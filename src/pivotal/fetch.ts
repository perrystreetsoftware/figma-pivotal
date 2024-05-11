type Param = Record<string, string | number| boolean>;

type PivotalResponseEnvelope<T> = {
  data: T,
  pagination?: {
    total: number,
    limit: number,
    offset: number
    returned: number
  }
};

type Response<T> = {
  data: T,
  paginate?: {
    more: boolean,
    next: {
      offset: number,
      limit: number
    }
  }
};

const storyFields = "name,url,accepted_at,estimate,project_id,owner_ids,story_type,labels(name),cycle_time_details(:default),reviews(reviewer_id,status)";

const epicFields = "name,url,project_id,completed_at,projected_completion,label(id,name)";

const paramsToString = (params: Param) => Object.keys(params).map((key: string) => `${key}=${encodeURI(params[key].toString())}`).join("&");

const headers = { "Content-Type": "application/json", "Accept": "application/json" };

async function fetchPaginatedPivotal<T>(pivotalToken: string, path: String, params: Param): Promise<T[]> {
  let {data, paginate} = await fetchPivotal<T[]>(pivotalToken, path, params);
  while (paginate?.more) {
    const nextResponse = await fetchPivotal<T[]>(pivotalToken, path, { ...params, ...paginate!.next });
    data = data.concat(nextResponse.data);
    paginate = nextResponse.paginate;
  }
  return data;
}

async function fetchPivotal<T>(pivotalToken: string, path: String, params: Param): Promise<Response<T>> {
  const url = `https://www.pivotaltracker.com/services/v5/${path}?${paramsToString({ token: pivotalToken, envelope: true, ...params })}`;
  const response = await fetch(url, { headers });
  const { data, pagination }: PivotalResponseEnvelope<T> = await response.json();
  let result: Response<T> = { data };

  if (pagination) {
    result.paginate = {
      more: (pagination.offset + pagination.limit) < pagination.total,
      next: { offset: pagination.offset + pagination.limit, limit: pagination.limit }
    };
  }

  return result;
}

export async function fetchEpic(pivotalToken: string, epicId: number): Promise<PivotalEpic> {
  return (await fetchPivotal<PivotalEpic>(pivotalToken, `epics/${epicId}`, {fields: epicFields})).data;
}

export async function fetchEpics(pivotalToken: string, projectId: number): Promise<PivotalEpic[]> {
  return fetchPaginatedPivotal<PivotalEpic>(pivotalToken, `projects/${projectId}/epics`, {fields: epicFields});
}

export async function fetchStoriesByEpic(pivotalToken: string, epic: PivotalEpic): Promise<PivotalStory[]> {
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${epic.project_id}/stories`, { with_label: epic.label.name, fields: storyFields });
}

export async function fetchStoriesByPeriod(pivotalToken: string, projectId: number, startDate: Date, endDate: Date): Promise<PivotalStory[]> {
  const params = { accepted_after: startDate.toISOString(), accepted_before: endDate.toISOString(), fields: storyFields };
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${projectId}/stories`, params);
}

export async function fetchStoriesByFilter(pivotalToken: string, projectId: number, filter: string): Promise<PivotalStory[]> {
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${projectId}/stories`, { filter, fields: storyFields });
}
