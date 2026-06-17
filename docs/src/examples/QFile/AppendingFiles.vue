<template>
  <div class="q-pa-md">
    <q-file
      v-model="files"
      label="Pick files"
      filled
      multiple
      append
      style="max-width: 300px"
    />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const files = ref(null)
    return { files }
  }
}
</script>
