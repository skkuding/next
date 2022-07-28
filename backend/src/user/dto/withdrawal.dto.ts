import { IsNotEmpty, IsString } from 'class-validator'

export class WithdrawalDto {
  @IsString()
  @IsNotEmpty()
  readonly password: string
}
