export class BusinessException extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class InvalidUserException extends BusinessException {}
export class InvalidJwtTokenException extends BusinessException {
  constructor(message) {
    super(`Invalid token: ${message}`)
  }
}

export class EntityNotExistException extends BusinessException {
  constructor(entity) {
    super(`${entity} does not exist`)
  }
}

export class UnprocessableDataException extends BusinessException {}
export class InvalidMailTransporterException extends BusinessException {}

export class InvalidTokenException extends BusinessException {}

export class EmailTransmissionFailedException extends BusinessException {}
