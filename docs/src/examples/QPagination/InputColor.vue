<template>
  <div class="q-pa-lg flex flex-center">
    <q-pagination
      v-model="current"
      :max="5"
      input
      input-class="text-orange-10"
    />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const current = ref(3)
    return { current }
  }
}
</script>
