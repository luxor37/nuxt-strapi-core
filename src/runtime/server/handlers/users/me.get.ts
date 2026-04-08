import { defineEventHandler } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken, unwrapStrapiData } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const token = getStrapiToken(event)
    const payload = await fetchStrapi<any>(
        getProxyEndpoint('/users-permissions/users/me', event),
        {
            method: 'GET',
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )

    return unwrapStrapiData(payload)
})
