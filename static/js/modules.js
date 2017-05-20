var socket = io.connect();
var moduleSetBtn = document.querySelector('.moduleBtn');
var restart = document.getElementById("restart")
var switches = document.getElementById('.moduleSwitch');
$("[name='checkbox']").bootstrapSwitch();

$('.moduleSwitch').on('switchChange.bootstrapSwitch', function (event, state) {
  if (state == true) {
    socket.emit('enableModule', this.id)
  } else {
    socket.emit('disableModule', this.id)
  }
});

if (restart) {
  restart.addEventListener("click", function() {
    socket.emit('restartBot')
  })
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
  $("#succesMsg").removeClass("hidden")
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

$(document).ready( function() {
  $('.close').click( function() {
    $(this).parent().fadeOut();
  });
});
