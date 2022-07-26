import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  InternalServerErrorException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice } from '@prisma/client'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { GroupMemberGuard } from 'src/group/guard/group-member.guard'
import { UserNotice } from './interface/user-notice.interface'
import { EntityNotExistException } from 'src/common/exception/business.exception'

@Controller('notice')
export class PublicNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getNoticesByGroupId(1, offset)
  }

  @Get(':id')
  async getNotice(@Param('id', ParseIntPipe) id: number): Promise<UserNotice> {
    try {
      return await this.noticeService.getNotice(id, 1)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}

@Controller('group/:group_id/notice')
@UseGuards(JwtAuthGuard, GroupMemberGuard)
export class GroupNoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotices(
    @Param('group_id', ParseIntPipe) group_id: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getNoticesByGroupId(group_id, offset)
  }

  @Get(':id')
  async getNotice(
    @Param('id', ParseIntPipe) id: number,
    @Param('group_id', ParseIntPipe) group_id: number
  ): Promise<UserNotice> {
    try {
      return await this.noticeService.getNotice(id, group_id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
