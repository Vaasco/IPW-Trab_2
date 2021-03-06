'use strict'


/**
 * Error collection builder
 */
function buildErrorList(){
    const errors = {};

    /**
     * Adds an error to the collection
     */
    function addError(code,name,message){
        errors[name] = info => {
            return {code, name, message, info};
        };
    }

    addError(2000,'FAIL','An error occurred');
    addError(2001,'NOT_FOUND','The item does not exist');
    addError(2002,'EXT_SVC_FAIL','External service failure');
    addError(2003,'INVALID_PARAM', 'Invalid value for parameter');
    addError(2004, 'UNAUTHENTICATED', 'Invalid or missing token');
    addError(2003, 'MISSING_PARAM','Required parameter missing');
    
    return errors;
}

const errorList = buildErrorList();

module.exports = errorList;