<template>
  <div class="q-pa-md bg-grey-9 text-white">
    <q-toggle color="blue" dark v-model="blue" />

    <q-toggle color="green" dark v-model="green" />

    <q-toggle color="yellow" dark v-model="yellow" />

    <q-toggle color="red" dark v-model="red" />
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const blue = ref(false)
    const green = ref(true)
    const yellow = ref(true)
    const red = ref(false)
    return {
      blue,
      green,
      yellow,
      red
    }
  }
}
</script>
