import { createError, useRuntimeConfig } from '#imports'
import type { StrapiUser } from '../types'
import { resolveStrapiCoreConfig } from '../utils/config'
import { transformStrapiInput } from '../utils/payload'
import { useStrapiRequest } from '../utils/request'
import { withSerializedQuery } from '../utils/query'

export function useStrapiUser() {
    const runtimeConfig = useRuntimeConfig()
    const config = resolveStrapiCoreConfig(runtimeConfig)

    const getMe = async <TUser extends StrapiUser = StrapiUser>(): Promise<TUser> => {
        try {
            return await useStrapiRequest<TUser>({
                proxyPath: '/users/me',
                directPath: '/users-permissions/users/me'
            }, {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUser] Failed to get me',
                cause: error
            })
        }
    }

    const getUser = async <TUser extends StrapiUser = StrapiUser>(id: string): Promise<TUser> => {
        try {
            return await useStrapiRequest<TUser>({
                proxyPath: `/users/${id}`,
                directPath: `/users-permissions/users/${id}`
            }, {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapiUser] Failed to get user "${id}"`,
                cause: error
            })
        }
    }

    const getAllUsers = async <TUser extends StrapiUser = StrapiUser>(
        params: Record<string, any> = {}
    ): Promise<TUser[]> => {
        try {
            return await useStrapiRequest<TUser[]>({
                proxyPath: withSerializedQuery('/users', params),
                directPath: withSerializedQuery('/users-permissions/users', params)
            }, {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUser] Failed to get all users',
                cause: error
            })
        }
    }

    const createUser = async <TUser extends StrapiUser = StrapiUser>(user: Record<string, any>): Promise<TUser> => {
        try {
            return await useStrapiRequest<TUser>({
                proxyPath: '/users',
                directPath: '/users'
            }, {
                method: 'POST',
                body: transformStrapiInput(user)
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUser] Failed to create user',
                cause: error
            })
        }
    }

    const updateMe = async <TUser extends StrapiUser = StrapiUser>(user: Record<string, any>): Promise<TUser> => {
        const transformedUser = transformStrapiInput(user)

        try {
            return await useStrapiRequest<TUser>({
                proxyPath: '/users/me',
                directPath: '/users-permissions/users/me'
            }, {
                method: 'PUT',
                body: config.transport === 'direct'
                    ? { data: transformedUser }
                    : transformedUser
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUser] Failed to update me',
                cause: error
            })
        }
    }

    const updateUser = async <TUser extends StrapiUser = StrapiUser>(
        id: string,
        user: Record<string, any>
    ): Promise<TUser> => {
        try {
            return await useStrapiRequest<TUser>({
                proxyPath: `/users/${id}`,
                directPath: `/users-permissions/users/${id}`
            }, {
                method: 'PUT',
                body: transformStrapiInput(user)
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapiUser] Failed to update user "${id}"`,
                cause: error
            })
        }
    }

    const deleteUser = async <TUser extends StrapiUser = StrapiUser>(id: string): Promise<TUser> => {
        try {
            return await useStrapiRequest<TUser>({
                proxyPath: `/users/${id}`,
                directPath: `/users/${id}`
            }, {
                method: 'DELETE'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapiUser] Failed to delete user "${id}"`,
                cause: error
            })
        }
    }

    return {
        getMe,
        getUser,
        getAllUsers,
        createUser,
        updateMe,
        updateUser,
        deleteUser
    }
}
