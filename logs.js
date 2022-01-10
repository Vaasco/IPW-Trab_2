const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const BRIGHT = "\x1b[1m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";

module.exports = {

    success: function (tag, message){
        console.log(`${GREEN}${BRIGHT}[${tag}] ${message}${RESET}`)
    },

    fail: function (tag, message){
        console.log(`${RED}${BRIGHT}[${tag}] ${message}${RESET}`)
    },

    warn: function(tag, message){
        console.log(`${YELLOW}${BRIGHT}[${tag}] ${message}${RESET}`)
    },

    debug: function(tag, message){
        console.log(`${BLUE}${BRIGHT}[${tag}] ${message}${RESET}`)
    },

}