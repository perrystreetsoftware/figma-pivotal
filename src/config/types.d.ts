declare type PSSUser = {
  name: string,
  pivotal_id: number,
  slack_id: string,
  type: string, // "SERVER" | "ANDROID" | "IOS" | "WEB" | "PRODUCT_QA" | "DEV_QA" | "DESIGN_QA",
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
  pivotal_project_id: number
}

declare type PSSPeriod = {
  startDate: string,
  endDate: string,
  t1: {
    startDate: string,
    endDate: string
  },
  t2: {
    startDate: string,
    endDate: string
  },
  t3: {
    startDate: string,
    endDate: string
  }
}
