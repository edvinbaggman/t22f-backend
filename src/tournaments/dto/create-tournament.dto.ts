import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsObject } from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ description: "Tournament's name" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Tournament's date" })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ description: "Tournament's starting time" })
  @IsNotEmpty()
  @IsString()
  startingTime: string;

  @ApiProperty({ description: "Tournament's description" })
  @IsString()
  description: string;

  @ApiProperty({ description: "Tournament's rounds number" })
  @IsNotEmpty()
  @IsNumber()
  numberOfRounds: number;

  @ApiProperty({ description: "Tournament's location" })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: "Tournament's owner" })
  @IsString()
  owner: string;

  @ApiProperty({ description: "Tournament's settings" })
  @IsNotEmpty()
  @IsObject()
  settings: {
    prioRest: string;
    prioType: string;
    maxSimultaneousGames: string;
  };
}
