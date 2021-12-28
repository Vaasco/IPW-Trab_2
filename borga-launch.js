
const default_port = 8888;
const port = process.argv[2] || default_port;

const config = require('./borga-config')

const app = require('./borga-server')(config.guest)

app.listen(port)