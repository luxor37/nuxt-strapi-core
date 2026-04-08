export function normalizeBasePath(path: string = '/'): string {
    const withLeadingSlash = path.startsWith('/') ? path : `/${path}`
    const normalized = withLeadingSlash.replace(/\/+$/, '')
    return normalized || '/'
}

export function normalizeApiPath(path: string): string {
    if (!path)
        return ''

    if (path.startsWith('/'))
        return path

    return `/${path}`
}

export function serializeStrapiQuery(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()

    const appendParam = (key: string, value: any) => {
        if (value === undefined)
            return

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                appendParam(`${key}[${index}]`, item)
            })
            return
        }

        if (value !== null && typeof value === 'object') {
            Object.entries(value).forEach(([childKey, childValue]) => {
                appendParam(`${key}[${childKey}]`, childValue)
            })
            return
        }

        searchParams.append(key, String(value))
    }

    Object.entries(params).forEach(([key, value]) => {
        appendParam(key, value)
    })

    return searchParams.toString()
}

export function withSerializedQuery(path: string, params: Record<string, any> = {}): string {
    const query = serializeStrapiQuery(params)

    if (!query)
        return normalizeApiPath(path)

    const normalizedPath = normalizeApiPath(path)
    return `${normalizedPath}${normalizedPath.includes('?') ? '&' : '?'}${query}`
}
