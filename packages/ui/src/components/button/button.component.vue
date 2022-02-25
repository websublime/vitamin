<template>
  <button
    :type="type"
    :disabled="disabled"
  >
    <slot
      name="loader"
      :isLoading="active"
    >
      <vui-loading 
        v-model="active"
        class="vui-loading"
      />
    </slot>

    <slot
      name="iconPrefix"
      :icon="iconLeft"
    >
      <vui-icon
        v-if="iconLeft"
        class="vui-icon"
        :icon="iconLeft"
      />
    </slot>

    <slot
      :icon="icon"
      :title="title"
    >
      <vui-icon
        v-if="icon"
        class="vui-icon"
        :icon="icon"
      />

      <span v-if="title && !iconOnly">{{ title }}</span>
    </slot>

    <slot
      name="iconSufix"
      :icon="iconRight"
    >
      <vui-icon
        v-if="iconRight"
        class="vui-icon"
        :icon="iconRight"
      />
    </slot>
  </button>
</template>

<script lang="ts" src="./button.component.ts"></script>
