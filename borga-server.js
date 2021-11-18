'use strict'

const default_port = 8888;
const port = process.argv[2] || default_port;

const data_games = require('./borga-games-data');
const data_int = require('./borga-data-mem')

const webapi = require('./borga-webapi')(serives);

const express = require('express');

const borga = express();

borga.use('/api, webapi');

borga.listen(port);