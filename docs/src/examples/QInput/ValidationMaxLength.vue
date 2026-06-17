<template>
  <div class="q-pa-md" style="max-width: 300px">
    <q-input
      ref="inputRef"
      filled
      v-model="model"
      label="Maximum 3 characters"
      :rules="[val => val.length <= 3 || 'Please use maximum 3 characters']"
    />

    <q-btn
      class="q-mt-sm"
      label="Reset Validation"
      @click="reset"
      color="primary"
    />
  </div>
</template>

<script>
import { ref, useTemplateRef } from 'vue'

export default {
  setup() {
    const inputRef = useTemplateRef('inputRef')

    return {
      model: ref(''),
      reset() {
        inputRef.value.resetValidation()
      }
    }
  }
}
</script>
