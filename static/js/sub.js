var yucibot = angular.module('yucibot',[]);
yucibot.controller('subController', function($scope, $http, $log) {})

function checkMod() {
	if(localStorage.sub == "true") {
		return
	}
	else {
		window.location.href = "/"
	}
}

window.onload = checkMod()