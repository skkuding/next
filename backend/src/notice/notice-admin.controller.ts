import {
  Controller,
  Get,
  Delete,
  Patch,
  Post,
  Req,
  Res,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common'
import { NoticeService } from './notice.service'
import { Notice, Role } from '@prisma/client'
import { Roles } from 'src/common/decorator/roles.decorator'
import { RolesGuard } from 'src/user/guard/roles.guard'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { UpdateNoticeDto } from './dto/update-notice.dto'
import { CreateNoticeDto } from './dto/create-notice.dto'
import { EntityNotExistException } from 'src/common/exception/business.exception'

@Controller('admin/notice')
@Roles(Role.GroupAdmin)
@UseGuards(RolesGuard)
export class NoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getAdminNotices(
    @Req() req: AuthenticatedRequest,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNotices(req.user.id, offset)
  }

  @Get(':id')
  async redirect(@Res() res, @Param('id', ParseIntPipe) id: number) {
    try {
      const groupId = (await this.noticeService.getGroup(id)).group_id
      return res.redirect('admin/group/' + groupId + 'notice/' + id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticeDto: UpdateNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, updateNoticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':group_id/:id')
  @UseGuards(GroupManagerGuard)
  async deleteNotice(
    @Param('group_id') groupId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    try {
      await this.noticeService.deleteNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException('fail to delete')
    }
  }
}

@Controller('admin/group/:group_id/notice')
@Roles(Role.GroupAdmin)
@UseGuards(RolesGuard, GroupManagerGuard)
export class GroupNoticeAdminController {
  constructor(private readonly noticeService: NoticeService) {}

  @Post()
  async createNotice(
    @Req() req: AuthenticatedRequest,
    @Param('group_id', ParseIntPipe) groupId: number,
    @Body() createNoticeDto: CreateNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.createNotice(
        req.user.id,
        groupId,
        createNoticeDto
      )
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Get()
  async getAdminNotices(
    @Param('group_id', ParseIntPipe) groupId: number,
    @Query('offset', ParseIntPipe) offset: number
  ): Promise<Partial<Notice>[]> {
    return await this.noticeService.getAdminNoticesByGroupId(groupId, offset)
  }

  @Get(':id')
  async getAdminNotice(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Partial<Notice>> {
    try {
      return await this.noticeService.getAdminNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoticeDto: UpdateNoticeDto
  ): Promise<Notice> {
    try {
      return await this.noticeService.updateNotice(id, updateNoticeDto)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteNotice(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.noticeService.deleteNotice(id)
    } catch (error) {
      if (error instanceof EntityNotExistException) {
        throw new NotFoundException(error.message)
      }
      throw new InternalServerErrorException('fail to delete')
    }
  }
}
