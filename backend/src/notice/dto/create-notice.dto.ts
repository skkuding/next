import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string

  @IsNotEmpty()
  @IsString()
  readonly content: string

  @IsNotEmpty()
  @IsBoolean()
  readonly visible: boolean

  @IsNotEmpty()
  @IsBoolean()
  readonly fixed: boolean
}
