<script setup lang="ts">
import Button from './Button.vue'
import Toast from './Toast.vue'
import { useToast } from '@/common/composables/toast'

const openToast = useToast()

const messages = [
  'nisi vitae suscipit',
  'enim sit amet',
  'augue neque gravida',
  'quam viverra orci',
  'potenti nullam ac'
]

const getMessage = () => {
  return messages[Math.floor(Math.random() * 5)]
}
</script>

<template>
  <Story>
    <Variant title="Default">
      <Toast />
      <Button @click="openToast({ message: getMessage() })">Click me!</Button>
    </Variant>
    <Variant title="Durations">
      <Toast />
      <Button @click="openToast({ message: '500ms (short!)', duration: 500 })">
        500ms
      </Button>
      <Button @click="openToast({ message: '2000ms', duration: 2000 })">
        2000ms
      </Button>
      <Button @click="openToast({ message: '5000ms (long!)', duration: 5000 })">
        5000ms
      </Button>
    </Variant>
    <Variant title="Types">
      <Toast />
      <Button @click="openToast({ message: getMessage(), type: 'info' })">
        Info
      </Button>
      <Button @click="openToast({ message: getMessage(), type: 'success' })">
        Success
      </Button>
      <Button @click="openToast({ message: getMessage(), type: 'warn' })">
        Warn
      </Button>
      <Button @click="openToast({ message: getMessage(), type: 'error' })">
        Error
      </Button>
    </Variant>
  </Story>
</template>
