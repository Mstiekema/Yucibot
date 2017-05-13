var socket = io.connect()
var soundEl = document.querySelectorAll('.sound');
var button = document.querySelectorAll('button');
var popup = document.getElementById('showBox');
var buy = document.getElementById('buyThing');
var close = document.getElementById('close');
var memes = document.querySelectorAll('.memes');

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

if (buy) {
  buy.addEventListener('click', function() {
    var item = document.getElementById('gifSpot').getAttribute("class").split(" ")
    var user = document.getElementById('easyUsernameFetcher').innerHTML
    socket.emit("buyCLR", {"item": item[0], "user": user, "type": item[1], url: item[2]})
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
      if (type == "btn btn-danger memes") {
        var length = memes.length
        var ranN = Math.floor(Math.random() * length)
        return socket.emit("meme", {"meme": memes[ranN]})
      }
      if (type.indexOf("btn btn-warning rem") != -1) {
        var id = type.slice(19)
        var con = confirm("Are you sure you want to remove " + this.id + "?");
        if (con == true) {
          console.log(id)
          socket.emit("removeCLR", {"id": id})
          window.location.reload()
        }
        return
      }
      if (type.indexOf("submitNewSample") != -1) {
        var newSample = {
          name: document.getElementById('id').value,
          url: document.getElementById('url').value,
          type: document.getElementById('type').value
        }      
        socket.emit('addSample', newSample)
        return window.location.reload()
      }
      $('#showStuff').removeClass('animated bounceOutUp');
      $('#showStuff').addClass('animated bounceInDown');
      popup.style.display = "block";
      if (type.indexOf("pure-button gif") != -1) {
        var type = type.slice(16)
        $("#gifSpot").addClass(type)
        $("#gifSpot").addClass("gif")
        $("#gifSpot").addClass(this.id)
        $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src="+this.id+" align='middle'><br>")
      } else if (type.indexOf("pure-button sound") != -1) {
        var type = type.slice(18)
        $("#gifSpot").addClass(type)
        $("#gifSpot").addClass("sound")
        $("#gifSpot").addClass(this.id)
        $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src='https://www.clammr.com/Content/images/webapp/animated-sound.gif' align='middle'><br>")
      } else if (type.indexOf("btn btn-success clrSamples") != -1) {
        var clrType = type.slice(27)
        if (clrType == "gif") {
          $("#gifSpot").addClass(this.id)
          $("#gifSpot").addClass("gif")
          $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src="+this.id+" align='middle'><br>")
        } else if (clrType == "sound") {
          $("#gifSpot").addClass(this.id)
          $("#gifSpot").addClass("sound")
          $("#gifSpot").html("<img style='margin='auto'; width='300'; height='300';' src='https://www.clammr.com/Content/images/webapp/animated-sound.gif' align='middle'><br>")
        } else if (clrType == "meme") {
          $("#gifSpot").addClass(this.id)
          $("#gifSpot").addClass("meme")
          $("#gifSpot").html("<video style='margin='auto'; width='300'; height='300';' id='meme' width='640' height='360' align='middle' autoplay='true'><source src='"+this.id+"'type='video/mp4'></video>")
        } else {
          return
        }
      }
    })
  }
}

if (soundEl) {
  for (var x = 0; x < soundEl.length; x++) {
    soundEl[x].addEventListener('click', function() {
      var sound = new Audio(this.id);
      sound.play();
    })
  }
}
