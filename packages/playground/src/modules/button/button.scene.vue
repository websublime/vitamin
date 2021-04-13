<template>
  <vui-tabs
    :has-border="false"
    class="vt-tabs"
  >
    <vui-tab-item label="Button">
      <button-doc class="mt-8" />
    </vui-tab-item>

    <vui-tab-item label="Button Group">
      <button-group-doc class="mt-8" />
    </vui-tab-item>
  </vui-tabs>
</template>

<script lang="ts">
import ButtonDoc from '@websublime/vitamin/src/components/button/examples/Button.md';
import ButtonGroupDoc from '@websublime/vitamin/src/components/button-group/examples/ButtonGroup.md';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    ButtonDoc,
    ButtonGroupDoc
  }
});
</script>

<style src="./button.style.css"></style>
