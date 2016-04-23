'use strict';
var express = require('express');

var app = express();
app.use(express.static(__dirname + '/public'));

app.use('/js/angular-keyboard/', express.static(__dirname + '/../dist'));
app.use('/js/angular/', express.static(__dirname + '/../node_modules/angular'));
app.use('/js/jquery/', express.static(__dirname + '/../node_modules/jquery/dist'));
app.use('/js/faker/', express.static(__dirname + '/../node_modules/faker/build/build'));

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log('demo-server started on port', port);
});