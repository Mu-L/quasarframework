<template>
  <div class="q-pa-md" style="max-width: 300px">
    <q-input v-model="text" filled autogrow />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const text = ref('')
    return { text }
  }
}
</script>
