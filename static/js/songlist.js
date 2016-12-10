var tag 			= document.createElement('script');
tag.src 			= "https://www.youtube.com/iframe_api";
var firstScriptTag 	= document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function getVideos(count) {
	$.getJSON('../json/songlistinfo.json', function(json) {
		if(count < json.length) {
			xd = json[count].id
			if ($.inArray(xd, allVideos) != true) {
				allVideos.push(xd)
				getVideos(++count)
			}
			else {
				getVideos(++count)
			}
		}
		$.each(allVideos, function(i, vid){
    		if($.inArray(vid, videos) === -1) videos.push(vid);
		});
	})
}

getVideos(0)

var allVideos = [];
var videos = [];
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

function previousVideo() {
	--i
	nextVideo();
}

function skipVideo() {
	++i
	nextVideo();
}

var i = 0;
function nextVideo() {
	player.loadVideoById({
	'videoId': videos[i],
	'startSeconds': 0,
	'suggestedQuality': 'large'
	});
}		

function getSongName() {
	$.getJSON('../json/songlistinfo.json', function(json) {
		xd = json[i].name 
		$(".videoTitle").html(function() {
			return "Current song: " + xd;
		});
	})
}

function onPlayerStateChange(event) {
	if (event.data == YT.PlayerState.ENDED) {
		i++
		nextVideo();
		event.target.playVideo();
		getVideos(0)
	}
	if (event.data == -1) {
		event.target.playVideo();
		getSongName();
		getVideos(0)
	}
}

var yucibot = angular.module('yucibot',[]);
yucibot.controller('songQueue', function($scope, $http, $log, $interval) {
	$scope.reload = function() {
	$http.get('../json/songlistinfo.json')
	.then(response => {
	    if (!response.data) return $log.error('No result was found')
	    $scope.allSongs = response.data
	})}
	$scope.reload()
	$interval($scope.reload, 5000);
})