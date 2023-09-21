export interface Players {
  [playerId: string]: {
    name: string;
    id: string;
    stats: string[];
  };
}
