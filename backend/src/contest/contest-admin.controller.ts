import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common'
import { ContestService } from './contest.service'
import { CreateContestDto } from './dto/create-contest.dto'
import { UpdateContestDto } from './dto/update-contest.dto'
import { Contest } from '@prisma/client'
import {
  EntityNotExistException,
  UnprocessableDataException
} from 'src/common/exception/business.exception'
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard'
import { AuthenticatedRequest } from 'src/auth/interface/authenticated-request.interface'
import { GroupManagerGuard } from 'src/group/guard/group-manager.guard'

@Controller('admin/group/:group_id/contest')
@UseGuards(JwtAuthGuard, GroupManagerGuard)
export class ContestAdminController {
  constructor(private readonly contestService: ContestService) {}

  @Post()
  async createContest(
    @Req() req: AuthenticatedRequest,
    @Body() contestDto: CreateContestDto
  ): Promise<Contest> {
    try {
      return await this.contestService.createContest(req.user.id, contestDto)
    } catch (err) {
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Patch(':id')
  async updateContest(
    @Param('id', ParseIntPipe) id: number,
    @Body() contestDto: UpdateContestDto
  ): Promise<Contest> {
    try {
      return await this.contestService.updateContest(id, contestDto)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  @Delete(':id')
  async deleteContest(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.contestService.deleteContest(id)
    } catch (err) {
      if (err instanceof EntityNotExistException) {
        throw new NotFoundException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }

  /* group admin page */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAdminContests(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminContests(userId)
  }

  @Get('ongoing')
  @UseGuards(JwtAuthGuard)
  async getAdminOngoingContests(@Req() req: AuthenticatedRequest) {
    return await this.contestService.getAdminOngoingContests(req.user.id)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAdminContestById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    return await this.contestService.getAdminContestById(req.user.id, contestId)
  }
}
