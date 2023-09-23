import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class gameRsultDto {
  @ApiProperty({ description: 'Game result' })
  @IsBoolean()
  won: boolean;
}
