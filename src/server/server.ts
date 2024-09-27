import { serve } from 'bun'
import { buildCSS, watchFiles } from './helpers.server'
import type { Client } from '../types/types'
import { hotReload, serveApp } from './routers.ts'

// Initialise a Set to keep track of connected clients and a counter for client ids
export let clients: Set<Client> = new Set()
export let clientId = 0

buildCSS()

/* 
  This is a rudimentary server with Bun, fetch function handles all incoming
  requests and determines the response based on the url pathname
*/
const server = serve({
	port: 3000,
	async fetch(req) {
		const url = new URL(req.url)

		// Serve static files from the public directory
		if (url.pathname.startsWith('/') && !url.pathname.startsWith('/hot-reload')) {
			let filePath
			if (url.pathname === '/index.css') {
				filePath = 'dist/index.css'
			} else {
				filePath = `public${url.pathname}`
			}
			const file = Bun.file(filePath)
			if (await file.exists()) {
				return new Response(file)
			}
		}

		if (url.pathname === '/') {
			const html = await Bun.file('public/index.html').text()
			return new Response(html, {
				headers: { 'Content-Type': 'text/html' },
			})
		} else if (url.pathname === '/app.js') {
			return serveApp()
		} else if (url.pathname === '/hot-reload') {
			return hotReload(req, clients, clientId)
		} else {
			return new Response('Not Found', { status: 404 })
		}
	},
})

console.log(`Server running at http://localhost:${server.port}`)

watchFiles(clients)
