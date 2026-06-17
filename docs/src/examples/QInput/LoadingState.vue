<template>
  <div class="q-pa-md">
    <div class="q-gutter-y-md column" style="max-width: 300px">
      <q-input :loading="loadingState" filled v-model="text" label="Label" />
      <q-toggle v-model="loadingState" label="Loading state" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const text = ref('')
    const loadingState = ref(false)
    return { text, loadingState }
  }
}
</script>
