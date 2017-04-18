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

var socket = io.connect()
socket.on("success", function() {
  $("#showText").html("Succesfully updated the module!").css("color", "green")
})

var modChange = document.getElementById("modChange")
if (modChange) {
  modChange.addEventListener('click', function() {
    var newValues = [];
    $("input").each(function(){
      var id = $(this)[0].id
      if (id == "searchBar") return
      var value = document.getElementById(id).value
      if (value == "on") value = $(this).prop('checked')
      if (value == true) value = 1
      if (value == false) value = 0
      var valueObj = {id: id, value: value}
      newValues.push(valueObj)
    });
    socket.emit('updateModule', newValues)
  }, false);
}
