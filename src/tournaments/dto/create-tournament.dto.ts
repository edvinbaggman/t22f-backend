import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ description: "Tournament's name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Tournament's date" })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: "Tournament's rounds number" })
  @IsNotEmpty()
  @IsNumber()
  numberOfRounds: number;

  @ApiProperty({ description: "Tournament's location" })
  @IsNotEmpty()
  @IsString()
  location: string;

  // @ApiProperty({ description: "Tournament's players" })
  // @IsArray()
  // players: string[];

  @ApiProperty({ description: "Tournament's owner" })
  @IsString()
  owner: string;
}
