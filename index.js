var msgpack = require('msgpack')

var exports = module.exports;

exports.pack=function(){
  var ended  = false

  return function(read){
    return function(abort,callback){
      if(abort) return read(abort, callback)

      if(ended){
        return callback(ended)
      }

      read(abort,function next(end,c){
        if(end){
          ended=end
          return callback(end)
        }

        try{
          callback(null,msgpack.pack(c))
        }
        catch(err){
          ended=err
        }

        if(!ended)read(null,next)
      })
    }
  }
}

exports.unpack=function(){
  var ended  = null
  var buffer=null

  return function(read){
    return function(abort,callback){
      if(abort) return read(abort, callback)

      if(ended){
        return callback(ended)
      }

      read(abort,function next(end,chunk){
        if(end){
          if(ended)return
          ended=end
          return read(end,function(){
            return callback(end)
          })
        }

        try{

          if(Buffer.isBuffer(buffer)){
            var b = new Buffer(buffer.length+chunk.length)
            buffer.copy(b,0,0,buffer.length)
            chunk.copy(b,buffer.length,0,chunk.length)
            buffer=b
          }else if(chunk){
            buffer = chunk
          }

          while(Buffer.isBuffer(buffer) && buffer.length > 0){
            var msg=msgpack.unpack(buffer)

            if(!msg)break

            callback(null,msg)

            if (msgpack.unpack.bytes_remaining > 0) {
              buffer = buffer.slice(
                  buffer.length - msgpack.unpack.bytes_remaining,
                  buffer.length
              )
            }
            else{
              buffer = null
            }
          }
          read(end,next)
        }
        catch(err){
          next(err)
        }
      })
    }
  }
}