<template>
  <div class="vui-input">
    <template v-if="type !== 'textarea'">
      <input
        :placeholder="placeholder"
        :type="type"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
    </template>

    <template v-else>
      <textarea
        :placeholder="placeholder"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </template>
  </div>
</template>

<script lang="ts" src="./input.component.ts"></script>
