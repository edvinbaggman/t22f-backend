export interface ILeaderboardPlayer {
  id: string;
  name: string;
  games: number;
  won: number;
  points: number;
  lastMatches: string[];
}
