import usersJson from "../config/users.json";

export const users: {[user: string]: PSSUser[]} = usersJson;

export const usersByPivotalId: { [key: number]: PSSUser } = Object.values(users)
  .filter(user => user.pivotal_id)
  .reduce<{[key: number]: PSSUser}>((memo, user) => (memo[user.pivotal_id] = user, memo), {});