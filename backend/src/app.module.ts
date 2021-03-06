import { CacheModule, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { ContestModule } from './contest/contest.module'
import { GroupModule } from './group/group.module'
import { NoticeModule } from './notice/notice.module'
import { ProblemModule } from './problem/problem.module'
import { SubmissionModule } from './submission/submission.module'
import { UserModule } from './user/user.module'
import { WorkbookModule } from './workbook/workbook.module'
import { CacheConfigService } from './common/cache/cacheConfig.service'
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService
    }),
    PrismaModule,
    AuthModule,
    ContestModule,
    GroupModule,
    NoticeModule,
    ProblemModule,
    SubmissionModule,
    UserModule,
    WorkbookModule
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }]
})
export class AppModule {}
