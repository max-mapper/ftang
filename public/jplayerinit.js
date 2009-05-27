$(document).ready(function(){

	var usePlayList = false;
	var playItem = 0;

	var myPlayList = [
		{name:"Tempered Song",filename:"http://www.miaowmusic.com/mp3/Miaow-01-Tempered-song.mp3"},
		{name:"Hidden",filename:"http://www.miaowmusic.com/mp3/Miaow-02-Hidden.mp3"},
		{name:"Lentement",filename:"http://www.miaowmusic.com/mp3/Miaow-03-Lentement.mp3"},
		{name:"Lismore",filename:"http://www.miaowmusic.com/mp3/Miaow-04-Lismore.mp3"},
		{name:"The Separation",filename:"http://www.miaowmusic.com/mp3/Miaow-05-The-separation.mp3"},
		{name:"Beside Me",filename:"http://www.miaowmusic.com/mp3/Miaow-06-Beside-me.mp3"},
		{name:"Bubble",filename:"http://www.miaowmusic.com/mp3/Miaow-07-Bubble.mp3"},
		{name:"Stirring of a Fool",filename:"http://www.miaowmusic.com/mp3/Miaow-08-Stirring-of-a-fool.mp3"},
		{name:"Partir",filename:"http://www.miaowmusic.com/mp3/Miaow-09-Partir.mp3"},
		{name:"Thin Ice",filename:"http://www.miaowmusic.com/mp3/Miaow-10-Thin-ice.mp3"}
	];


	$("#jquery_jplayer").jPlayer({
		ready: function() {
			displayPlayList();
			playListEnable(true);
		}
	});

	$("#jquery_jplayer").jPlayerId("play", "player_play");
	$("#jquery_jplayer").jPlayerId("pause", "player_pause");
	$("#jquery_jplayer").jPlayerId("stop", "player_stop");
	$("#jquery_jplayer").jPlayerId("loadBar", "player_progress_load_bar");
	$("#jquery_jplayer").jPlayerId("playBar", "player_progress_play_bar");
	$("#jquery_jplayer").jPlayerId("volumeMin", "player_volume_min");
	$("#jquery_jplayer").jPlayerId("volumeMax", "player_volume_max");
	$("#jquery_jplayer").jPlayerId("volumeBar", "player_volume_bar");
	$("#jquery_jplayer").jPlayerId("volumeBarValue", "player_volume_bar_value");

	$("#jquery_jplayer").onProgressChange( function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
		var myPlayedTime = new Date(playedTime);
		var ptMin = (myPlayedTime.getMinutes() < 10) ? "0" + myPlayedTime.getMinutes() : myPlayedTime.getMinutes();
		var ptSec = (myPlayedTime.getSeconds() < 10) ? "0" + myPlayedTime.getSeconds() : myPlayedTime.getSeconds();
		$("#play_time").text(ptMin+":"+ptSec);

		var myTotalTime = new Date(totalTime);
		var ttMin = (myTotalTime.getMinutes() < 10) ? "0" + myTotalTime.getMinutes() : myTotalTime.getMinutes();
		var ttSec = (myTotalTime.getSeconds() < 10) ? "0" + myTotalTime.getSeconds() : myTotalTime.getSeconds();
		$("#total_time").text(ttMin+":"+ttSec);
	});

	$("#jquery_jplayer").onSoundComplete(endOfSong);

	$("#ctrl_prev").click( function() {
		playListPrev();
		return false;
	});

	$("#ctrl_next").click( function() {
		playListNext();
		return false;
	});

	function endOfSong() {
		if(usePlayList) {
			playListNext();
		}
	}

	function displayPlayList() {
		for (i=0; i < myPlayList.length; i++) {
			$("#playlist_list ul").append("<li id='playlist_item_"+i+"'>"+ myPlayList[i].name +"</li>");
			$("#playlist_item_"+i).data( "index", i ).hover(
				function() {
					if (playItem != $(this).data("index")) {
						$(this).addClass("playlist_hover");
					}
				},
				function() {
					$(this).removeClass("playlist_hover");
				}
			).click( function() {
				var index = $(this).data("index");
				if (playItem != index) {
					playListChange( index );
				}
			});
		}
	}

	function playListEnable(e) {
		usePlayList = e;
		if(usePlayList) {
			playListChange( playItem );
		} else {
			$("#jquery_jplayer").stop();
			$("#player_playlist_message").text("Playlists disabled");
		}
	}

	function playListChange( index ) {
		$("#playlist_item_"+playItem).removeClass("playlist_current");
		$("#playlist_item_"+index).addClass("playlist_current");
		playItem = index;
		$("#jquery_jplayer").changeAndPlay(myPlayList[playItem].filename);
		// $("#player_playlist_message").text(myPlayList[playItem].name);
	}

	function playListNext() {
		if(usePlayList) {
			var index = (playItem+1 < myPlayList.length) ? playItem+1 : 0;
			playListChange( index );
		}
	}

	function playListPrev() {
		if(usePlayList) {
			var index = (playItem-1 >= 0) ? playItem-1 : myPlayList.length-1;
			playListChange( index );
		}
	}
});
