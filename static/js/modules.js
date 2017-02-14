var socket = io.connect();
var moduleSetBtn = document.querySelector('.moduleBtn');

function disableModule(name) {
  socket.emit('disableModule', name)
  setTimeout(function() {window.location.reload(true)}, 100);
}

function enableModule(name) {
  socket.emit('enableModule', name)
  setTimeout(function() {window.location.reload(true)}, 100);
}

function restartBot() {
  socket.emit('restartBot')
}

if (moduleSetBtn) {
  for (var x = 0; x < moduleSetBtn.length; x++) {
    moduleSetBtn[x].addEventListener('click', function() {
      window.location.href = "/"
    })
  }
}
