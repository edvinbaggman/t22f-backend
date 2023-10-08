import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RenameUserDto {
  @ApiProperty({ description: "User's name" })
  @IsString()
  name: string;
}
