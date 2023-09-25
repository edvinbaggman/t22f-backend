import { IsNotEmpty, IsString } from 'class-validator';

export class addPlayerDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
