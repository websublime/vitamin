<template>
  <main class="vt-docs">
    <vt-sidebar :links="menu" />

    <div class="vt-docs__container">
      <header class="vt-docs__head">
        <ul class="flex items-center space-x-8 lg:flex">
          <li class="flex-grow">
            {{ activeMenu ? activeMenu.description : '' }}
          </li>

          <li>
            <vui-button
              space="sm"
              rounded="full"
              class="vt-docs__themer"
              @click="toggleTheme"
            >
              <Icon
                :icon="icon"
                height="24"
              />
            </vui-button>
          </li>
        </ul>
      </header>

      <main class="vt-docs__main">
        <div class="vt-docs__content">
          <router-view />
        </div>
      </main>
    </div>
  </main>
</template>

<script lang="ts" src="./documentation.container"></script>

<style src="./documentation.style.css"></style>
