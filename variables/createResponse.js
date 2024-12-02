exports.createResponse = (errorCode, errorMessage, data)=>{
    return {
        error_code:errorCode,
        error_message:errorMessage,
        data:data
    }
}