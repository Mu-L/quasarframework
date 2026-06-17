<template>
  <div class="q-pa-md" style="max-width: 300px">
    <q-input
      filled
      v-model="model"
      label="Type here"
      bottom-slots
      hint="Max 3 characters"
      error-message="Please use maximum 3 characters"
      :error="!isValid"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'

export default {
  setup() {
    const model = ref('')
    const isValid = computed(() => model.value.length <= 3)
    return { model, isValid }
  }
}
</script>
