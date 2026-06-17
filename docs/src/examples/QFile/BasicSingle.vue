<template>
  <div class="q-pa-md">
    <q-file
      v-model="file"
      label="Pick one file"
      filled
      style="max-width: 300px"
    />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const file = ref(null)
    return { file }
  }
}
</script>
