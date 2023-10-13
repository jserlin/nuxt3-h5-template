// 注入脚本

import 'virtual:svg-icons-register'

import svgIcon from '~/components/SvgIcon.vue'

export default defineNuxtPlugin(nuxtApp => {
    nuxtApp.vueApp.component('svg-icon', svgIcon)
})