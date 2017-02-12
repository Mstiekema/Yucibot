var socket = io.connect()
var soundEl =document.querySelectorAll('.sound');
var button =document.querySelectorAll('button');
var popup = document.getElementById('showBox');
var buy = document.getElementById('buyThing');
var sounds = {
  "echo": 'https://puu.sh/tNZm7/6fd06f6b2f.mp3',
  "datboi": 'https://puu.sh/rk6dH/5ba8a259f8.mp3',
  "fuckyou": 'https://puu.sh/pMG2z/eeda3235c9.mp3',
  "lielielie": 'https://puu.sh/mlMzM/af31153a57.mp3',
  "bottle": 'http://puu.sh/tX9R5/4ce2a001f0.mp3',
  "beer": 'http://puu.sh/tXc6X/d75fb7a875.mp3'
}
var gifs = {
  "pepe": 'https://media.giphy.com/media/FHCHRtwAZgGFq/giphy.gif',
  "billy": 'http://x3.wykop.pl/cdn/c3201142/comment_SbwUMF1MFEXwgaUpuZBAFuXbl5g6ZcYy.gif',
  "kappa": 'http://i.imgur.com/8TRbWHM.gif',
  "sound": 'https://www.clammr.com/Content/images/webapp/animated-sound.gif'
}

window.onclick = function(event) {
  if (event.target == popup) {
    popup.style.display = "none";
    $("#gifSpot").removeClass()
    window.location.reload()
  }
}

if (buy) {
  buy.addEventListener('click', function() {
    var item = document.getElementById('gifSpot').getAttribute("class").split(" ")
    var user = document.getElementById('name').innerHTML.slice(0, -2)
    socket.emit("buyCLR", {"item": item[0], "user": user, "type": item[1]})
  })
}

socket.on("success", function() {
  $("#showText").html("Succesfully bought your CLR command!").css("color", "green")
})

socket.on("failure", function() {
  $("#showText").html("Something went wrong. Please try again later. (Do you have enough points?)").css("color", "red")
})

if (button) {
  for (var x = 0; x < button.length; x++) {
    button[x].addEventListener('click', function() {
      if(this.id == "loginBtn") return
      popup.style.display = "block";
      var type = $(this).attr("class")
      if (type == "gif") {
        $("#gifSpot").addClass(this.id)
        $("#gifSpot").addClass("gif")
        $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src="+gifs[this.id]+" align='middle'><br>")
      } else if (type == "sound") {
        $("#gifSpot").addClass(this.id)
        $("#gifSpot").addClass("sound")
        $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src="+gifs["sound"]+" align='middle'><br>")
      }
    })
  }
}

if (soundEl) {
  for (var x = 0; x < soundEl.length; x++) {
    soundEl[x].addEventListener('click', function() {
      var sound = new Audio(sounds[this.id]);
      sound.play();
    })
  }
}
