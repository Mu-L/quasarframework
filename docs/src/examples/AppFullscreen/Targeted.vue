<template>
  <div class="q-pa-md">
    <q-btn
      color="secondary"
      @click="toggle"
      :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
      :label="$q.fullscreen.isActive ? 'Exit Fullscreen' : 'Go Fullscreen'"
    />
  </div>
</template>

<script>
import { useQuasar } from 'quasar'

export default {
  setup() {
    const $q = useQuasar()

    function toggle(e) {
      const target = e.target.parentNode.parentNode.parentNode

      $q.fullscreen
        .toggle(target)
        .then(() => {
          // success!
        })
        .catch(err => {
          alert(err)
          // uh, oh, error!!
          // console.error(err)
        })
    }

    return {
      toggle
    }
  }
}
</script>
