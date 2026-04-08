import { createError, useRuntimeConfig } from 'nuxt/app'
import type { StrapiAuthLoginResponse, StrapiUser } from '../types'
import { useStrapiSession } from './useStrapiSession'
import { useStrapiUser } from './useStrapiUser'
import { resolveStrapiCoreConfig } from '../utils/config'
import { useStrapiRequest } from '../utils/request'

interface ProxyLoginResponse<TUser extends StrapiUser = StrapiUser> {
    user: TUser
}

export function useStrapiAuth() {
    const runtimeConfig = useRuntimeConfig()
    const config = resolveStrapiCoreConfig(runtimeConfig)
    const session = useStrapiSession()
    const userApi = useStrapiUser()

    const login = async <TUser extends StrapiUser = StrapiUser>(
        identifier: string,
        password: string
    ): Promise<TUser> => {
        try {
            if (config.transport === 'direct') {
                const payload = await useStrapiRequest<StrapiAuthLoginResponse<TUser>>({
                    proxyPath: '/auth/login',
                    directPath: '/auth/local'
                }, {
                    method: 'POST',
                    body: { identifier, password }
                })

                await session.setToken(payload.jwt)
                session.setUser(payload.user)
                return payload.user
            }

            const payload = await useStrapiRequest<ProxyLoginResponse<TUser>>('/auth/login', {
                method: 'POST',
                body: { identifier, password }
            })

            session.setUser(payload.user)
            return payload.user
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to login',
                cause: error
            })
        }
    }

    const logout = async (): Promise<void> => {
        try {
            if (config.transport === 'server-proxy') {
                await useStrapiRequest('/auth/logout', {
                    method: 'POST'
                })
            }

            await session.clearToken()
            session.setUser(null)
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to logout',
                cause: error
            })
        }
    }

    const getMe = async <TUser extends StrapiUser = StrapiUser>(): Promise<TUser> => {
        try {
            const user = await userApi.getMe<TUser>()
            session.setUser(user)
            return user
        } catch (error: any) {
            if (config.transport === 'direct') {
                await session.clearToken()
            }
            session.setUser(null)

            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to get me',
                cause: error
            })
        }
    }

    const changePassword = async (
        currentPassword: string,
        newPassword: string,
        newPasswordConfirmation: string
    ) => {
        try {
            return await useStrapiRequest('/auth/change-password', {
                method: 'POST',
                body: {
                    currentPassword,
                    password: newPassword,
                    passwordConfirmation: newPasswordConfirmation
                }
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to change password',
                cause: error
            })
        }
    }

    const forgotPassword = async (email: string) => {
        try {
            return await useStrapiRequest('/auth/forgot-password', {
                method: 'POST',
                body: { email }
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to start forgot password',
                cause: error
            })
        }
    }

    const resetPassword = async (code: string, password: string, passwordConfirmation: string) => {
        try {
            return await useStrapiRequest('/auth/reset-password', {
                method: 'POST',
                body: {
                    code,
                    password,
                    passwordConfirmation
                }
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiAuth] Failed to reset password',
                cause: error
            })
        }
    }

    return {
        login,
        logout,
        getMe,
        changePassword,
        forgotPassword,
        resetPassword
    }
}
