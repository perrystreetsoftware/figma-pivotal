import { fetchEpics } from "./pivotal/fetch";
import { users, teams, periods } from "./config/config";

type Suggestion<T> = {
  name: string,
  data: T
};

function suggestionsFor<T>(objects: SRecord<T>): Suggestion<T>[] {
  return Object.keys(objects).sort().map(object => ({name: object, data: objects[object]}));
}

function setSuggestion({query, result}: ParameterInputEvent, suggestions: Suggestion<T>[]) {
  result.setSuggestions(suggestions.filter(({name}) => name.includes(query)));
}

const ownerSuggestions = suggestionsFor<PSSUser>(users),
  projectSuggestions = suggestionsFor<PSSTeam>(teams),
  periodSuggestions = suggestionsFor<PSSPeriod>(periods);

export const suggestions: Record<string, (input: ParameterInputEvent) => void> = {
  owner(parameterInputEvent: ParameterInputEvent) {
    setSuggestion(parameterInputEvent, ownerSuggestions);
  },

  pivotalProject(parameterInputEvent: ParameterInputEvent) {
    setSuggestion(parameterInputEvent, projectSuggestions);
  },

  async pivotalEpic({parameters: {pivotalToken, pivotalProject}, query, result}: ParameterInputEvent) {
    const epics = await fetchEpics(pivotalToken, pivotalProject.pivotal_project_id);
    const suggestions: Suggestion<PivotalEpic>[] = epics.map(epic => ({name: epic.name, data: epic}));
    setSuggestion({query, result} as ParameterInputEvent, suggestions);
  },

  period(parameterInputEvent: ParameterInputEvent) {
    setSuggestion(parameterInputEvent, periodSuggestions);
  }
};
