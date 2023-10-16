import { Tournaments } from './tournaments.model';
import { Sex } from '../enum/sex.enum';

export class Players {
  id?: string;
  name: string;
  sex: Sex;
  stats: Tournaments;
}
