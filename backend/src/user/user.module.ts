import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { GroupModule } from 'src/group/group.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [forwardRef(() => AuthModule), GroupModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
