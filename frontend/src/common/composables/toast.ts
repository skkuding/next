import { createEventHook } from '@vueuse/core'

export interface ToastOption {
  message: string
  type?: 'info' | 'success' | 'warn' | 'error'
  duration?: number
}

const { trigger, on } = createEventHook<ToastOption>()

export const onTrigger = on

export const useToast = () => {
  return (option: ToastOption) => {
    trigger(option)
  }
}
