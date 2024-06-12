class ApiError extends Error{
    constructor(
        statusCode,
        message = 'Some thing went wrong',
        errors = [],
        stacks = ''
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.errors = errors
        
        this.success = false

        if(stacks){
            this.stack = stacks
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}