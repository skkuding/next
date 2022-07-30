<script setup lang="ts">
import MyComponent from '../../components/MyComponent.vue'
defineProps<{
  groupId: number
}>()
</script>

<template>
  <div>This is group contest page : id = {{ groupId }}</div>
  <MyComponent msg="group contest!" />
</template>
