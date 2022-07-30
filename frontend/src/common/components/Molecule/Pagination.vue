<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Atom/Button.vue'
import AngelLeft from '~icons/fa6-solid/angle-left'
import AngelRight from '~icons/fa6-solid/angle-right'
import Ellipsis from '~icons/fa6-solid/ellipsis'

const props = defineProps<{
  numberOfPages: number
}>()

const emit = defineEmits(['change-page'])

defineExpose({
  changePage
})

const currentPage = ref(1)

function changePage(page: number): void {
  if (1 <= page && page <= props.numberOfPages) {
    currentPage.value = page
    emit('change-page', currentPage.value)
  }
}
</script>

<template>
  <div class="flex flex-row">
    <Button
      color="white"
      :class="currentPage === 1 ? 'pointer-events-none' : ''"
      class="mr-1 aspect-square rounded-lg"
      @click="changePage(currentPage - 1)"
    >
      <AngelLeft />
    </Button>

    <Button
      :color="currentPage === 1 ? 'gray-dark' : 'gray'"
      :class="currentPage === 1 ? 'pointer-events-none' : ''"
      class="mr-1 aspect-square w-9 rounded-lg"
      @click="changePage(1)"
    >
      1
    </Button>

    <div v-if="currentPage - 1 > 2" class="text-gray-dark mr-1 px-2 py-2">
      <Ellipsis />
    </div>

    <Button
      v-if="currentPage > 2"
      color="gray"
      class="mr-1 aspect-square w-9 rounded-lg"
      @click="changePage(currentPage - 1)"
    >
      {{ currentPage - 1 }}
    </Button>

    <Button
      v-if="![1, numberOfPages].includes(currentPage)"
      color="gray-dark"
      class="pointer-events-none mr-1 aspect-square w-9 rounded-lg"
      @click="changePage(currentPage)"
    >
      {{ currentPage }}
    </Button>

    <Button
      v-if="currentPage + 1 < numberOfPages"
      color="gray"
      class="mr-1 aspect-square w-9 rounded-lg"
      @click="changePage(currentPage + 1)"
    >
      {{ currentPage + 1 }}
    </Button>

    <div
      v-if="numberOfPages - currentPage > 2"
      class="text-gray-dark mr-1 px-2 py-2"
    >
      <Ellipsis />
    </div>

    <Button
      v-if="numberOfPages > 1"
      :color="currentPage === numberOfPages ? 'gray-dark' : 'gray'"
      :class="currentPage === numberOfPages ? 'pointer-events-none' : ''"
      class="mr-1 aspect-square w-9 rounded-lg"
      @click="changePage(numberOfPages)"
    >
      {{ numberOfPages }}
    </Button>

    <Button
      color="white"
      :class="currentPage === numberOfPages ? 'pointer-events-none' : ''"
      class="mr-1 aspect-square rounded-lg"
      @click="changePage(currentPage + 1)"
    >
      <AngelRight />
    </Button>
  </div>
</template>
