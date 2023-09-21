import { Players } from './players.model';

export class Users {
  id?: string;
  name: string;
  email: string;
  players: Players[];
}
