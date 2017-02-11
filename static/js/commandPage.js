$(document).ready(function(){
  $(".subCommands").hide();
  $(".modCommands").hide();
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

$(".commDetails").click(function() {
  window.location.href = "/commands/" + this.id.substring(1)
});
