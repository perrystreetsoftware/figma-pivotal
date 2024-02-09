import { PivotalStory, PivotalEpic } from "./types.d";

type Param = { [key: string]: string };

export async function fetchStoriesByEpic(pivotalToken: string, epicId: number): Promise<PivotalStory[]> {
  const epic = await fetchEpic(pivotalToken, epicId);
  const params = { with_label: encodeURI(epic.label.name), fields: ":default,labels(name),cycle_time_details(:default),transitions(state,occurred_at)"}
  return await fetchPivotal(pivotalToken, `projects/${epic.project_id}/stories`, params) as PivotalStory[];
}

export async function fetchEpic(pivotalToken: string, epicId: number): Promise<PivotalEpic> {
  return await fetchPivotal(pivotalToken, `epics/${epicId}`, {fields: "name,url,project_id,label(id,name)"}) as PivotalEpic;
}

function paramsToString(params: Param): string {
  return Object.keys(params).map((key: string) => `${key}=${params[key]}`).join("&");
}

async function fetchPivotal(pivotalToken: string, path: String, params?: Param): Promise<object> {
  const url = `https://www.pivotaltracker.com/services/v5/${path}?${paramsToString({ token: pivotalToken, ...params })}`;
  const response = await fetch(url, { headers: { "Content-Type": "application/json", "Accept": "application/json" }});
  return response.json();
}
