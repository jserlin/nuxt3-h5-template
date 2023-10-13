<template>
  <div
    class="pdf-vue3-main"
    style="position: relative; height: 100%; min-height: 10px"
  >
    <div class="pdf-vue3-container" style="height: 100%">
      <div
        ref="scroller"
        class="pdf-vue3-scroller"
        style="height: 100%; overflow-y: auto"
        :style="{ maxHeight: `${viewportHeight}px` }"
        @scroll="handleScroll"
      >
        <div
          class="pdf-vue3-canvas-container"
          ref="container"
          style="margin: 0 auto"
          :style="{
            width: isNaN(Number(props.pdfWidth))
              ? props.pdfWidth
              : `${props.pdfWidth}px`,
          }"
        >
          <canvas
            style="
              display: block;
              width: calc(100% - 4px);
              margin-right: auto;
              margin-left: auto;
              box-shadow: #a9a9a9 0 1px 3px 0;
            "
            :style="{
              marginBottom: `${rowGap}px`,
            }"
            v-for="item in totalPages"
            :key="item"
            :ref="canvasRefs[item - 1]"
          ></canvas>
        </div>
      </div>
    </div>
    <div
      class="pdf-vue3-progress"
      v-if="props.showProgress"
      style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        pointer-events: none;
        user-select: none;
      "
    >
      <slot v-if="slots.progress" name="progress" :loadRatio="loadRatio"></slot>
      <div
        v-else
        style="width: 0%; height: 4px; transition: all 0.2s"
        :style="{
          width: `${loadRatio}%`,
          opacity: loadRatio < 100 ? '1' : '0',
          backgroundColor: props.progressColor,
        }"
      ></div>
    </div>
    <div
      class="pdf-vue3-pageTooltip"
      v-if="props.showPageTooltip"
      style="
        position: absolute;
        top: 12px;
        left: 12px;
        width: calc(100% - 12px);
        pointer-events: none;
        user-select: none;
      "
    >
      <slot
        v-if="slots.pageTooltip"
        name="pageTooltip"
        :currentPage="currentPage"
        :totalPages="totalPages"
      ></slot>
      <div
        v-else
        style="
          display: inline-block;
          padding: 4px 8px;
          font-size: 16px;
          color: #fff;
          background: rgb(0 0 0 / 50%);
          border-radius: 6px;
          transition: opacity 0.3s;
        "
        :style="{ opacity: isScrolling && totalPages > 0 ? '1' : '0' }"
      >
        {{ currentPage }}/{{ totalPages }}
      </div>
    </div>
    <div
      class="pdf-vue3-backToTopBtn"
      v-if="props.showBackToTopBtn"
      @click="backToTop"
      style="
        position: absolute;
        right: 16px;
        bottom: 16px;
        display: inline-block;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s;
        user-select: none;
      "
      :style="
        scrollOffset > props.scrollThreshold
          ? { opacity: '1', pointerEvents: 'initial' }
          : undefined
      "
    >
      <slot
        v-if="slots.backToTopBtn"
        name="backToTopBtn"
        :scrollOffset="scrollOffset"
      ></slot>
      <div
        v-else
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          font-size: 16px;
          color: #fff;
          background: rgb(0 0 0 / 40%);
          border-radius: 50%;
        "
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M11.0001 22.2877H13.0001V7.80237L16.2428 11.045L17.657 9.63079L12.0001 3.97394L6.34326 9.63079L7.75748 11.045L11.0001 7.80236V22.2877ZM18 3H6V1H18V3Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup>
// import pdfjs from 'pdfjs-dist/legacy/build/pdf.min.js'
// console.log(`既然手边有树叶 ~ file: PdfView.vue:158 ~ pdfjs:`, pdfjs)
// import {
//   // ref,
//   // onUnmounted,
//   // computed,
//   // watch,
//   // onBeforeMount,
//   // defineEmits,
// } from 'vue'

let GlobalWorkerOptions, getDocument

const dpr = ref(1)

const props = defineProps({
  src: undefined,
  httpHeaders: undefined,
  withCredentials: undefined,
  password: undefined,
  useSystemFonts: undefined,
  stopAtErrors: undefined,
  disableFontFace: undefined,
  disableRange: undefined,
  disableStream: undefined,
  disableAutoFetch: undefined,
  showProgress: true,
  progressColor: '#87ceeb',
  showPageTooltip: true,
  showBackToTopBtn: true,
  scrollThreshold: 300,
  pdfWidth: '100%',
  rowGap: 8,
  page: 1,
})

