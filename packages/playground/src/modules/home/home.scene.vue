<template>
  <vt-hero class="vt-home__hero">
    <div class="ml-9">
      <h1 class="vt-home__hero-title">
        <img
          v-show="dark"
          src="@/assets/vit-dark.png"
          alt="Logo"
        >
        <img
          v-show="!dark"
          src="@/assets/vit-light.png"
          alt="Logo"
        >
        itamin
      </h1>

      <h6 class="vt-home__hero-subtitle">
        UI Components for Vue
      </h6>

      <p class="vt-home__hero-msg">
        Simple, elegant and functional components.
        Styled to pixel and powered by Tailwind, PostCSS.
        Just old good modern CSS.
      </p>
    </div>

    <img
      src="@/assets/design.svg"
      alt="Brand"
      class="lg:max-h-full md:max-h-60"
    >
  </vt-hero>

  <div class="vt-home__nav">
    <div class="vt-home__nav-content">
      <ul class="vt-home__nav-menu">
        <li>
          <router-link
            class="vt-home__nav-link"
            :to="{ name: 'Config'}"
          >
            Documentation
          </router-link>
        </li>

        <li>
          <a
            href="https://github.com/websublime/vitamin"
            target="_blank"
            aria-label="Github repo"
            title="Github repo"
            class="vt-home__nav-link"
          >Github</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" src="./home.scene"></script>

<style src="./home.style.css"></style>
