var getUrl = window.location.href;
var user = getUrl.split('/')[4]
var profile = '../user/_' + user.toLowerCase() + '/profile.json'
var logs = '/../user/_' + user.toLowerCase() + '/logs.json'

yucibot.controller('userPage', function($scope, $http, $log) {
	$scope.user = user;
	$http.get(profile)
	.then(response => {
	    if (!response.data) return $log.error('No result was found')
	    $log.log(response.data)
	    $scope.points = response.data.profile.points
	    $scope.lines = response.data.profile.lines
	})
})

yucibot.controller('userLogs', function($scope, $http, $log) {
	$scope.user = user;
	$http.get(logs)
	.then(response => {
	    if (!response.data) return $log.error('No result was found')
	    $log.log(response.data)
		$scope.allLogs = response.data.messages
	})
})