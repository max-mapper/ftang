var glob = require('glob')

glob('**/**.mp3', function(err, files) {
  var objs = files.map(function(f) {
    var parts = f.split('/')
    
    var artist = parts[0]
    var album = parts[1]
    var song = parts[2]
    
    var obj = {}
    obj.url = "http://commondatastorage.googleapis.com/maxomusic/DOESTHISMONKEYLOOKFUNNYTOYOU.COM/taco/"
    obj.url += encodeURIComponent([artist, album, song].join('/'))
    obj.artist = artist
    obj.song = song
    obj.album = album
    
    return obj
  })
  
  console.log(JSON.stringify(objs))
})