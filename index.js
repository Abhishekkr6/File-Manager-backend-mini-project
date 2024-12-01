const express = require('express');
const app = express();
const port = 3000;
const Path = require('path');
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    fs.readdir(`./files`, function(err, files) {
        res.render('index', { files: files });
    });
});

app.get('/file/:file', (req, res) => {
    const file = req.params.file;
    fs.readFile(`./files/${file}`, 'utf-8', function(err, data) {
        if (err) {
            res.status(404).send('File not found');
        } else {
            res.render('show', { file: req.params.file, data: data });
        }
    });
});

app.get('/edit/:file', (req, res) => {
    res.render('edit', { file: req.params.file });
});

app.post('/edit', (req, res) => {
    fs.rename(`./files/${req.body.previous}`, `./files/${req.body.new}`, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error renaming the file');
        }
        res.redirect('/');
    });
});

app.post('/create', (req, res) => {
    const filename = req.body.title.trim();
    const description = req.body.description;

    if (!filename.includes('.') || filename.split('.').pop().trim() === '') {
        return res.status(400).send('Invalid file name or extension');
    }

    fs.writeFile(`./files/${filename}`, description, function(err) {
        if (err) {
            console.error(err);
            return res.status(500).send('Error while creating the file');
        }
        res.redirect('/');
    });
});

app.post('/delete', (req, res) => {
    const fileName = req.body.fileName;
    const filePath = `./files/${fileName}`;

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Error deleting the file:', err);
            return res.status(500).send('Error while deleting the file');
        }
        console.log(`File ${fileName} deleted successfully`);
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
