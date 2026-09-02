export const TEAM_SCORE_DECIMAL_PLACES = 2;

export const formatTeamScore = (score: number): string =>
  score.toFixed(TEAM_SCORE_DECIMAL_PLACES);
