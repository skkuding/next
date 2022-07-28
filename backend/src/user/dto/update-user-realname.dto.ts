import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateUserRealNameDto {
  @IsString()
  @IsNotEmpty()
  readonly real_name: string
}
