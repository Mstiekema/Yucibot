var clientID = "jzlu9iswyn1syr2jpyz40ut3d7fkcxm"
var redirect = "http://localhost:3000"
var channel = "midnan"

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

function sub() {
   window.location.href = '/sub';
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
	$.ajax({
	    url: 'https://api.twitch.tv/kraken/user',
		headers: {
			'Client-ID': clientID,
			"Authorization": "OAuth " + token
		},
		success: function(data){
			console.log("Welcome " + data.display_name)
			localStorage.login = true
			localStorage.displayName = data.display_name
			localStorage.name = data.name
			checkMod()
			checkSub()
		}
	});
	changeLogin()
	setTimeout(function(){window.location.href = "/"}, 1500)
}

function checkMod() {
	$.ajax('../json/mods.json')
	.done(function(data) {
		var data = data.mods
		if(data.indexOf(localStorage.name) + 1 != 0) {
			localStorage.mod = true
		}
		else {
			localStorage.mod = false
		}
	})
}

function checkSub() {
	$.ajax({
		url: 'https://api.twitch.tv/kraken/users/' + localStorage.name + '/subscriptions/' + channel,
		headers: {
			'Client-ID': clientID,
			"Authorization": "OAuth " + token
		}
	}).done(function(data) {
		if(data.channel != undefined) {
			localStorage.sub = true
		}
		else {
			localStorage.sub = false
		}
	}).fail(function(data) {
		localStorage.sub = false
	})
}

var pt1 = $("<p onclick='login()'></p>").text("Login");
var pt2 = $("<p onclick='logout()'></p>").text("Logout");
var pt3 = $("<p onclick='admin()'></p>").text(" • Admin pages");
var pt4 = $("<p onclick='sub()'></p>").text(" • Sub pages");
var pt5 = $("<u id='test'></u>").text("Hello " + localStorage.displayName);

function changeLogin() {
	if(localStorage.login == "true") {
		var mod = localStorage.mod
		var sub = localStorage.sub

		if((sub == "true" && mod == "true") || mod == "true") {
			$(".login").append(pt5, pt3, pt4, pt2)
		}
		// else if (mod == "true") {
		// 	$(".login").append(pt5, pt3, pt4, pt2)
		// }
		else if (sub == "true") {
			$(".login").append(pt5, pt4, pt2)
		}
		else {
			$(".login").append(pt5, pt2)
		}
	} else {
		$(".login").append(pt1)
	}
}

window.onload = changeLogin()