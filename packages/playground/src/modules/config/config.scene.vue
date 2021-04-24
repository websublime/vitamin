<template>
  <config-doc />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ConfigDoc from './Config.md';

export default defineComponent({
  components: {
    ConfigDoc
  }
});
</script>
