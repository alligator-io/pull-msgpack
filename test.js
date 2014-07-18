var test = require('tape')
var pull= require('pull-stream')
var msgpack = require('./index.js')

test('pack/unpack',function(t){
  var testArr  = ['test1','test2','test3']
  pull(
      pull.values(testArr),
      msgpack.pack(),
      msgpack.unpack(),
      pull.collect(function(err,data){
        t.equal(err,null)
        t.same(data,testArr)
        t.end()
      })
  )
})