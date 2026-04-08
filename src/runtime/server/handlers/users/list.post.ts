import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken, unwrapStrapiData } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const token = getStrapiToken(event)
    const body = await readBody(event)
    const payload = await fetchStrapi<any>(
        getProxyEndpoint('/users', event),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )

    return unwrapStrapiData(payload)
})
