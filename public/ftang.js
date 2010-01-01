// documentation for this version of jplayer: http://www.happyworm.com/jquery/jplayer/0.2.5/developer-guide.htm

// controls for the player and the playlist
var FTANGPlayer = function() { // called inline
  var playlist = [];
  var playItem = 0;
  
  return { // public interface object
  	initJPlayer: function() {
      $("#jquery_jplayer").jPlayer({ 
  			ready: function() { FTANGPlayer.loadPlaylist(); }, 
  			oggSupport: false
  		})
    	.jPlayerId("play", "player_play")
      .jPlayerId("pause", "player_pause")
      .jPlayerId("stop", "player_stop")
      .jPlayerId("loadBar", "player_progress_load_bar")
      .jPlayerId("playBar", "player_progress_play_bar")
      .jPlayerId("volumeMin", "player_volume_min")
      .jPlayerId("volumeMax", "player_volume_max")
      .jPlayerId("volumeBar", "player_volume_bar")
      .jPlayerId("volumeBarValue", "player_volume_bar_value")
      .onProgressChange( function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
        var myPlayedTime = new Date(playedTime);
        var ptMin = (myPlayedTime.getUTCMinutes() < 10) ? "0" + myPlayedTime.getUTCMinutes() : myPlayedTime.getUTCMinutes();
        var ptSec = (myPlayedTime.getUTCSeconds() < 10) ? "0" + myPlayedTime.getUTCSeconds() : myPlayedTime.getUTCSeconds();
        $("#play_time").text(ptMin+":"+ptSec);

        var myTotalTime = new Date(totalTime);
        var ttMin = (myTotalTime.getUTCMinutes() < 10) ? "0" + myTotalTime.getUTCMinutes() : myTotalTime.getUTCMinutes();
        var ttSec = (myTotalTime.getUTCSeconds() < 10) ? "0" + myTotalTime.getUTCSeconds() : myTotalTime.getUTCSeconds();
        $("#total_time").text(ttMin+":"+ttSec);
      })
      .onSoundComplete( function() {
        FTANGPlayer.playListNext();
      })
  	},

  	displayPlayList: function() {
  		FTANGPlayer.playListInit(false);
  		$('#playlist_list ul').empty();
  	  for (i=0; i < playlist.length; i++) {
  	    $("#playlist_list ul").append("<li id='playlist_item_"+i+"'>"+ playlist[i].name +"</li>");
  	    $("#playlist_item_"+i).data( "index", i ).hover(
  	      function() {
  	        if (playItem != $(this).data("index")) {
  	          $(this).addClass("playlist_hover");
  	        }
  	      },
  	      function() {
  	        $(this).removeClass("playlist_hover");
  	    })
  	    .click( function() {
  	      var index = $(this).data("index");
  	      if (playItem != index) {
  	      	FTANGPlayer.playListChange( index );
  	      } else {
  	        $("#jquery_jplayer").play();
  	      }
  	    });
    
  	    $("#playlist_item_" + i).append("<span id='playlist_remove_item_"+i+"' class='playlist_remove'>"+ 'rm' +"</span>");
  	    $("#playlist_remove_item_"+i).click( function() {
  	      var index = $(this).attr('id').split('_').pop();
  	     FTANGPlayer.playListRemove(index);
  	      return false;
  	    });
  	  }
  	},

  	playListInit: function(autoplay) {
  		if(autoplay) {
  	  	FTANGPlayer.playListChange( playItem );
  	  } else {
  	  	FTANGPlayer.playListConfig( playItem );
  	  }
  	},

  	playListConfig: function( index ) {
  	  $("#playlist_item_"+playItem).removeClass("playlist_current");
  	  $("#playlist_item_"+index).addClass("playlist_current");
  	  playItem = index;
  		if (playlist != "") {
  		  $("#jquery_jplayer").setFile(playlist[playItem].mp3, playlist[playItem].ogg);
  		}
  	},

  	playListChange: function( index ) {
  		FTANGPlayer.playListConfig( index );
  		$("#jquery_jplayer").play();
  	},

  	playListNext: function() {
  		var index = (playItem+1 < playlist.length) ? playItem+1 : 0;
  		FTANGPlayer.playListChange( index );
  	},

  	playListPrev: function() {
  		var index = (playItem-1 >= 0) ? playItem-1 : playlist.length-1;
  		FTANGPlayer.playListChange( index );
  	},

  	playListRemove: function(song) {
  	  $.get('/playlist/remove/'+song);
  	  $("#playlist_item_"+song).remove();
  	  $("#playlist_remove_item_"+song).remove();
  	  for(var i = song; i < $(playlist).size(); i++) {
  	    $("#playlist_item_"+i).attr( 'id', "playlist_item_"+(i-1) );
  	    $("#playlist_remove_item_"+i).attr( 'id', "playlist_remove_item_"+(i-1) );
  	  }
  	  playlist.splice(song, 1);
  	  if(playItem > song) {
  	    playItem--;
  	  }
  	},
  
    loadPlaylist: function() {
      $.getJSON('/playlist/load', function(data) {
        playlist = data;
  			FTANGPlayer.displayPlayList();
      });
    },
  
    showPlaylist: function() {
      $('#content').css('width', '80%');
      $('#playlist').show();
    },
    
    clearPlaylist: function() {
      $('#playlist_list ul').empty();
      $.get('/playlist/clear', function(){
  			playlist = [];
        FTANGPlayer.hidePlaylist();
      });
    },
  
    hidePlaylist: function() {
      $('#content').css('width', '100%');
      $('#playlist').hide();
    },
  
    togglePlaylistVisibility: function() {
      if( $('#playlist').is(":hidden") == true ) {
        FTANGPlayer.showPlaylist();
      } else {
        FTANGPlayer.hidePlaylist();
      }
    }
  };
}();

