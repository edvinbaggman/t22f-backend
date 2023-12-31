import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RenamePlayersDto {
  @ApiProperty({ description: "Player's name" })
  @IsString()
  name: string;
}
