<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-time v-model="time" landscape />

      <q-time v-model="timeWithSeconds" with-seconds landscape />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const time = ref('10:56')
    const timeWithSeconds = ref('09:24:10')
    return { time, timeWithSeconds }
  }
}
</script>
