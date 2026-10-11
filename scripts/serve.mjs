import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
const base=resolve(process.cwd());
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml; charset=utf-8','.md':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT)||4174;
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const decoded=decodeURIComponent(url.pathname);
 const file=resolve(base,'.'+(decoded==='/'?'/index.html':decoded));
 if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end();return;}
 try{const data=await readFile(file);res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log('OMNIEARTH+ http://127.0.0.1:'+port));
