import http, { IncomingMessage, ServerResponse } from 'http'
import { itemsRoute } from './routes/items';

const PORT = 3000;

const requestListener = (req: IncomingMessage, res: ServerResponse) => {
    
    if(req.url?.startsWith("/items")) {
        itemsRoute(req, res)
     } else {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ message: "Hello World" }));
     }

};

const server = http.createServer(requestListener)

server.listen(PORT, () => { 
    console.log(`Server is running on http://localhost:${PORT}`);
    })