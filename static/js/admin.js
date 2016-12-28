function changeState(state, name) {
	var module = name
	var state = state
	window.location.href = "/admin/modules/" + name + "/" + state;
}

var logs = '/../json/logs.json'
var modules = '/../json/modules.json'
yucibot.controller('adminController', function($scope, $http, $log) {
	$.getJSON(modules, function(json) {
		var json = json.modules[0]
		$scope.twitchapi = json.twitchapi
		$scope.overwatch = json.overwatch
		$scope.updatePoints = json.updatePoints
		$scope.pointCommands = json.pointCommands
		$scope.fetchProfile = json.fetchProfile
		$scope.dungeon = json.dungeon
		$scope.sub = json.sub
		$scope.update = json.update
		$scope.fourtwenty = json.fourtwenty
		$scope.twitter = json.twitter
		$scope.songrequest = json.songrequest
	})

	$http.get(logs)
	.then(response => {
	    if (!response.data) return $log.error('No result was found')
	    $log.log(response.data)
		$scope.adminLogs = response.data.points
	})
})

function checkMod() {
	var name = localStorage.name
	$.ajax('../json/mods.json')
	.done(function(data) {
		var data = data.mods
		if(data.indexOf(name) + 1 != 0) {
			return
		}
		else {
			window.location.href = "/"
		}
	});
}

window.onload = checkMod()