$("#searchBar").keyup(function(ev) {
   if (ev.which === 13) {
      var xD = $("input").val();
      location.href = "user";
   }
}); 
