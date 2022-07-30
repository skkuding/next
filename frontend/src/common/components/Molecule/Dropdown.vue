<script setup lang="ts">
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'

const show = ref(false)
</script>

<template>
  <div class="relative inline-block">
    <button class="cursor-pointer" @click="show = true">
      <slot name="button" />
    </button>
    <OnClickOutside @trigger="show = false">
      <ul
        v-show="show"
        class="border-gray-light absolute right-0 flex w-max flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg"
      >
        <slot name="items" />
      </ul>
    </OnClickOutside>
  </div>
</template>
