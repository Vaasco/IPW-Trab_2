
const GREEN = "\x1b[32m"
const RESET = "\x1b[0m"
const BRIGHT = "\x1b[1m"
const log = () => {

}

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
            console.log("\x1b[31m[SERVER] Error on server startup\x1b[0m")
        }
        console.log(`${GREEN}${BRIGHT}[SERVER] Server listening on port ${port}\x1b[0m`)
    })
}).catch((err) => {
    console.log(err)
})



