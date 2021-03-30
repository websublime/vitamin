import { usePreferredDark, useStorage } from '@vueuse/core';
import { computed, Ref, watch } from 'vue';

const preferredDark = usePreferredDark();
const schema: Ref<'auto' | 'dark' | 'light'> = useStorage('icones-schema', 'auto');

export const isDark = computed({
  get() {
    return schema.value === 'auto' ? preferredDark.value : schema.value === 'dark';
  },
  set(value: boolean) {
    if (value === preferredDark.value) {
      schema.value = 'auto';
    } else {
      schema.value = value ? 'dark' : 'light';
    }
  }
});

watch(
  isDark,
  value => document.documentElement.classList.toggle('dark', value),
  { immediate: true }
);
