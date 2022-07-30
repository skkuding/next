<script setup lang="ts">
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'
import Dropdown from '../Molecule/Dropdown.vue'
import ListItem from '../Atom/ListItem.vue'
import SignatureLogo from '../Atom/SignatureLogo.vue'
import IconUser from '~icons/fa6-regular/user'
import IconBars from '~icons/fa6-solid/bars'
import IconUserGear from '~icons/fa6-solid/user-gear'
import IconSliders from '~icons/fa6-solid/sliders'
import IconArrowRightFromBracket from '~icons/fa6-solid/arrow-right-from-bracket'
import Button from '../Atom/Button.vue'

// TODO: define composable
const auth = ref(false)

const isMenuOpen = ref(false)
</script>

<template>
  <OnClickOutside @trigger="isMenuOpen = false">
    <header class="border-b-gray grid h-14 place-items-center border-b px-8">
      <div class="flex w-full max-w-7xl items-center justify-between">
        <router-link to="/">
          <SignatureLogo
            class="w-40 cursor-pointer active:opacity-40 md:hover:opacity-60"
          />
        </router-link>
        <nav class="text-text-title hidden gap-4 md:flex">
          <router-link
            v-for="{ to, name } in [
              { to: '/notice', name: 'Notice' },
              { to: '/contest', name: 'Contest' },
              { to: '/problem', name: 'Problem' },
              { to: '/group', name: 'Group' }
            ]"
            :key="name"
            class="cursor-pointer text-lg font-semibold hover:opacity-60 active:opacity-40"
            active-class="text-green hover:opacity-70 active:opacity-50"
            :to="to"
          >
            {{ name }}
          </router-link>
        </nav>
        <transition
          enter-active-class="transition-opacity duration-300"
          leave-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
          mode="out-in"
        >
          <Dropdown v-if="auth" class="hidden md:inline-block">
            <template #button>
              <!-- add left margin to center navigation -->
              <IconUser
                class="text-text-title ml-[8.5rem] text-xl hover:opacity-60 active:opacity-40"
              />
            </template>
            <template #items>
              <ListItem>Management</ListItem>
              <ListItem>Settings</ListItem>
              <ListItem @click="auth = false">Logout</ListItem>
              <!-- TODO: log out functionality -->
            </template>
          </Dropdown>
          <div v-else class="ml-2 hidden gap-2 md:flex">
            <Button color="gray-dark" class="w-20">Sign Up</Button>
            <Button color="gray-dark" class="w-16" @click="auth = true">
              Log In
            </Button>
            <!-- TODO: show log in page -->
          </div>
        </transition>
        <IconBars
          class="text-text-title cursor-pointer text-xl active:opacity-60 md:hidden"
          @click="isMenuOpen = !isMenuOpen"
        />
      </div>
      <transition
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-show="isMenuOpen"
          class="fixed inset-x-0 top-14 flex w-full flex-col items-center justify-center gap-6 overflow-hidden bg-white/30 py-8 shadow-lg backdrop-blur"
        >
          <nav class="text-text-title flex flex-col items-center gap-2">
            <router-link
              v-for="{ to, name } in [
                { to: '/notice', name: 'Notice' },
                { to: '/contest', name: 'Contest' },
                { to: '/problem', name: 'Problem' },
                { to: '/group', name: 'Group' }
              ]"
              :key="name"
              class="cursor-pointer font-semibold active:opacity-60"
              active-class="text-green active:opacity-70"
              :to="to"
            >
              {{ name }}
            </router-link>
          </nav>
          <transition
            enter-active-class="transition-opacity duration-300"
            leave-active-class="transition-opacity duration-300"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <div v-if="auth" class="text-text-title flex gap-4 text-lg">
              <IconUserGear class="active:opacity-60" />
              <IconSliders class="active:opacity-60" />
              <IconArrowRightFromBracket
                class="active:opacity-60"
                @click="auth = false"
              />
            </div>
            <div v-else class="flex gap-2">
              <Button color="gray-dark" class="text-sm">Sign Up</Button>
              <Button color="gray-dark" class="text-sm" @click="auth = true">
                Log In
              </Button>
            </div>
          </transition>
        </div>
      </transition>
    </header>
  </OnClickOutside>
</template>
