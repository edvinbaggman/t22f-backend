import { IsNotEmpty, IsString } from 'class-validator';

export class addPlayerDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
