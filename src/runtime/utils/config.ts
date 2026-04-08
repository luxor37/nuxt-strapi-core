import { useRuntimeConfig } from '#imports'
import type { StrapiCoreResolvedConfig } from '../types'
import { normalizeBasePath } from './query'

const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function resolveStrapiCoreConfig(runtimeConfig = useRuntimeConfig()): StrapiCoreResolvedConfig {
    const publicConfig = (runtimeConfig.public as any)?.strapiCore || {}
    const privateConfig = (runtimeConfig as any)?.strapiCore || {}

    return {
        strapiUrl: publicConfig.strapiUrl || privateConfig.strapiUrl || '',
        transport: publicConfig.transport || 'server-proxy',
        proxyBase: normalizeBasePath(publicConfig.proxyBase || '/api/strapi'),
        timeoutMs: privateConfig.timeoutMs ?? publicConfig.timeoutMs ?? 10000,
        auth: {
            cookieName: privateConfig.auth?.cookieName || 'strapi_jwt',
            tokenStorageKey: publicConfig.auth?.tokenStorageKey || privateConfig.auth?.tokenStorageKey || 'strapi_jwt',
            cookie: {
                path: '/',
                maxAge: DEFAULT_COOKIE_MAX_AGE,
                ...(privateConfig.auth?.cookie || {})
            }
        }
    }
}
