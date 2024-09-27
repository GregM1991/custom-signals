import postcss from 'postcss'
import postcssImport from 'postcss-import'
import { watch } from 'fs'
import type { Client } from '../types/types'
import fs from 'fs'
import path from 'path'

// Function to build CSS
export async function buildCSS() {
	const inputFile = 'public/index.css'
	const outputFile = 'dist/index.css'

	const css = fs.readFileSync(inputFile, 'utf8')
	const result = await postcss([postcssImport()]).process(css, {
		from: inputFile,
		to: outputFile,
	})

	fs.mkdirSync(path.dirname(outputFile), { recursive: true })
	fs.writeFileSync(outputFile, result.css)
	if (result.map) {
		fs.writeFileSync(outputFile + '.map', result.map.toString())
	}
	console.log('CSS built successfully')
}

// Function for triggering stream message
async function handleFileChange(filename: string, clients: Set<Client>) {
	console.log(
		`File ${filename} has been changed. Rebuilding and notifying clients...`,
	)

	if (filename.endsWith('.ts')) {
		// Rebuild the TypeScript file
		const result = await Bun.build({
			entrypoints: ['src/client/app.ts'],
			outdir: './dist',
			target: 'browser',
		})

		if (!result.success) {
			console.error('Build failed:', result.logs)
			return
		}
	} else if (filename.endsWith('.css')) {
		// Rebuild the CSS file
		await buildCSS()
	}

	const updateMessage = filename.endsWith('.css') ? 'css-update' : 'update'
	clients.forEach(client => {
		client.controller.enqueue(`data: ${updateMessage}\n\n`)
	})
}

export function watchFiles(clients: Set<Client>) {
	const watchOptions = ['src', 'public']

	watchOptions.forEach(path => {
		watch(path, { recursive: true }, (eventType, filename) => {
			if (eventType === 'change' && filename) {
				handleFileChange(filename, clients)
			}
		})
	})
}
