import usersJson from "./users.json"; //  with { type: "json" };
import teamsJson from "./teams.json"; // with { type: "json" };
import periodsJson from "./periods.json"; // with { type: "json" };

const allUsers: {[user: string]: PSSAllUser} = usersJson

export const users: {[user: string]: PSSUser} = Object.keys(allUsers)
  .filter((user) => "pivotal_id" in allUsers[user])
  .reduce<{[user: string]: PSSUser}>((memo, user) => (memo[user] = allUsers[user] as PSSUser, memo), {});

export const teams: {[team: string]: PSSTeam} = teamsJson;

export const periods: {[team: string]: PSSPeriod} = periodsJson;

export const usersByPivotalId: { [key: number]: PSSUser } = Object.values(users)
  .reduce<{[key: number]: PSSUser}>((memo, user) => (memo[user.pivotal_id] = user, memo), {});
