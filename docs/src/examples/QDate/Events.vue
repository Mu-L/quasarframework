<template>
  <div class="q-pa-md">
    <div class="q-gutter-md">
      <q-date v-model="date" :events="events" />

      <q-date v-model="date" :events="eventsFn" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const date = ref('2019/02/01')
    const events = [
      // #region
      '2019/02/01',
      '2019/02/05',
      '2019/02/06',
      '2019/02/09',
      '2019/02/23'
      // #endregion
    ]

    function eventsFn(d) {
      const parts = d.split('/')
      return parts[2] % 2 === 0
    }

    return {
      date,
      events,
      eventsFn
    }
  }
}
</script>
