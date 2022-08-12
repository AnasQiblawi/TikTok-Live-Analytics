// Video Player
var flvPlayer = undefined;

// Player
function VideoPlayer(url) {
    if (flvjs.isSupported()) {
        VideoContainer = document.getElementById('VideoPlayer');
        flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: url
        });
        flvPlayer.attachMediaElement(VideoContainer);
        flvPlayer.load();
        flvPlayer.play();
    };
};