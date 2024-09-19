const express = require("express");
const path = require('path');
const { Data } = require("./data");
const { upload } = require("./images");
const cors = require('cors');

const app = express();
const port = 5334;
const data = new Data();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'main')));
app.use('/utils/shared', express.static('path/to/utils/shared'));
app.use('/components/StackedList', express.static('path/to/components/StackedList'));


app.get('/api', async (req, res) => {
    if (req.query.select) {
        res.json((await data.query('select ' + req.query.select)).rows);
    }
    if (req.query.update) {
        res.json((await data.query('update ' + req.query.update)).rows);
    }
    if (req.query.delete) {
        res.json((await data.query('delete ' + req.query.delete)).rows);
    }
    if (req.query.insert) {
        res.json((await data.query('insert ' + req.query.insert)).rows);
    }
    if (req.query.nameexist) {
        res.json({ exist: await data.doesUsernameExist(req.query.nameexist) });
    }
    if (req.query.hashgen) {
        res.json({ hash: await data.hashGen(req.query.hashgen) });
    }
    if (req.query.login && req.query.pass) {
        res.json(await data.login(req.query.login, req.query.pass));
    }
    if (req.query.loginhash) {
        res.json({ user: await data.loginHash(req.query.loginhash) });
    }
    if (req.query.getnodeid === '') {
        res.json((await data.query(`
        SELECT MIN(t1.node_id + 1)
        FROM person t1
        LEFT JOIN person t2 ON t1.node_id + 1 = t2.node_id
        WHERE t2.node_id IS NULL
    `)).rows);
    }
    console.log(JSON.stringify(req.query).length > 1000 ? `query commited` : req.query);
});

app.post('/upload', upload.single('image'), (req, res) => {
    const uploadedFilePath = req.file.path;
    console.log('File uploaded:', uploadedFilePath);
    res.json({ success: true, filePath: uploadedFilePath });
});

app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
