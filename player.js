(function () {
  "use strict";
  var params = new URLSearchParams(location.search), id = params.get("v"), session = params.get("n"), player, phase = "loading", code = 0, adMuted = false, stopped = false, timer = null;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id || "") || !/^[a-zA-Z0-9_-]{8,64}$/.test(session || "")) { return; }
  function report() {
    if (stopped) { return; }
    var time = 0, muted = null;
    try { time = player.getCurrentTime(); muted = player.isMuted(); } catch (e) {}
    parent.postMessage({ protocol: "mdtv-trailer-v1", session: session, phase: phase, currentTime: time, muted: muted, code: code }, "*");
  }
  function schedule() {
    clearTimeout(timer);
    if (stopped || phase === "ended" || phase === "error") { return; }
    timer = setTimeout(sync, phase === "playing" || phase === "paused" ? 1000 : 150);
  }
  function sync() {
    if (stopped) { return; }
    if (player && phase !== "error") {
      try {
        var st = player.getPlayerState();
        var opts = (player.getOptions && player.getOptions()) || [];
        var time = player.getCurrentTime() || 0;
        if (phase !== "blocked" && ((st === -1 && opts.indexOf("ad") >= 0 && time > 0) || (adMuted && st !== 1 && st !== 2 && st !== 0))) {
          if (!adMuted || !player.isMuted()) { player.mute(); adMuted = true; }
          phase = "ad";
        } else if (st === 1) {
          if (adMuted) { player.unMute(); player.setVolume(100); adMuted = false; }
          phase = "playing";
        } else if (st === 2) {
          phase = "paused";
        } else if (st === 0) {
          adMuted = false;
          phase = "ended";
        } else if (phase !== "blocked") {
          phase = "loading";
        }
      } catch (e) {}
    }
    report();
    schedule();
  }
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", { width: "100%", height: "100%", videoId: id, playerVars: { autoplay: 1, playsinline: 1, rel: 0, controls: 0, disablekb: 1, fs: 0, origin: location.origin, widget_referrer: "https://mdtvbrowse.moviesdrivetv" }, events: {
      onReady: function (event) { phase = "loading"; event.target.unMute(); event.target.setVolume(100); event.target.playVideo(); sync(); },
      onApiChange: function () { sync(); },
      onStateChange: function () { sync(); },
      onAutoplayBlocked: function () { phase = "blocked"; report(); schedule(); },
      onError: function (event) { phase = "error"; code = event.data; clearTimeout(timer); report(); }
    } });
  };
  window.addEventListener("message", function (event) {
    var data = event.data;
    if (event.source !== parent || !data || data.protocol !== "mdtv-trailer-v1" || data.session !== session || !player) { return; }
    if (data.action === "play") { if (phase === "blocked" || phase === "ended") { phase = "loading"; } if (!adMuted) { player.unMute(); } player.playVideo(); sync(); }
    else if (data.action === "pause") { player.pauseVideo(); sync(); }
    else if (data.action === "stop") { stopped = true; clearTimeout(timer); player.destroy(); }
  });
  var script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.onerror = function () { phase = "error"; code = -1; clearTimeout(timer); report(); }; document.head.appendChild(script); schedule();
}());
