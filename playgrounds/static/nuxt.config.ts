import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2026-04-08',
    modules: ['@luxor37/nuxt-strapi-core'],
    strapiCore: {
        strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
        transport: 'direct'
    }
})
