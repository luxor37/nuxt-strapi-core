import { addImportsDir, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { StrapiCoreModuleOptions } from './runtime/types'
import { normalizeBasePath } from './runtime/utils/query'

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export type { StrapiCoreModuleOptions } from './runtime/types'

export default defineNuxtModule<StrapiCoreModuleOptions>({
    meta: {
        name: 'nuxt-strapi-core',
        configKey: 'strapiCore',
        compatibility: {
            nuxt: '^3.17.0'
        }
    },
    defaults: {
        strapiUrl: '',
        transport: 'server-proxy',
        proxyBase: '/api/strapi',
        timeoutMs: 10000,
        autoImports: true,
        auth: {
            cookieName: 'strapi_jwt',
            tokenStorageKey: 'strapi_jwt',
            cookie: {
                path: '/',
                maxAge: DEFAULT_COOKIE_MAX_AGE
            }
        }
    },
    setup(options, nuxt) {
        const resolver = createResolver(import.meta.url)
        const proxyBase = normalizeBasePath(options.proxyBase || '/api/strapi')
        const resolveRuntime = (path = '') => resolver.resolve(`../src/runtime${path}`)

        nuxt.options.runtimeConfig.strapiCore = {
            ...(nuxt.options.runtimeConfig.strapiCore as any || {}),
            strapiUrl: options.strapiUrl || process.env.STRAPI_URL || (nuxt.options.runtimeConfig.strapiCore as any)?.strapiUrl || 'http://localhost:1337',
            timeoutMs: options.timeoutMs ?? (nuxt.options.runtimeConfig.strapiCore as any)?.timeoutMs ?? 10000,
            auth: {
                cookieName: options.auth?.cookieName || (nuxt.options.runtimeConfig.strapiCore as any)?.auth?.cookieName || 'strapi_jwt',
                tokenStorageKey: options.auth?.tokenStorageKey || (nuxt.options.runtimeConfig.strapiCore as any)?.auth?.tokenStorageKey || 'strapi_jwt',
                cookie: {
                    path: '/',
                    maxAge: DEFAULT_COOKIE_MAX_AGE,
                    ...((nuxt.options.runtimeConfig.strapiCore as any)?.auth?.cookie || {}),
                    ...(options.auth?.cookie || {})
                }
            }
        }

        nuxt.options.runtimeConfig.public.strapiCore = {
            ...(nuxt.options.runtimeConfig.public.strapiCore as any || {}),
            strapiUrl: options.strapiUrl || (nuxt.options.runtimeConfig.public.strapiCore as any)?.strapiUrl || 'http://localhost:1337',
            transport: options.transport || (nuxt.options.runtimeConfig.public.strapiCore as any)?.transport || 'server-proxy',
            proxyBase,
            timeoutMs: options.timeoutMs ?? (nuxt.options.runtimeConfig.public.strapiCore as any)?.timeoutMs ?? 10000,
            auth: {
                tokenStorageKey: options.auth?.tokenStorageKey || (nuxt.options.runtimeConfig.public.strapiCore as any)?.auth?.tokenStorageKey || 'strapi_jwt'
            }
        }

        nuxt.options.build.transpile.push(resolveRuntime())
        if (options.autoImports !== false) {
            addImportsDir(resolveRuntime('/composables'))
        }

        if ((options.transport || 'server-proxy') !== 'server-proxy')
            return

        const register = (route: string, handler: string, method?: string) => {
            addServerHandler({
                route,
                handler: resolveRuntime(`/server/handlers/${handler}`),
                method
            })
        }

        register(`${proxyBase}/auth/login`, 'auth/login.post', 'post')
        register(`${proxyBase}/auth/logout`, 'auth/logout.post', 'post')
        register(`${proxyBase}/auth/change-password`, 'auth/change-password.post', 'post')
        register(`${proxyBase}/auth/forgot-password`, 'auth/forgot-password.post', 'post')
        register(`${proxyBase}/auth/reset-password`, 'auth/reset-password.post', 'post')

        register(`${proxyBase}/users/me`, 'users/me.get', 'get')
        register(`${proxyBase}/users/me`, 'users/me.put', 'put')
        register(`${proxyBase}/users`, 'users/list.get', 'get')
        register(`${proxyBase}/users`, 'users/list.post', 'post')
        register(`${proxyBase}/users/:id`, 'users/detail.get', 'get')
        register(`${proxyBase}/users/:id`, 'users/detail.put', 'put')
        register(`${proxyBase}/users/:id`, 'users/detail.delete', 'delete')

        register(`${proxyBase}/upload`, 'upload/upload.post', 'post')
        register(`${proxyBase}/upload/files`, 'upload/files/list.get', 'get')
        register(`${proxyBase}/upload/files/:id`, 'upload/files/detail.get', 'get')
        register(`${proxyBase}/upload/files/:id`, 'upload/files/detail.delete', 'delete')

        register(`${proxyBase}/:resource`, 'resource/collection.get', 'get')
        register(`${proxyBase}/:resource`, 'resource/collection.post', 'post')
        register(`${proxyBase}/:resource`, 'resource/collection.put', 'put')
        register(`${proxyBase}/:resource/:id`, 'resource/entity.get', 'get')
        register(`${proxyBase}/:resource/:id`, 'resource/entity.put', 'put')
        register(`${proxyBase}/:resource/:id`, 'resource/entity.delete', 'delete')
    }
})
