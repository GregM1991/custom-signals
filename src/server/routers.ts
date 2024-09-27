import type { Client } from '../types/types'

/* We need to transpile the ts into JS, doing this on the fly isn't ideal
but I don't have any compilation set up. I thought I could get away with
serving the .ts file directly and bun would transpile on the fly, but turns 
out that's not the case. */
export async function serveApp() {
	const result = await Bun.build({
		entrypoints: ['src/client/app.ts'],
		outdir: './dist',
		target: 'browser',
	})

	if (!result.success) {
		console.error('Build failed:', result.logs)
		return new Response('Build failed', { status: 500 })
	}

	const jsContent = await Bun.file('./dist/app.js').text()
	return new Response(jsContent, {
		headers: { 'Content-Type': 'application/javascript' },
	})
}

/* This is a simple way to set up hot-reloading via SSEs, the handleFileChange
function runs in the watch function, triggering a message to be sent to the
client, which has a script to reload when a message is received, thus fetching
all new files. I'm pretty sure Bun has a flag for this but 🤷🏻‍♀️ */
export async function hotReload(
	req: Request,
	clients: Set<Client>,
	clientId: number,
) {
	const stream = new ReadableStream({
		start(controller) {
			const client: Client = { id: clientId++, controller }
			clients.add(client)
			req.signal.addEventListener('abort', () => {
				clients.delete(client)
			})
		},
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
		},
	})
}
