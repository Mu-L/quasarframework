<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-date v-model="date" title="John Doe" subtitle="Birthday" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const date = ref('2019/02/01')
    return { date }
  }
}
</script>
