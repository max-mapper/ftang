/*
Copyright (c) 2009 Happyworm Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Author: Mark J Panaghiston
Version: 0.2.1.beta
Documentation: www.happyworm.com/jquery/jplayer
*/

(function($) {
	$.jPlayerCount = 0;
	
	var methods = {
		jPlayer: function(options) {
			$.jPlayerCount++;
			
			var config = {
				ready: null,
				cssPrefix: "jqjp",
				swfPath: "/js",
				quality: "high",
				width: 0,
				height: 0,
				top: 0,
				left: 0,
				position: "absolute",
				bgcolor: "#ffffff"
			};

			$.extend(config, options);

			var configWithoutOptions = {
				id: $(this).attr("id"),
				swf: config.swfPath + ((config.swfPath != "") ? "/" : "") + "Jplayer.swf",
				fid: config.cssPrefix + "_flash_" + $.jPlayerCount,
				hid: config.cssPrefix + "_force_" + $.jPlayerCount
			};

			$.extend(config, configWithoutOptions);

			$(this).data("jPlayer.config", config);
			
			var events = {
				change: function(e, f) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					m.fl_change_mp3(f);
					$(this).trigger("jPlayer.screenUpdate", false);
				},
				play: function(e) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					var r = m.fl_play_mp3();
					if(r) {
						$(this).trigger("jPlayer.screenUpdate", true);
					}
					
				},
				pause: function(e) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					var r = m.fl_pause_mp3();
					if(r) {
						$(this).trigger("jPlayer.screenUpdate", false);
					}
				},
				stop: function(e) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					var r = m.fl_stop_mp3();
					if(r) {
						$(this).trigger("jPlayer.screenUpdate", false);
					}
				},
				playHead: function(e, p) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					var r = m.fl_play_head_mp3(p);
					if(r) {
						$(this).trigger("jPlayer.screenUpdate", true);
					}
				},
				volume: function(e, v) {
					var fid = $(this).data("jPlayer.config").fid;
					var m = $(this).data("jPlayer.getMovie")(fid);
					m.fl_volume_mp3(v);
				},
				screenUpdate: function(e, playing) {
					var playId = $(this).data("jPlayer.cssId.play");
					var pauseId = $(this).data("jPlayer.cssId.pause");
					var prefix = $(this).data("jPlayer.config").cssPrefix;

					if(playId != null && pauseId != null) {
						if(playing) {
							var style = $(this).data("jPlayer.cssDisplay.pause");
							$("#"+playId).css("display", "none");
							$("#"+pauseId).css("display", style);
						} else {
							var style = $(this).data("jPlayer.cssDisplay.play");
							$("#"+playId).css("display", style);
							$("#"+pauseId).css("display", "none");
						}
					}
				}
			};
			
			for(var event in events) {
				var e = "jPlayer." + event;
				$(this).unbind(e);
				$(this).bind(e, events[event]);
			}

			var getMovie = function(fid) {
				if ($.browser.msie) {
					return window[fid];
				} else {
					return document[fid];
				}
			};
			$(this).data("jPlayer.getMovie", getMovie);
			
			if($.browser.msie) {
				var html_obj = '<object id="' + config.fid + '"';
				html_obj += ' classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"';
				html_obj += ' codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"';
				html_obj += ' type="application/x-shockwave-flash"';
				html_obj += ' width="' + config.width + '" height="' + config.height + '">';
				html_obj += '</object>';
			
				var obj_param = new Array();
				obj_param[0] = '<param name="movie" value="' + config.swf + '" />';
				obj_param[1] = '<param name="quality" value="high" />';
				obj_param[2] = '<param name="FlashVars" value="id=' + escape(config.id) + '&fid=' + escape(config.fid) + '" />';
				obj_param[3] = '<param name="allowScriptAccess" value="always" />';
				obj_param[4] = '<param name="bgcolor" value="' + config.bgcolor + '" />';
				
				var ie_dom = document.createElement(html_obj);
				for(var i=0; i < obj_param.length; i++) {
					ie_dom.appendChild(document.createElement(obj_param[i]));
				}
				$(this).html(ie_dom);
			} else {
				var html_embed = '<embed name="' + config.fid + '" src="' + config.swf + '"';
				html_embed += ' width="' + config.width + '" height="' + config.height + '" bgcolor="' + config.bgcolor + '"';
				html_embed += ' quality="high" FlashVars="id=' + escape(config.id) + '&fid=' + escape(config.fid) + '"';
				html_embed += ' allowScriptAccess="always"';
				html_embed += ' type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />';
				$(this).html(html_embed);
			}
			
			var html_hidden = '<div id="' + config.hid + '"></div>';
			$(this).append(html_hidden);
			
			$(this).css({'position':config.position, 'top':config.top, 'left':config.left});
			$("#"+config.hid).css({'text-indent':'-9999px'});
			
			return $(this);
		},
		change: function(f) {
			$(this).trigger("jPlayer.change", f);
		},
		play: function() {
			$(this).trigger("jPlayer.play");
		},
		changeAndPlay: function(f) {
			$(this).trigger("jPlayer.change", f);
			$(this).trigger("jPlayer.play");
		},
		pause: function() {
			$(this).trigger("jPlayer.pause");
		},
		stop: function() {
			$(this).trigger("jPlayer.stop");
		},
		playHead: function(p) {
			$(this).trigger("jPlayer.playHead", p);
		},
		volume: function(v) {
			$(this).trigger("jPlayer.volume", v);
		},
		jPlayerId: function(fn, id) {
			if(id != null) {
				var isValid = eval("$(this)."+fn);
				if(isValid != null) {
					$(this).data("jPlayer.cssId." + fn, id);
					var jPlayerId = $(this).data("jPlayer.config").id;
					eval("var myHandler = function(e) { $(\"#" + jPlayerId + "\")." + fn + "(e); return false; }");
					$("#"+id).click(myHandler).hover(this.rollOver, this.rollOut).data("jPlayerId", jPlayerId);
					
					var display = $("#"+id).css("display");
					$(this).data("jPlayer.cssDisplay." + fn, display);
					
					if(fn == "pause") {
						$("#"+id).css("display", "none");
					}
				} else {
					alert("Unknown function assigned in: jPlayerId( fn="+fn+", id="+id+" )");
				}
			} else {
				id = $(this).data("jPlayer.cssId." + fn);
				if(id != null) {
					return id;
				} else {
					alert("Unknown function id requested: jPlayerId( fn="+fn+" )");
					return false;
				}
			}
		},
		loadBar: function(e) {
			var lbId = $(this).data("jPlayer.cssId.loadBar");
			if( lbId != null ) {
				var offset = $("#"+lbId).offset();
				var x = e.pageX - offset.left;
				var w = $("#"+lbId).width();
				var p = 100*x/w;
				$(this).playHead(p);
			}
		},
		playBar: function(e) {
			this.loadBar(e);
		},
		onProgressChange: function(fn) {
			$(this).data("jPlayer.jsFn.onProgressChange", fn);
		},
		updateProgress: function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) { // Called from Flash
			var lbId = $(this).data("jPlayer.cssId.loadBar");
			if (lbId != null) {
				$("#"+lbId).width(loadPercent+"%");
			}
			var pbId = $(this).data("jPlayer.cssId.playBar");
			if (pbId != null ) {
				$("#"+pbId).width(playedPercentRelative+"%");
			}
			var onProgressChangeFn = $(this).data("jPlayer.jsFn.onProgressChange");
			if(onProgressChangeFn != null) {
				onProgressChangeFn(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime);
			}
			if (lbId != null || pbId != null || onProgressChangeFn != null) {
				this.forceScreenUpdate();
				return true;
			} else {
				return false;
			}
		},
		volumeMin: function() {
			$(this).volume(0);
		},
		volumeMax: function() {
			$(this).volume(100);
		},
		volumeBar: function(e) {
			var vbId = $(this).data("jPlayer.cssId.volumeBar");
			if( vbId != null ) {
				var offset = $("#"+vbId).offset();
				var x = e.pageX - offset.left;
				var w = $("#"+vbId).width();
				var p = 100*x/w;
				$(this).volume(p);
			}
		},
		volumeBarValue: function(e) {
			this.volumeBar(e);
		},
		updateVolume: function(v) { // Called from Flash
			var vbvId = $(this).data("jPlayer.cssId.volumeBarValue");
			if( vbvId != null ) {
				$("#"+vbvId).width(v+"%");
				this.forceScreenUpdate();
				return true;
			}
		},
		onSoundComplete: function(fn) {
			$(this).data("jPlayer.jsFn.onSoundComplete", fn);
		},
		finishedPlaying: function() { // Called from Flash
			var onSoundCompleteFn = $(this).data("jPlayer.jsFn.onSoundComplete");
			$(this).trigger("jPlayer.screenUpdate", false);
			if(onSoundCompleteFn != null) {
				onSoundCompleteFn();
				return true;
			} else {
				return false;
			}
		},
		setBufferState: function (b) { // Called from Flash
			var lbId = $(this).data("jPlayer.cssId.loadBar");
			if( lbId != null ) {
				var prefix = $(this).data("jPlayer.config").cssPrefix;
				if(b) {
					$("#"+lbId).addClass(prefix + "_buffer");
				} else {
					$("#"+lbId).removeClass(prefix + "_buffer");
				}
				return true;
			} else {
				return false;
			}
		},
		bufferMsg: function() {
			// Empty: Initialized to enable jPlayerId() to work.
			// See setBufferMsg() for code.
		},
		setBufferMsg: function (msg) { // Called from Flash
			var bmId = $(this).data("jPlayer.cssId.bufferMsg");
			if( bmId != null ) {
				$("#"+bmId).html(msg);
				return true;
			} else {
				return false;
			}
		},
		forceScreenUpdate: function() { // For Safari and Chrome
			var hid = $(this).data("jPlayer.config").hid;
			$("#"+hid).html(Math.random());
		},
		rollOver: function() {
			var jPlayerId = $(this).data("jPlayerId");
			var prefix = $("#"+jPlayerId).data("jPlayer.config").cssPrefix;
			$(this).addClass(prefix + "_hover");
		},
		rollOut: function() {
			var jPlayerId = $(this).data("jPlayerId");
			var prefix = $("#"+jPlayerId).data("jPlayer.config").cssPrefix;
			$(this).removeClass(prefix + "_hover");
		},
		flashReady: function() { // Called from Flash
			var readyFn = $(this).data("jPlayer.config").ready;
			if(readyFn != null) {
				readyFn();
			}
		}
	};

	$.each(methods, function(i) {
		$.fn[i] = this;
	});
})(jQuery);
