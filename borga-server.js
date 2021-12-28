'use strict'

module.exports = function (guest){

    const data_games = require('./borga-games-data');
    const data_mem = require('./borga-data-mem')(guest)
    const services = require('./borga-services')(data_games, data_mem)
    const webApi = require('./borga-web-api')(services);
    const webui = require('./borga-web-site')(services, guest.token)

    const express = require('express');
    const borga = express();

    borga.set('view engine', 'hbs');

    borga.use('/favicon.ico', express.static('static-files/favicon.ico'))

    borga.use('/public', express.static('static-files'));

    borga.use('/api', webApi);

    borga.use('/', webui);

    return borga
}

