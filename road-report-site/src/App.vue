<script setup lang="ts">
  import Home from "@/views/Home.vue";
  import TitleBar from "@/views/TitleBar.vue";
  import { RouterView } from "vue-router";
</script>

<template>
  <TitleBar/>
  <div class="p-8">
    <RouterView/>
  </div>
</template>

<style scoped></style>
