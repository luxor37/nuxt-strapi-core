import { useRequestEvent, useRequestFetch, useRuntimeConfig } from 'nuxt/app'
import { $fetch } from 'ofetch'
import { useStrapiSession } from '../composables/useStrapiSession'
import { resolveStrapiCoreConfig } from './config'
import { normalizeApiPath } from './query'

export interface StrapiTransportPaths {
    proxyPath: string
    directPath?: string
}

export interface StrapiRequestOptions extends Omit<RequestInit, 'headers'> {
    headers?: HeadersInit | Record<string, string>
    body?: any
}

export async function useStrapiRequest<T>(
    paths: string | StrapiTransportPaths,
    options: StrapiRequestOptions = {}
): Promise<T> {
    const config = resolveStrapiCoreConfig(useRuntimeConfig())
    const headers = new Headers(options.headers as HeadersInit | undefined)
    const isDirect = config.transport === 'direct'
    const resolvedPaths = typeof paths === 'string'
        ? { proxyPath: paths, directPath: paths }
        : { proxyPath: paths.proxyPath, directPath: paths.directPath || paths.proxyPath }

    const path = normalizeApiPath(isDirect ? resolvedPaths.directPath : resolvedPaths.proxyPath)

    if (isDirect) {
        const session = useStrapiSession()
        await session.ensureReady()

        if (session.token.value && !headers.has('authorization')) {
            headers.set('authorization', `Bearer ${session.token.value}`)
        }

        const baseUrl = config.strapiUrl.replace(/\/+$/, '')
        return await $fetch<T>(`${baseUrl}/api${path}`, {
            ...options,
            headers,
        } as any)
    }

    const isServer = typeof window === 'undefined'
    const event = isServer ? useRequestEvent() : null
    const cookieHeader = event?.node.req.headers.cookie
    if (cookieHeader && !headers.has('cookie')) {
        headers.set('cookie', cookieHeader)
    }

    if (isServer) {
        const requestFetch = useRequestFetch()

        return await requestFetch<T>(`${config.proxyBase}${path}`, {
            ...options,
            headers,
            credentials: 'include',
        } as any)
    }

    return await $fetch<T>(`${config.proxyBase}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    } as any)
}
