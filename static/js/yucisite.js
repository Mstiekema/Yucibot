$("#searchBar").keyup(function(ev) {
   if (ev.which === 13) {
      var name = $("input").val();
      location.href = "/user/" + name;
   }
}); 

function home() {
   window.location.href = '/';
}

function commands() {
   window.location.href = '/commands';
}

function stats() {
   window.location.href = '/stats';
}

function admin() {
   window.location.href = '/admin';
}

function songlist() {
   window.location.href = '/admin/songlist';
}

function logs() {
   window.location.href = '/admin/logs';
}

function module() {
   window.location.href = '/admin/modules';
}

function sub() {
   window.location.href = '/sub';
}

function history() {
	window.location.href = '/history/' + new Date().toISOString().substr(0, 10);
}

function login() {
	window.location.href = "/login"
}

function logout() {
	window.location.href = '/logout';
}

function about() {
   window.location.href = '/about';
}

function github() {
   window.open("https://www.github.com/Mstiekema", "_blank");
}

function dev() {
   window.open("https://mstiekema.github.io", "_blank");
}