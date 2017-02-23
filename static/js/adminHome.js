var socket = io.connect();
var twitchInfo = $('#twitchInfo')
var twitter = $('#twitter')
var donations = $('#donations')
var followers = $('#followers')
var update = document.getElementById("update")
var restart = document.getElementById("restart")

$(document).ready(function() {
  twitchInfo.css({
    'position': 'absolute',
    'width': '360px',
    'top': '300px',
    'padding': '20px',
    'background-color': '#282828',
    'left': '440px'
  })
  donations.css({
    'position': 'absolute',
    'width': '360px',
    'top': '70px',
    'bottom': '20px',
    'padding': '20px',
    'background-color': '#282828',
    'left': '1270px'
  })
  followers.css({
    'position': 'absolute',
    'width': '360px',
    'top': '430px',
    'bottom': '20px',
    'padding': '20px',
    'background-color': '#282828',
    'left': '440px'
  })
  twitter.css({
    'position': 'absolute',
    'width': '360px',
    'top': '70px',
    'bottom': '20px',
    'padding': '20px',
    'background-color': '#282828',
    'left': '855px'
  })
})

setInterval(function () {
  twitchInfo.load(document.URL + ' #twitchInfo')
  twitter.load(document.URL + ' #twitter')
  followers.load(document.URL + ' #followers')
}, 60000);

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
