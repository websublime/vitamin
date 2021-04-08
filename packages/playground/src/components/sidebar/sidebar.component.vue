<template>
  <div class="flex">
    <!-- Backdrop -->
    <div
      :class="isOpen ? 'block' : 'hidden'"
      class="fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"
      @click="isOpen = false"
    />
    <!-- End Backdrop -->

    <div
      :class="isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'"
      class="vt-sidebar"
    >
      <div class="vt-sidebar__header">
        <div class="vt-sidebar__header-content">
          <router-link to="/">
            <img
              v-show="isDark"
              src="@/assets/vit-dark.png"
              alt="Vitamin Logo"
              class="vt-sidebar__logo"
            >
            <img
              v-show="!isDark"
              src="@/assets/vit-light.png"
              alt="Vitamin Logo"
              class="vt-sidebar__logo"
            >
          </router-link>

          <span class="vt-sidebar__title">itamin</span>
        </div>
      </div>

      <nav class="vt-sidebar__nav">
        <router-link
          v-for="(item, idx) in links"
          :key="idx"
          class="vt-sidebar__nav-link"
          :to="{name: item.route}"
        >
          <Icon
            :icon="item.icon"
            class="vt-link__icon"
            height="24"
          />

          <span class="mx-4">{{ item.title }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script lang="ts" src="./sidebar.component"></script>

<style src="./sidebar.style.css"></style>
