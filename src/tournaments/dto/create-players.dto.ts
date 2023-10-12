import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePlayersDto {
  @ApiProperty({ description: "Player's name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Player's sex" })
  @IsString()
  sex: string;
}
