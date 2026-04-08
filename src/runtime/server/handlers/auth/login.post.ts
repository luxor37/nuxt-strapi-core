import { defineEventHandler, readBody } from 'h3'
import { fetchStrapi, getProxyEndpoint, setStrapiTokenCookie } from '../../utils/strapi'

interface LoginBody {
    identifier: string
    password: string
}

interface LoginPayload<TUser = Record<string, any>> {
    jwt: string
    user: TUser
}

export default defineEventHandler(async (event) => {
    const body = await readBody<LoginBody>(event)
    const payload = await fetchStrapi<LoginPayload>(
        getProxyEndpoint('/auth/local', event),
        {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        },
        false,
        event
    )

    setStrapiTokenCookie(event, payload.jwt)

    return {
        user: payload.user
    }
})
