const url = require("url");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const http = require("http");

const headers = {
    'Content-Type': 'application/javascript',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
};

const staticFolder = path.join(__dirname, 'public');

function processPostRequest(req, res) {
    let parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
    let body = "";

    req.on("data", function(chunk) {
        body += chunk;
    });

    req.on("end", function() {
        let query;
        try {
            query = JSON.parse(body);
        } catch (err) {
            console.log(err.message);
            res.writeHead(400, headers);
            res.write(JSON.stringify({ error: "Error parsing JSON req: " + err }));
            res.end();
            return;
        }
        
        switch (pathname) {
            case "/register":
                let ret = checkCredentials(query["nick"], query["pass"]);

                if (ret === 2) {
                    res.writeHead(500, headers);
                    res.end();
                } else if (ret === 1) {
                    res.writeHead(400, headers);
                    res.write(JSON.stringify({ error: "User registered with a different password" }));
                    res.end();
                } else {
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({}));
                    res.end();
                }
                break;

            default:
                res.writeHead(404, headers);
                res.end();
                break;
        }
    });

    req.on("error", function(err) {
        console.log(err.message);
        res.writeHead(400, headers);
        res.end();
    });
}

function serveStaticFile(req, res) {
    let parsedUrl = url.parse(req.url);
    let pathname = path.join(staticFolder, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);

    fs.stat(pathname, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end("404 Not Found");
            return;
        }

        let ext = path.extname(pathname).toLowerCase();
        let contentType = "text/plain";

        switch (ext) {
            case ".html":
                contentType = "text/html";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".js":
                contentType = "application/javascript";
                break;
            case ".json":
                contentType = "application/json";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".jpg":
            case ".jpeg":
                contentType = "image/jpeg";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
        }

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(pathname).pipe(res);
    });
}


function checkCredentials(nick, pass) {
    let i;
    let fileData;
    if (nick === "" || pass === "")
        return 1;

    pass = crypto.createHash('md5').update(pass).digest('hex');

    try {
        fileData = fs.readFileSync("users.json");
        fileData = JSON.parse(fileData.toString())["users"];
    } catch (err) {
        console.log(err);
        return 2;
    }

    let found = false;
    for (i = 0; i < fileData.length; i++) {
        if (fileData[i]["nick"] === nick) {
            found = true;
            break;
        }
    }
    if (!found) {
        fileData.push({ nick: nick, pass: pass, games: {} });
        fileData = { users: fileData };
        try {
            fs.writeFileSync("users.json", JSON.stringify(fileData));
        } catch (err) {
            console.log("Error writing to file 'users.json'.");
            console.log(err);
            return 2;
        }
    } else {
        if (fileData[i]["pass"] === pass)
            return 0;
        else
            return 1;
    }
}

http.createServer(function(req, res) {
    if (req.method === "POST") {
        processPostRequest(req, res);
    } else if (req.method === "GET") {
        serveStaticFile(req, res);
    } else {
        res.writeHead(501, headers);
        res.end();
    }
}).listen(8080);

console.log("Server is running on http://localhost:8080");
