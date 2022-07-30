import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  readonly title: string

  @IsOptional()
  @IsString()
  readonly content: string

  @IsOptional()
  @IsBoolean()
  readonly visible: boolean

  @IsOptional()
  @IsBoolean()
  readonly fixed: boolean
}
