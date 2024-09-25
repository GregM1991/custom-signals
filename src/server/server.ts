import { serve } from "bun";
import { watch } from "fs";
import type { Client } from "../types/types"

// Initialise a Set to keep track of connected clients and a counter for client ids
let clients: Set<Client> = new Set();
let clientId = 0;

/* 
  This is a rudimentary server with Bun, fetch function handles all incoming
  requests and determines the response based on the url pathname
*/
const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      const html = await Bun.file("public/index.html").text();
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    } else if (url.pathname === "/app.js") {
      /* We need to transpile the ts into JS, doing this on the fly isn't ideal
      but I don't have any compilation set up. I thought I could get away with
      serving the .ts file directly and bun would transpile on the fly, but turns 
      out that's not the case. */
      const result = await Bun.build({
        entrypoints: ["src/client/app.ts"],
        outdir: "./dist",
        target: "browser"
      });

      if (!result.success) {
        console.error("Build failed:", result.logs);
        return new Response("Build failed", { status: 500 });
      }

      const jsContent = await Bun.file("./dist/app.js").text();
      return new Response(jsContent, {
        headers: { "Content-Type": "application/javascript" }
      });
    } else if (url.pathname === "/hot-reload") {
      /* This is a simple way to set up hot-reloading via SSEs, the handleFileChange
      function runs in the watch function, triggering a message to be sent to the
      client, which has a script to reload when a message is received, thus fetching
      all new files */
      const stream = new ReadableStream({
        start(controller) {
          const client: Client = { id: clientId++, controller };
          clients.add(client);
          req.signal.addEventListener("abort", () => {
            clients.delete(client);
          });
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        }
      });
    } else {
      return new Response("Not Found", { status: 404 });
    }
  }
});

console.log(`Server running at http://localhost:${server.port}`);

// Function for triggering stream message
async function handleFileChange(filename: string) {
  console.log(`File ${filename} has been changed. Rebuilding and notifying clients...`);
  
  if (filename.endsWith('.ts')) {
      // Rebuild the TypeScript file
      const result = await Bun.build({
          entrypoints: ['src/client/app.ts'],
          outdir: './dist',
          target: 'browser',
      });
      
      if (!result.success) {
          console.error('Build failed:', result.logs);
          return;
      }
  }

  clients.forEach(client => {
      client.controller.enqueue('data: update\n\n');
  });
}

// Watchers
watch("src", { recursive: true }, (eventType, filename) => {
  if (eventType === 'change' && filename) {
      handleFileChange(filename);
  }
});

watch("public", { recursive: true }, (eventType, filename) => {
  if (eventType === 'change' && filename) {
      handleFileChange(filename);
  }
});