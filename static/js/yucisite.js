$(".searchBar").keyup(function(ev) {
  if (ev.which === 13) {
    var name = document.getElementsByClassName('searchBar')[0].value + document.getElementsByClassName('searchBar')[1].value
    location.href = "/user/" + name;
  }
});

$("#fullProfile").click(function() {
  $(".profile").toggleClass("hidden")
  $("#name").toggleClass("hover")
});

$("#fullProfileSmall").click(function() {
  $(".profile").toggleClass("hidden")
  $("#name").toggleClass("hover")
});

$("#loop").click(function() {
  $(".pure-menu-list").toggleClass("hidden")
  $("#fullProfileSmall").toggleClass("hidden")
  $("#smallMenuSearch").toggleClass("hidden")
});

document.onclick = function(event) {
  if (event.target.id == "name" || $(event.target).attr('class') == "profile text-left" || event.target.id == "menu" || $(event.target).attr('class') == "fa fa-caret-down") {
    return
  } else if( $(event.target).attr('class') == "img-circle pf") {
    window.location.href = "/user/" + event.target.id
  } else {
    $('.profile').addClass('hidden');
    $("#name").removeClass("hover")
  }
}
