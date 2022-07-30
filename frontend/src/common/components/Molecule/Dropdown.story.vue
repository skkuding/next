<script setup lang="ts">
import Dropdown from '../Molecule/Dropdown.vue'
import ListItem from '../Atom/ListItem.vue'
import Fa6RegularUser from '~icons/fa6-regular/user'
</script>

<template>
  <Story>
    <Dropdown>
      <template #button>
        <Fa6RegularUser
          class="text-text-title ml-32 text-xl hover:opacity-60 active:opacity-40"
        />
      </template>
      <template #items>
        <ListItem>Management</ListItem>
        <ListItem>Settings</ListItem>
        <ListItem>Logout</ListItem>
      </template>
    </Dropdown>
  </Story>
</template>
