import { defineEventHandler } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../../utils/strapi'

export default defineEventHandler(async (event) => {
    const token = getStrapiToken(event)

    return await fetchStrapi(
        getProxyEndpoint('/upload/files', event),
        {
            method: 'GET',
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
