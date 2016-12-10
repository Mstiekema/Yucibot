var time = new Date();
var day = time.getDate();
var month = time.getMonth() + 1;
var year = time.getFullYear();
var urlDate = window.location.href
var date = urlDate.split('/')[4]
var file = '../json/songlists/songlist' + date + ".json";

var yucibot = angular.module('yucibot',[]);
yucibot.controller('songQueueHistory', function($scope, $http, $log, $interval) {
	$scope.reload = function() {
	$http.get(file)
	.then(response => {
	    if (!response.data) return $log.error('No result was found')
	    $scope.allSongs = response.data
	})}
	$scope.reload()
	$interval($scope.reload, 5000);
	$scope.date = date
})