var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// getVideos = function() {
// 	return $http.get('../js/songlist.json')
// 	.then(function(data) {
// 		$scope.videos = data.data;
// 		// $log.log($scope.videos + " xD")
// 	});
// };
// getVideos().then(function(data) {
// 	console.log($scope.videos)
// });

var videos = ["vbMQfaG6lo8", "07UwP3kHTTk", "gjDK4OiuIfk", "NlrK03iz74A", "E_1-oylPHjs"]

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '563',
		width: '1000',
		videoId: videos[0],
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	event.target.playVideo();
}

var i = 0
function nextVideo() {
	player.cueVideoById({
		'videoId': videos[i],
    	'startSeconds': 0,
    	'suggestedQuality': 'large'
	});
}

function previousVideo() {
	i--
	nextVideo();
}

function skipVideo() {
	i++
	nextVideo();
}

function getSongName() {
	var url = "https://www.googleapis.com/youtube/v3/videos?id=" + videos[i] + "&key=AIzaSyDI91lLeIzNm94yV7cScSiYn-aa4uh2TFE%20&part=snippet,contentDetails,statistics,status"
	var meh = $.getJSON(url, function(json) {
		xd = json.items[0].snippet.title
		console.log(xd)
		$(".videoTitle").html(function() {
			return "Current song: " + xd;
		});
	})
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		nextVideo();
		event.target.playVideo();
	}
	if (event.data == -1) {
		event.target.playVideo();
		getSongName();
	}
}

var yucibot = angular.module('yucibot',[]);
yucibot.controller('songQueue', function($scope, $http, $log) {
	$http.get('../json/songlistinfo.json')
	.then(response => {
		
		var ytId = response.data[i]
		$log.log(ytId)
		var url = "https://www.googleapis.com/youtube/v3/videos?id=" + ytId + "&key=AIzaSyDI91lLeIzNm94yV7cScSiYn-aa4uh2TFE%20&part=snippet,contentDetails,statistics,status"
		
		$http.get('../json/songlistinfo.json')
		.then(result => {
		    if (!result.data) return $log.error('No result was found')
		    $scope.allSongs = result.data
			$log.log(result.data)
		});
	});
})

// https://developers.google.com/youtube/iframe_api_reference