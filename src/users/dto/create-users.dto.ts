import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUsersDto {
  @ApiProperty({ description: "User's name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "User's Email" })
  @IsEmail()
  email: string;
}
