import { fetchEpics } from "./pivotal/fetch";
import { users, teams, periods } from "./config";

type Suggestion<T> = {
  name: string,
  data: T
};

export const suggestions: {[key: string]: (input: ParameterInputEvent) => void} = {
  owner({query, result}: ParameterInputEvent) {
    const owners = Object.keys(users);
    result.setSuggestions(owners.filter(s => s.includes(query)));
  },

  pivotalProject({query, result}: ParameterInputEvent) {
    const setSuggestions = Object.keys(teams);
    result.setSuggestions(setSuggestions.filter(name => name.includes(query)));
  },

  async pivotalEpicId({parameters, query, result}: ParameterInputEvent) {
    const epics = await fetchEpics(parameters.pivotalToken, teams[parameters.pivotalProject].pivotal_project_id);
    const epicSuggestions: Suggestion<number>[] = epics.map(({name, id}) => ({name, data: id}));
    result.setSuggestions(epicSuggestions.filter(({name}) => name.includes(query)));
  },

  period({query, result}: ParameterInputEvent) {
    const periodsSuggestions = Object.keys(periods).reduce((acc, name) => {
      const {t1, t2, t3, ...year} = periods[name];
      acc.push({name, data: year})
      acc.push({name: `${name} T1`, data: t1});
      acc.push({name: `${name} T2`, data: t2});
      acc.push({name: `${name} T3`, data: t3});
      return acc;
    }, [] as Suggestion<{startDate: string, endDate: string}>[]);
    result.setSuggestions(periodsSuggestions.filter(({name}) => name.includes(query)));
  }
};
