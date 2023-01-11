const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
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

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});