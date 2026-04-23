/* ============================================================
   projector.js — output-window controller.
   Main window uses this to push state to the projector window.
   ============================================================ */

const Projector = (() => {

  const CHANNEL = 'worship-projector';
  const channel = new BroadcastChannel(CHANNEL);

  let win = null;
  let state = {
    slide: null,
    blackout: false,
  };

  // Monotonic id so the receiver can drop duplicates when a payload arrives
  // over both transports (BroadcastChannel + window.postMessage).
  let seq = 0;

  // Send the full state. Main-window code should treat this as idempotent.
  // For video slides we resolve the Blob here and include it in the payload
  // so the projector window doesn't have to reach back through window.opener
  // (which is unreliable — popups often land with opener === null). Blobs
  // are structured-cloneable and pass by reference through both transports.
  //
  // We dual-send over BroadcastChannel AND window.postMessage: the former
  // only works when both pages share a real origin (e.g. served over http),
  // the latter works across opaque origins (e.g. both pages opened as
  // file:// URLs, which makes this tool usable without running a server).
  const send = () => {
    const payload = { ...state };
    const s = payload.slide;
    if (s && s.kind === 'video' && s.blobId && !s.blob) {
      const blob = (window.App && typeof window.App.getVideoBlob === 'function')
        ? window.App.getVideoBlob(s.blobId)
        : null;
      if (blob) payload.slide = { ...s, blob };
    }
    const msg = { type: 'render', payload, seq: ++seq };
    try { channel.postMessage(msg); } catch {}
    if (win && !win.closed) {
      try { win.postMessage(msg, '*'); } catch {}
    }
  };

  // Open projector — must be called in response to a user click
  const open = () => {
    if (win && !win.closed) { win.focus(); return win; }
    win = window.open(
      'projector.html',
      'worship-projector',
      'width=1280,height=720,menubar=no,toolbar=no,location=no'
    );
    return win;
  };

  const isOpen = () => !!(win && !win.closed);

  const showSlide = (slide) => {
    state.slide = slide;
    send();
  };

  const clear = () => {
    state.slide = null;
    send();
  };

  const toggleBlackout = () => {
    state.blackout = !state.blackout;
    send();
    return state.blackout;
  };

  const setBlackout = (on) => {
    state.blackout = !!on;
    send();
  };

  const getState = () => ({ ...state });

  // Projector window posts {type:'ready'} on load — resend state.
  // Listen on both transports so we respond regardless of which one the
  // projector managed to reach us through.
  const videoStateSubs = new Set();
  const onMessage = (d) => {
    if (!d) return;
    if (d.type === 'ready') { send(); return; }
    if (d.type === 'video-state') {
      videoStateSubs.forEach(fn => { try { fn(d); } catch (_) {} });
    }
  };
  channel.addEventListener('message', (e) => onMessage(e.data));
  window.addEventListener('message', (e) => {
    if (win && e.source !== win) return;
    onMessage(e.data);
  });

  const onVideoState = (fn) => { videoStateSubs.add(fn); return () => videoStateSubs.delete(fn); };

  const sendVideoCmd = (action, value) => {
    const msg = { type: 'video-cmd', action, value };
    try { channel.postMessage(msg); } catch {}
    if (win && !win.closed) { try { win.postMessage(msg, '*'); } catch {} }
  };

  window.addEventListener('beforeunload', () => { try { channel.close(); } catch {} });

  return { open, isOpen, showSlide, clear, toggleBlackout, setBlackout, getState, onVideoState, sendVideoCmd };
})();
