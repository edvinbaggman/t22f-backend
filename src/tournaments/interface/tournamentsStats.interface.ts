export interface ITournaments {
  [tournamentId: string]: {
    tournament: IPlayerTournament;
  };
}
export interface IPlayerTournament {
  id: string;
  games: number;
  wins: number;
  points: number;
}
