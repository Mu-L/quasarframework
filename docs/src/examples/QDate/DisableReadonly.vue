<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-date v-model="date" disable />

      <q-date v-model="date" readonly />
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
