import usersJson from "./users.json"; // assert { type: "json" };
import teamsJson from "./teams.json"; // assert { type: "json" };
import periodsJson from "./periods.json"; // assert { type: "json" };

const allUsers: Readonly<SRecord<PSSAllUser>> = usersJson

export const users: Readonly<SRecord<PSSUser>> = Object.keys(allUsers)
  .filter((user) => "pivotal_id" in allUsers[user])
  .reduce<SRecord<PSSUser>>((memo, user) => (memo[user] = allUsers[user] as PSSUser, memo), {});

export const teams: Readonly<SRecord<PSSTeam>> = teamsJson;

export const periods: Readonly<SRecord<PSSPeriod>> = periodsJson;

export const usersByPivotalId: Readonly<NRecord<PSSUser>> = Object.values(users)
  .reduce<NRecord<PSSUser>>((memo, user) => (memo[user.pivotal_id] = user, memo), {});
