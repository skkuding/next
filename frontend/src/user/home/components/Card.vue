<script setup lang="ts">
import IconMenu from '~icons/fa6-solid/bars'

defineProps<{
  href: string
  items: {
    title: string
    date: string
    href: string
    state?: string
  }[]
}>()
</script>

<template>
  <section class="w-full rounded-lg p-5 shadow-xl">
    <div class="mb-4 flex justify-between text-xl font-bold">
      <span class="flex items-center">
        <slot name="title" />
      </span>
      <router-link
        :to="href"
        class="cursor-pointer hover:opacity-50 active:opacity-30"
      >
        <IconMenu />
      </router-link>
    </div>
    <div class="flex flex-col gap-1">
      <router-link
        v-for="item in items"
        :key="item.title"
        :to="item.href"
        class="hover:bg-gray/25 active:bg-gray/50 flex cursor-pointer items-center rounded p-1"
      >
        <span><slot name="icon" :item="item.state" /></span>
        <span class="ml-2 mr-auto">{{ item.title }}</span>
        <span class="text-right">{{ item.date }}</span>
      </router-link>
    </div>
  </section>
</template>
