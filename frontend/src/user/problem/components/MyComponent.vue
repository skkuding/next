<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>My Component props : {{ msg }}</div>
</template>
