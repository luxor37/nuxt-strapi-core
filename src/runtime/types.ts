export type StrapiTransport = 'server-proxy' | 'direct'

export interface StrapiCookieOptions {
    domain?: string
    maxAge?: number
    path?: string
    sameSite?: 'lax' | 'strict' | 'none'
    secure?: boolean
}

export interface StrapiAuthRuntimeConfig {
    cookieName: string
    cookie: StrapiCookieOptions
    tokenStorageKey: string
}

export interface StrapiCoreModuleOptions {
    strapiUrl?: string
    transport?: StrapiTransport
    proxyBase?: string
    timeoutMs?: number
    autoImports?: boolean
    auth?: Partial<{
        cookieName: string
        cookie: StrapiCookieOptions
        tokenStorageKey: string
    }>
}

export interface StrapiCoreResolvedConfig {
    strapiUrl: string
    transport: StrapiTransport
    proxyBase: string
    timeoutMs: number
    auth: StrapiAuthRuntimeConfig
}

export interface StrapiResponse<T> {
    data: T
    meta?: Record<string, any>
}

export interface StrapiEntity {
    id?: number | string
    documentId?: string
    [key: string]: any
}

export interface StrapiUser extends StrapiEntity {
    username?: string
    email?: string
    [key: string]: any
}

export interface StrapiAuthLoginResponse<TUser extends StrapiUser = StrapiUser> {
    jwt: string
    user: TUser
}

export interface StrapiSessionState<TUser extends StrapiUser = StrapiUser> {
    initialized: boolean
    token: string | null
    user: TUser | null
}

export interface StrapiTokenAdapter {
    getToken: () => Promise<string | null> | string | null
    setToken: (token: string) => Promise<void> | void
    clearToken: () => Promise<void> | void
}

export interface StrapiUploadFile extends StrapiEntity {
    name: string
    alternativeText?: string | null
    caption?: string | null
    width?: number
    height?: number
    size?: number
    mime?: string
    ext?: string
    url: string
    previewUrl?: string | null
    [key: string]: any
}

export interface StrapiUploadOptions {
    field?: string
    fileName?: string
    path?: string
    ref?: string
    refId?: number | string
    source?: string
}
