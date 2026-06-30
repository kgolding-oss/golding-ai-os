import { vercelClient } from "./vercel-client";
import type { VercelRuntimeInput } from "./vercel-types";
export const projectPath = (i: VercelRuntimeInput) => i.projectId ? `/v9/projects/${i.projectId}` : i.projectName ? `/v9/projects/${i.projectName}` : "/v9/projects";
export async function listVercelProjects(i: VercelRuntimeInput) { return vercelClient.request(`/v9/projects?limit=${i.limit ?? 20}`); }
export async function getVercelProject(i: VercelRuntimeInput) { return vercelClient.request(projectPath(i)); }
export function projectMetadata(project: any) { return { id: project?.id, name: project?.name, framework: project?.framework, productionDeployments: project?.targets?.production ? 1 : 0, environmentMetadata: { count: Array.isArray(project?.env) ? project.env.length : undefined, valuesExposed: false } }; }
