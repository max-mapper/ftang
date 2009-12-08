var myPlayList;

$( function() {  
  $('#toggle_playlist').live('click', function(e) {
    $('#playlist').toggle();
  });
  
  
  var load_jplayer = function init_jplayer (playlist) {
    var playItem = 0;
    myPlayList = playlist;
    
    $("#jquery_jplayer").jPlayer({
      ready: function() {
        $('#playlist_list ul').empty();
        displayPlayList();
        playListInit(false); // Parameter is a boolean for autoplay.
      },
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
      playListNext();
    });

    $("#ctrl_prev").click( function() {
      playListPrev();
      return false;
    });

    $("#ctrl_next").click( function() {
      playListNext();
      return false;
    });

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
          } else {
            $("#jquery_jplayer").play();
          }
        });
      }
    }

    function playListInit(autoplay) {
      if(autoplay) {
        playListChange( playItem );
      } else {
        playListConfig( playItem );
      }
    }

    function playListConfig( index ) {
      $("#playlist_item_"+playItem).removeClass("playlist_current");
      $("#playlist_item_"+index).addClass("playlist_current");
      playItem = index;
      $("#jquery_jplayer").setFile(myPlayList[playItem].mp3, myPlayList[playItem].ogg);
    }

    function playListChange( index ) {
      playListConfig( index );
      $("#jquery_jplayer").play();
    }

    function playListNext() {
      var index = (playItem+1 < myPlayList.length) ? playItem+1 : 0;
      playListChange( index );
    }

    function playListPrev() {
      var index = (playItem-1 >= 0) ? playItem-1 : myPlayList.length-1;
      playListChange( index );
    }
  };
  
  var load_playlist = function() {
    $.getJSON('/playlist/load', function(data) {
      load_jplayer(data);
    });
  };

  var load_artists = function() {
    $.get( '/artists', function(data) {
      $('#content').html(data);
      $('#tiles ul').listnav({showCounts: false});
    });
  };
  
  $(".cover").live("click", function(e) { //add album to playlist
    e.preventDefault();
    var artist = $('#header_artist h1').text();
    var album = $(this).text().trim(" ");
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_album').show();
      $('#header_album h1').text(album);
      $.get("/playlist/add/" + artist + "/" + album, function() {
        load_playlist();
      });
    });
  });

  $(".tiles a").live("click", function(e){
    e.preventDefault();
    var artist = $(this).text().trim(" ");
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_artist').show();
      $('#header_artist h1').text(artist);
    });
  });

  $(".home_nav").live("click", function() {
    load_artists();
    $('#header_artist h1').text("");
    $('#header_artist').hide();
    $('#header_album h1').text("");
    $('#header_album').hide();
  });
  
  $('#clear_playlist').live('click', function(e) {
    $.get('/playlist/clear', function(){
      $('#playlist_list ul').empty();
      load_playlist();
    });
  });
  
  load_artists();
  load_playlist();
  
  try {
  _uacct = "UA-9156272-1";
  urchinTracker();
  } catch(err) {}
});