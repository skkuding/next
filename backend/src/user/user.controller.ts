import { Controller } from '@nestjs/common'
import { UserService } from './user.service'
import { PwResetEmailDto } from './pwResetEmail.dto'
import { NewPwDto } from './newPw.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/password/reset')
  sendPwResetEmail(@Body() body: PwResetEmailDto): Promise<string> {
    const email: string = body.email
    return this.userService.sendPwResetToken(email)
  }

  @Patch('/:userId/password/reset/:resetToken')
  updatePassword(
    @Body() body: NewPwDto,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resetToken') resetToken: string
  ): Promise<string> {
    const newPassword: string = body.newPassword
    return this.userService.updatePassword(userId, resetToken, newPassword)
  }
}
