/* ============================================================
   video.js — ingest a video File into a clip object.
   Extracts a poster frame (for the library thumbnail) and
   keeps the raw Blob so the projector window can create its
   own object URL (blob URLs don't cross windows).
   ============================================================ */

const Video = (() => {

  const POSTER_W = 640;
  const POSTER_H = 360;

  const makePoster = (videoEl) => {
    const c = document.createElement('canvas');
    c.width = POSTER_W;
    c.height = POSTER_H;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);

    const vw = videoEl.videoWidth || POSTER_W;
    const vh = videoEl.videoHeight || POSTER_H;
    const ar = vw / vh;
    const car = c.width / c.height;
    let dw, dh;
    if (ar > car) { dh = c.height; dw = c.height * ar; }
    else          { dw = c.width;  dh = c.width  / ar; }
    try {
      ctx.drawImage(videoEl, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh);
    } catch {}
    return c.toDataURL('image/jpeg', 0.82);
  };

  const parse = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.muted = true;
    v.preload = 'metadata';
    v.src = url;

    let posterReady = false;
    const finish = () => {
      if (posterReady) return;
      posterReady = true;
      const posterUrl = makePoster(v);
      resolve({
        id: `vid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        source: 'video',
        title: file.name.replace(/\.[^.]+$/, ''),
        blob: file,
        url,
        posterUrl,
        duration: v.duration || 0,
        mime: file.type || 'video/mp4',
        createdAt: Date.now(),
      });
    };

    v.addEventListener('error', () => reject(new Error('Cannot decode video')), { once: true });
    v.addEventListener('loadeddata', () => {
      try { v.currentTime = Math.min(0.1, (v.duration || 1) / 2); }
      catch { finish(); }
    }, { once: true });
    v.addEventListener('seeked', finish, { once: true });
    setTimeout(finish, 3000);
  });

  return { parse };
})();
