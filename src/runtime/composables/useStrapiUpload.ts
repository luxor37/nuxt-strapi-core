import { createError } from '#imports'
import type { StrapiUploadFile, StrapiUploadOptions } from '../types'
import { useStrapiRequest } from '../utils/request'
import { withSerializedQuery } from '../utils/query'

function appendUploadMetadata(form: FormData, options: StrapiUploadOptions) {
    if (options.path)
        form.append('path', options.path)

    if (options.ref)
        form.append('ref', options.ref)

    if (options.refId !== undefined && options.refId !== null)
        form.append('refId', String(options.refId))

    if (options.field)
        form.append('field', options.field)

    if (options.source)
        form.append('source', options.source)
}

export function useStrapiUpload() {
    const uploadFiles = async (
        files: Array<File | Blob>,
        options: StrapiUploadOptions = {}
    ): Promise<StrapiUploadFile[]> => {
        const form = new FormData()
        appendUploadMetadata(form, options)

        files.forEach((file, index) => {
            const name = options.fileName
                ? (files.length === 1 ? options.fileName : `${index}-${options.fileName}`)
                : ('name' in file && typeof file.name === 'string' ? file.name : `upload-${index}`)

            form.append('files', file, name)
        })

        try {
            return await useStrapiRequest<StrapiUploadFile[]>('/upload', {
                method: 'POST',
                body: form
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUpload] Failed to upload files',
                cause: error
            })
        }
    }

    const uploadFile = async (
        file: File | Blob,
        options: StrapiUploadOptions = {}
    ): Promise<StrapiUploadFile[]> => {
        return await uploadFiles([file], options)
    }

    const listFiles = async (params: Record<string, any> = {}): Promise<StrapiUploadFile[]> => {
        try {
            return await useStrapiRequest<StrapiUploadFile[]>(withSerializedQuery('/upload/files', params), {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: '[useStrapiUpload] Failed to list uploaded files',
                cause: error
            })
        }
    }

    const getFile = async (id: string | number): Promise<StrapiUploadFile> => {
        try {
            return await useStrapiRequest<StrapiUploadFile>(`/upload/files/${id}`, {
                method: 'GET'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapiUpload] Failed to get uploaded file "${id}"`,
                cause: error
            })
        }
    }

    const deleteFile = async (id: string | number): Promise<StrapiUploadFile> => {
        try {
            return await useStrapiRequest<StrapiUploadFile>(`/upload/files/${id}`, {
                method: 'DELETE'
            })
        } catch (error: any) {
            throw createError({
                statusCode: error?.response?.status || error?.statusCode || 500,
                statusMessage: `[useStrapiUpload] Failed to delete uploaded file "${id}"`,
                cause: error
            })
        }
    }

    return {
        uploadFile,
        uploadFiles,
        listFiles,
        getFile,
        deleteFile
    }
}
