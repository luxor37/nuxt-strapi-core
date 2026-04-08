import { defineEventHandler } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const resource = event.context.params?.resource
    const token = getStrapiToken(event)

    return await fetchStrapi(
        getProxyEndpoint(`/${resource}`, event),
        {
            method: 'GET',
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
