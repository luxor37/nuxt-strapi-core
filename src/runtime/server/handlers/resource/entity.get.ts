import { defineEventHandler } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const resource = event.context.params?.resource
    const id = event.context.params?.id
    const token = getStrapiToken(event)

    return await fetchStrapi(
        getProxyEndpoint(`/${resource}/${id}`, event),
        {
            method: 'GET',
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
