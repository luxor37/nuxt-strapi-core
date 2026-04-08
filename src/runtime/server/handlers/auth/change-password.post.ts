import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getStrapiToken(event)

    return await fetchStrapi(
        getProxyEndpoint('/auth/change-password', event),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                ...getStrapiAuthHeaders(token),
                'Content-Type': 'application/json'
            }
        },
        false,
        event
    )
})
