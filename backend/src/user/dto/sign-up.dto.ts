import {
  IsAlpha,
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator'

export class SignUpDto {
  @IsNotEmpty()
  @IsAlphanumeric()
  readonly username: string

  @IsNotEmpty()
  @IsString()
  readonly password: string

  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @IsNotEmpty()
  @IsAlpha()
  readonly real_name: string
}
