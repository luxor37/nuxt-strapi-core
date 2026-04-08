import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
    normalizeApiPath,
    normalizeBasePath,
    serializeStrapiQuery,
    withSerializedQuery
} from '../src/runtime/utils/query'

describe('normalizeBasePath', () => {
    it('adds a leading slash and removes trailing slashes', () => {
        assert.equal(normalizeBasePath('api/strapi/'), '/api/strapi')
    })

    it('returns root when the path collapses to empty', () => {
        assert.equal(normalizeBasePath('/'), '/')
    })
})

describe('normalizeApiPath', () => {
    it('preserves leading slashes', () => {
        assert.equal(normalizeApiPath('/users/me'), '/users/me')
    })

    it('adds a leading slash to relative paths', () => {
        assert.equal(normalizeApiPath('users/me'), '/users/me')
    })
})

describe('serializeStrapiQuery', () => {
    it('serializes nested array filters with indexed brackets', () => {
        const query = serializeStrapiQuery({
            filters: {
                documentId: {
                    $in: ['alpha', 'beta']
                }
            }
        })

        assert.equal(
            query,
            'filters%5BdocumentId%5D%5B%24in%5D%5B0%5D=alpha&filters%5BdocumentId%5D%5B%24in%5D%5B1%5D=beta'
        )
    })

    it('omits undefined values and preserves null scalars', () => {
        const query = serializeStrapiQuery({
            filters: {
                title: undefined,
                summary: null
            }
        })

        assert.equal(query, 'filters%5Bsummary%5D=null')
    })
})

describe('withSerializedQuery', () => {
    it('appends serialized params to a path without an existing query string', () => {
        assert.equal(
            withSerializedQuery('articles', { pagination: { page: 2 } }),
            '/articles?pagination%5Bpage%5D=2'
        )
    })

    it('appends serialized params to a path with an existing query string', () => {
        assert.equal(
            withSerializedQuery('/articles?locale=fr', { sort: ['title:asc'] }),
            '/articles?locale=fr&sort%5B0%5D=title%3Aasc'
        )
    })
})
