const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const qs = require('querystring');
const path = require('path');
const sanitizeHTML = require('sanitize-html');
const bodyParser = require('body-parser');
const compression = require('compression');
const template = require('./lib/template.js');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.get('*',(request, response, next) => {
    fs.readdir(`./data`, function(error, filelist) {
        request.filelist = filelist;
        next();
    });
});

app.get('/', (request, response) => {
    var title = 'Welcome';
    var description = 'Hello Express';
    var list = template.list(request.filelist);
    var HTML = template.HTML(title, list, 
        `<h2>${title}</h2>
        <p>${description}</p>
        <img src="/images/hello.jpg" style="width:200px">`, 
        `<a href="/create">Create</a>`
    );
    response.send(HTML);
});

app.get('/page/:pageId', (request, response, next) => {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(error, description){
        if(error){
            next(error);
        } else {
            var title = request.params.pageId;
            var sanitizedTitle = sanitizeHTML(title);
            var sanitizedDescription = sanitizeHTML(description);
            var list = template.list(request.filelist);
            var HTML = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                `<a href="/create">Create</a>
                <a href="/update/${sanitizedTitle}">Update</a>
                <form action="/delete" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}" />
                    <input type="submit" value="Delete" />
                </form>`
            );
            response.send(HTML);
        }
    });
});

app.get('/create', (request, response) => {
    var title = 'Create';
    var list = template.list(request.filelist);
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

app.post('/create', (request, response) => {
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
        response.redirect(`/page/${title}`);
    });
});

app.get('/update/:updateId', (request, response) => {
    var filteredId = path.parse(request.params.updateId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, desc){
        var title = request.params.updateId;
        var list = template.list(request.filelist);
        var HTML = template.HTML(title, list,
            `<form action="/update" method="post">
                <input type="hidden" name="id" value="${title}" />
                <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
                <p><textarea type=text name="description" placeholder="description">${desc}</textarea></p>
                <p><input type="submit" /></p>
            </form>`, 
            `<a href="/create">Create</a> <a href="/update/${title}">Update</a>`
        );
        response.send(HTML);
    });
});

app.post('/update', (request, response) => {
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
        response.redirect(`/page/${title}`);
        });
    });
});

app.post('/delete', (request, response) => {
    var post = request.body;
    var id = post.id;
    fs.unlink(`data/${id}`, function(error) {
        response.redirect('/');
    });
});

app.use((request, response, next) => {
    response.status(404).send('요청하신 페이지를 찾을 수 없습니다 임마');
});

app.use((error, request, response, next) => {
    console.error(error.stack);
    response.status(500).send('잘못 입력하셨잖아')
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});