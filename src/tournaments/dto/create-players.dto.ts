import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { Sex } from '../enum/sex.enum';

export class CreatePlayersDto {
  @ApiProperty({ description: "Player's name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Player's sex", enum: Sex })
  @IsEnum(Sex)
  sex: Sex;
}
