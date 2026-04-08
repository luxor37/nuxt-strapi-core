import type { StrapiTokenAdapter } from '../../types'

export function createLocalStorageTokenAdapter(storageKey: string): StrapiTokenAdapter {
    return {
        getToken() {
            if (typeof window === 'undefined')
                return null

            return window.localStorage.getItem(storageKey)
        },
        setToken(token: string) {
            if (typeof window === 'undefined')
                return

            window.localStorage.setItem(storageKey, token)
        },
        clearToken() {
            if (typeof window === 'undefined')
                return

            window.localStorage.removeItem(storageKey)
        }
    }
}
