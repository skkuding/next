<script setup lang="ts">
import IconGithub from '~icons/fa6-brands/github'
import IconEnvelope from '~icons/fa6-solid/envelope'
import IconKakaoTalk from '~icons/ri/kakao-talk-fill'
import IconLink from '~icons/fa6-solid/link'
import { useClipboard } from '@vueuse/core'

const { copy } = useClipboard()

const copyEmail = () => {
  copy('skkucodingplatform@gmail.com')
  // TODO: use custom alert
  alert('Email copied!')
}
</script>

<template>
  <footer
    class="bg-gray-light text-gray-dark fixed bottom-0 flex w-full flex-col items-center gap-y-2 py-4"
  >
    <div
      class="[&>a:hover]:text-gray [&>a:active]:text-gray-light flex flex-row gap-x-4 text-xl [&>a]:cursor-pointer [&>a]:transition"
    >
      <a href="https://github.com/skkuding/skku-coding-platform">
        <IconGithub />
      </a>
      <a @click="copyEmail">
        <IconEnvelope />
      </a>
      <a href="http://pf.kakao.com/_UKraK/chat">
        <IconKakaoTalk />
      </a>
      <a href="https://npc.skku.edu">
        <IconLink />
      </a>
    </div>
    <div>© 2020-2022 SKKUDING</div>
  </footer>
</template>
