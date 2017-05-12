var socket = io.connect()
var soundEl = document.querySelectorAll('.sound');
var button = document.querySelectorAll('button');
var popup = document.getElementById('showBox');
var buy = document.getElementById('buyThing');
var close = document.getElementById('close');
var memes = document.querySelectorAll('.memes');
var sounds = {
  "echo": 'https://puu.sh/tNZm7/6fd06f6b2f.mp3',
  "datboi": 'https://puu.sh/rk6dH/5ba8a259f8.mp3',
  "fuckyou": 'https://puu.sh/pMG2z/eeda3235c9.mp3',
  "bottle": 'http://puu.sh/tX9R5/4ce2a001f0.mp3',
  "beer": 'http://puu.sh/tXc6X/d75fb7a875.mp3',
  "zelda": 'http://puu.sh/u0pld/34c6c39a2d.mp3',
  "harro": 'https://puu.sh/uf3iH/5fbf1d4b4f.mp3',
  "bedankt": 'https://puu.sh/ufdBg/b25699a14e.mp3'
}
var gifs = {
  "pepe": 'https://media.giphy.com/media/FHCHRtwAZgGFq/giphy.gif',
  "billy": 'http://x3.wykop.pl/cdn/c3201142/comment_SbwUMF1MFEXwgaUpuZBAFuXbl5g6ZcYy.gif',
  "kappa": 'http://i.imgur.com/8TRbWHM.gif',
  "sound": 'https://www.clammr.com/Content/images/webapp/animated-sound.gif'
}
var memes = [
  "http://puu.sh/vNR7E/32ac03a631.mp4",
  "http://puu.sh/vNWvP/a8ea63181c.mp4",
  "http://puu.sh/vNWx3/287ab583fc.mp4",
  "http://puu.sh/vNWxC/9f1ce6d63b.mp4",
  "http://puu.sh/vNWzd/2a43408c50.mp4",
  "http://puu.sh/vNWzK/acb2ce8b40.mp4",
  "http://puu.sh/vNWA2/1b4455d81d.mp4",
  "http://puu.sh/vNWAx/040a4dfc2b.mp4"
]

window.onclick = function(event) {
  if (event.target == popup) {
    $('#showStuff').removeClass('animated bounceInDown');
    $('#showStuff').addClass('animated bounceOutUp');
    setTimeout(function () {
      popup.style.display = "none";
    }, 700);
  }
}

if (close) {
  close.addEventListener('click', function() {
    $('#showStuff').removeClass('animated bounceInDown');
    $('#showStuff').addClass('animated bounceOutUp');
    setTimeout(function () {
      popup.style.display = "none";
    }, 700);
  })
}

if (buy) {
  buy.addEventListener('click', function() {
    var item = document.getElementById('gifSpot').getAttribute("class").split(" ")
    var user = document.getElementById('easyUsernameFetcher').innerHTML
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
      var type = $(this).attr("class")
      if(this.id == "loginBtn") return
      if (type == "pure-button memes") {
        var length = memes.length
        var ranN = Math.floor(Math.random() * length)
        return socket.emit("meme", {"meme": memes[ranN]})
      }
      $('#showStuff').removeClass('animated bounceOutUp');
      $('#showStuff').addClass('animated bounceInDown');
      popup.style.display = "block";
      if (type == "pure-button gif") {
        $("#gifSpot").addClass(this.id)
        $("#gifSpot").addClass("gif")
        $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src="+gifs[this.id]+" align='middle'><br>")
      } else if (type == "pure-button sound") {
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
