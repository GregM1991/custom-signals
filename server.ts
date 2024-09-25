// server.ts
import { serve } from "bun";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Counter App with Custom Signals</title>
</head>
<body>
    <h1>Counter App</h1>
    <p>Count: <span id="count">0</span></p>
    <button id="increment">Increment</button>
    <button id="decrement">Decrement</button>
    <script src="/app.js"></script>
</body>
</html>
`;

const server = serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/") {
            return new Response(html, {
                headers: { "Content-Type": "text/html" },
            });
        } else if (url.pathname === "/app.js") {
            return new Response(Bun.file("app.ts"), {
                headers: { "Content-Type": "application/javascript" },
            });
        } else {
            return new Response("Not Found", { status: 404 });
        }
    },
});

console.log(`Server running at http://localhost:${server.port}`);