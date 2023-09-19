import { IsNotEmpty, IsString } from 'class-validator';

export class matchResultDto {
  @IsNotEmpty()
  @IsString()
  round: string;

  @IsNotEmpty()
  @IsString()
  match: string;

  @IsNotEmpty()
  @IsString()
  team: string;

  @IsNotEmpty()
  @IsString()
  points: string;
}
