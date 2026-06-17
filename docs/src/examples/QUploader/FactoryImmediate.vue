<template>
  <div class="q-pa-md">
    <q-uploader :factory="factoryFn" multiple style="max-width: 300px" />
  </div>
</template>

<script>
export default {
  setup() {
    function factoryFn(files) {
      return {
        url: 'http://localhost:4444/upload',
        method: 'POST'
      }
    }
    return { factoryFn }
  }
}
</script>
