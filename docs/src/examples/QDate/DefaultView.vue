<template>
  <div class="q-pa-md">
    <q-date v-model="date" default-view="Years" />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const date = ref(null)
    return { date }
  }
}
</script>
