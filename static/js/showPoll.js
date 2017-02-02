var socket = io.connect();
var id = window.location.href.split('/').pop()
var resIdb = window.location.href.split('/'); resIdb.pop();
var resId = resIdb.pop()
var fullObj;
var voted;
socket.emit('getPoll', id)
socket.emit('retPollRes', resId)

socket.on('pollData', function (data) {
  fullObj = data.data
})

socket.on('pollRes', function (data) {
  voted = data.data
})

var yucibot = angular.module('yucibot',[]);
yucibot.controller('votePoll', function($scope, $http, $log, $interval) {
  $scope.getAnswers = function() {
    socket.emit('getPoll', id)
    $scope.answer = fullObj
  }
  $scope.vote = function(x) {
    ip = "xD";
    $.get("http://ipinfo.io", function(response) {
      var sendData = {
        pollId: id,
        answerId: x,
        ip: response.ip
      }
      socket.emit('addResult', sendData)
      window.location.href="/poll/" + id + "/result"
    }, "jsonp");
  }
  $scope.getAnswers()
  $interval($scope.getAnswers, 500);
})

yucibot.controller('showPoll', function($scope, $http, $log, $interval) {
  $scope.getAnswers = function() {
    socket.emit('retPollRes', resId)
    $scope.answer = voted
  }
  $scope.getAnswers()
  $interval($scope.getAnswers, 500);
})
