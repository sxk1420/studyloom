import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname||path.dirname(new URL(import.meta.url).pathname));
const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const name=decodeURIComponent(url.pathname)==='/'?'/index.html':decodeURIComponent(url.pathname);if(!['/index.html','/styles.css'].includes(name)&&!/^\/src\/[\w-]+\.mjs$/.test(name)){res.writeHead(404);res.end('Not found');return;}const data=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':types[path.extname(name)]||'text/plain','Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(5173,'127.0.0.1',()=>console.log('Studyloom: http://127.0.0.1:5173'));
