import { Tournaments } from './tournaments.model';

export class Players {
  id: string;
  name: string;
  stats: Tournaments;
}

// don't need to store stat of all games and wins because we can calculate it from the number of games and wins
