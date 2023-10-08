import { Players } from '../../tournaments/entities/players.model';

export class Users {
  id?: string;
  name: string;
  email: string;
  players: Players[];
}
