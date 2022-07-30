<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{
  slides: string[]
}>()

const currentSlide = ref(0)
const direction = ref('right')

const { pause, resume } = useIntervalFn(() => {
  currentSlide.value =
    currentSlide.value + 1 < props.slides.length ? currentSlide.value + 1 : 0
}, 3000)

const switchSlide = (index: number) => {
  direction.value = index - currentSlide.value > 0 ? 'right' : 'left'
  currentSlide.value = index
  resume
}

onMounted(() => {
  resume
})

onBeforeUnmount(() => {
  pause
})
</script>
<template>
  <div class="flex justify-center">
    <div class="relative h-[600px] w-full overflow-hidden">
      <div class="absolute left-1/2 bottom-5 z-10 -translate-x-1/2">
        <button
          v-for="index in slides.length"
          :key="index"
          class="m-1 h-4 w-4 cursor-pointer rounded-full border-none bg-white opacity-50"
          :class="currentSlide === index - 1 ? 'opacity-100' : ''"
          @click="switchSlide(index - 1)"
          @mouseenter="pause"
          @mouseout="resume"
        ></button>
      </div>
      <transition
        :name="direction === 'right' ? 'slide-out' : 'slide-in'"
        class="absolute inset-0"
        @mouseenter="pause"
        @mouseout="resume"
      >
        <img
          :key="currentSlide"
          class="h-full w-full"
          :src="slides[currentSlide]"
        />
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* slide-out : move slide from right to left, slide-in : from left to right */
.slide-in-enter-active,
.slide-in-leave-active,
.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 1s ease-in-out;
}
.slide-in-enter-from {
  transform: translateX(-100%);
}
.slide-in-leave-to {
  transform: translateX(100%);
}
.slide-out-enter-from {
  transform: translateX(100%);
}
.slide-out-leave-to {
  transform: translateX(-100%);
}
</style>
