import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common'
import { Contest } from '@prisma/client'
import { ContestService } from './contest.service'

@Controller()
export class ContestController {
  constructor(private readonly contestService: ContestService) {}

  /* group admin page */
  @Get('admin')
  async getAllAdminContest(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAllAdminContest(userId)
  }

  @Get('admin/ongoing')
  async getAdminOngoing(@Req() req) {
    const userId = req.body.user.id
    return await this.contestService.getAdminOngoing(userId)
  }

  /* User Page */
  /* contest list page */
  @Get('ongoing')
  async getOngoing(): Promise<Partial<Contest>[]> {
    return await this.contestService.getOngoing()
  }

  @Get('upcoming')
  async getUpcoming(): Promise<Partial<Contest>[]> {
    return await this.contestService.getUpcoming()
  }

  @Get('finished')
  async getFinished(): Promise<Partial<Contest>[]> {
    return await this.contestService.getFinished()
  }

  @Get('group/:id')
  async findByGroupId(@Req() req, @Param('id', ParseIntPipe) groupId: number) {
    const userId = req.body.user.id
    return await this.contestService.findByGroupId(userId, groupId)
  }

  /* contest detail page */
  @Get(':id')
  async findByContestId(
    @Req() req,
    @Param('id', ParseIntPipe) contestId: number
  ): Promise<Partial<Contest>> {
    const userId = req.body.user.id
    return await this.contestService.findByContestId(userId, contestId)
  }
}