const rowGap = computed(() => parseInt(String(props.rowGap)))

const emit = defineEmits([
  'onProgress',
  'onComplete',
  'onScroll',
  'onPageChange',
])

// const slots = defineSlots<{
//   progress?: (props: { loadRatio: number }) => any
//   pageTooltip?: (props: { currentPage: number; totalPages: number }) => any
//   backToTopBtn?: (props: { scrollOffset: number }) => any
// }>()

const canvasRefs = ref([])

const loadRatio = ref(0)
const loadingTask = ref(null)
const getDoc = () => {
  const option = {
    httpHeaders: props.httpHeaders,
    withCredentials: props.withCredentials,
    password: props.password,
    useSystemFonts: props.useSystemFonts,
    stopAtErrors: props.stopAtErrors,
    disableFontFace: props.disableFontFace,
    disableRange: props.disableRange,
    disableStream: props.disableStream,
    disableAutoFetch: props.disableAutoFetch,
    cMapUrl: '/lib/cmaps', // 这里用项目public目录下的数据。
    // cMapUrl: 'https://unpkg.com/pdfjs-dist@3.7.107/cmaps/',
  }
  if ((props.sourceType = 'pdf')) {
    option.url = props.src
  } else if (props.src instanceof Uint8Array) {
    option.data = props.src
  } else {
    const binaryData = atob(
      props.src.includes(',') ? props.src.split(',')[1] : props.src
    )
    const byteArray = new Uint8Array(binaryData.length)
    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i)
    }
    option.data = byteArray
  }

  for (const key in option) {
    if (option[key] === undefined) {
      delete option[key]
    }
  }
  loadRatio.value = 0
  loadingTask.value = getDocument(option)
  loadingTask.value.onProgress = progressData => {
    const ratio = (progressData.loaded / progressData.total) * 100
    loadRatio.value = ratio >= 100 ? 100 : ratio
    emit('onProgress', loadRatio.value)
  }
  loadingTask.value.promise.then(() => {
    emit('onComplete')
  })
}

const totalPages = ref(0)
const currentPage = ref(1)
const scrollOffset = ref(0)
const itemHeightList = ref([])

const scroller = ref()
const container = ref()

let pdf
const cancelRendering = ref(false)
const renderComplete = ref(false)
const renderPDF = async () => {
  renderComplete.value = false
  try {
    if (!pdf) {
      pdf = await loadingTask.value.promise
      const refs = []
      for (let i = 0; i < pdf.numPages; i++) {
        refs.push(ref())
      }
      canvasRefs.value = refs
      totalPages.value = pdf.numPages
    }
  } catch (error) {
    console.error('Error loadingTask PDF:', error)
  }
  let calcH = 0
  for (let i = 0; i < totalPages.value; i++) {
    try {
      const page = await pdf.getPage(i + 1)
      // ----
      if (cancelRendering.value) {
        cancelRendering.value = false
        renderPDF()
        break
      }
      // ----
      const canvas = canvasRefs.value[i].value[0]
      var viewport = page.getViewport({ scale: 1 })
      // var scale = (canvas.parentNode.clientWidth - 4) / viewport.width
      var scale = (canvas.parentNode.clientWidth - 4) / viewport.width
      const context = canvas.getContext('2d')
      // const scaledViewport = page.getViewport({ scale: scale * dpr.value })
      const scaledViewport = page.getViewport({ scale: scale * dpr.value })
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      itemHeightList.value[i] = calcH +=
        scaledViewport.height / dpr.value + rowGap.value
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      })
    } catch (error) {
      console.error('Error rendering PDF:', error)
    }
    if (
      props.page &&
      (i === props.page - 1 ||
        (props.page > totalPages.value && i === totalPages.value - 1))
    ) {
      scroller.value.scrollTo(0, (itemHeightList.value[i - 1] ?? 0) + 2)
    }
    if (i === totalPages.value - 1) {
      renderComplete.value = true
    }
  }
}

const viewportHeight = ref(0)
const isScrolling = ref(false)

