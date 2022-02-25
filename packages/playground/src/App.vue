<script setup>
  import { ref } from 'vue';

  const loading = ref(false);
  const state = ref(null);
</script>

<template>
  <h1 class="text-3xl m-4">
    Components
  </h1>
  
  <section class="grid grid-cols-4 gap-4 justify-items-center">
    <vui-button
      :is-loading="loading"
      class="vui-btn vui-btn-primary is-rounded"
    >
      Primary Button

      <template #loader>
        <vui-loading
          v-model="state"
          class="vui-loading"
        />
      </template>
    </vui-button>

    <vui-button
      class="vui-btn vui-btn-secondary is-rounded"
      label="Secondary Button"
      :is-loading="loading"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-tertiary is-rounded"
      label="Tertiary Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-info is-rounded"
      label="Info Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-success is-rounded"
      label="Success Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-error is-rounded"
      label="Error Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-warning is-rounded"
      label="Warning Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-danger is-rounded"
      label="Danger Button"
      @click="loading = !loading"
    />

    <vui-button
      class="vui-btn vui-btn-secondary is-rounded"
      label="Icon Button"
      icon="calendar"
    />

    <vui-button
      class="vui-btn vui-btn-info is-rounded is-rounded-full"
      icon="account"
      icon-only
    />

    <vui-button
      class="vui-btn vui-btn-info is-rounded"
      label="Button Icon Prefix"
      icon-prefix="chevron-right"
    />

    <vui-button
      class="vui-btn vui-btn-info is-rounded"
      label="Button Icon Sufix"
      icon-sufix="chevron-left"
    />
  </section>
</template>
