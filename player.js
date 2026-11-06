(function () {
  "use strict";
  var params = new URLSearchParams(location.search), id = params.get("v"), session = params.get("n"), player, phase = "loading", code = 0;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id || "") || !/^[a-zA-Z0-9_-]{8,64}$/.test(session || "")) { return; }
  function report() { var time = 0, muted = null; try { time = player.getCurrentTime(); muted = player.isMuted(); } catch (e) {} parent.postMessage({ protocol: "mdtv-trailer-v1", session: session, phase: phase, currentTime: time, muted: muted, code: code }, "*"); }
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", { width: "100%", height: "100%", videoId: id, playerVars: { autoplay: 1, playsinline: 1, rel: 0, origin: location.origin, widget_referrer: "https://mdtvbrowse.moviesdrivetv" }, events: {
      onReady: function (event) { phase = "ready"; event.target.unMute(); event.target.setVolume(100); event.target.playVideo(); report(); },
      onStateChange: function (event) { phase = event.data === 1 ? "playing" : event.data === 2 ? "paused" : event.data === 0 ? "ended" : "loading"; report(); },
      onAutoplayBlocked: function () { phase = "blocked"; report(); }, onError: function (event) { phase = "error"; code = event.data; report(); }
    } });
  };
  window.addEventListener("message", function (event) { var data = event.data; if (event.source !== parent || !data || data.protocol !== "mdtv-trailer-v1" || data.session !== session || !player) { return; } if (data.action === "play") { player.unMute(); player.playVideo(); } else if (data.action === "pause") { player.pauseVideo(); } else if (data.action === "stop") { player.destroy(); } });
  var script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.onerror = function () { phase = "error"; code = -1; report(); }; document.head.appendChild(script); setInterval(report, 2000);
}());