let scrollTimer
const handleScroll = event => {
  isScrolling.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    isScrolling.value = false
  }, 1000)
  scrollOffset.value = event.target.scrollTop
  emit('onScroll', event.target.scrollTop)
  if (
    scroller.value.scrollTop + scroller.value.offsetHeight >=
    scroller.value.scrollHeight - 10
  ) {
    currentPage.value = itemHeightList.value.length
    return
  }

  for (let i = 0; i < itemHeightList.value.length; i++) {
    const height = itemHeightList.value[i]
    if (height > event.target.scrollTop) {
      currentPage.value = i + 1
      break
    }
  }
}

let timer
const renderPDFWithDebounce = () => {
  viewportHeight.value = window.innerHeight
  if (
    Math.abs(innerWidth.value - window.innerWidth) > 1 &&
    Math.abs(containerWidth.value - container.value.offsetWidth) > 1
  ) {
    setWidth()
  } else {
    setWidth()
    return
  }
  cancelRendering.value = true
  clearTimeout(timer)
  timer = setTimeout(() => {
    renderComplete.value && renderPDF()
  }, 500)
}

const innerWidth = ref(0)
const containerWidth = ref(0)
const setWidth = () => {
  innerWidth.value = window.innerWidth
  containerWidth.value = container.value.offsetWidth
}
const isAddEvent = ref(false)
onMounted(async () => {
  // const pdfjs = (await import('pdfjs-dist/legacy/build/pdf.min.js')).default
  const pdfjs = await import('pdfjs-dist')
  // const pdfjs = await import('~/assets/lib/pdf.js')
  // console.log(
  //   `既然手边有树叶 ~ file: PdfView.vue:381 ~ onMounted ~ pdfjs:`,
  //   pdfjs
  // )
  GlobalWorkerOptions = pdfjs.GlobalWorkerOptions
  getDocument = pdfjs.getDocument
  const workerSrc = new URL(
    '../node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js',
    import.meta.url
  ).href
  // const workerSrc = '/lib/pdf.worker'
  GlobalWorkerOptions.workerSrc = workerSrc
  dpr.value = window.devicePixelRatio || 1
  viewportHeight.value = window.innerHeight
  setWidth()
  if (
    (typeof props.src === 'string' && props.src.length > 0) ||
    props.src instanceof Uint8Array
  ) {
    getDoc()
    renderPDF()
    window.addEventListener('resize', renderPDFWithDebounce)
    isAddEvent.value = true
  }
  watch(
    () => props.src,
    src => {
      if (
        (typeof src === 'string' && src.length > 0) ||
        src instanceof Uint8Array
      ) {
        getDoc()
        renderPDF()
        if (!isAddEvent.value) {
          window.addEventListener('resize', renderPDFWithDebounce)
          isAddEvent.value = true
        }
      }
    }
  )
})

onUnmounted(() => {
  clearTimeout(timer)
  clearTimeout(scrollTimer)
  cancelAnimationFrame(animFrameId)
  isAddEvent.value &&
    window.removeEventListener('resize', renderPDFWithDebounce)
})
// --- back to top ---
let animFrameId
const easeOutCubic = progress => {
  return 1 - Math.pow(1 - progress, 3)
}
const backToTop = () => {
  const duration = 500
  const startPos = scroller.value.scrollTop
  const startTime = performance.now()

  const animateScroll = timestamp => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeOutCubic(progress)
    const distance = startPos * (1 - easeProgress)

    scroller.value.scrollTo(0, distance)

    if (progress < 1) {
      animFrameId = requestAnimationFrame(animateScroll)
    }
  }
  cancelAnimationFrame(animFrameId)
  requestAnimationFrame(animateScroll)
}
let waitToPageFun = null
watch(
  () => props.page,
  page => {
    if (props.page === currentPage.value) {
      return
    }
    if (page > itemHeightList.value.length) {
      page = itemHeightList.value.length
    }
    if (renderComplete.value) {
      scroller.value.scrollTo(0, (itemHeightList.value[page - 2] ?? 0) + 2)
    } else {
      waitToPageFun = () => {
        scroller.value.scrollTo(0, (itemHeightList.value[page - 2] ?? 0) + 2)
      }
    }
  }
)
watch(
  () => renderComplete.value,
  complete => {
    complete && waitToPageFun?.()
    waitToPageFun = null
  }
)
watch(
  () => currentPage.value,
  page => {
    emit('onPageChange', page)
  }
)
</script>

<style></style>
