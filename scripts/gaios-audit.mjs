#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exts = new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.md','.sql','.json']);
function walk(dir, out=[]) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir,{withFileTypes:true})) { if (['node_modules','.next','.git'].includes(e.name)) continue; const p=path.join(dir,e.name); if(e.isDirectory()) walk(p,out); else if(exts.has(path.extname(e.name))) out.push(p); } return out; }
function rel(p){return path.relative(root,p).replaceAll('\\','/');}
const files = walk(root);
const codeFiles = files.filter(f=>/^(app|lib|components|scripts)\//.test(rel(f)) && !rel(f).endsWith('gaios-audit.mjs'));
const migrations = files.filter(f=>rel(f).startsWith('supabase/migrations/') && f.endsWith('.sql'));
const allMigrationSql = migrations.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const tableDefs = new Map();
for (const mf of migrations) {
  const sql = fs.readFileSync(mf,'utf8');
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_]+)/gi)) {
    tableDefs.set(m[1], rel(mf));
  }
}
const inserts = new Map();
const reads = new Map();
const env = new Map();
const dynamicImports = [];
function add(map,key,file,line){ if(!map.has(key)) map.set(key,[]); map.get(key).push(`${rel(file)}:${line}`); }
for (const f of codeFiles) {
  const text = fs.readFileSync(f,'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line,i)=>{
    for (const m of line.matchAll(/repositoryFrom\([^)]*\)\.insert(?:<[^>]+>)?\(\s*["'`]([a-zA-Z0-9_]+)["'`]/g)) add(inserts,m[1],f,i+1);
    for (const m of line.matchAll(/\.insert(?:<[^>]+>)?\(\s*["'`]([a-zA-Z0-9_]+)["'`]/g)) if(line.includes('repo.')||line.includes('repositoryFrom')) add(inserts,m[1],f,i+1);
    for (const m of line.matchAll(/(?:getRows|supabaseRequest)(?:<[^>]+>)?\(\s*["'`]([a-zA-Z0-9_]+)["'`]/g)) add(reads,m[1],f,i+1);
    for (const m of line.matchAll(/process\.env\.([A-Za-z0-9_]+)/g)) add(env,m[1],f,i+1);
    for (const m of line.matchAll(/import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) dynamicImports.push({from:rel(f), line:i+1, spec:m[1]});
  });
}
function parseInsertCols(table) {
  const cols = new Set();
  for (const loc of inserts.get(table)??[]) {
    const [file, l] = loc.split(':'); const lines=fs.readFileSync(path.join(root,file),'utf8').split(/\r?\n/); const snippet=lines.slice(Number(l)-1, Number(l)+8).join('\n');
    const obj = snippet.match(/\{([\s\S]*?)\}/)?.[1] ?? '';
    for (const m of obj.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g)) cols.add(m[1]);
  }
  return [...cols].filter(c=>!['token','method','body','prefer'].includes(c)).sort();
}
function migrationHas(table, col){ return new RegExp(`\\b${table}\\b[\\s\\S]*?\\b${col}\\b`,'i').test(allMigrationSql); }
const referenced = [...new Set([...inserts.keys(),...reads.keys()])].sort();
const missingTables = referenced.filter(t=>!tableDefs.has(t));
const missingColumns = [];
for (const t of inserts.keys()) for (const c of parseInsertCols(t)) if (tableDefs.has(t) && !migrationHas(t,c)) missingColumns.push(`${t}.${c}`);
const brokenDynamicImports = dynamicImports.filter(d=>d.spec.startsWith('.') ).filter(d=>{
  const base=path.dirname(path.join(root,d.from)); const target=path.resolve(base,d.spec);
  return !['.ts','.tsx','.js','.jsx','.mjs','.cjs'].some(ext=>fs.existsSync(target+ext)) && !fs.existsSync(path.join(target,'index.ts')) && !fs.existsSync(path.join(target,'index.tsx'));
});
const rlsMissing = referenced.filter(t=>tableDefs.has(t) && !new RegExp(`alter\\s+table\\s+(?:public\\.)?${t}\\s+enable\\s+row\\s+level\\s+security`,'i').test(allMigrationSql));
const indexMissing = referenced.filter(t=>tableDefs.has(t) && !new RegExp(`create\\s+index[\\s\\S]*?on\\s+(?:public\\.)?${t}\\b`,'i').test(allMigrationSql));
const report = { generatedAt:new Date().toISOString(), referencedTables:{inserts:Object.fromEntries(inserts), reads:Object.fromEntries(reads), all:referenced}, migrations:{files:migrations.map(rel), tables:Object.fromEntries(tableDefs), executiveSnapshotsMigration:migrations.map(rel).find(f=>f.includes('executive_snapshots'))??null}, findings:{missingTables, missingColumns, tablesMissingRls:rlsMissing, tablesMissingIndexes:indexMissing, brokenDynamicImports}, env:Object.fromEntries(env) };
console.log(JSON.stringify(report,null,2));
if (process.argv.includes('--fail-on-critical') && (missingTables.length||brokenDynamicImports.length)) process.exit(1);
