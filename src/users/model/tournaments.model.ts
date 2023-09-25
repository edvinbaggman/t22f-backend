export class Tournaments {
  [tournamentId: string]: {
    tournament: Tournament;
  };
}
export class Tournament {
  id: string;
  games: number;
  wins: number;
}
