<script setup lang="ts">
const { count, inc, dec } = useCount()
const emit = defineEmits([
  'onProgress',
  'onComplete',
  'onScroll',
  'onPageChange',
])
</script>

<template>
  <div inline-flex m="y-3">
    <button rounded-full p-2 btn @click="dec()">
      <div i-carbon-subtract />
    </button>
    <div font="mono" w="15" m-auto inline-block>
      {{ count }}
    </div>
    <button rounded-full p-2 btn @click="inc()">
      <div i-carbon-add />
    </button>
  </div>
</template>
