import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    compatibilityDate: '2026-04-08',
    modules: ['nuxt-strapi-core'],
    strapiCore: {
        strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
        transport: 'server-proxy',
        proxyBase: '/api/strapi'
    }
})
