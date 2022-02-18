'use strict'

const passport = require("passport")
const session = require("express-session")
const logs = require("./logs")

passport.serializeUser((userInfo, done) => {
    done(null, userInfo)
})

passport.deserializeUser((userInfo, done) => {
    done(null, userInfo)
})

module.exports = function (es_spec, guest, dbMode){

    const games_data = require('./borga-games-data');
    let data_mem; 
    if (dbMode === "LOCAL")
     data_mem = require('./borga-data-mem')(guest)
    else if(dbMode === "REMOTE")
        data_mem = require('./borga-db')(es_spec, guest)
    else throw new Error("Please specify the DB_MODE on borga-config.js")
    
    const services = require('./borga-services')(games_data, data_mem)

    const webApi = require('./borga-web-api')(services);
    const webui = require('./borga-web-site')(services, guest.token)

    const express = require('express');
    const borga = express();

    borga.use(session({
		secret: 'borga-games',
		resave: false,
		saveUninitialized: false
	}));
    
    borga.use(passport.initialize());
    borga.use(passport.session());

    borga.set('view engine', 'hbs');

    borga.use('/favicon.ico', express.static('static/favicon.ico'))

    borga.use('/public', express.static('static'));

    borga.use('/api', webApi);

    borga.use('/', webui);

    return {app: borga, setup: services.setup}
}

