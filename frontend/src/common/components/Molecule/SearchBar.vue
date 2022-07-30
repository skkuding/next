<script setup lang="ts">
import Button from '../Atom/Button.vue'
import MagnifyingGlass from '~icons/fa6-solid/magnifying-glass'
import { ref } from 'vue'

defineProps<{
  placeholder?: string
}>()

defineEmits(['search'])
const inputData = ref('')
</script>

<template>
  <div class="flex w-fit">
    <input
      v-model="inputData"
      class="border-gray-dark h-9 rounded-l-lg border-2 px-2 focus:outline-0"
      type="text"
      :placeholder="placeholder"
      @keyup.enter="$emit('search', inputData)"
    />
    <Button
      color="gray-dark"
      class="border-gray-dark rounded-l-none rounded-r-lg border-2 border-l-0"
      @click="$emit('search', inputData)"
    >
      <MagnifyingGlass class="text-white" />
    </Button>
  </div>
</template>
