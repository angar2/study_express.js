const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});