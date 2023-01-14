const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const sanitizeHTML = require('sanitize-html');
const template = require('../lib/template.js');

router.get('/create', (request, response) => {
    var title = 'Create';
    var list = template.list(request.filelist);
    var HTML = template.HTML(title, list,
        `<form action="/topic/create" method="post">
            <p><input type="text" name="title" placeholder="title" /></p>
            <p><textarea type=text name="description" placeholder="description"></textarea></p>
            <p><input type="submit" /></p>
            </form>`,
        `<h2>${title}</h2>`
    );
    response.send(HTML);
});

router.post('/create', (request, response) => {
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
        response.redirect(`/topic/${title}`);
    });
});

router.get('/update/:updateId', (request, response) => {
    var filteredId = path.parse(request.params.updateId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, desc){
        var title = request.params.updateId;
        var list = template.list(request.filelist);
        var HTML = template.HTML(title, list,
            `<form action="/topic/update" method="post">
                <input type="hidden" name="id" value="${title}" />
                <p><input type="text" name="title" placeholder="title" value="${title}"/></p>
                <p><textarea type=text name="description" placeholder="description">${desc}</textarea></p>
                <p><input type="submit" /></p>
            </form>`, 
            `<a href="/topic/create">Create</a> <a href="/topic/update/${title}">Update</a>`
        );
        response.send(HTML);
    });
});

router.post('/update', (request, response) => {
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(error) {
        response.redirect(`/topic/${title}`);
        });
    });
});

router.post('/delete', (request, response) => {
    var post = request.body;
    var id = post.id;
    fs.unlink(`data/${id}`, function(error) {
        response.redirect('/');
    });
});

router.get('/:topicId', (request, response, next) => {
    var filteredId = path.parse(request.params.topicId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(error, description){
        if(error){
            next(error);
        } else {
            var title = request.params.topicId;
            var sanitizedTitle = sanitizeHTML(title);
            var sanitizedDescription = sanitizeHTML(description);
            var list = template.list(request.filelist);
            var HTML = template.HTML(sanitizedTitle, list,
                `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p>`,
                `<a href="/topic/create">Create</a>
                <a href="/topic/update/${sanitizedTitle}">Update</a>
                <form action="/topic/delete" method="post">
                    <input type="hidden" name="id" value="${sanitizedTitle}" />
                    <input type="submit" value="Delete" />
                </form>`
            );
            response.send(HTML);
        }
    });
});

module.exports = router;