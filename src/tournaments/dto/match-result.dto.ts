import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class matchResultDto {
  @ApiProperty({ description: 'Round Number' })
  @IsNotEmpty()
  @IsString()
  round: string;

  @ApiProperty({ description: 'Match Id' })
  @IsNotEmpty()
  @IsString()
  match: string;

  @ApiProperty({ description: 'Team1 Points' })
  @IsNotEmpty()
  @IsNumber()
  team1Points: number;

  @ApiProperty({ description: 'Team2 Points' })
  @IsNotEmpty()
  @IsNumber()
  team2Points: number;
}
