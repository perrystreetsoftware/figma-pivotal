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

const fields = "name,url,accepted_at,estimate,project_id,owner_ids,story_type,labels(name),cycle_time_details(:default),reviews(reviewer_id,status)";

const headers = { "Content-Type": "application/json", "Accept": "application/json" };

export async function fetchStoriesByEpic(pivotalToken: string, epicId: number): Promise<PivotalStory[]> {
  const epic = await fetchEpic(pivotalToken, epicId);
  const params = { with_label: encodeURI(epic.label.name), fields}
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${epic.project_id}/stories`, params);
}

export async function fetchStoriesByPeriod(pivotalToken: string, projectId: number, startDate: Date, endDate: Date): Promise<PivotalStory[]> {
  const params = { accepted_after: startDate.toISOString(), accepted_before: endDate.toISOString(), fields };
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${projectId}/stories`, params);
}

export async function fetchStoriesByOwnerId(pivotalToken: string, projectId: number, ownerId: number): Promise<PivotalStory[]> {
  const params = { owner_id: ownerId, fields };
  return fetchPaginatedPivotal<PivotalStory>(pivotalToken, `projects/${projectId}/stories`, params);
}

async function fetchEpic(pivotalToken: string, epicId: number): Promise<PivotalEpic> {
  const { data } = await fetchPivotal<PivotalEpic>(pivotalToken, `epics/${epicId}`, {fields: "name,url,project_id,label(id,name)"});
  return data;
}

function paramsToString(params: Param): string {
  return Object.keys(params).map((key: string) => `${key}=${encodeURI(params[key].toString())}`).join("&");
}

async function fetchPaginatedPivotal<T>(pivotalToken: string, path: String, params?: Param): Promise<T[]> {
  let {data, paginate} = await fetchPivotal<T[]>(pivotalToken, path, params);
  while (paginate.more) {
    const nextResponse = await fetchPivotal<T[]>(pivotalToken, path, { ...params, ...paginate.next });
    data = data.concat(nextResponse.data);
    paginate = nextResponse.paginate;
  }
  return data;
}
async function fetchPivotal<T>(pivotalToken: string, path: String, params?: Param): Promise<Response<T>> {
  const url = `https://www.pivotaltracker.com/services/v5/${path}?${paramsToString({ token: pivotalToken, envelope: true, ...params })}`;
  const response = await fetch(url, { headers });
  const {data, pagination: { offset, limit, total }}: PivotalResponseEnvelope<T> = await response.json()

  return {
    data,
    paginate: {
      more: (offset + limit) < total,
      next: { offset: offset + limit, limit }
    }
  };
}
