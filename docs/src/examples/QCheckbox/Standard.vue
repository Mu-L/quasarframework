<template>
  <div class="q-pa-md">
    <q-checkbox v-model="val" />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const val = ref(true)
    return { val }
  }
}
</script>
