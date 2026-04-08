import { rm, mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const srcDir = path.join(rootDir, 'src')
const distDir = path.join(rootDir, 'dist')

async function collectTypeScriptFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(entries.map(async (entry) => {
        const absolutePath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            return await collectTypeScriptFiles(absolutePath)
        }

        if (entry.isFile() && absolutePath.endsWith('.ts')) {
            return [absolutePath]
        }

        return []
    }))

    return files.flat()
}

async function main() {
    const esbuild = require('esbuild')
    const entryPoints = await collectTypeScriptFiles(srcDir)

    await rm(distDir, { recursive: true, force: true })
    await mkdir(distDir, { recursive: true })

    await esbuild.build({
        entryPoints,
        outdir: distDir,
        outbase: srcDir,
        bundle: true,
        splitting: false,
        format: 'esm',
        platform: 'node',
        target: 'es2022',
        sourcemap: true,
        external: ['h3', 'nuxt/app', 'nuxt/config', 'vue'],
        outExtension: { '.js': '.mjs' },
        logLevel: 'info'
    })

    await writeFile(path.join(distDir, '.built'), `${new Date().toISOString()}\n`, 'utf8')
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
