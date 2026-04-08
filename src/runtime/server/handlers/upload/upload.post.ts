import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const token = getStrapiToken(event)
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'No files uploaded'
        })
    }

    const outboundForm = new FormData()

    for (const field of form) {
        if (field.filename) {
            const blob = new Blob([field.data], { type: field.type })
            outboundForm.append(field.name, blob, field.filename)
        } else {
            outboundForm.append(field.name, field.data.toString())
        }
    }

    return await fetchStrapi(
        getProxyEndpoint('/upload', event),
        {
            method: 'POST',
            body: outboundForm,
            headers: getStrapiAuthHeaders(token)
        },
        true,
        event
    )
})
