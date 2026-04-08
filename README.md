# nuxt-strapi-core

Reusable Nuxt 3 + Strapi 5 core module for:

- generic Strapi CRUD composables
- auth composables
- basic user composables
- generic upload composables
- SSR cookie-backed proxy mode
- direct browser-token mode for static deployments

## Requirements

- Node.js 22.x
- Nuxt 3
- Strapi 5

This package is intentionally limited to reusable infrastructure. It does not include app-specific store wiring, `ensureUser()`, custom course/user endpoints, or file-manager orchestration such as global-vs-course libraries.

## Included APIs

- `useStrapi()`
- `useStrapiAuth()`
- `useStrapiUser()`
- `useStrapiUpload()`
- `useStrapiSession()`

## Transport Modes

### `server-proxy`

Recommended for SSR/serverful Nuxt apps.

- composables call local Nitro proxy routes under `proxyBase`
- the module manages an `httpOnly` Strapi JWT cookie
- auth cookies are cleared automatically after upstream `401/403`

### `direct`

Recommended for static/generated apps.

- composables call Strapi directly from the browser
- auth state is stored through a token adapter
- the default adapter uses `localStorage`

## Installation

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-strapi-core"],
  strapiCore: {
    strapiUrl: process.env.STRAPI_URL || "http://localhost:1337",
    transport: "server-proxy",
  },
});
```

## Module Options

```ts
export default defineNuxtConfig({
  modules: ["nuxt-strapi-core"],
  strapiCore: {
    strapiUrl: "http://localhost:1337",
    transport: "server-proxy",
    proxyBase: "/api/strapi",
    timeoutMs: 10000,
    auth: {
      cookieName: "strapi_jwt",
      tokenStorageKey: "strapi_jwt",
      cookie: {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      },
    },
  },
});
```

## Auth Example

```vue
<script setup lang="ts">
const auth = useStrapiAuth();
const session = useStrapiSession();

const login = async () => {
  await auth.login("admin@example.com", "secret");
  await auth.getMe();
};
</script>
```

## Direct-Mode Custom Token Adapter

The module ships with a default local-storage adapter. If a project needs something else, provide `strapiSessionAdapter` from an app plugin.

```ts
// plugins/00.strapi-adapter.client.ts
import { defineStrapiTokenAdapter } from "nuxt-strapi-core/runtime";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide(
    "strapiSessionAdapter",
    defineStrapiTokenAdapter({
      getToken: () => sessionStorage.getItem("strapi_jwt"),
      setToken: (token) => sessionStorage.setItem("strapi_jwt", token),
      clearToken: () => sessionStorage.removeItem("strapi_jwt"),
    }),
  );
});
```

## Boundary

Keep these outside the core package:

- Pinia store orchestration
- `ensureUser()` and app-specific auth/bootstrap flows
- custom Strapi endpoints such as `users/me/courses`
- media/document library orchestration like `useStrapiFileManager()`

Those should be rebuilt in each app on top of `useStrapi()` and `useStrapiUpload()`.

## Fixtures

Two minimal fixture apps are included:

- [`playgrounds/ssr`](./playgrounds/ssr): SSR + `server-proxy`
- [`playgrounds/static`](./playgrounds/static): client-only + `direct`

They are scaffolds for validating the module in isolation once the package is moved into its own repo/workspace.
