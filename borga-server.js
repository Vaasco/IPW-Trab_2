'use strict'

const default_port = 8888;
const port = process.argv[2] || default_port;

const data_games = require('./borga-games-data');
const data_mem = require('./borga-data-mem')
const services = require('./borga-services')(data_games, data_mem)
const webApi = require('./borga-web-api')(services);
const webui = require('./borga-webui')(services)

const express = require('express');

const borga = express();

borga.use('/api', webApi);

borga.listen(port);

borga.use('/',webui);

borga.use('/public', express.static('static-files'));

borga.set('view engine', 'hbs');
