import type { GraphQuery, GraphQueryResult, GraphRegistration, KnowledgeGraphEdge, KnowledgeGraphNode, TimelineEvent } from "./types";
const low=(v:string)=>v.toLowerCase();
function uniqueById<T extends {id:string}>(items:T[]){return Array.from(new Map(items.map((i)=>[i.id,i])).values());}
export class KnowledgeGraphEngine{
 private nodes=new Map<string,KnowledgeGraphNode>(); private edges=new Map<string,KnowledgeGraphEdge>(); private events=new Map<string,TimelineEvent>();
 register(input:GraphRegistration){input.nodes?.forEach((n)=>this.nodes.set(n.id,n)); input.edges?.forEach((e)=>this.edges.set(e.id,e)); input.timeline?.forEach((t)=>this.events.set(t.id,t)); return this;}
 clear(){this.nodes.clear(); this.edges.clear(); this.events.clear(); return this;}
 query(q:GraphQuery):GraphQueryResult{const limit=q.limit??100; const terms=(q.text??"").toLowerCase().split(/\s+/).filter(Boolean); const matchesText=(n:KnowledgeGraphNode)=>!terms.length||terms.every((t)=>[n.label,n.summary??"",...n.tags,JSON.stringify(n.properties)].some((v)=>low(String(v)).includes(t)));
  const seed=this.allNodes().filter((n)=>n.organizationId===q.organizationId).filter((n)=>!q.nodeTypes?.length||q.nodeTypes.includes(n.type)).filter((n)=>!q.nodeIds?.length||q.nodeIds.includes(n.id)).filter((n)=>!q.tags?.length||q.tags.some((t)=>n.tags.includes(t))).filter(matchesText).slice(0,limit);
  const ids=new Set(seed.map((n)=>n.id)); const connected=this.allEdges().filter((e)=>e.organizationId===q.organizationId&&(ids.has(e.from)||ids.has(e.to))).filter((e)=>!q.relationshipTypes?.length||q.relationshipTypes.includes(e.type)); connected.forEach((e)=>{ids.add(e.from); ids.add(e.to);});
  const nodes=this.allNodes().filter((n)=>ids.has(n.id)); const edgeIds=new Set(connected.map((e)=>e.id)); const timeline=this.allTimeline().filter((t)=>t.organizationId===q.organizationId).filter((t)=>t.entityIds.some((id)=>ids.has(id))||t.edgeIds.some((id)=>edgeIds.has(id))).filter((t)=>(!q.timelineFrom||t.occurredAt>=q.timelineFrom)&&(!q.timelineTo||t.occurredAt<=q.timelineTo)).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt)).slice(0,limit);
  const relationshipCounts=connected.reduce<Record<string,number>>((a,e)=>{a[e.type]=(a[e.type]??0)+1; return a;},{}); const heatMap=nodes.reduce<Record<string,number>>((a,n)=>{a[n.type]=(a[n.type]??0)+connected.filter((e)=>e.from===n.id||e.to===n.id).length; return a;},{});
  const entityHealth=nodes.reduce<Record<string,KnowledgeGraphNode["health"]>>((a,n)=>{a[n.id]=n.health; return a;},{}); const dependencyTrees=nodes.map((root)=>({root,dependencies:connected.filter((e)=>e.type==="depends_on"&&e.from===root.id).map((e)=>nodes.find((n)=>n.id===e.to)).filter(Boolean) as KnowledgeGraphNode[]})).filter((t)=>t.dependencies.length);
  return {nodes:uniqueById(nodes),edges:uniqueById(connected),timeline,relationshipCounts,heatMap,entityHealth,dependencyTrees,generatedAt:new Date().toISOString()};}
 allNodes(){return Array.from(this.nodes.values());} allEdges(){return Array.from(this.edges.values());} allTimeline(){return Array.from(this.events.values());}
}
export const knowledgeGraphEngine=new KnowledgeGraphEngine();
