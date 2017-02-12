var create = document.getElementsByClassName("create");
var remove = document.getElementsByClassName("remove");
var edit = document.getElementsByClassName("edit");
var update = document.getElementById("update")
var add = document.getElementById("add")
var socket = io.connect();

for (var i = 0; i < create.length; i++) {
  create[i].addEventListener('click', function() {
    window.location.href = "/admin/commands/create"
  }, false);
}

for (var i = 0; i < remove.length; i++) {
  remove[i].addEventListener('click', function() {
    var comm = this.id
    socket.emit('removeComm', comm)
    alert("Succesfully removed the following command: " + comm)
    window.location.reload()
  }, false);
}

for (var i = 0; i < edit.length; i++) {
  edit[i].addEventListener('click', function() {
    window.location.href = "/admin/commands/edit/" + this.id
  }, false);
}

if (update) {
  update.addEventListener('click', function() {
    var updatedComm = {
      commName: window.location.href.split("/").pop(),
      response: document.getElementById('response').value,
      level: document.getElementById('level').value,
      cdType: document.getElementById('cdType').value,
      cd: document.getElementById('cd').value,
      points: document.getElementById('points').value
    }
    socket.emit('updateComm', updatedComm)
    window.location.href = "/admin/commands"
  }, false);
}

if (add) {
  add.addEventListener('click', function() {
    var newComm = {
      commName: document.getElementById('command').value,
      response: document.getElementById('response').value,
      level: document.getElementById('level').value,
      cdType: document.getElementById('cdType').value,
      cd: document.getElementById('cd').value,
      points: document.getElementById('points').value
    }
    socket.emit('addCom', newComm)
    window.location.href = "/admin/commands"
  }, false);
}
