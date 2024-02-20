type Param = { [key: string]: string | number| boolean };

type PivotalResponseEnvelope<T> = {
  data: T,
  pagination: {
    total: number,
    limit: number,
    offset: number
    returned: number
  }
};

type Response<T> = {
  data: T,
  paginate: {
    more: boolean,
    next: {
      offset: number,
      limit: number
    }
  }
};

const storyFields = "name,url,accepted_at,estimate,project_id,owner_ids,story_type,labels(name),cycle_time_details(:default),reviews(reviewer_id,status)";

const epicFields = "name,url,project_id,label(id,name)";

const paramsToString = (params: Param) => Object.keys(params).map((key: string) => `${key}=${encodeURI(params[key].toString())}`).join("&");

const headers = { "Content-Type": "application/json", "Accept": "application/json" };

async function fetchPaginatedPivotal<T>(pivotalToken: string, path: String, params: Param): Promise<T[]> {
  let {data, paginate} = await fetchPivotal<T[]>(pivotalToken, path, params);
  while (paginate.more) {
    const nextResponse = await fetchPivotal<T[]>(pivotalToken, path, { ...params, ...paginate.next });
    data = data.concat(nextResponse.data);
    paginate = nextResponse.paginate;
  }
  return data;
}
async function fetchPivotal<T>(pivotalToken: string, path: String, params: Param): Promise<Response<T>> {
  const url = `https://www.pivotaltracker.com/services/v5/${path}?${paramsToString({ token: pivotalToken, envelope: true, ...params })}`;
  const response = await fetch(url, { headers });
  const { data, pagination: { offset, limit, total } }: PivotalResponseEnvelope<T> = await response.json();

  return {
    data,
    paginate: {
      more: (offset + limit) < total,
      next: { offset: offset + limit, limit }
    }
  };
}

async function fetchEpic(pivotalToken: string, epicId: number): Promise<PivotalEpic> {
  const { data } = await fetchPivotal<PivotalEpic>(pivotalToken, `epics/${epicId}`, {fields: epicFields});
  return data;
}

export async function fetchStoriesByEpic(pivotalToken: string, epicId: number): Promise<PivotalStory[]> {
  const epic = await fetchEpic(pivotalToken, epicId);
  const params = { with_label: encodeURI(epic.label.name), fields: storyFields}
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${epic.project_id}/stories`, params);
}

export async function fetchStoriesByPeriod(pivotalToken: string, projectId: number, startDate: Date, endDate: Date): Promise<PivotalStory[]> {
  const params = { accepted_after: startDate.toISOString(), accepted_before: endDate.toISOString(), fields: storyFields };
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${projectId}/stories`, params);
}
