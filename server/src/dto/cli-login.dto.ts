import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CliLoginDto {
  @IsNotEmpty()
  username: string;

  @MinLength(5)
  password: string;
}
