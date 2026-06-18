(function () {
  const players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    let instance = null;
    let prepared = false;

    function prepare() {
      if (!video || prepared) {
        return;
      }

      const stream = video.getAttribute('data-stream');

      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    }

    function start() {
      prepare();

      if (button) {
        button.classList.add('hidden');
      }

      const playTask = video.play();

      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared || video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  });
})();
