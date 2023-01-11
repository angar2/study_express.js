const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const sanitizeHTML = require('sanitize-html');
const template = require('./lib/template.js');

app.get('/', (request, response) => {
    fs.readdir(`./data`, function(error, filelist) {
        var title = 'Welcome';
        var description = 'Hello Express';
        var list = template.list(filelist);
        var HTML = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, `<a href="/create">Create</a>`);
        response.send(HTML);
    });
});

app.get('/page/:pageId', (request, response) => {
    fs.readdir(`./data`, function(error, filelist) {
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(error, description){
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHTML(title);
            var sanitizedDescription = sanitizeHTML(description);
            var list = template.list(filelist);
            var HTML = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                `<a href="/create">Create</a>
                <a href="/update?id=${sanitizedTitle}">Update</a>
                <form action="delete_process" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}" />
                    <input type="submit" value="Delete" />
                </form>`
            );
            response.send(HTML);
        });
    });
});

app.get('/create', (request, response) => {
    fs.readdir(`./data`, function(error, filelist) {
        var title = 'Create';
        var list = template.list(filelist);
        var HTML = template.HTML(title, list,
            `<form action="/create" method="post">
                <p><input type="text" name="title" placeholder="title" /></p>
                <p><textarea type=text name="description" placeholder="description"></textarea></p>
                <p><input type="submit" /></p>
                </form>`,
            `<h2>${title}</h2>`
        );
        response.send(HTML);
    });
});

app.post('/create', (request, response) => {
    var body = '';
      request.on('data', function(data) {
        body = body + data;
      });
      request.on('end', function() {
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
            response.writeHead(302, {location: `/?id=${title}`});
            response.end("Success");
        });
      });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});