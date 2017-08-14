var create = document.getElementById("createTimer");
var popup = document.getElementById('showBox');
var close = document.getElementById('close');
var remove = document.getElementsByClassName("remTimer");
var add = document.getElementById("addTimer")
var edit = document.getElementsByClassName("editTimer")
var socket = io.connect();

for (var i = 0; i < remove.length; i++) {
  remove[i].addEventListener('click', function() {
    var timer = this.id
    socket.emit('remTimer', timer)
    alert("Succesfully removed the following timer: " + timer)
    window.location.reload()
  }, false);
}

for (var i = 0; i < edit.length; i++) {
  edit[i].addEventListener('click', function() {
    var base = $(this).parent()[0].classList
    $("#timerName").val(base[0]);
    $("#msg").val(base[1].split(",").join(" "));
    $("#online").val(base[2]);
    $("#offline").val(base[3]);
    $('#showStuff').removeClass('animated bounceOutUp');
    $('#showStuff').addClass('animated bounceInDown');
    popup.style.display = "block";
}, false);
}

add.addEventListener('click', function() {
  var newTimer = {
    name: document.getElementById('timerName').value,
    msg: document.getElementById('msg').value,
    online: document.getElementById('online').value,
    offline: document.getElementById('offline').value
  }
  socket.emit('addTimer', newTimer)
  window.location.reload()
}, false);

// Modal
create.addEventListener('click', function() {
  $('#showStuff').removeClass('animated bounceOutUp');
  $('#showStuff').addClass('animated bounceInDown');
  popup.style.display = "block";
}, false);

window.onclick = function(event) {
  if (event.target == popup) {
    $('#showStuff').removeClass('animated bounceInDown');
    $('#showStuff').addClass('animated bounceOutUp');
    setTimeout(function () {
      popup.style.display = "none";
      window.location.reload()
    }, 700);
  }
}

if (close) {
  close.addEventListener('click', function() {
    $('#showStuff').removeClass('animated bounceInDown');
    $('#showStuff').addClass('animated bounceOutUp');
    setTimeout(function () {
      popup.style.display = "none";
      window.location.reload()
    }, 700);
  })
}

restart.addEventListener("click", function() {
  socket.emit('restartBot')
})