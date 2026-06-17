<template>
  <div class="q-pa-md">
    <q-range v-model="model" color="secondary" :min="0" :max="50" disable />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const model = ref({
      min: 10,
      max: 35
    })
    return { model }
  }
}
</script>
