<template>
  <div class="q-pa-md">
    <q-date v-model="date" first-day-of-week="1" />
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
