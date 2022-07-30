<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
defineProps<{
  noticeId: number
}>()
</script>

<template>
  <div>This is notice detail page : id = {{ noticeId }}</div>
  <MyComponent msg="notice detail!" />
</template>
