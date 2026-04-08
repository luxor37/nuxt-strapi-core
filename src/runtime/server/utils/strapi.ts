import { createError, deleteCookie, getCookie, getHeader, getRequestURL, setCookie, type EventHandlerRequest, type H3Event } from 'h3'
import { useRuntimeConfig } from 'nuxt/app'
import type { StrapiCookieOptions } from '../../types'

function normalizeStrapiUrl(url: string): string {
    return url.replace(/\/+$/, '')
}

export function getStrapiAuthHeaders(token: string | null): HeadersInit {
    const headers: HeadersInit = {}

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    return headers
}

export function getProxyEndpoint(endpoint: string, event: H3Event<EventHandlerRequest>): string {
    const queryString = getRequestURL(event).search
    if (!queryString)
        return endpoint

    if (endpoint.includes('?'))
        return `${endpoint}&${queryString.slice(1)}`

    return `${endpoint}${queryString}`
}

function getServerConfig() {
    const runtimeConfig = useRuntimeConfig() as any

    return {
        strapiUrl: runtimeConfig.strapiCore?.strapiUrl || runtimeConfig.public?.strapiCore?.strapiUrl || 'http://localhost:1337',
        timeoutMs: runtimeConfig.strapiCore?.timeoutMs ?? runtimeConfig.public?.strapiCore?.timeoutMs ?? 10000,
        cookieName: runtimeConfig.strapiCore?.auth?.cookieName || 'strapi_jwt',
        cookie: {
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
            ...(runtimeConfig.strapiCore?.auth?.cookie || {})
        } as StrapiCookieOptions
    }
}

function resolveCookieSecurity(event: H3Event<EventHandlerRequest>, cookieOptions: StrapiCookieOptions) {
    const forwardedProto = getHeader(event, 'x-forwarded-proto') || ''
    const secure = cookieOptions.secure ?? (forwardedProto === 'https' || process.env.NODE_ENV === 'production')
    const sameSite = cookieOptions.sameSite ?? (secure ? 'none' : 'lax')

    return {
        secure,
        sameSite
    }
}

export function getStrapiToken(event: H3Event<EventHandlerRequest>): string | null {
    const config = getServerConfig()
    return getCookie(event, config.cookieName) || null
}

export function setStrapiTokenCookie(event: H3Event<EventHandlerRequest>, token: string) {
    const config = getServerConfig()
    const security = resolveCookieSecurity(event, config.cookie)

    setCookie(event, config.cookieName, token, {
        httpOnly: true,
        path: config.cookie.path || '/',
        maxAge: config.cookie.maxAge,
        domain: config.cookie.domain,
        secure: security.secure,
        sameSite: security.sameSite
    })
}

export function clearStrapiTokenCookie(event: H3Event<EventHandlerRequest>) {
    const config = getServerConfig()

    deleteCookie(event, config.cookieName, {
        path: config.cookie.path || '/',
        domain: config.cookie.domain
    })
}

export async function fetchStrapi<T>(
    endpoint: string,
    options: RequestInit = {},
    isMultipart = false,
    event: H3Event<EventHandlerRequest> | null = null
): Promise<T> {
    const config = getServerConfig()
    const url = `${normalizeStrapiUrl(config.strapiUrl)}/api${endpoint}`

    const headers = {
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {})
    }

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs)

        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal
        })

        clearTimeout(timeout)

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}))
            const message = errorBody?.error?.message || `Strapi error on ${endpoint}`

            throw createError({
                statusCode: response.status,
                statusMessage: message
            })
        }

        return await response.json()
    } catch (error: any) {
        const statusCode = error?.statusCode || error?.status || error?.response?.status

        if ((statusCode === 401 || statusCode === 403) && event) {
            clearStrapiTokenCookie(event)
        }

        throw createError({
            statusCode: statusCode || 500,
            statusMessage: error?.statusMessage || error?.message || 'Strapi proxy request failed',
            cause: error
        })
    }
}

export function unwrapStrapiData<T>(payload: T | { data: T }): T {
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as { data: T }).data
    }

    return payload as T
}
