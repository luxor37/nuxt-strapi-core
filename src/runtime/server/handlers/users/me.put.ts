import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken, unwrapStrapiData } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const token = getStrapiToken(event)
    const body = await readBody(event)
    const payload = await fetchStrapi<any>(
        getProxyEndpoint('/users-permissions/users/me', event),
        {
            method: 'PUT',
            body: JSON.stringify({ data: body }),
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )

    return unwrapStrapiData(payload)
})
