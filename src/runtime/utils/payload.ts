const RELATION_OPERATORS = ['set', 'connect', 'disconnect', 'data', 'content', 'metadata']
const IMMUTABLE_FIELDS = ['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt']

function isDate(value: unknown): value is Date {
    return value instanceof Date
}

function setRelations(data: any): any {
    if (isDate(data))
        return data

    if (Array.isArray(data)) {
        if (data.length > 0 && data[0]?.documentId) {
            return {
                set: data.map((item: { documentId: string }) => ({ documentId: item.documentId }))
            }
        }

        return data.map(item => setRelations(item))
    }

    if (data !== null && typeof data === 'object') {
        const transformedData: Record<string, any> = {}

        for (const key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key))
                continue

            if (data[key] && typeof data[key] === 'object' && data[key].documentId) {
                transformedData[key] = { set: [{ documentId: data[key].documentId }] }
            } else {
                transformedData[key] = setRelations(data[key])
            }
        }

        return transformedData
    }

    return data
}

function cleanData(data: any): any {
    if (isDate(data))
        return data

    if (Array.isArray(data))
        return data.map(item => cleanData(item))

    if (data !== null && typeof data === 'object') {
        const cleanedData: Record<string, any> = {}

        for (const key in data) {
            if (!Object.prototype.hasOwnProperty.call(data, key))
                continue

            if (RELATION_OPERATORS.includes(key)) {
                cleanedData[key] = data[key]
                continue
            }

            if (IMMUTABLE_FIELDS.includes(key))
                continue

            cleanedData[key] = cleanData(data[key])
        }

        return cleanedData
    }

    return data
}

export function transformStrapiInput<T>(payload: T): T {
    if (!payload || typeof payload !== 'object' || payload instanceof FormData)
        return payload

    return cleanData(setRelations({ ...(payload as any) }))
}
