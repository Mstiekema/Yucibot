window.onload = function() {
	document.getElementById("welcome").innerHTML = "This is the website of Yucibot that moderates " + streamer.substring(1) + "'s stream!";
}

$("#searchBar").keyup(function(ev) {
   if (ev.which === 13) {
      var xD = $("input").val();
      location.href = "./user/" + xD + ".html";
   }
}); 
