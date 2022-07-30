<script setup lang="ts">
import SignatureLogo from './SignatureLogo.vue'
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant title="default">
      <SignatureLogo />
    </Variant>
    <Variant title="sizing">
      <SignatureLogo class="w-32" />
    </Variant>
  </Story>
</template>
