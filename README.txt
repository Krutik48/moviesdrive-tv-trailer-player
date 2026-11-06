Static official YouTube player embedded inside MoviesDrive TV.

Only these five files belong in this public repository: index.html, player.js,
player.css, README.txt and .nojekyll. The TV application project, certificates,
movie-provider stream URLs and local viewing history are not included.

The page uses the official YouTube IFrame API. The TV supplies a public video ID
(v) and an ephemeral message-session identifier (n). No video is downloaded,
converted or hosted here; no API key or running Mac/Python server is needed.

Live page: https://krutik48.github.io/moviesdrive-tv-trailer-player/
The TV embeds that page with query parameters and uses validated postMessage
commands for play, pause and stop. Directly opening the root URL without those
parameters does not start a video.

The connected Samsung Tizen9.0 TV played a sample inside the app with advancing
currentTime and muted=false after its navigation policy allowed this host and
YouTube. A focused native test confirmed stable pause, resume and close with
zero remaining iframe nodes and no late owned-frame messages over seven seconds.
This is sample/API evidence; speaker loudness and every possible trailer are
not independently verified. YouTube availability and embed policies can change.
