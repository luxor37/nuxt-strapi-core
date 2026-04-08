import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const resource = event.context.params?.resource
    const id = event.context.params?.id
    const token = getStrapiToken(event)
    const body = await readBody(event)

    return await fetchStrapi(
        getProxyEndpoint(`/${resource}/${id}`, event),
        {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
