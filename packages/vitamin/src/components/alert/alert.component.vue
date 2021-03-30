<template>
  <div v-if="visibility" :class="['vui-alert', typeClass, borderRef ? 'vui-alert--border' : '', shadowRef, roundRef]">
    <Icon
      v-if="closableRef"
      :icon="closeIconRef"
      class="vui-alert__close"
      height="12"
      @click.prevent="handleClose"
    />

    <span
      v-if="titleRef || $slots.title"
      class="vui-alert__title"
    >
      <slot name="title">{{ titleRef }}</slot>
    </span>
  </div>
</template>

<script lang="ts" src="./alert.component.ts"></script>
