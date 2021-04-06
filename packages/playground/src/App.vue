<template>
  <div
    class="bg-white transition-colors duration-500 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
  >
    <doc-header />
    <main class="w-full max-w-screen-xl mx-auto px-6">
      <div class="lg:flex -mx-6">
        <!-- sidebar -->
        <doc-siderbar />
        <!-- content -->
        <div class="flex min-h-screen w-full lg:w-3/4 xl:w-4/5">
          <router-view />
        </div>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import DocHeader from './components/DocHeader.vue';
import DocSiderbar from './components/DocSiderbar.vue';

export default {
  components: {
    DocHeader,
    DocSiderbar
  },
  name: 'App'
};
</script>

<style>
.dark .vuedoc-demo__preview {
  background-color: rgba(31, 41, 55, var(--tw-bg-opacity));
}

.dark .vuedoc-demo__footer {
  background-color: transparent;
  border-radius: none;
}
</style>
