import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException
} from '@nestjs/common'
import { UnprocessableDataException } from 'src/common/exception/business.exception'
import { SignUpDto } from './dto/sign-up.dto'
import { UserService } from './user.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      await this.userService.signUp(signUpDto)
      return
    } catch (err) {
      if (err instanceof UnprocessableDataException) {
        throw new UnprocessableEntityException(err.message)
      }
      throw new InternalServerErrorException()
    }
  }
}
