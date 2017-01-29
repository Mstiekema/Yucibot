$("#searchBar").keyup(function(ev) {
   if (ev.which === 13) {
      var name = $("input").val();
      location.href = "/user/" + name;
   }
}); 
