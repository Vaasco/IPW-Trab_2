'use strict'

function buildErrorList(){
    const errors = {};

    function addError(code,name,message){
        errors[name] = info => {
            return {code,name, message,info};
        };
    }

    addError(2000,'FAIL','An error occurred');
    addError(2001,'NOT_FOUND','The item does not exist');
    addError(2002,'EXT_SVC_FAIL','External service failure');
    addError(2003, 'MISSING_PARAM','Required parameter missing');
    addError(2004,'INVALID_PARAM', 'Invalid value for parameter');
    addError(2005, 'UNAUTHENTICATED', 'Invalid or missing token');
    
    return errors;
}

const errorList = buildErrorList();

module.exports = errorList;