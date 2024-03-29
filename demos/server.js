'use strict';
var express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));

app.use('/js/angular-keyboard/', express.static(__dirname + '/../dist'));
app.use('/js/angular/', express.static(__dirname + '/../node_modules/angular'));
app.use('/js/jquery/', express.static(__dirname + '/../node_modules/jquery/dist'));

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('demo-server started on port', port);
});