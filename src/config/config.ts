import usersJson from "./users.json"; //  with { type: "json" };
import teamsJson from "./teams.json"; // with { type: "json" };
import periodsJson from "./periods.json"; // with { type: "json" };

const allUsers: {[user: string]: PSSAllUser} = usersJson

export const users: Readonly<SRecord<PSSUser>> = Object.keys(allUsers)
  .filter((user) => "pivotal_id" in allUsers[user])
  .reduce<SRecord<PSSUser>>((memo, user) => (memo[user] = allUsers[user] as PSSUser, memo), {});

export const teams: Readonly<SRecord<PSSTeam>> = teamsJson;

export const periods: Readonly<SRecord<PSSPeriod>> = periodsJson;

export const usersByPivotalId: Readonly<NRecord<PSSUser>> = Object.values(users)
  .reduce<NRecord<PSSUser>>((memo, user) => (memo[user.pivotal_id] = user, memo), {});
