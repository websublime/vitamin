<template>
  <div
    :class="[
      'vui-card',
      shadowRef,
      roundRef,
      typeClass,
      {
        'vui-card--border': borderRef
      }
    ]"
  >
    <header
      v-if="title || $slots.header"
      class="vui-card__header"
    >
      <h3
        v-if="title"
        class="vui-card__title"
      >
        {{ title }}
      </h3>

      <slot name="header" />
    </header>

    <section
      v-if="image || $slots.media"
      class="vui-card__media"
      :style="typeStyle"
    >
      <slot name="media" />
    </section>

    <section
      v-if="$slots.default"
      class="vui-card__body"
    >
      <slot />
    </section>

    <footer
      v-if="$slots.footer"
      class="vui-card__footer"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<script lang="ts" src="./card.component.ts"></script>
