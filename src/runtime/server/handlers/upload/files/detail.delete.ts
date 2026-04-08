import { defineEventHandler } from 'h3'
import { fetchStrapi, getProxyEndpoint, getStrapiAuthHeaders, getStrapiToken } from '../../../utils/strapi'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getStrapiToken(event)

    return await fetchStrapi(
        getProxyEndpoint(`/upload/files/${id}`, event),
        {
            method: 'DELETE',
            headers: getStrapiAuthHeaders(token)
        },
        false,
        event
    )
})
