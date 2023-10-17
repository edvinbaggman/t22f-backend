import { ITournaments } from '../interface/tournamentsStats.interface';
import { Sex } from '../enum/sex.enum';

export class Players {
  id?: string;
  name: string;
  sex: Sex;
  stats: ITournaments;
}
