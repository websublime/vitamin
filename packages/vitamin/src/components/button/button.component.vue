<template>
  <!-- eslint-disable max-len -->
  <button
    :class="[
      'vui-button',
      classType,
      spaceType,
      roundRef,
      shadowRef,
      {
        'vui-button__disabled': disableRef || loadingRef,
        'vui-button--border': borderRef
      }
    ]"
    :disabled="disableRef || loadingRef"
    @click="handleClick"
  >
    <slot
      v-if="loadingRef || $slots.loading"
      name="loading"
    >
      <svg
        class="vui-button--loading"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </slot>

    <slot
      v-if="$slots.prefixIcon || iconLeftRef"
      name="prefixIcon"
    >
      <Icon
        :icon="iconLeftRef"
        class="mr-2"
      />
    </slot>

    <span v-if="$slots.default"><slot /></span>

    <slot
      v-if="$slots.sufixIcon || iconRightRef"
      name="sufixIcon"
    >
      <Icon
        :icon="iconRightRef"
        class="ml-2"
      />
    </slot>
  </button>
</template>

<script lang="ts" src="./button.component.ts"></script>
