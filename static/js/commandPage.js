$(document).ready(function(){
  $(".subCommands").hide();
  $(".modCommands").hide();
});

$("#switchPageE").click(function() {
  $(".allCommands").show();
  $(".subCommands").hide();
  $(".modCommands").hide();
});

$("#switchPageS").click(function() {
  $(".allCommands").hide();
  $(".subCommands").show();
  $(".modCommands").hide();
});

$("#switchPageM").click(function() {
  $(".allCommands").hide();
  $(".subCommands").hide();
  $(".modCommands").show();
});

$(".commDetails").click(function() {
  window.location.href = "/commands/" + this.id.substring(1)
});
