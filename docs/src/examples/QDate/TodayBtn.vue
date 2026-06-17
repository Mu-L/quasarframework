<template>
  <div class="q-pa-md">
    <q-date v-model="date" today-btn />
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
