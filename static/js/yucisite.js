$("#searchBar").keyup(function(ev) {
  if (ev.which === 13) {
    var name = $("input").val();
    location.href = "/user/" + name;
  }
});

$("#menuIconOpen").hide();
$("#menuIconClosed").click(function() {
  $("#menuIconClosed").hide();
  $(".menu").addClass('animated bounceOut');
  $(".login").addClass('animated bounceOut');
  $("#menuIconOpen").show();
  setTimeout(function () { $(".main").addClass('mainMenuClosed'); }, 800);
});

$("#menuIconOpen").click(function() {
  $("#menuIconOpen").hide();
  $(".main").removeClass('mainMenuClosed');
  $(".menu").removeClass('animated bounceOut');
  $(".login").removeClass('animated bounceOut');
  $(".menu").addClass('animated bounceInLeft');
  $(".login").addClass('animated bounceInLeft');
  $(".menu").show();
  $(".login").show();
  $("#menuIconClosed").show();
});

$("#name").click(function() {
  var classes = $(".profile").attr('class')
  if (classes.includes("hidden")) {
    $(".profile").removeClass("hidden");
  } else {
    $(".profile").addClass("hidden");
  }
});
