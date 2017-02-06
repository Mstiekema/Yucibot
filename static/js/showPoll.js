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
    var sendData = {
      pollId: id,
      answerId: x,
    }
    socket.emit('addResult', sendData)
    window.location.href="/poll/" + id + "/result"
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

// Draw pie chart
function makeGraph() {
  google.charts.load('current', {'packages':['corechart']});
  setTimeout(function () {
    google.charts.setOnLoadCallback(drawChart);
  }, 300);

  var arrChartTable = new Array;

  setTimeout(function () {
    arrChartTable.push(['Answer', 'Votes'])
    for (var x = 0; x < voted.length; x++) {
      var answer = voted[x].answer
      var votes = voted[x].votes
      arrChartTable.push([answer, votes])
    }
  }, 100);

  function drawChart() {
    var data = google.visualization.arrayToDataTable(arrChartTable);
    var options = {
      is3D: true,
      refreshInterval: 5,
      backgroundColor: { fill:'transparent' },
      fontName: "Roboto",
      width: 600,
      height: 500,
      legend: {textStyle: { color: "#7b6bb8"}, alignment: 'center', position: 'left'}
    };
    var chart = new google.visualization.PieChart(document.getElementById('chart'));
    chart.draw(data, options);
  }
}

makeGraph()

setInterval(function () {
  makeGraph()
}, 5000);
