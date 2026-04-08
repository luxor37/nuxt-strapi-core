import { createError } from 'nuxt/app'
import type { StrapiEntity, StrapiResponse } from '../types'
import { transformStrapiInput } from '../utils/payload'
import { useStrapiRequest } from '../utils/request'
import { withSerializedQuery } from '../utils/query'

export function useStrapi() {
    const prepareBody = (payload: any) => {
        if (!payload || typeof payload !== 'object' || payload instanceof FormData) {
            return payload
        }

        return {
            data: transformStrapiInput(payload)
        }
    }

    const find = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        params: Record<string, any> = {}
    ): Promise<StrapiResponse<T[]>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T[]>>(withSerializedQuery(resource, params), {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to find "${resource}"`,
                cause: error
            })
        }
    }

    const findSingle = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        params: Record<string, any> = {}
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(withSerializedQuery(resource, params), {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to findSingle "${resource}"`,
                cause: error
            })
        }
    }

    const findOne = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        id: string,
        params: Record<string, any> = {}
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(withSerializedQuery(`${resource}/${id}`, params), {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to findOne "${resource}"`,
                cause: error
            })
        }
    }

    const create = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        data: any
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(resource, {
                method: 'POST',
                body: prepareBody(data)
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to create "${resource}"`,
                cause: error
            })
        }
    }

    const update = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        id: string,
        data: any
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(`${resource}/${id}`, {
                method: 'PUT',
                body: prepareBody(data)
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to update "${resource}"`,
                cause: error
            })
        }
    }

    const updateSingle = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        data: any
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(resource, {
                method: 'PUT',
                body: prepareBody(data)
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to updateSingle "${resource}"`,
                cause: error
            })
        }
    }

    const deleteResource = async <T extends StrapiEntity = StrapiEntity>(
        resource: string,
        id: string
    ): Promise<StrapiResponse<T>> => {
        try {
            return await useStrapiRequest<StrapiResponse<T>>(`${resource}/${id}`, {
                method: 'DELETE'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapi] Failed to delete "${resource}"`,
                cause: error
            })
        }
    }

    return {
        find,
        findSingle,
        findOne,
        create,
        update,
        updateSingle,
        delete: deleteResource
    }
}
