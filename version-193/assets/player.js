
document.addEventListener('DOMContentLoaded', () => {
  const videos = [...document.querySelectorAll('[data-hls-player]')];
  videos.forEach((video) => {
    const src = video.dataset.src;
    if (!src) return;
    const canNative = video.canPlayType('application/vnd.apple.mpegurl');
    if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          console.warn('HLS fatal error:', data);
        }
      });
    } else if (canNative) {
      video.src = src;
    } else {
      video.src = src;
    }
  });
});
