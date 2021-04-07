<template>
  <div
    v-if="visibility"
    :class="[
      'vui-alert',
      shadowRef,
      roundRef,
      typeClass,
      {
        'vui-alert--border': borderRef
      }
    ]"
  >
    <div
      v-if="withMedia || $slots.media"
      :class="[typeMedia]"
    >
      <slot name="media">
        <Icon
          :icon="mediaIconRef"
          class="vui-alert__media-icon"
          height="32"
        />
      </slot>
    </div>

    <div :class="['vui-alert__content']">
      <span
        v-if="titleRef || $slots.title"
        class="vui-alert__title"
      >
        <slot name="title">{{ titleRef }}</slot>
      </span>

      <p
        v-if="$slots.default || !!description"
        class="vui-alert__description"
      >
        <slot>{{ description }}</slot>
      </p>

      <Icon
        v-if="closableRef"
        :icon="closeIconRef"
        class="vui-alert__close"
        height="12"
        @click.prevent="handleClose"
      />
    </div>
  </div>
</template>

<script lang="ts" src="./alert.component.ts"></script>
