<script setup lang="ts">
const session = useStrapiSession()
</script>

<template>
  <main style="padding: 2rem; font-family: sans-serif;">
    <h1>Nuxt Strapi Core SSR Fixture</h1>
    <p>Transport: server-proxy</p>
    <p>Initialized: {{ session.isInitialized }}</p>
    <p>Authenticated: {{ session.isAuthenticated }}</p>
  </main>
</template>
