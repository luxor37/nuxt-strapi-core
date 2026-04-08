import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    return await fetchStrapi(
        getProxyEndpoint('/auth/reset-password', event),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
})
