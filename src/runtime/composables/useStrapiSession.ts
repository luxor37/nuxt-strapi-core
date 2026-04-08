import { useNuxtApp, useRuntimeConfig, useState } from 'nuxt/app'
import { computed, readonly } from 'vue'
import { createLocalStorageTokenAdapter } from '../session/adapters/local-storage'
import type { StrapiSessionState, StrapiTokenAdapter, StrapiUser } from '../types'
import { resolveStrapiCoreConfig } from '../utils/config'

let sessionRestorePromise: Promise<void> | null = null

export function defineStrapiTokenAdapter<T extends StrapiTokenAdapter>(adapter: T): T {
    return adapter
}

export function useStrapiSession<TUser extends StrapiUser = StrapiUser>() {
    const isServer = typeof window === 'undefined'
    const runtimeConfig = useRuntimeConfig()
    const config = resolveStrapiCoreConfig(runtimeConfig)
    const nuxtApp = useNuxtApp()
    const state = useState<StrapiSessionState<TUser>>('nuxt-strapi-core:session', () => ({
        initialized: false,
        token: null,
        user: null
    }))

    const resolveAdapter = (): StrapiTokenAdapter | null => {
        if (config.transport !== 'direct' || isServer)
            return null

        const injectedAdapter = (nuxtApp as any).$strapiSessionAdapter as StrapiTokenAdapter | undefined
        return injectedAdapter || createLocalStorageTokenAdapter(config.auth.tokenStorageKey)
    }

    const ensureReady = async () => {
        if (state.value.initialized)
            return state.value

        if (config.transport !== 'direct' || isServer) {
            state.value.initialized = true
            return state.value
        }

        if (!sessionRestorePromise) {
            sessionRestorePromise = (async () => {
                try {
                    const adapter = resolveAdapter()
                    state.value.token = adapter ? await adapter.getToken() : null
                } finally {
                    state.value.initialized = true
                }
            })()
        }

        try {
            await sessionRestorePromise
        } finally {
            sessionRestorePromise = null
        }

        return state.value
    }

    const setToken = async (token: string | null) => {
        state.value.token = token
        state.value.initialized = true

        const adapter = resolveAdapter()
        if (!adapter)
            return

        if (token) {
            await adapter.setToken(token)
        } else {
            await adapter.clearToken()
        }
    }

    const clearToken = async () => {
        await setToken(null)
    }

    const setUser = (user: TUser | null) => {
        state.value.user = user
        state.value.initialized = true
    }

    const reset = async () => {
        state.value = {
            initialized: config.transport !== 'direct' || isServer,
            token: null,
            user: null
        }

        const adapter = resolveAdapter()
        if (adapter)
            await adapter.clearToken()
    }

    if (!state.value.initialized && (config.transport !== 'direct' || isServer)) {
        state.value.initialized = true
    } else if (!isServer && config.transport === 'direct' && !state.value.initialized) {
        void ensureReady()
    }

    return {
        state: readonly(state),
        token: computed(() => state.value.token),
        user: computed(() => state.value.user),
        isInitialized: computed(() => state.value.initialized),
        isAuthenticated: computed(() => {
            if (config.transport === 'direct')
                return !!state.value.token

            return !!state.value.user
        }),
        ensureReady,
        setToken,
        clearToken,
        setUser,
        reset
    }
}
