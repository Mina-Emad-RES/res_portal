import { IsString, MinLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/[A-Za-z]/, {
    message: 'Password must contain at least one letter',
  })
  @Matches(/\d/, {
    message: 'Password must contain at least one number',
  })
  password: string;
}
