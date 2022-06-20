import { Inject, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class ContestService {
  constructor(@Inject('prisma') private readonly prisma: PrismaService) {}
}