// page loady one time stuff, lots of default event handling
$(function() {
  function loadArtists() {
    $.get( '/artists', function(data) {
      $('#content').html(data);
      $('#tiles ul').listnav({showCounts: false});
    });
  }
  
  function appendPlaylistAddButtons(cover) {
    $('.add_album_to_playlist').remove();
    $('.view_songs_in_album').remove();
    var add_html = "<div class='view_songs_in_album'></div>" +
                   "<div class='add_album_to_playlist'>+ Add album to Playlist</div>";
    $(cover).append(add_html);
  }

  function createAlbumMouseoverTriggers() {
    $('.album').mouseover(function(){
      appendPlaylistAddButtons(this);
      resetCoverMouseoverTriggers(this);
    });
  }

  function resetCoverMouseoverTriggers(cover) {
    $('.album').unbind();
    createAlbumMouseoverTriggers();
    $(cover).unbind();
  }
  
  $(".add_album_to_playlist").live("click", function(e) {
    e.preventDefault();
    var cover = $(this).parents().filter(':first');
    var img = $(cover).find('img');
    var album = $(img).attr('album');
    var artist = $(img).attr('artist');
    $.get('/playlist/add/' + artist + '/' + album, function() {
      FTANGPlayer.loadPlaylist();
      FTANGPlayer.showPlaylist();
    });
  });

  $(".tiles a").live("click", function(e) {
    e.preventDefault();
    var artist = $.trim($(this).text());
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_artist').show();
      $('#header_artist h1').text(artist);
      createAlbumMouseoverTriggers();
    });
  });

  $(".home_nav").live("click", function() {
    loadArtists();
    $('#header_artist h1').text("");
    $('#header_artist').hide();
    $('#header_album h1').text("");
    $('#header_album').hide();
  });
  
  $('#clear_playlist').live('click', function(e) {
    FTANGPlayer.clearPlaylist();
  });
  
  $('#playlist_list ul li').live("mouseover", function() {
    $(this).find("span").filter(":first").show();
  })
  
  $('#playlist_list ul li').live("mouseout", function() {
    $(this).find("span").filter(":first").hide();
  });
  
  $('#toggle_playlist').live('click', function() {
    FTANGPlayer.togglePlaylistVisibility();
  });

  $("#ctrl_prev").live('click', function() {
  	FTANGPlayer.playListPrev();
   	return false;
  });

  $("#ctrl_next").live('click', function() {
  	FTANGPlayer.playListNext();
    return false;
  });
  
  loadArtists();
  FTANGPlayer.initJPlayer();
  FTANGPlayer.hidePlaylist();

  try { //google analytics
  _uacct = "UA-9156272-1";
  urchinTracker();
  } catch(err) {}
});