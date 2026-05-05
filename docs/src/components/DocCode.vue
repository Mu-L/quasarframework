<template>
  <div class="relative-position copybtn-hover">
    <CodePrism :lang="props.lang" :code="props.code" />
    <CopyButton />
  </div>
</template>

<script setup>
import { computed } from 'vue'

import CodePrism from './CodePrism.js'
import CopyButton from './CopyButton.vue'

const props = defineProps({
  code: String,
  lang: {
    type: String,
    default: 'js'
  }
})
</script>
