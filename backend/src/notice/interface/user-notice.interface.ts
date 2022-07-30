import { Notice } from '@prisma/client'

export interface UserNotice {
  current: Partial<Notice>
  prev?: {
    id: number
    title: string
  }
  next?: {
    id: number
    title: string
  }
}
