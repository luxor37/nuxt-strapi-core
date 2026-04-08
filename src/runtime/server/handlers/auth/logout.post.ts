import { defineEventHandler } from 'h3'
import { clearStrapiTokenCookie } from '../../utils/strapi'

export default defineEventHandler(async (event) => {
    clearStrapiTokenCookie(event)

    return {
        success: true
    }
})
