
const log = require('./logs')
const SERVER_LOG_TAG = "SERVER"

const default_port = "8888";
const port = process.argv[2] || default_port;

const config = require('./borga-config')

const es_spec = {
    url: config.devl_es_url,
    prefix: 'prod'
}

const serverResponse = require('./borga-server')(es_spec, config.guest)

const app = serverResponse.app

serverResponse.setup().then(() => {
    app.listen(port, (err) => {
        if(err){
            log.fail(SERVER_LOG_TAG, `Error on server startup ${err}`)
        }
        log.success(SERVER_LOG_TAG, `Server listening on ${port}`) 
    })
}).catch((err) => {
    console.log(err)
})



