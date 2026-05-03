import http from 'http';
http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        console.log("BROWSER ERROR:", body);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end("ok");
    });
}).listen(9999, () => console.log("Logger listening on 9999"));
