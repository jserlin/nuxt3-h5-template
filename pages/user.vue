<script setup>
import { getUserInfo } from '~/apis/login'

const { router } = usePageRoute()

definePageMeta({
  requiresAuth: true,
})

const { data, pending, error, refresh } = await useAsyncData('mountains', () =>
  $fetch('https://api.nuxtjs.dev/mountains')
)
console.log(
  `既然手边有树叶 ~ file: user.vue:12 ~ data:`,
  data.value[0].continent
)

useServerSeoMeta({
  title: '从服务端收取数据修改',
  description: data.value[0].continent,
  ogDescription: 'This is my amazing site, let me tell you all about it.',
  ogImage: 'https://example.com/image.png',
  twitterCard: 'summary_large_image',
})

// await setHead()
async function getData() {
  const res = await getUserInfo({
    page: 1,
    pageSize: 20,
  })
}

function logout() {
  const authInfo = useCookie('Authorization')
  authInfo.value = ''
  router.push('/')
}
</script>

<template>
  <div class="my">
    我的，需要登录后访问
    <svg-icon name="logo"></svg-icon>
    <img src="~/assets/images/pdf-1.png" alt="Discover Nuxt 3" />
  </div>
  <div class="flex justify-around">
    <van-button type="primary" @click="logout()"> 退出账号 </van-button>
    <!-- <van-button @click="$router.push('/')"> -->
    <van-button @click="getData"> 返回首页 </van-button>
  </div>
</template>

<style lang="scss">
.my {
  background: $bgColor;
}
</style>
