import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

let isReady = false;

function healthHandler(req: IncomingMessage, res: ServerResponse): void {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
  } else if (req.url === '/ready') {
    if (isReady) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...response, status: 'ready' }));
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...response, status: 'not ready' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
}

export function startHealthServer(port: number = 3001): void {
  const server = createServer(healthHandler);

  server.listen(port, () => {
    console.log(`Health server listening on port ${port}`);
    isReady = true;
  });

  server.on('error', (error) => {
    console.error('Health server error:', error);
  });
}

export function setReady(ready: boolean): void {
  isReady = ready;
}
