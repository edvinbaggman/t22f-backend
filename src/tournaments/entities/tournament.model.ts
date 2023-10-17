export class Tournament {
  id: string;
  owner: string;
  players: string[];
  date: string;
  name: string;
  numberOfRounds: number;
  image: string;
  playersInactive: string[];
  location: string;
  startingTime: string;
  settings: {
    prioRest: string;
    prioType: string;
    maxSimultaneousGames: string;
  };
}
