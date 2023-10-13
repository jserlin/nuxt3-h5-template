<script setup>
import { ref, watchEffect } from 'vue'

const isMobile = ref(false)
const page = ref(1)

const handlePageChange = newPage => {
  console.log(`new page: ${newPage}`)
  page.value = newPage
}
if (process.client) {
  const resize = () => {
    isMobile.value = window.innerWidth < 768
  }

  watchEffect(() => {
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  })
}
</script>

<template>
  <div>
    <ClientOnly>
      <pdf-view
        src="/customerweb/file/previewFile/162022112544948329/162021855920652391"
        :page="page"
        @on-page-change="handlePageChange"
      ></pdf-view>

      <!-- <PDF
      v-if="showPdf"
      src="http://localhost:8080/customerweb/file/previewFile/161738004753285146/161737893084135433"
    /> -->
    </ClientOnly>
  </div>
</template>

<style>
@media (min-width: 768px) {
  ::v-deep(.pdf-vue3-backToTopBtn) {
    right: 32px !important;
  }
}

.tool-bar {
  position: fixed;
  left: 16px;
  bottom: 16px;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 0px 2px #777;
  border-radius: 4px;
  line-height: 1em;
  padding: 8px;
}

.tool-bar > p {
  margin: 0 0 8px;
}
</style>
