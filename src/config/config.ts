import usersJson from "./users.json"; //  with { type: "json" };
import teamsJson from "./teams.json"; // with { type: "json" };
import periodsJson from "./periods.json"; // with { type: "json" };

const allUsers: {[user: string]: PSSAllUser} = usersJson

export const users: Readonly<Record<string, PSSUser>> = Object.keys(allUsers)
  .filter((user) => "pivotal_id" in allUsers[user])
  .reduce<Record<string, PSSUser>>((memo, user) => (memo[user] = allUsers[user] as PSSUser, memo), {});

export const teams: Readonly<Record<string, PSSTeam>> = teamsJson;

export const periods: Readonly<Record<string, PSSPeriod>> = periodsJson;

export const usersByPivotalId: Readonly<Record<number, PSSUser>> = Object.values(users)
  .reduce<Record<number, PSSUser>>((memo, user) => (memo[user.pivotal_id] = user, memo), {});
