import { HttpException, HttpStatus } from '@nestjs/common'

export class InvalidSMTPException extends HttpException {
  constructor(e: Error) {
    super(e.message, HttpStatus.INTERNAL_SERVER_ERROR)
  }
}
