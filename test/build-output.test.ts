import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '..')

describe('build output', () => {
    it('emits the expected package artifacts', async () => {
        await access(path.join(packageRoot, 'dist/module.mjs'))
        await access(path.join(packageRoot, 'dist/runtime/index.mjs'))
        await access(path.join(packageRoot, 'dist/runtime/composables/useStrapi.mjs'))
    })

    it('keeps Nuxt runtime wiring pointed at src/runtime', async () => {
        const moduleContents = await readFile(path.join(packageRoot, 'dist/module.mjs'), 'utf8')

        assert.match(moduleContents, /\.\.\/src\/runtime/)
    })
})
