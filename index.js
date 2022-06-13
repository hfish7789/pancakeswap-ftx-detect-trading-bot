var express = require('express');
var app = express();
const cors = require("cors");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(upload.array()); 

app.get('/', function(req, res){
   res.sendFile('index.html');
});

require("./routes.js")(app);

app.listen(3000, function() {
    console.log("port 3000");
});