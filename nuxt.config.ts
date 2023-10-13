import { appDescription } from './constants/index'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import { pwa } from './config/pwa'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@vant/nuxt',
  ],

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  css: [
    // 'element-plus/dist/index.css',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/styles/default.scss" as *;', // 注意文件路径要配成自己的
        },
      },
    },
    plugins: [
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'assets/svg')],
      }),
    ],
  },

  colorMode: {
    classSuffix: '',
  },

  nitro: {
    devProxy: {
      '/platformapi': {
        target: 'http://192.168.103.245:30119', // 这里是接口地址
        changeOrigin: true,
        // prependPath: true,
      },
      '/customerweb': {
        target: 'http://192.168.103.245:30119/customerweb', // 这里是接口地址
        changeOrigin: true,
        // prependPath: true,
      },
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
      ignore: ['/hi'],
    },
  },

  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/nuxt.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
      ],
    },
  },
  // 自定义配置项
  runtimeConfig: {
    // 只在服务端可以访问的配置项
    apiSecret: 'api-secret',
    // 可以暴露给客户端使用的配置项
    public: {},
  },
  postcss: {
    plugins: {
      'postcss-px-to-viewport-8-plugin': {
        unitToConvert: 'px', // 要转化的单位
        viewportWidth: 375, // UI设计稿的宽度
        // viewportHeight: 667, // UI
        unitPrecision: 6, // 转换后的精度，即小数点位数
        // propList: 当有些属性的单位我们不希望转换的时候，可以添加在数组后面，并在前面加上!号，如propList: ["*","!letter-spacing"],这表示：所有css属性的属性的单位都进行转化，除了letter-spacing的
        propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
        // viewportUnit: 'vw', // 指定需要转换成的视窗单位，默认vw
        // fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
        exclude: [/node_modules/i],
        // 转换的黑名单，在黑名单里面的我们可以写入字符串，只要类名包含有这个字符串，就不会被匹配。比如selectorBlackList: ['wrap'],它表示形如wrap,my-wrap,wrapper这样的类名的单位，都不会被转换
        selectorBlackList: ['ignore', 'van'], // 指定不转换为视窗单位的类名，
        minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
        mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
        replace: true, // 是否转换后直接更换属性值
        // exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
        // include: [/node_modules/],
        landscape: false, // 是否处理横屏情况
      },
    },
  },

  pwa,

  devtools: {
    enabled: true,
  },
})
