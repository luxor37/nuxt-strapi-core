import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { transformStrapiInput } from '../src/runtime/utils/payload'

describe('transformStrapiInput', () => {
    it('converts related documents into Strapi set payloads', () => {
        const payload = transformStrapiInput({
            title: 'Example',
            course: {
                documentId: 'course-1',
                createdAt: 'ignored'
            },
            pages: [
                { documentId: 'page-1' },
                { documentId: 'page-2' }
            ]
        }) as Record<string, any>

        assert.deepEqual(payload.course, {
            set: [{ documentId: 'course-1' }]
        })

        assert.deepEqual(payload.pages, {
            set: [{ documentId: 'page-1' }, { documentId: 'page-2' }]
        })
    })

    it('removes immutable fields recursively while preserving relation-operator keys', () => {
        const payload = transformStrapiInput({
            id: 99,
            documentId: 'root-doc',
            title: 'Example',
            metadata: {
                documentId: 'metadata-doc',
                id: 1,
                custom: 'value'
            },
            relation: {
                connect: [{ documentId: 'page-1' }]
            },
            nested: {
                createdAt: 'ignore-me',
                child: {
                    updatedAt: 'ignore-me-too',
                    value: 'kept'
                }
            }
        }) as Record<string, any>

        assert.deepEqual(payload, {
            title: 'Example',
            metadata: {
                set: [{ documentId: 'metadata-doc' }]
            },
            relation: {
                connect: {
                    set: [{ documentId: 'page-1' }]
                }
            },
            nested: {
                child: {
                    value: 'kept'
                }
            }
        })
    })

    it('preserves Date instances', () => {
        const reminderDate = new Date('2026-01-01T00:00:00.000Z')
        const payload = transformStrapiInput({
            title: 'With date',
            reminderDate
        }) as Record<string, any>

        assert.equal(payload.reminderDate, reminderDate)
    })

    it('returns FormData unchanged', () => {
        const form = new FormData()
        form.append('files', new Blob(['hello'], { type: 'text/plain' }), 'hello.txt')

        assert.equal(transformStrapiInput(form), form)
    })
})
