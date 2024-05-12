// declare type UserType = "SERVER" | "ANDROID" | "IOS" | "WEB" | "PRODUCT_QA" | "DEV_QA" | "DESIGN_QA"; // Does not work with JSON

declare type SRecord<T> = Record<string, T>;
declare type NRecord<T> = Record<number, T>;

declare type PSSUser = {
  name: string,
  pivotal_id: number,
  slack_id: string,
  type: string,
  pivotal_projects: string[],
  github_emails?: string[],
}

declare type PSSOldUser = {
  github_emails: string[],
}

declare type PSSAllUser = PSSUser | PSSOldUser

declare type PSSTeam = {
  name: string,
  slack_channel: string,
  pivotal_project_id: number,
  repos: string[],
}

declare type PSSPeriod = {
  startDate: string,
  endDate: string
}
