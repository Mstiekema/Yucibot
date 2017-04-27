var button =document.querySelectorAll('button');
var popup = document.getElementById('showBox');
var close = document.getElementById('close');
var modals = document.getElementsByClassName('commText')

$(document).ready(function(){
  $(".subCommands").hide();
  $(".modCommands").hide();
  $(".pointCommands").hide();
});

$("#switchPageE").click(function() {
  $(".allCommands").show();
  $(".subCommands").hide();
  $(".pointCommands").hide();
  $(".modCommands").hide();
});

$("#switchPageS").click(function() {
  $(".allCommands").hide();
  $(".subCommands").show();
  $(".pointCommands").hide();
  $(".modCommands").hide();
});

$("#switchPageM").click(function() {
  $(".allCommands").hide();
  $(".subCommands").hide();
  $(".pointCommands").hide();
  $(".modCommands").show();
});

$("#switchPageP").click(function() {
  $(".allCommands").hide();
  $(".subCommands").hide();
  $(".modCommands").hide();
  $(".pointCommands").show();
});

window.onclick = function(event) {
  if (event.target == popup) {
    $('#showComms').removeClass('animated bounceInDown');
    $('#showComms').addClass('animated bounceOutUp');
    setTimeout(function () {
      popup.style.display = "none";
      $(".commText").addClass("hidden")
    }, 700);
  }
}

close.addEventListener('click', function() {
  $('#showComms').removeClass('animated bounceInDown');
  $('#showComms').addClass('animated bounceOutUp');
  setTimeout(function () {
    popup.style.display = "none";
    $(".commText").addClass("hidden")
  }, 700);
})

if (button) {
  for (var x = 0; x < button.length; x++) {
    button[x].addEventListener('click', function() {
      if(this.id == "loginBtn" || this.id.indexOf("switchPage") != -1) return
      if(this.id == "!clr") return window.location.href = "/commands/clr"
      $('#showComms').removeClass('animated bounceOutUp');
      $('#showComms').addClass('animated bounceInDown');
      popup.style.display = "block";
      var id = this.id + "Modal"
      for (key in modals) {
        if (modals[key].id == id) {
          return $(modals[key]).removeClass("hidden");
        }
      }
    })
  }
}
