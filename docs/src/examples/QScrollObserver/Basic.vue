<template>
  <div class="q-pa-md">
    <pre class="q-ma-none container">{{ scrollInfo }}</pre>
    <q-scroll-observer @scroll="onScroll" />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const scrollInfo = ref({})

    function onScroll(info) {
      scrollInfo.value = info
    }

    return {
      scrollInfo,
      onScroll
    }
  }
}
</script>

<style lang="sass" scoped>
.container
  font-size: 10px
</style>
