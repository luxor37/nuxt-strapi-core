import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const resource = event.context.params?.resource
    const token = getStrapiToken(event)
    const body = await readBody(event)

    return await fetchStrapi(
        getProxyEndpoint(`/${resource}`, event),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
