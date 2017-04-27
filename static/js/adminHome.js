var socket = io.connect();
var twitchInfo = $('#twitchInfo')
var twitter = $('#twitter')
var donations = $('#donations')
var followers = $('#followers')
var update = document.getElementById("update")
var restart = document.getElementById("restart")

setInterval(function () {
  // twitchInfo.load(document.URL + ' #twitchInfo')
  twitter.load(document.URL + ' #twitter')
  // followers.load(document.URL + ' #followers')
}, 20000);

restart.addEventListener("click", function() {
  socket.emit('restartBot')
})

update.addEventListener("click", function() {
  var title = $("#title").val()
  var game = $("#game").val()
  var data = {
    title: title,
    game: game
  }
  socket.emit("updateStatus", data)
})
