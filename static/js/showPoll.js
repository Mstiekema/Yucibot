var socket = io.connect();
var id = window.location.href.split('/').pop()
socket.emit('getPoll', id)

var answers;
var results;
var fullObj;

socket.on('pollData', function (data) {
  answers = $.map(JSON.parse(data), function(value, index) {
    return [index];
  });
  results = $.map(JSON.parse(data), function(value, index) {
    return [value];
  });
  fullObj = JSON.parse(data)
})

setTimeout(function() {
  console.log(answers); 
  console.log(results)
}, 1000); 

var yucibot = angular.module('yucibot',[]);
yucibot.controller('songQueue', function($scope, $http, $log, $interval) { 
  $scope.getAnswers = function() {
    socket.emit('getPoll', id)
    $scope.answer = answers
    $scope.result = results
  }
  $scope.vote = function(x) {
    fullObj[x] += 1
    var sendData = {
      id: id,
      answers: fullObj
    }
    socket.emit('addResult', sendData)
  }
  $scope.getAnswers()
  $interval($scope.getAnswers, 100);
})
