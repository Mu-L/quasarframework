<template>
  <div class="q-pa-md" style="max-width: 300px">
    <div class="q-gutter-md">
      <q-select
        disable-tab-selection
        filled
        v-model="model"
        :options="options"
        stack-label
        label="Standard"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const model = ref(null)
    const options = ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle']
    return { model, options }
  }
}
</script>
