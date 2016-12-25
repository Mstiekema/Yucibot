var clientID = "putclientidhere"
var redirect = "http://localhost:3000"

$("#searchBar").keyup(function(ev) {
   if (ev.which === 13) {
      var xD = $("input").val();
      location.href = "/user/" + xD;
   }
}); 

function home() {
   window.location.href = '/';
}

function commands() {
   window.location.href = '/commands';
}

function admin() {
   window.location.href = '/admin';
}

function songlist() {
   window.location.href = '/admin/songlist';
}

function points() {
   window.location.href = '/admin/pointlogs';
}

function module() {
   window.location.href = '/admin/modules';
}

var time = new Date();
var day = time.getDate();
var month = time.getMonth() + 1;
var year = time.getFullYear();
var date = year + "-" + month + "-" + day;

function history() {
   window.location.href = '/history/' + date;
}

function login() {
	window.location.href = 'https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=' + clientID + '&redirect_uri=' + redirect + '&scope=user_read+channel_subscriptions+user_subscriptions';
}

function logout() {
	localStorage.clear();
	changeLogin()
	window.location.href = '/';
}

// Check if logging in
var hash = location.hash
var token = hash.substring(hash.indexOf('=')+1,hash.indexOf("&"))
if (location.hash != "") {
	console.log("Test")
	$.ajax({
	    url: 'https://api.twitch.tv/kraken/user',
		headers: {
			'Client-ID': clientID,
			"Authorization": "OAuth " + token
		},
		success: function(data){
			window.location.href = "/"
			changeLogin()
			// alert("Welcome " + data.display_name)
			console.log("Welcome " + data.display_name)
			localStorage.login = true
			localStorage.displayName = data.display_name
			localStorage.name = data.name
		}
	});
}

var pt1 = $("<p id='test'></p>").text("Hello " + localStorage.displayName);
var pt2 = $("<p onclick='login()'></p>").text("Login");
var pt3 = $("<p onclick='admin()'></p>").text(" - Admin");
var pt4 = $("<p onclick='logout()'></p>").text(" - Logout");

function changeLogin() {
	if(localStorage.login == "true") {
		$(".login").append(pt1, pt3, pt4)
		console.log("xD")
	} else {
		$(".login").append(pt2)
		console.log("...")
	}
}

window.onload = changeLogin()