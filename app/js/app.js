/* ============================================================
   app.js — EZ Worship main controller.
   Single App object orchestrating every view, action, and render.
   ============================================================ */

(() => {

  // ===========================================================
  // Utilities
  // ===========================================================

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const escapeHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const escapeAttr = escapeHtml;

  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  // ----- inline SVG icon set -----
  const ICONS = {
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
    slides: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="1.5"/><path d="M8 21h8M12 18v3"/></svg>',
    media: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="1.5"/><circle cx="8.5" cy="10.5" r="1.5"/><path d="m21 16-5-5-9 8"/></svg>',
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2zM3 19a2 2 0 0 0 2 2h1v-7H5a2 2 0 0 0-2 2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    jump: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    'to-schedule': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v6h6"/><path d="M20 10H4v12h16V10z"/><path d="M4 10V4a2 2 0 0 1 2-2h8"/><path d="M12 13v6M9 16h6"/></svg>',
    tv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="13" rx="2"/><path d="M8 21h8M12 18v3"/></svg>',
    empty: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18v16H3z"/><path d="M3 9h18"/></svg>',
    go: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l14-8z"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20 6 12l12-8v16z" fill="currentColor"/><path d="M6 4v16"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 4 12 8-12 8V4z" fill="currentColor"/><path d="M18 4v16"/></svg>',
    blackout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a1 1 0 0 0 1 1h3l7 5V5L7 10H4a1 1 0 0 0-1 1z"/><path d="M17 9a4 4 0 0 1 0 6"/><path d="M20 6a8 8 0 0 1 0 12"/></svg>',
    cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6V3m-3 3V4m6 2V4"/><circle cx="12" cy="3" r="0.6" fill="currentColor"/><circle cx="9" cy="4" r="0.6" fill="currentColor"/><circle cx="15" cy="4" r="0.6" fill="currentColor"/><path d="M4 12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4z"/><path d="M3 20v-4c1.5 0 1.5 1.4 3 1.4s1.5-1.4 3-1.4 1.5 1.4 3 1.4 1.5-1.4 3-1.4 1.5 1.4 3 1.4 1.5-1.4 3-1.4v4z"/></svg>',
  };

  const icon = (name, cls = '') => {
    const svg = ICONS[name] || ICONS.empty;
    return `<span class="icon ${cls}" data-icon-inline="${escapeAttr(name)}">${svg}</span>`;
  };

  // Replace all <span data-icon="..."></span> placeholders with actual SVG
  const hydrateIcons = (root = document) => {
    for (const n of $$('[data-icon]', root)) {
      const name = n.dataset.icon;
      if (!ICONS[name]) continue;
      n.innerHTML = ICONS[name];
    }
  };

  // ----- toasts -----
  const toast = (msg, variant = 'info') => {
    const stack = $('#toast-stack');
    if (!stack) return;
    const t = document.createElement('div');
    t.className = `toast ${variant}`;
    t.textContent = msg;
    stack.appendChild(t);
    setTimeout(() => {
      t.classList.add('closing');
      t.addEventListener('animationend', () => t.remove(), { once: true });
    }, 2500);
  };

  // ----- modal -----
  let modalOpen = false;
  const openModal = ({ title, bodyHtml, bodyEl, footerHtml, onMount, onClose }) => {
    modalOpen = true;
    const root = $('#modal-root');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-head">
        <div class="modal-title">${escapeHtml(title || '')}</div>
        <button class="modal-close" aria-label="Close">${ICONS.x}</button>
      </div>
      <div class="modal-body"></div>
      ${footerHtml ? `<div class="modal-foot">${footerHtml}</div>` : ''}
    `;
    backdrop.appendChild(modal);
    root.appendChild(backdrop);

    const body = modal.querySelector('.modal-body');
    if (bodyEl) body.appendChild(bodyEl);
    else if (bodyHtml) body.innerHTML = bodyHtml;

    const close = () => {
      modalOpen = false;
      backdrop.remove();
      document.removeEventListener('keydown', onKey);
      if (onClose) onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    modal.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });

    if (onMount) onMount({ close, modal, body });

    return { close, modal, body };
  };

  // ===========================================================
  // App
  // ===========================================================

  const App = {
    // -------- state --------
    state: {
      libraryTab: 'songs',          // songs | bible | media
      schedule: [],                 // array of schedule items {id, kind, title, subtitle, slides[]}
      selectedScheduleIdx: -1,      // which schedule item shown in center
      liveScheduleIdx: -1,          // which schedule item is live
      currentSlideIdx: 0,           // live slide within live item
      previewSlideIdx: 0,           // preview slide within selected item
      editingSong: null,            // id of song being edited (center shows editor)
      activeSongId: null,           // song whose slides are shown in center (read-only preview)
      activeSongSlideIdx: 0,        // single-clicked slide within the previewed song (used by Go Live)
      activePptxId: null,           // pptx/pdf deck whose slides are shown in center
      activePptxSlideIdx: 0,        // single-clicked slide within the previewed pptx deck
      pptxDocs: [],                 // in-memory parsed decks (pptx + pdf share this shape)
      videoClips: [],               // in-memory video clips {id, title, blob, url, posterUrl, duration}
      activeVideoId: null,          // video highlighted in library
      bibleBook: 'John',
      bibleChapter: 3,
      bibleTranslation: 'web',
      bibleData: null,              // last loaded chapter
      bibleLoading: false,
      bibleError: null,
      bibleSelectedVerse: null,     // last clicked verse (anchor for shift-click ranges)
      bibleSelectedVerses: [],      // all currently selected verse numbers (multi-select)
      versesPerSlide: 2,            // pagination size when sending many verses live
      songSearch: '',
      songLanguage: 'en',           // 'en' | 'tl' — filter applied to Songs library tab
      songCategory: 'worship',      // 'worship' | 'hymnal' — category filter on Songs tab
      projectorConnected: false,
      sessionMotion: 'none',        // operator-level bg motion for text slides (songs/scripture)
      liveDeck: null,               // out-of-band paged deck (e.g. multi-slide birthday) { kind, label, slides[], idx }
    },

    // -------- init --------
    init() {
      // Restore
      const settings = Store.getSettings();
      if (settings.lastBook) this.state.bibleBook = settings.lastBook;
      if (settings.lastChapter) this.state.bibleChapter = settings.lastChapter;
      if (settings.translation) this.state.bibleTranslation = settings.translation;
      if (Number.isFinite(settings.versesPerSlide) && settings.versesPerSlide > 0) {
        this.state.versesPerSlide = settings.versesPerSlide;
      }
      if (typeof settings.sessionMotion === 'string') {
        this.state.sessionMotion = settings.sessionMotion;
      }
      if (settings.songCategory === 'worship' || settings.songCategory === 'hymnal') {
        this.state.songCategory = settings.songCategory;
      }
      if (settings.songLanguage === 'en' || settings.songLanguage === 'tl') {
        this.state.songLanguage = settings.songLanguage;
      }
      this.state.schedule = Store.getSchedule();

      // Media (pptx/pdf/image decks, video blobs) lives in IndexedDB —
      // hydrate it asynchronously and re-render once it's back. Until then
      // the library shows whatever was restored synchronously (nothing,
      // on a cold reload). Schedule items that reference videos by blobId
      // will resolve once the corresponding clip is re-added to state.
      this._hydrateMedia();

      // Demo mode: when the landing page embeds the app as ?demo=1 it wants
      // the Preview + Live monitors populated with sample content. Writes
      // are suppressed so the landing preview never pollutes the visitor's
      // real schedule in localStorage.
      if (new URLSearchParams(location.search).get('demo') === '1') {
        this._loadDemoState();
      } else {
        // First-run seed: drop in a starter set of popular worship songs
        // (Hillsong + Planetshakers) so the library isn't empty on first
        // open. Gated by a settings flag so it only runs once — deleted
        // seeds stay deleted, and user edits aren't overwritten on reload.
        this._seedStarterLibrary();
      }

      hydrateIcons();
      this._wireMenu();
      this._wireToolbar();
      this._wireTabs();
      this._wireTransport();
      this._wireKeyboard();
      this._wireShortcutsMenu();

      // Start projector status polling
      this._pollProjector();
      setInterval(() => this._pollProjector(), 1200);

      // First render
      this.renderAll();

      // Load last bible chapter in background
      if (this.state.libraryTab === 'bible' || true) {
        this._loadBibleChapter().catch(() => {});
      }
    },

    renderAll() {
      this._renderStatus();
      this._renderSchedule();
      this._renderLibrary();
      this._renderCenter();
      this._renderMonitors();
    },

    // Populate the app with a fake service so the landing-page preview
    // Restore the Media library from IndexedDB. Runs in the background so
    // boot isn't blocked on the DB handshake — the library re-renders once
    // the data arrives. Video clips come back as Blobs; we recreate object
    // URLs here since URL.createObjectURL results don't persist.
    async _hydrateMedia() {
      if (typeof MediaStore === 'undefined') return;
      try { MediaStore.init(); } catch {}
      try {
        const [decks, videos] = await Promise.all([
          MediaStore.getDecks(),
          MediaStore.getVideos(),
        ]);
        // Only replace when state is still empty — if the operator managed
        // to load a file before hydration completed, we don't want to clobber
        // their new work.
        if (Array.isArray(decks) && decks.length && !this.state.pptxDocs.length) {
          // Preserve order most-recent-first; the original load flow does
          // unshift, so sort by createdAt desc to keep newest on top.
          this.state.pptxDocs = decks
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }
        if (Array.isArray(videos) && videos.length && !this.state.videoClips.length) {
          this.state.videoClips = videos
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .map(v => ({
              ...v,
              // Blob URLs are per-document, so rebuild on each load.
              url: v.blob ? URL.createObjectURL(v.blob) : null,
            }));
        }
        if ((decks && decks.length) || (videos && videos.length)) {
          this.renderAll();
        }
      } catch (e) {
        console.warn('media hydrate failed', e);
      }
    },

    // shows meaningful content across every panel (Library, Preview,
    // Live, Schedule). All writes are neutered so demo state never
    // reaches the visitor's localStorage.
    _loadDemoState() {
      const chapel  = Store.defaultStyle('chapel');
      const classic = Store.defaultStyle('classic');

      const mkSong = (id, title, author, key, ccli, category, sections) => ({
        id, title, author, songKey: key, ccli: ccli || '', tempo: '',
        category: category || 'worship',
        style: chapel,
        sections: sections.map((s, i) => ({ id: `${id}_sec_${i}`, label: s.label, text: s.text })),
        createdAt: Date.now(),
      });

      const demoSongs = [
        mkSong('demo_s1', 'God Is Here',          'Noel Robinson',  'D',  '', 'worship', [
          { label: 'Verse 1', text: 'God is here, He is moving\nIn the sound of our worship' },
          { label: 'Chorus',  text: 'Lift your hands, lift your voice\nHe is worthy of our praise' },
        ]),
        mkSong('demo_s2', 'I Give You Glory',     'Outbreakband',   'G',  '', 'worship', [
          { label: 'Verse 1', text: 'I give You glory with my hands up\nI give You glory in the darkest storm' },
          { label: 'Chorus',  text: 'Oh, I give You glory\nYou alone are worthy' },
        ]),
        mkSong('demo_s3', 'Still',                'Hillsong',       '',   '2562880', 'worship', [
          { label: 'Verse 1', text: 'Hide me now\nUnder Your wings' },
          { label: 'Chorus',  text: 'Find rest my soul\nIn Christ alone' },
        ]),
        mkSong('demo_s4', '10,000 Reasons',       'Matt Redman',    'C',  '6016351', 'worship', [
          { label: 'Chorus',  text: 'Bless the Lord, O my soul\nO my soul, worship His holy name' },
          { label: 'Verse 1', text: 'The sun comes up, it\u2019s a new day dawning' },
        ]),
        mkSong('demo_s5', 'Way Maker',            'Sinach',         'B\u266D', '7115744', 'worship', [
          { label: 'Verse 1', text: 'You are here, moving in our midst\nI worship You, I worship You' },
          { label: 'Chorus',  text: 'Way Maker, Miracle Worker\nPromise Keeper, Light in the darkness' },
        ]),
        mkSong('demo_s6', 'Build My Life',        'Pat Barrett',    'E',  '', 'worship', [
          { label: 'Chorus',  text: 'Holy, there is no one like You\nThere is none beside You' },
        ]),
        mkSong('demo_h1', 'Amazing Grace',        'John Newton',    'G',  '', 'hymnal', [
          { label: 'Verse 1', text: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!' },
        ]),
        mkSong('demo_h2', 'How Great Thou Art',   'Carl Boberg',    'A',  '', 'hymnal', [
          { label: 'Verse 1', text: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made' },
        ]),
        mkSong('demo_h3', 'Praise Him, Praise Him','Fanny Crosby',  'C',  '', 'hymnal', [
          { label: 'Verse 1', text: 'Praise Him! Praise Him! Jesus our blessed Redeemer\nSing, O earth, His wonderful love proclaim' },
        ]),
      ];

      // Intercept the Store so the library panel sees our demo catalog.
      Store.getSongs = () => demoSongs.slice();
      Store.getSong  = (id) => demoSongs.find(s => s.id === id) || null;

      this.state.schedule = [
        {
          id: 'demo_svc_1',
          kind: 'song',
          refId: 'demo_h1',
          title: 'Amazing Grace',
          subtitle: 'John Newton · Key G',
          slides: [{
            id: 'demo_sl_1',
            kind: 'song',
            label: 'Verse 1',
            text: 'Amazing grace! How sweet the sound\nThat saved a wretch like me!\nI once was lost, but now am found;\nWas blind, but now I see.',
            style: chapel,
          }],
        },
        {
          id: 'demo_svc_2',
          kind: 'scripture',
          title: 'John 3:16',
          subtitle: 'WEB',
          slides: [{
            id: 'demo_sl_2',
            kind: 'scripture',
            text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
            reference: 'John 3:16 · WEB',
            style: classic,
          }],
        },
      ];
      // Live = Amazing Grace slide 1; Preview = John 3:16 slide 1.
      this.state.liveScheduleIdx     = 0;
      this.state.currentSlideIdx     = 0;
      this.state.selectedScheduleIdx = 1;
      this.state.previewSlideIdx     = 0;
      // Seal off persistence + projector side-effects for the demo session.
      Store.setSchedule = () => {};
      Store.saveSong    = () => {};
      Store.deleteSong  = () => {};
      Store.setSetting  = () => {};
    },

    // First-run library seed. Each batch runs at most once per install:
    //   V2 — Hillsong + Planetshakers worship songs (initial seed).
    //   V3 — Charity Gayle + a full set of classic hymns.
    // Bumping to a new version only seeds NEW songs; existing ones are
    // not re-written so user edits are preserved. Deleted seeds stay
    // deleted (merge-by-id semantics in Store.mergeSongs).
    _seedStarterLibrary() {
      const settings = Store.getSettings();
      const chapel = Store.defaultStyle('chapel');
      const sng = (id, title, author, key, ccli, category, sections) => ({
        id, title, author, songKey: key, ccli: ccli || '', tempo: '',
        category: category || 'worship',
        style: chapel,
        sections: sections.map((s, i) => ({
          id: `${id}_sec_${i}`, label: s.label, text: s.text,
        })),
        createdAt: Date.now(),
      });

      let added = 0;

      // -------- V2: Hillsong + Planetshakers -----------------
      if (!settings.seededStarterV2) {
        const v2 = this._v2Seeds(sng);
        Store.mergeSongs(v2);
        Store.setSetting('seededStarterV2', true);
        added += v2.length;
      }

      // -------- V3: Charity Gayle + classic hymns ------------
      if (!settings.seededStarterV3) {
        const v3 = this._v3Seeds(sng);
        Store.mergeSongs(v3);
        Store.setSetting('seededStarterV3', true);
        added += v3.length;
      }

      // -------- V4: Chris Tomlin, Darlene Zschech, Don Moen, -
      // Kari Jobe, Elevation, Bethel, Phil Wickham, and more.
      if (!settings.seededStarterV4) {
        const v4 = this._v4Seeds(sng);
        Store.mergeSongs(v4);
        Store.setSetting('seededStarterV4', true);
        added += v4.length;
      }

      // V5 Tagalog seeds (old auto-generated scaffolds) removed —
      // operator-curated Tagalog songs now live in V7 instead.

      // -------- V7: Operator-curated Tagalog worship --------
      if (!settings.seededStarterV7) {
        const v7 = this._v7Seeds(sng);
        Store.mergeSongs(v7);
        Store.setSetting('seededStarterV7', true);
        added += v7.length;
      }

      // One-time lyric refresh for Endless Praise. We updated the seed
      // wording but can't just re-run V2 (that would overwrite other user
      // edits), so patch only this one song once per install.
      if (!settings.refreshedEndlessPraiseV2) {
        const ep = Store.getSong('seed_ps_endless_praise');
        if (ep) {
          const fresh = this._v2Seeds(sng).find(x => x.id === 'seed_ps_endless_praise');
          if (fresh) {
            ep.sections = fresh.sections;
            Store.saveSong(ep);
          }
        }
        Store.setSetting('refreshedEndlessPraiseV2', true);
      }

      // One-time cleanup for users who already had the old V5 Tagalog
      // seeds in their library. Runs once per install, then never again,
      // so operator-created Tagalog songs (without the seed_tl_ prefix) are
      // never touched.
      if (!settings.purgedTagalogSeedsV1) {
        const before = Store.getSongs().length;
        Store.getSongs()
          .filter(s => s && typeof s.id === 'string' && s.id.startsWith('seed_tl_'))
          .forEach(s => Store.deleteSong(s.id));
        const removed = before - Store.getSongs().length;
        Store.setSetting('purgedTagalogSeedsV1', true);
        if (removed > 0) {
          setTimeout(() => toast(`Cleaned up ${removed} old Tagalog seed song${removed === 1 ? '' : 's'}`, 'info'), 600);
        }
      }

      if (added > 0) {
        setTimeout(() => toast(`Added ${added} worship song${added === 1 ? '' : 's'} to your library`, 'ok'), 400);
      }
    },

    _v2Seeds(sng) {
      return [
        // ================ Hillsong ================

        sng('seed_hs_oceans', 'Oceans (Where Feet May Fail)', 'Hillsong UNITED', 'B', '6428767', 'worship', [
          { label: 'Verse 1', text: 'You call me out upon the waters\nThe great unknown where feet may fail\nAnd there I find You in the mystery\nIn oceans deep my faith will stand' },
          { label: 'Chorus',  text: 'And I will call upon Your name\nAnd keep my eyes above the waves\nWhen oceans rise, my soul will rest in Your embrace\nFor I am Yours and You are mine' },
          { label: 'Verse 2', text: 'Your grace abounds in deepest waters\nYour sovereign hand will be my guide\nWhere feet may fail and fear surrounds me\nYou’ve never failed and You won’t start now' },
          { label: 'Bridge',  text: 'Spirit lead me where my trust is without borders\nLet me walk upon the waters\nWherever You would call me\nTake me deeper than my feet could ever wander\nAnd my faith will be made stronger\nIn the presence of my Savior' },
        ]),

        sng('seed_hs_mighty_to_save', 'Mighty to Save', 'Hillsong', 'A', '4591782', 'worship', [
          { label: 'Verse 1', text: 'Everyone needs compassion\nLove that’s never failing\nLet mercy fall on me\nEveryone needs forgiveness\nThe kindness of a Savior\nThe hope of nations' },
          { label: 'Chorus',  text: 'Savior, He can move the mountains\nMy God is mighty to save\nHe is mighty to save\nForever, Author of salvation\nHe rose and conquered the grave\nJesus conquered the grave' },
          { label: 'Verse 2', text: 'So take me as You find me\nAll my fears and failures\nFill my life again\nI give my life to follow\nEverything I believe in\nNow I surrender' },
          { label: 'Bridge',  text: 'Shine your light and let the whole world see\nWe’re singing for the glory of the risen King\nJesus\nShine your light and let the whole world see\nWe’re singing for the glory of the risen King' },
        ]),

        sng('seed_hs_what_a_beautiful_name', 'What a Beautiful Name', 'Hillsong Worship', 'D', '7068424', 'worship', [
          { label: 'Verse 1',   text: 'You were the Word at the beginning\nOne with God the Lord Most High\nYour hidden glory in creation\nNow revealed in You our Christ' },
          { label: 'Chorus 1',  text: 'What a beautiful Name it is\nWhat a beautiful Name it is\nThe Name of Jesus Christ my King\nWhat a beautiful Name it is\nNothing compares to this\nWhat a beautiful Name it is\nThe Name of Jesus' },
          { label: 'Verse 2',   text: 'You didn’t want heaven without us\nSo Jesus, You brought heaven down\nMy sin was great, Your love was greater\nWhat could separate us now' },
          { label: 'Chorus 2',  text: 'What a wonderful Name it is\nWhat a wonderful Name it is\nThe Name of Jesus Christ my King\nWhat a wonderful Name it is\nNothing compares to this\nWhat a wonderful Name it is\nThe Name of Jesus' },
          { label: 'Bridge',    text: 'Death could not hold You\nThe veil tore before You\nYou silenced the boast of sin and grave\nThe heavens are roaring\nThe praise of Your glory\nFor You are raised to life again\n\nYou have no rival\nYou have no equal\nNow and forever God You reign\nYours is the Kingdom\nYours is the glory\nYours is the Name above all names' },
          { label: 'Chorus 3',  text: 'What a powerful Name it is\nWhat a powerful Name it is\nThe Name of Jesus Christ my King\nWhat a powerful Name it is\nNothing can stand against\nWhat a powerful Name it is\nThe Name of Jesus' },
        ]),

        sng('seed_hs_cornerstone', 'Cornerstone', 'Hillsong', 'C', '6158927', 'worship', [
          { label: 'Verse 1', text: 'My hope is built on nothing less\nThan Jesus’ blood and righteousness\nI dare not trust the sweetest frame\nBut wholly trust in Jesus’ Name' },
          { label: 'Chorus',  text: 'Christ alone, Cornerstone\nWeak made strong in the Savior’s love\nThrough the storm, He is Lord\nLord of all' },
          { label: 'Verse 2', text: 'When darkness seems to hide His face\nI rest on His unchanging grace\nIn every high and stormy gale\nMy anchor holds within the veil\nMy anchor holds within the veil' },
          { label: 'Verse 3', text: 'When He shall come with trumpet sound\nOh may I then in Him be found\nDressed in His righteousness alone\nFaultless, stand before the throne' },
        ]),

        sng('seed_hs_hosanna', 'Hosanna', 'Hillsong', 'E', '4785835', 'worship', [
          { label: 'Verse 1', text: 'I see the King of glory\nComing on the clouds with fire\nThe whole earth shakes, the whole earth shakes\nI see His love and mercy\nWashing over all our sin\nThe people sing, the people sing' },
          { label: 'Chorus',  text: 'Hosanna, hosanna\nHosanna in the highest\nHosanna, hosanna\nHosanna in the highest' },
          { label: 'Verse 2', text: 'I see a generation\nRising up to take their place\nWith selfless faith, with selfless faith\nI see a near revival\nStirring as we pray and seek\nWe’re on our knees, we’re on our knees' },
          { label: 'Bridge',  text: 'Heal my heart and make it clean\nOpen up my eyes to the things unseen\nShow me how to love like You have loved me\nBreak my heart for what breaks Yours\nEverything I am for Your Kingdom’s cause\nAs I walk from earth into eternity' },
        ]),

        sng('seed_hs_king_of_kings', 'King of Kings', 'Hillsong Worship', 'D', '7127647', 'worship', [
          { label: 'Verse 1', text: 'In the darkness we were waiting\nWithout hope, without light\n’Til from Heaven You came running\nThere was mercy in Your eyes\nTo fulfil the law and prophets\nTo a virgin came the Word\nFrom a throne of endless glory\nTo a cradle in the dirt' },
          { label: 'Chorus',  text: 'Praise the Father, praise the Son\nPraise the Spirit, three in one\nGod of glory, Majesty\nPraise forever to the King of kings' },
          { label: 'Verse 2', text: 'To reveal the kingdom coming\nAnd to reconcile the lost\nTo redeem the whole creation\nYou did not despise the cross\nFor even in Your suffering\nYou saw to the other side\nKnowing this was our salvation\nJesus, for our sake You died' },
          { label: 'Verse 3', text: 'And the morning that You rose\nAll of heaven held its breath\n’Til that stone was moved for good\nFor the Lamb had conquered death\nAnd the dead rose from their tombs\nAnd the angels stood in awe\nFor the souls of all who’d come\nTo the Father are restored' },
          { label: 'Verse 4', text: 'And the Church of Christ was born\nThen the Spirit lit the flame\nNow this Gospel truth of old\nShall not kneel, shall not faint\nBy His blood and in His Name\nIn His freedom I am free\nFor the love of Jesus Christ\nWho has resurrected me' },
        ]),

        sng('seed_hs_who_you_say_i_am', 'Who You Say I Am', 'Hillsong Worship', 'C', '7102401', 'worship', [
          { label: 'Verse 1', text: 'Who am I that the highest King\nWould welcome me\nI was lost but He brought me in\nOh His love for me\nOh His love for me' },
          { label: 'Chorus',  text: 'Who the Son sets free\nOh is free indeed\nI’m a child of God\nYes I am' },
          { label: 'Verse 2', text: 'Free at last, He has ransomed me\nHis grace runs deep\nWhile I was a slave to sin\nJesus died for me\nYes He died for me' },
          { label: 'Bridge',  text: 'I am chosen, not forsaken\nI am who You say I am\nYou are for me, not against me\nI am who You say I am\n\nIn my Father’s house\nThere’s a place for me\nI’m a child of God\nYes I am' },
        ]),

        sng('seed_hs_so_will_i', 'So Will I (100 Billion X)', 'Hillsong UNITED', 'B', '7084123', 'worship', [
          { label: 'Verse 1', text: 'God of creation\nThere at the start, before the beginning of time\nWith no point of reference\nYou spoke to the dark and fleshed out the wonder of light' },
          { label: 'Verse 2', text: 'And as You speak\nA hundred billion galaxies are born\nIn the vapor of Your breath the planets form\nIf the stars were made to worship so will I' },
          { label: 'Verse 3', text: 'I can see Your heart in everything You’ve made\nEvery burning star\nA signal fire of grace\nIf creation sings Your praises, so will I' },
          { label: 'Verse 4', text: 'God of salvation\nYou chased down my heart through all of my failure and pride\nOn a hill You created\nThe light of the world abandoned in darkness to die' },
          { label: 'Chorus',  text: 'And as You speak\nA hundred billion failures disarmed\nAnd I know that You don’t give up on me\nSo I won’t give up on You' },
          { label: 'Bridge',  text: 'If the stars were made to worship so will I\nIf the mountains bow in reverence so will I\nIf the oceans roar Your greatness so will I\nFor if everything exists to lift You high so will I' },
        ]),

        // ================ Planetshakers ================

        sng('seed_ps_the_anthem', 'The Anthem', 'Planetshakers', 'A', '6129877', 'worship', [
          { label: 'Verse 1', text: 'We’ll sing Your praise, oh God\nWe’ll sing Your praise\nLet everything that’s within us rise\nTo sing Your praise' },
          { label: 'Chorus',  text: 'This is our anthem\nThis is our song\nThe cry of our hearts as we sing Your praise\nThis is our anthem\nThis is our song' },
          { label: 'Verse 2', text: 'We’ll lift Your name, oh God\nWe’ll lift Your name\nLet every generation know\nWe’ll lift Your name' },
          { label: 'Bridge',  text: 'Let the earth sing, sing, sing\nAnd the nations sing, sing, sing\nWe will rise, we will rise\nTill all the earth sings' },
        ]),

        sng('seed_ps_endless_praise', 'Endless Praise', 'Planetshakers', 'G', '6426842', 'worship', [
          { label: 'Verse 1', text: 'Oh, You are God, and we lift You up\nWeʼll keep singing, Weʼll keep praising\nWe wonʼt stop, giving all we got\nCause You\'re worthy, Of all glory' },
          { label: 'Pre-Chorus', text: 'And oh, there is no other\nYou are forever, Lord over all\nThere\'s nobody like You, no one beside You' },
          { label: 'Chorus', text: 'To You, let endless praise resound\nEvery night and day, and with no delay\nLet endless praise resound, yeah' },
          { label: 'Verse 2', text: 'Boundless love, light before the sun\nYour glory eternal\nNever stops\nGiving all you got\nCreation keeps singing' },
          { label: 'Chorus', text: 'Oh, there is no other\nYou are forever, Lord over all\nThere\'s nobody like You, No one beside You' },
          { label: 'Chorus', text: 'To You let endless praise resound\nEvery night and day, and with no delay\nLet endless praise resound\nTo You let endless praise resound (Oh)\nEvery night and day, and with no delay\nLet endless praise resound' },
          { label: 'Build-up', text: 'Early in the morning, early in the evening\nGonna give You praise' },
          { label: 'Bridge', text: 'We lift You up, up, up\nWeʼre giving You our love, love, love\nFor everything Youʼve done, done, done\nWe give you all the praise\nWe lift You up, up, up\nWeʼre giving You our love, love, love\nFor everything Youʼve done, done, done\nWe give you all the praise' },
          { label: 'Chorus', text: 'To You, oh, Lord, let endless praise resound\nEvery night and day, and with no delay\nLet endless praise resound\nTo You, let endless praise resound\nEvery night and day, and with no delay\nLet endless praise resound, yeah, yeah' },
          { label: 'Outro', text: 'Oh, Lord' },
        ]),

        sng('seed_ps_nothing_is_impossible', 'Nothing Is Impossible', 'Planetshakers', 'D', '5928569', 'worship', [
          { label: 'Verse 1', text: 'Through You I can do anything, I can do all things\n’Cause it’s You who gives me strength, nothing is impossible\nThrough You blind eyes are opened, strongholds are broken\nI am living by faith, nothing is impossible' },
          { label: 'Chorus',  text: 'I’m not gonna live by what I see\nI’m not gonna live by what I feel\nDeep down I know that You’re here with me\nI know that You can do anything' },
          { label: 'Verse 2', text: 'Through You I can walk through fire, rise up from the grave\nBreak free from all my chains, nothing is impossible\nThrough You all my dreams have come alive\nMy faith is on the rise, nothing is impossible' },
          { label: 'Bridge',  text: 'Through You, through You\nI can do all things, I can do all things\nThrough You, through You\nI can do all things\nIt’s You who gives me strength' },
        ]),

        sng('seed_ps_beautiful_saviour', 'Beautiful Saviour', 'Planetshakers', 'G', '5168175', 'worship', [
          { label: 'Verse 1', text: 'Beautiful Saviour\nWonderful Counselor\nClothed in majesty\nLord of history\nYou’re the Way, the Truth, the Life' },
          { label: 'Chorus',  text: 'Star of the morning\nGlorious in holiness\nYou’re the risen One\nHeaven’s champion\nAnd You reign, You reign over all' },
          { label: 'Verse 2', text: 'I long to be where the praise is never ending\nYearn to dwell where the glory never fades\nWhere countless worshippers will share one song\nAnd cries of “Worthy” will honor the Lamb' },
          { label: 'Bridge',  text: 'Lord of lords, King of kings\nMighty God, holy is Your name\nLord of lords, King of kings\nGlory to Jesus, holy is Your name' },
        ]),

        sng('seed_ps_this_is_our_time', 'This Is Our Time', 'Planetshakers', 'A', '6449811', 'worship', [
          { label: 'Verse 1', text: 'This is our time\nThis is our moment\nWe lift our voices loud\nAnd sing for all the world to hear' },
          { label: 'Chorus',  text: 'We live to make His name known\nWe live for Jesus\nWe live to make His name known\nThis is our time' },
          { label: 'Verse 2', text: 'This is our hour\nThis is our calling\nWe raise a banner high\nFor our God who reigns on high' },
          { label: 'Bridge',  text: 'Sing to the Lord, all the earth\nSing for the glory of His name\nSing to the Lord, all the earth\nHe is the King of kings' },
        ]),

        sng('seed_ps_rain_down', 'Rain Down', 'Planetshakers', 'E', '5063213', 'worship', [
          { label: 'Verse 1', text: 'We’ve been waiting\nFor this moment\nOpen up the floodgates of heaven\nLet it rain, let it rain' },
          { label: 'Chorus',  text: 'Rain down Your love, Your love\nRain down Your love on us\nWe open up our hearts\nTo receive from You, Lord\nRain down Your love on us' },
          { label: 'Verse 2', text: 'We’re expecting\nNow to feel Your presence\nReady to receive all\nThat You have for us today' },
          { label: 'Bridge',  text: 'Pour it out, pour it out\nLet Your glory come\nPour it out, pour it out\nWe want more of You' },
        ]),
      ];
    },

    _v3Seeds(sng) {
      return [
        // ================ Charity Gayle ================

        sng('seed_cg_i_speak_jesus', 'I Speak Jesus', 'Charity Gayle', 'F', '7136201', 'worship', [
          { label: 'Verse 1', text: 'I just want to speak the name of Jesus\nOver every heart and every mind\n’Cause I know there is peace within Your presence\nI speak Jesus' },
          { label: 'Verse 2', text: 'I just want to speak the name of Jesus\nTill every dark addiction starts to break\nDeclaring there is hope and there is freedom\nI speak Jesus' },
          { label: 'Chorus',  text: 'Your name is power\nYour name is healing\nYour name is life\nBreak every stronghold\nShine through the shadows\nBurn like a fire' },
          { label: 'Verse 3', text: 'I just want to speak the name of Jesus\nOver fear and every inward thing\nOver every victory I’ll find in You, Lord\nI speak Jesus' },
          { label: 'Bridge',  text: 'Shout Jesus from the mountains\nJesus in the streets\nJesus in the darkness over every enemy\nJesus for my family\nI speak the holy name, Jesus' },
        ]),

        sng('seed_cg_thank_you_jesus_blood', 'Thank You Jesus for the Blood', 'Charity Gayle', 'G', '7135967', 'worship', [
          { label: 'Verse 1', text: 'I was a wretch, I remember who I was\nI was lost, I was broken, and I was so in love with sin\nBut mercy found me\nMercy found me' },
          { label: 'Chorus',  text: 'Thank You, Jesus, for the blood applied\nThank You, Jesus, it has washed me white\nThank You, Jesus, You have saved my life\nBrought me from the darkness into glorious light' },
          { label: 'Verse 2', text: 'You took my place, laid in that borrowed grave\nThen You rose, hell You defeated, now salvation’s mine\nOh, praise Your name\nI’ll never be the same' },
          { label: 'Bridge',  text: 'There is power in the blood\nThere is power in the blood\nPower in the blood of the Lamb\nThere is power in the blood\nThere is power in the blood\nPower in the blood of the Lamb' },
        ]),

        sng('seed_cg_new_name', 'New Name Written Down in Glory', 'Charity Gayle', 'G', '7161480', 'worship', [
          { label: 'Verse 1', text: 'I was a sinner, I was in shame\nLost in my darkness, bound up in chains\nCame to the altar, came to be free\nJesus, forgive me, I have believed' },
          { label: 'Chorus',  text: 'I have a new name written down in glory\nAnd it’s mine, oh, it’s mine\nI am Yours, You are mine\nSong of the angels, oh, what a story\nOh, what a love divine\nThat I’m Yours and You are mine' },
          { label: 'Verse 2', text: 'Clothed in Your goodness, filled with Your light\nHeavenly Father, hold me tonight\nYou are my refuge, You are my peace\nJesus, my Savior, You rescued me' },
        ]),

        sng('seed_cg_throne_room', 'Throne Room', 'Charity Gayle', 'G', '7162142', 'worship', [
          { label: 'Verse 1', text: 'We’ve come to praise You\nAnd we’ve come to worship\nWith everything in us\nEverything that we have, we give' },
          { label: 'Chorus',  text: 'Jesus, Jesus\nWe reach out for You\nJesus, Jesus\nWe’re changed by Your love' },
          { label: 'Bridge',  text: 'Holy is the Lord of hosts\nWorthy is the Lamb enthroned\nAll the earth will see the glory of the Lord' },
        ]),

        // ================ Classic Hymns ================

        sng('seed_hy_to_god_be_the_glory', 'To God Be the Glory', 'Fanny Crosby', 'G', '', 'hymnal', [
          { label: 'Verse 1', text: 'To God be the glory, great things He hath done\nSo loved He the world that He gave us His Son\nWho yielded His life an atonement for sin\nAnd opened the life-gate that all may go in' },
          { label: 'Chorus',  text: 'Praise the Lord, praise the Lord\nLet the earth hear His voice\nPraise the Lord, praise the Lord\nLet the people rejoice\nO come to the Father through Jesus the Son\nAnd give Him the glory, great things He hath done' },
          { label: 'Verse 2', text: 'O perfect redemption, the purchase of blood\nTo every believer the promise of God\nThe vilest offender who truly believes\nThat moment from Jesus a pardon receives' },
          { label: 'Verse 3', text: 'Great things He hath taught us, great things He hath done\nAnd great our rejoicing through Jesus the Son\nBut purer and higher and greater will be\nOur wonder, our transport, when Jesus we see' },
        ]),

        sng('seed_hy_blessed_assurance', 'Blessed Assurance', 'Fanny Crosby', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'Blessed assurance, Jesus is mine!\nO what a foretaste of glory divine!\nHeir of salvation, purchase of God\nBorn of His Spirit, washed in His blood' },
          { label: 'Chorus',  text: 'This is my story, this is my song\nPraising my Savior all the day long\nThis is my story, this is my song\nPraising my Savior all the day long' },
          { label: 'Verse 2', text: 'Perfect submission, perfect delight\nVisions of rapture now burst on my sight\nAngels descending, bring from above\nEchoes of mercy, whispers of love' },
          { label: 'Verse 3', text: 'Perfect submission, all is at rest\nI in my Savior am happy and blessed\nWatching and waiting, looking above\nFilled with His goodness, lost in His love' },
        ]),

        sng('seed_hy_it_is_well', 'It Is Well with My Soul', 'Horatio Spafford', 'C', '', 'hymnal', [
          { label: 'Verse 1', text: 'When peace like a river attendeth my way\nWhen sorrows like sea billows roll\nWhatever my lot, Thou hast taught me to say\nIt is well, it is well with my soul' },
          { label: 'Chorus',  text: 'It is well (it is well)\nWith my soul (with my soul)\nIt is well, it is well with my soul' },
          { label: 'Verse 2', text: 'Though Satan should buffet, though trials should come\nLet this blest assurance control\nThat Christ hath regarded my helpless estate\nAnd hath shed His own blood for my soul' },
          { label: 'Verse 3', text: 'My sin, oh the bliss of this glorious thought\nMy sin, not in part but the whole\nIs nailed to the cross, and I bear it no more\nPraise the Lord, praise the Lord, O my soul!' },
          { label: 'Verse 4', text: 'And Lord, haste the day when the faith shall be sight\nThe clouds be rolled back as a scroll\nThe trump shall resound and the Lord shall descend\nEven so, it is well with my soul' },
        ]),

        sng('seed_hy_great_is_thy_faithfulness', 'Great Is Thy Faithfulness', 'Thomas O. Chisholm', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions, they fail not\nAs Thou hast been Thou forever wilt be' },
          { label: 'Chorus',  text: 'Great is Thy faithfulness\nGreat is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided\nGreat is Thy faithfulness, Lord, unto me!' },
          { label: 'Verse 2', text: 'Summer and winter, and springtime and harvest\nSun, moon, and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy, and love' },
          { label: 'Verse 3', text: 'Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside!' },
        ]),

        sng('seed_hy_holy_holy_holy', 'Holy, Holy, Holy', 'Reginald Heber', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'Holy, holy, holy! Lord God Almighty!\nEarly in the morning our song shall rise to Thee\nHoly, holy, holy! Merciful and mighty\nGod in three persons, blessed Trinity!' },
          { label: 'Verse 2', text: 'Holy, holy, holy! All the saints adore Thee\nCasting down their golden crowns around the glassy sea\nCherubim and seraphim falling down before Thee\nWhich wert and art and evermore shalt be' },
          { label: 'Verse 3', text: 'Holy, holy, holy! Though the darkness hide Thee\nThough the eye of sinful man Thy glory may not see\nOnly Thou art holy, there is none beside Thee\nPerfect in power, in love, and purity' },
          { label: 'Verse 4', text: 'Holy, holy, holy! Lord God Almighty!\nAll Thy works shall praise Thy name in earth and sky and sea\nHoly, holy, holy! Merciful and mighty\nGod in three persons, blessed Trinity!' },
        ]),

        sng('seed_hy_come_thou_fount', 'Come Thou Fount of Every Blessing', 'Robert Robinson', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'Come, Thou Fount of every blessing\nTune my heart to sing Thy grace\nStreams of mercy, never ceasing\nCall for songs of loudest praise\nTeach me some melodious sonnet\nSung by flaming tongues above\nPraise the mount! I’m fixed upon it\nMount of Thy redeeming love' },
          { label: 'Verse 2', text: 'Here I raise mine Ebenezer\nHither by Thy help I’m come\nAnd I hope, by Thy good pleasure\nSafely to arrive at home\nJesus sought me when a stranger\nWandering from the fold of God\nHe, to rescue me from danger\nInterposed His precious blood' },
          { label: 'Verse 3', text: 'O to grace how great a debtor\nDaily I’m constrained to be\nLet Thy goodness, like a fetter\nBind my wandering heart to Thee\nProne to wander, Lord, I feel it\nProne to leave the God I love\nHere’s my heart, O take and seal it\nSeal it for Thy courts above' },
        ]),

        sng('seed_hy_be_thou_my_vision', 'Be Thou My Vision', 'Traditional Irish', 'Eb', '', 'hymnal', [
          { label: 'Verse 1', text: 'Be Thou my vision, O Lord of my heart\nNaught be all else to me, save that Thou art\nThou my best thought, by day or by night\nWaking or sleeping, Thy presence my light' },
          { label: 'Verse 2', text: 'Be Thou my wisdom, and Thou my true word\nI ever with Thee and Thou with me, Lord\nThou my great Father, I Thy true son\nThou in me dwelling, and I with Thee one' },
          { label: 'Verse 3', text: 'Riches I heed not, nor man’s empty praise\nThou mine inheritance, now and always\nThou and Thou only, first in my heart\nHigh King of heaven, my treasure Thou art' },
          { label: 'Verse 4', text: 'High King of heaven, my victory won\nMay I reach heaven’s joys, O bright heaven’s Sun\nHeart of my own heart, whatever befall\nStill be my vision, O Ruler of all' },
        ]),

        sng('seed_hy_praise_him_praise_him', 'Praise Him, Praise Him', 'Fanny Crosby', 'Bb', '', 'hymnal', [
          { label: 'Verse 1', text: 'Praise Him! Praise Him! Jesus, our blessed Redeemer!\nSing, O earth, His wonderful love proclaim!\nHail Him! Hail Him! Highest archangels in glory\nStrength and honor give to His holy name!\nLike a shepherd, Jesus will guard His children\nIn His arms He carries them all day long' },
          { label: 'Chorus',  text: 'Praise Him! Praise Him! Tell of His excellent greatness\nPraise Him! Praise Him! Ever in joyful song!' },
          { label: 'Verse 2', text: 'Praise Him! Praise Him! Jesus, our blessed Redeemer!\nFor our sins He suffered and bled and died\nHe, our Rock, our Hope of eternal salvation\nHail Him! Hail Him! Jesus the Crucified!\nSound His praises, Jesus who bore our sorrows\nLove unbounded, wonderful, deep, and strong' },
          { label: 'Verse 3', text: 'Praise Him! Praise Him! Jesus, our blessed Redeemer!\nHeavenly portals, loud with hosannas ring!\nJesus, Savior, reigneth forever and ever\nCrown Him! Crown Him! Prophet, and Priest, and King!\nChrist is coming! Over the world victorious\nPower and glory unto the Lord belong' },
        ]),

        sng('seed_hy_crown_him_many_crowns', 'Crown Him with Many Crowns', 'Matthew Bridges', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'Crown Him with many crowns\nThe Lamb upon His throne\nHark! How the heavenly anthem drowns\nAll music but its own!\nAwake, my soul, and sing\nOf Him who died for thee\nAnd hail Him as thy matchless King\nThrough all eternity' },
          { label: 'Verse 2', text: 'Crown Him the Lord of love\nBehold His hands and side\nThose wounds, yet visible above\nIn beauty glorified\nNo angels in the sky\nCan fully bear that sight\nBut downward bend their burning eyes\nAt mysteries so bright' },
          { label: 'Verse 3', text: 'Crown Him the Lord of life\nWho triumphed o’er the grave\nAnd rose victorious in the strife\nFor those He came to save\nHis glories now we sing\nWho died, and rose on high\nWho died eternal life to bring\nAnd lives that death may die' },
        ]),

        sng('seed_hy_all_creatures', 'All Creatures of Our God and King', 'Francis of Assisi', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'All creatures of our God and King\nLift up your voice and with us sing\nAlleluia! Alleluia!\nThou burning sun with golden beam\nThou silver moon with softer gleam\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!' },
          { label: 'Verse 2', text: 'Thou rushing wind that art so strong\nYe clouds that sail in heaven along\nO praise Him! Alleluia!\nThou rising morn in praise rejoice\nYe lights of evening, find a voice\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!' },
          { label: 'Verse 3', text: 'Let all things their Creator bless\nAnd worship Him in humbleness\nO praise Him! Alleluia!\nPraise, praise the Father, praise the Son\nAnd praise the Spirit, Three in One\nO praise Him! O praise Him!\nAlleluia! Alleluia! Alleluia!' },
        ]),

        sng('seed_hy_amazing_love', 'And Can It Be (Amazing Love)', 'Charles Wesley', 'D', '', 'hymnal', [
          { label: 'Verse 1', text: 'And can it be that I should gain\nAn interest in the Savior’s blood?\nDied He for me, who caused His pain\nFor me, who Him to death pursued?\nAmazing love! How can it be\nThat Thou, my God, shouldst die for me?' },
          { label: 'Chorus',  text: 'Amazing love! How can it be\nThat Thou, my God, shouldst die for me?' },
          { label: 'Verse 2', text: 'He left His Father’s throne above\nSo free, so infinite His grace\nEmptied Himself of all but love\nAnd bled for Adam’s helpless race\n’Tis mercy all, immense and free\nFor, O my God, it found out me!' },
          { label: 'Verse 3', text: 'No condemnation now I dread\nJesus, and all in Him, is mine!\nAlive in Him, my living Head\nAnd clothed in righteousness divine\nBold I approach the eternal throne\nAnd claim the crown, through Christ my own' },
        ]),
      ];
    },

    _v4Seeds(sng) {
      return [
        // ================ Darlene Zschech ================

        sng('seed_dz_shout_to_the_lord', 'Shout to the Lord', 'Darlene Zschech', 'A', '1406918', 'worship', [
          { label: 'Verse 1', text: 'My Jesus, my Savior\nLord, there is none like You\nAll of my days I want to praise\nThe wonders of Your mighty love' },
          { label: 'Verse 2', text: 'My comfort, my shelter\nTower of refuge and strength\nLet every breath, all that I am\nNever cease to worship You' },
          { label: 'Chorus',  text: 'Shout to the Lord, all the earth, let us sing\nPower and majesty, praise to the King\nMountains bow down and the seas will roar\nAt the sound of Your name\nI sing for joy at the work of Your hands\nForever I’ll love You, forever I’ll stand\nNothing compares to the promise I have in You' },
        ]),

        sng('seed_dz_worthy_is_the_lamb', 'Worthy Is the Lamb', 'Darlene Zschech', 'Bb', '3217555', 'worship', [
          { label: 'Verse 1', text: 'Thank You for the cross, Lord\nThank You for the price You paid\nBearing all my sin and shame\nIn love You came and gave amazing grace' },
          { label: 'Verse 2', text: 'Thank You for the nail-pierced hands\nWashed me in Your cleansing flow\nNow all I know\nYour forgiveness and embrace' },
          { label: 'Chorus',  text: 'Worthy is the Lamb, seated on the throne\nCrown You now with many crowns\nYou reign victorious\nHigh and lifted up, Jesus, Son of God\nThe Darling of Heaven crucified\nWorthy is the Lamb\nWorthy is the Lamb' },
        ]),

        sng('seed_dz_power_of_your_love', 'The Power of Your Love', 'Geoff Bullock', 'E', '917491', 'worship', [
          { label: 'Verse 1', text: 'Lord I come to You\nLet my heart be changed, renewed\nFlowing from the grace\nThat I found in You\nAnd Lord I’ve come to know\nThe weaknesses I see in me\nWill be stripped away\nBy the power of Your love' },
          { label: 'Chorus',  text: 'Hold me close, let Your love surround me\nBring me near, draw me to Your side\nAnd as I wait, I’ll rise up like the eagle\nAnd I will soar with You\nYour Spirit leads me on\nIn the power of Your love' },
          { label: 'Verse 2', text: 'Lord, unveil my eyes\nLet me see You face to face\nThe knowledge of Your love\nAs You live in me\nLord, renew my mind\nAs Your will unfolds in my life\nIn living every day\nBy the power of Your love' },
        ]),

        // ================ Chris Tomlin ================

        sng('seed_ct_how_great_is_our_god', 'How Great Is Our God', 'Chris Tomlin', 'C', '4348399', 'worship', [
          { label: 'Verse 1', text: 'The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nTrembles at His voice' },
          { label: 'Chorus',  text: 'How great is our God\nSing with me\nHow great is our God\nAnd all will see\nHow great, how great is our God' },
          { label: 'Verse 2', text: 'Age to age He stands\nAnd time is in His hands\nBeginning and the end\nBeginning and the end\nThe Godhead, three in one\nFather, Spirit, Son\nThe Lion and the Lamb\nThe Lion and the Lamb' },
          { label: 'Bridge',  text: 'Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God' },
        ]),

        sng('seed_ct_our_god', 'Our God', 'Chris Tomlin / Matt Redman / Jonas Myrin', 'G', '5677416', 'worship', [
          { label: 'Verse 1', text: 'Water You turned into wine\nOpened the eyes of the blind\nThere’s no one like You, none like You' },
          { label: 'Verse 2', text: 'Into the darkness You shine\nOut of the ashes we rise\nThere’s no one like You, none like You' },
          { label: 'Chorus',  text: 'Our God is greater, our God is stronger\nGod, You are higher than any other\nOur God is Healer, awesome in power\nOur God, our God' },
          { label: 'Bridge',  text: 'And if our God is for us, then who could ever stop us?\nAnd if our God is with us, then what could stand against?' },
        ]),

        sng('seed_ct_good_good_father', 'Good Good Father', 'Chris Tomlin / Pat Barrett', 'G', '7036612', 'worship', [
          { label: 'Verse 1', text: 'I’ve heard a thousand stories of what they think You’re like\nBut I’ve heard the tender whisper of love in the dead of night\nAnd You tell me that You’re pleased and that I’m never alone' },
          { label: 'Chorus',  text: 'You’re a Good, Good Father\nIt’s who You are, it’s who You are, it’s who You are\nAnd I’m loved by You\nIt’s who I am, it’s who I am, it’s who I am' },
          { label: 'Verse 2', text: 'I’ve seen many searching for answers far and wide\nBut I know we’re all searching for answers only You provide\n’Cause You know just what we need before we say a word' },
          { label: 'Bridge',  text: 'You are perfect in all of Your ways\nYou are perfect in all of Your ways\nYou are perfect in all of Your ways to us' },
        ]),

        sng('seed_ct_amazing_grace_my_chains', 'Amazing Grace (My Chains Are Gone)', 'Chris Tomlin', 'G', '4768151', 'worship', [
          { label: 'Verse 1', text: 'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now I’m found\nWas blind, but now I see' },
          { label: 'Verse 2', text: '’Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed' },
          { label: 'Chorus',  text: 'My chains are gone, I’ve been set free\nMy God, my Savior has ransomed me\nAnd like a flood His mercy reigns\nUnending love, amazing grace' },
          { label: 'Verse 3', text: 'The Lord has promised good to me\nHis Word my hope secures\nHe will my shield and portion be\nAs long as life endures' },
        ]),

        sng('seed_ct_holy_is_the_lord', 'Holy Is the Lord', 'Chris Tomlin / Louie Giglio', 'G', '4158039', 'worship', [
          { label: 'Verse 1', text: 'We stand and lift up our hands\nFor the joy of the Lord is our strength\nWe bow down and worship Him now\nHow great, how awesome is He' },
          { label: 'Chorus',  text: 'Holy is the Lord God Almighty\nThe earth is filled with His glory\nHoly is the Lord God Almighty\nThe earth is filled with His glory\nThe earth is filled with His glory' },
          { label: 'Bridge',  text: 'It’s rising up all around\nIt’s the anthem of the Lord’s renown\nIt’s rising up all around\nIt’s the anthem of the Lord’s renown' },
        ]),

        sng('seed_ct_forever', 'Forever', 'Chris Tomlin', 'G', '3148428', 'worship', [
          { label: 'Verse 1', text: 'Give thanks to the Lord, our God and King\nHis love endures forever\nFor He is good, He is above all things\nHis love endures forever\nSing praise, sing praise' },
          { label: 'Verse 2', text: 'With a mighty hand and outstretched arm\nHis love endures forever\nFor the life that’s been reborn\nHis love endures forever\nSing praise, sing praise' },
          { label: 'Chorus',  text: 'Forever God is faithful\nForever God is strong\nForever God is with us\nForever, forever' },
        ]),

        sng('seed_ct_indescribable', 'Indescribable', 'Chris Tomlin / Laura Story', 'C', '4403076', 'worship', [
          { label: 'Verse 1', text: 'From the highest of heights to the depths of the sea\nCreation’s revealing Your majesty\nFrom the colors of fall to the fragrance of spring\nEvery creature unique in the song that it sings\nAll exclaiming' },
          { label: 'Chorus',  text: 'Indescribable, uncontainable\nYou placed the stars in the sky\nAnd You know them by name\nYou are amazing, God\nAll powerful, untamable\nAwestruck, we fall to our knees\nAs we humbly proclaim\nYou are amazing, God' },
          { label: 'Verse 2', text: 'Who has told every lightning bolt where it should go?\nOr seen heavenly storehouses laden with snow?\nWho imagined the sun and gives source to its light?\nYet conceals it to bring us the coolness of night\nNone can fathom' },
        ]),

        // ================ Don Moen ================

        sng('seed_dm_god_will_make_a_way', 'God Will Make a Way', 'Don Moen', 'C', '458317', 'worship', [
          { label: 'Verse 1', text: 'God will make a way\nWhere there seems to be no way\nHe works in ways we cannot see\nHe will make a way for me\nHe will be my guide\nHold me closely to His side\nWith love and strength for each new day\nHe will make a way, He will make a way' },
          { label: 'Verse 2', text: 'By a roadway in the wilderness, He’ll lead me\nAnd rivers in the desert will I see\nHeaven and earth will fade\nBut His Word will still remain\nHe will do something new today' },
        ]),

        sng('seed_dm_i_will_sing', 'I Will Sing', 'Don Moen', 'G', '2994307', 'worship', [
          { label: 'Verse 1', text: 'I will sing, I will sing a song unto the Lord\nI will sing, I will sing a song unto the Lord\nI will sing, I will sing a song unto the Lord\nAllelu, Alleluia, glory to the Lord' },
          { label: 'Verse 2', text: 'We will come, we will come as one before the Lord\nWe will come, we will come as one before the Lord\nWe will come, we will come as one before the Lord\nAllelu, Alleluia, glory to the Lord' },
        ]),

        sng('seed_dm_give_thanks', 'Give Thanks', 'Henry Smith', 'D', '20285', 'worship', [
          { label: 'Chorus',  text: 'Give thanks with a grateful heart\nGive thanks to the Holy One\nGive thanks because He’s given\nJesus Christ, His Son' },
          { label: 'Verse 1', text: 'And now let the weak say, "I am strong"\nLet the poor say, "I am rich"\nBecause of what the Lord has done for us' },
        ]),

        // ================ Matt Redman ================

        sng('seed_mr_blessed_be_your_name', 'Blessed Be Your Name', 'Matt Redman', 'A', '3798438', 'worship', [
          { label: 'Verse 1', text: 'Blessed be Your name\nIn the land that is plentiful\nWhere Your streams of abundance flow\nBlessed be Your name' },
          { label: 'Verse 2', text: 'Blessed be Your name\nWhen I’m found in the desert place\nThough I walk through the wilderness\nBlessed be Your name' },
          { label: 'Pre-Chorus', text: 'Every blessing You pour out, I’ll\nTurn back to praise\nWhen the darkness closes in, Lord\nStill I will say' },
          { label: 'Chorus',  text: 'Blessed be the name of the Lord\nBlessed be Your name\nBlessed be the name of the Lord\nBlessed be Your glorious name' },
          { label: 'Bridge',  text: 'You give and take away\nYou give and take away\nMy heart will choose to say\nLord, blessed be Your name' },
        ]),

        sng('seed_mr_heart_of_worship', 'Heart of Worship', 'Matt Redman', 'E', '2296522', 'worship', [
          { label: 'Verse 1', text: 'When the music fades\nAll is stripped away\nAnd I simply come\nLonging just to bring\nSomething that’s of worth\nThat will bless Your heart' },
          { label: 'Pre-Chorus', text: 'I’ll bring You more than a song\nFor a song in itself\nIs not what You have required\nYou search much deeper within\nThrough the way things appear\nYou’re looking into my heart' },
          { label: 'Chorus',  text: 'I’m coming back to the heart of worship\nAnd it’s all about You, it’s all about You, Jesus\nI’m sorry, Lord, for the thing I’ve made it\nWhen it’s all about You, it’s all about You, Jesus' },
          { label: 'Verse 2', text: 'King of endless worth\nNo one could express\nHow much You deserve\nThough I’m weak and poor\nAll I have is Yours\nEvery single breath' },
        ]),

        sng('seed_mr_you_never_let_go', 'You Never Let Go', 'Matt Redman', 'Ab', '4674166', 'worship', [
          { label: 'Verse 1', text: 'Even though I walk through the valley\nOf the shadow of death\nYour perfect love is casting out fear\nAnd even when I’m caught in the middle\nOf the storms of this life\nI won’t turn back, I know You are near' },
          { label: 'Pre-Chorus', text: 'And I will fear no evil\nFor my God is with me\nAnd if my God is with me\nWhom then shall I fear?\nWhom then shall I fear?' },
          { label: 'Chorus',  text: 'Oh no, You never let go\nThrough the calm and through the storm\nOh no, You never let go\nIn every high and every low\nOh no, You never let go\nLord, You never let go of me' },
        ]),

        // ================ Kari Jobe ================

        sng('seed_kj_revelation_song', 'Revelation Song', 'Jennie Lee Riddle', 'D', '4447960', 'worship', [
          { label: 'Verse 1', text: 'Worthy is the Lamb who was slain\nHoly, holy is He\nSing a new song to Him who sits on\nHeaven’s mercy seat' },
          { label: 'Chorus',  text: 'Holy, holy, holy is the Lord God Almighty\nWho was and is and is to come\nWith all creation I sing\nPraise to the King of kings\nYou are my everything\nAnd I will adore You' },
          { label: 'Verse 2', text: 'Clothed in rainbows of living color\nFlashes of lightning, rolls of thunder\nBlessing and honor, strength and glory and power be\nTo You, the only wise King' },
          { label: 'Verse 3', text: 'Filled with wonder, awestruck wonder\nAt the mention of Your name\nJesus, Your name is power, breath, and living water\nSuch a marvelous mystery' },
        ]),

        sng('seed_kj_forever_we_sing_hallelujah', 'Forever (We Sing Hallelujah)', 'Kari Jobe / Brian Johnson', 'Eb', '7001228', 'worship', [
          { label: 'Verse 1', text: 'The moon and stars they wept\nThe morning sun was dead\nThe Savior of the world was fallen\nHis body on the cross\nHis blood poured out for us\nThe weight of every curse upon Him' },
          { label: 'Pre-Chorus', text: 'One final breath He gave\nAs heaven looked away\nThe Son of God was laid in darkness\nA battle in the grave\nThe war on death was waged\nThe power of Hell forever broken' },
          { label: 'Chorus',  text: 'Forever He is glorified\nForever He is lifted high\nForever He is risen\nHe is alive, He is alive' },
          { label: 'Bridge',  text: 'We sing Hallelujah\nWe sing Hallelujah\nWe sing Hallelujah\nThe Lamb has overcome' },
        ]),

        // ================ Elevation Worship ================

        sng('seed_ew_o_come_to_the_altar', 'O Come to the Altar', 'Elevation Worship', 'B', '7051511', 'worship', [
          { label: 'Verse 1', text: 'Are you hurting and broken within?\nOverwhelmed by the weight of your sin?\nJesus is calling\nHave you come to the end of yourself?\nDo you thirst for a drink from the well?\nJesus is calling' },
          { label: 'Chorus',  text: 'O come to the altar\nThe Father’s arms are open wide\nForgiveness was bought with\nThe precious blood of Jesus Christ' },
          { label: 'Verse 2', text: 'Leave behind your regrets and mistakes\nCome today, there’s no reason to wait\nJesus is calling\nBring your sorrows and trade them for joy\nFrom the ashes a new life is born\nJesus is calling' },
          { label: 'Bridge',  text: 'Oh, what a Savior\nIsn’t he wonderful?\nSing Hallelujah, Christ is risen\nBow down before Him\nFor He is Lord of all\nSing Hallelujah, Christ is risen' },
        ]),

        sng('seed_ew_the_blessing', 'The Blessing', 'Elevation Worship / Kari Jobe / Cody Carnes', 'A', '7147007', 'worship', [
          { label: 'Verse 1', text: 'The Lord bless you and keep you\nMake His face shine upon you\nAnd be gracious to you\nThe Lord turn His face toward you\nAnd give you peace' },
          { label: 'Chorus',  text: 'Amen, amen, amen\nAmen, amen, amen' },
          { label: 'Bridge',  text: 'May His favor be upon you\nAnd a thousand generations\nAnd your family and your children\nAnd their children, and their children\nMay His presence go before you\nAnd behind you, and beside you\nAll around you, and within you\nHe is with you, He is with you' },
        ]),

        sng('seed_ew_do_it_again', 'Do It Again', 'Elevation Worship', 'G', '7067555', 'worship', [
          { label: 'Verse 1', text: 'Walking around these walls\nI thought by now they’d fall\nBut You have never failed me yet\nWaiting for change to come\nKnowing the battle’s won\nFor You have never failed me yet' },
          { label: 'Chorus',  text: 'Your promise still stands\nGreat is Your faithfulness, faithfulness\nI’m still in Your hands\nThis is my confidence, You’ve never failed me yet' },
          { label: 'Verse 2', text: 'I know the night won’t last\nYour Word will come to pass\nMy heart will sing Your praise again\nJesus, You’re still enough\nKeep me within Your love\nMy heart will sing Your praise again' },
          { label: 'Bridge',  text: 'I’ve seen You move, come move the mountains\nAnd I believe, I’ll see You do it again\nYou made a way, where there was no way\nAnd I believe, I’ll see You do it again' },
        ]),

        // ================ Bethel Music ================

        sng('seed_bm_reckless_love', 'Reckless Love', 'Cory Asbury', 'F', '7089641', 'worship', [
          { label: 'Verse 1', text: 'Before I spoke a word, You were singing over me\nYou have been so, so good to me\nBefore I took a breath, You breathed Your life in me\nYou have been so, so kind to me' },
          { label: 'Chorus',  text: 'Oh, the overwhelming, never-ending, reckless love of God\nOh, it chases me down, fights till I’m found, leaves the ninety-nine\nI couldn’t earn it, I don’t deserve it\nStill, You give Yourself away\nOh, the overwhelming, never-ending, reckless love of God' },
          { label: 'Verse 2', text: 'When I was Your foe, still Your love fought for me\nYou have been so, so good to me\nWhen I felt no worth, You paid it all for me\nYou have been so, so kind to me' },
          { label: 'Bridge',  text: 'There’s no shadow You won’t light up\nMountain You won’t climb up\nComing after me\nThere’s no wall You won’t kick down\nLie You won’t tear down\nComing after me' },
        ]),

        sng('seed_bm_no_longer_slaves', 'No Longer Slaves', 'Bethel Music', 'C', '7030123', 'worship', [
          { label: 'Verse 1', text: 'You unravel me with a melody\nYou surround me with a song\nOf deliverance from my enemies\nTill all my fears are gone' },
          { label: 'Chorus',  text: 'I’m no longer a slave to fear\nI am a child of God\nI’m no longer a slave to fear\nI am a child of God' },
          { label: 'Verse 2', text: 'From my mother’s womb\nYou have chosen me\nLove has called my name\nI’ve been born again into Your family\nYour blood flows through my veins' },
          { label: 'Bridge',  text: 'You split the sea so I could walk right through it\nMy fears were drowned in perfect love\nYou rescued me and I could stand and sing\nI am a child of God' },
        ]),

        sng('seed_bm_goodness_of_god', 'Goodness of God', 'Bethel Music / CeCe Winans', 'A', '7117726', 'worship', [
          { label: 'Verse 1', text: 'I love You, Lord\nOh, Your mercy never fails me\nAll my days, I’ve been held in Your hands\nFrom the moment that I wake up\nUntil I lay my head\nI will sing of the goodness of God' },
          { label: 'Chorus',  text: 'All my life You have been faithful\nAll my life You have been so, so good\nWith every breath that I am able\nI will sing of the goodness of God' },
          { label: 'Verse 2', text: 'I love Your voice\nYou have led me through the fire\nIn darkest night, You are close like no other\nI’ve known You as a Father\nI’ve known You as a Friend\nI have lived in the goodness of God' },
          { label: 'Bridge',  text: 'Your goodness is running after, it’s running after me\nYour goodness is running after, it’s running after me\nWith my life laid down, I’m surrendered now\nI give You everything\nYour goodness is running after, it’s running after me' },
        ]),

        // ================ Phil Wickham ================

        sng('seed_pw_living_hope', 'Living Hope', 'Phil Wickham', 'Bb', '7106807', 'worship', [
          { label: 'Verse 1', text: 'How great the chasm that lay between us\nHow high the mountain I could not climb\nIn desperation, I turned to heaven\nAnd spoke Your name into the night\nThen through the darkness, Your loving-kindness\nTore through the shadows of my soul\nThe work is finished, the end is written\nJesus Christ, my living hope' },
          { label: 'Verse 2', text: 'Who could imagine so great a mercy?\nWhat heart could fathom such boundless grace?\nThe God of ages stepped down from glory\nTo wear my sin and bear my shame\nThe cross has spoken, I am forgiven\nThe King of kings calls me His own\nBeautiful Savior, I’m Yours forever\nJesus Christ, my living hope' },
          { label: 'Chorus',  text: 'Hallelujah, praise the One who set me free\nHallelujah, death has lost its grip on me\nYou have broken every chain\nThere’s salvation in Your name\nJesus Christ, my living hope' },
          { label: 'Bridge',  text: 'Jesus, Yours is the victory' },
        ]),

        sng('seed_pw_great_things', 'Great Things', 'Phil Wickham', 'G', '7111321', 'worship', [
          { label: 'Verse 1', text: 'Come let us worship our King\nCome let us bow at His feet\nHe has done great things\nSee what our Savior has done\nSee how His love overcomes\nHe has done great things, He has done great things' },
          { label: 'Chorus',  text: 'Oh hero of Heaven, You conquered the grave\nYou free every captive and break every chain\nOh God, You have done great things\nWe dance in Your freedom, awake and alive\nOh Jesus, our Savior, Your name lifted high\nOh God, You have done great things' },
          { label: 'Verse 2', text: 'You’ve been faithful through every storm\nYou’ll be faithful forevermore\nYou have done great things\nAnd I know You will do it again\nFor Your promise is "Yes and amen"\nYou will do great things, God, You do great things' },
          { label: 'Bridge',  text: 'Hallelujah, God above it all\nHallelujah, God unshakable\nHallelujah, You have done great things' },
        ]),

        sng('seed_pw_this_is_amazing_grace', 'This Is Amazing Grace', 'Phil Wickham / Jeremy Riddle / Josh Farro', 'G', '6333821', 'worship', [
          { label: 'Verse 1', text: 'Who breaks the power of sin and darkness?\nWhose love is mighty and so much stronger?\nThe King of Glory, the King above all kings' },
          { label: 'Verse 2', text: 'Who shakes the whole earth with holy thunder?\nAnd leaves us breathless in awe and wonder?\nThe King of Glory, the King above all kings' },
          { label: 'Chorus',  text: 'This is amazing grace\nThis is unfailing love\nThat You would take my place\nThat You would bear my cross\nYou laid down Your life\nThat I would be set free\nOh, Jesus, I sing for\nAll that You’ve done for me' },
          { label: 'Verse 3', text: 'Who brings our chaos back into order?\nWho makes the orphan a son and daughter?\nThe King of Glory, the King of Glory\nWho rules the nations with truth and justice?\nShines like the sun in all of its brilliance?\nThe King of Glory, the King above all kings' },
          { label: 'Bridge',  text: 'Worthy is the Lamb who was slain\nWorthy is the King who conquered the grave\nWorthy is the Lamb who was slain\nWorthy is the King who conquered the grave' },
        ]),

        // ================ Jesus Culture / Others ================

        sng('seed_jc_how_he_loves', 'How He Loves', 'John Mark McMillan', 'B', '5032549', 'worship', [
          { label: 'Verse 1', text: 'He is jealous for me\nLoves like a hurricane, I am a tree\nBending beneath the weight of His wind and mercy\nWhen all of a sudden\nI am unaware of these afflictions eclipsed by glory\nAnd I realize just how beautiful You are\nAnd how great Your affections are for me' },
          { label: 'Chorus',  text: 'Oh, how He loves us so\nOh, how He loves us\nHow He loves us so' },
          { label: 'Verse 2', text: 'We are His portion and He is our prize\nDrawn to redemption by the grace in His eyes\nIf grace is an ocean, we’re all sinking\nSo Heaven meets earth like an unforeseen kiss\nAnd my heart turns violently inside of my chest\nI don’t have time to maintain these regrets\nWhen I think about the way\nHe loves us' },
        ]),

        // ================ Keith & Kristyn Getty ================

        sng('seed_gt_in_christ_alone', 'In Christ Alone', 'Keith Getty / Stuart Townend', 'D', '3350395', 'worship', [
          { label: 'Verse 1', text: 'In Christ alone my hope is found\nHe is my light, my strength, my song\nThis Cornerstone, this solid ground\nFirm through the fiercest drought and storm\nWhat heights of love, what depths of peace\nWhen fears are stilled, when strivings cease\nMy Comforter, my All in All\nHere in the love of Christ I stand' },
          { label: 'Verse 2', text: 'In Christ alone, who took on flesh\nFullness of God in helpless babe\nThis gift of love and righteousness\nScorned by the ones He came to save\nTill on that cross as Jesus died\nThe wrath of God was satisfied\nFor every sin on Him was laid\nHere in the death of Christ I live' },
          { label: 'Verse 3', text: 'There in the ground His body lay\nLight of the world by darkness slain\nThen bursting forth in glorious day\nUp from the grave He rose again\nAnd as He stands in victory\nSin’s curse has lost its grip on me\nFor I am His and He is mine\nBought with the precious blood of Christ' },
          { label: 'Verse 4', text: 'No guilt in life, no fear in death\nThis is the power of Christ in me\nFrom life’s first cry to final breath\nJesus commands my destiny\nNo power of hell, no scheme of man\nCan ever pluck me from His hand\nTill He returns or calls me home\nHere in the power of Christ I’ll stand' },
        ]),

        // ================ More Hillsong ================

        sng('seed_hs_from_the_inside_out', 'From the Inside Out', 'Joel Houston', 'E', '4705176', 'worship', [
          { label: 'Verse 1', text: 'A thousand times I’ve failed\nStill Your mercy remains\nAnd should I stumble again\nStill I’m caught in Your grace\nEverlasting, Your light will shine when all else fades\nNever ending, Your glory goes beyond all fame' },
          { label: 'Chorus',  text: 'In my heart, in my soul\nLord I give You control\nConsume me from the inside out, Lord\nLet justice and praise\nBecome my embrace\nTo love You from the inside out' },
          { label: 'Verse 2', text: 'Your will above all else, my purpose remains\nThe art of losing myself in bringing You praise\nEverlasting, Your light will shine when all else fades\nNever ending, Your glory goes beyond all fame' },
          { label: 'Bridge',  text: 'Everlasting, Your light will shine when all else fades\nNever ending, Your glory goes beyond all fame\nAnd the cry of my heart is to bring You praise\nFrom the inside out, Lord, my soul cries out' },
        ]),

        // ================ Tim Hughes ================

        sng('seed_th_here_i_am_to_worship', 'Here I Am to Worship', 'Tim Hughes', 'E', '3266032', 'worship', [
          { label: 'Verse 1', text: 'Light of the world\nYou stepped down into darkness\nOpened my eyes, let me see\nBeauty that made this heart adore You\nHope of a life spent with You' },
          { label: 'Chorus',  text: 'Here I am to worship\nHere I am to bow down\nHere I am to say that You’re my God\nYou’re altogether lovely\nAltogether worthy\nAltogether wonderful to me' },
          { label: 'Verse 2', text: 'King of all days\nOh so highly exalted\nGlorious in heaven above\nHumbly You came to the earth You created\nAll for love’s sake became poor' },
          { label: 'Bridge',  text: 'I’ll never know how much it cost\nTo see my sin upon that cross\nI’ll never know how much it cost\nTo see my sin upon that cross' },
        ]),

        // ================ Paul Baloche ================

        sng('seed_pb_open_the_eyes', 'Open the Eyes of My Heart', 'Paul Baloche', 'A', '2298355', 'worship', [
          { label: 'Verse 1', text: 'Open the eyes of my heart, Lord\nOpen the eyes of my heart\nI want to see You\nI want to see You' },
          { label: 'Chorus',  text: 'To see You high and lifted up\nShining in the light of Your glory\nPour out Your power and love\nAs we sing holy, holy, holy' },
          { label: 'Bridge',  text: 'Holy, holy, holy\nHoly, holy, holy\nHoly, holy, holy\nI want to see You' },
        ]),

        sng('seed_pb_above_all', 'Above All', 'Lenny LeBlanc / Paul Baloche', 'F', '2672885', 'worship', [
          { label: 'Verse 1', text: 'Above all powers, above all kings\nAbove all nature and all created things\nAbove all wisdom and all the ways of man\nYou were here before the world began' },
          { label: 'Verse 2', text: 'Above all kingdoms, above all thrones\nAbove all wonders the world has ever known\nAbove all wealth and treasures of the earth\nThere’s no way to measure what You’re worth' },
          { label: 'Chorus',  text: 'Crucified, laid behind the stone\nYou lived to die, rejected and alone\nLike a rose trampled on the ground\nYou took the fall, and thought of me\nAbove all' },
        ]),

        // ================ Rick Founds / Classic ================

        sng('seed_rf_lord_i_lift_your_name', 'Lord, I Lift Your Name on High', 'Rick Founds', 'A', '117947', 'worship', [
          { label: 'Chorus',  text: 'Lord, I lift Your name on high\nLord, I love to sing Your praises\nI’m so glad You’re in my life\nI’m so glad You came to save us' },
          { label: 'Verse',   text: 'You came from heaven to earth\nTo show the way\nFrom the earth to the cross\nMy debt to pay\nFrom the cross to the grave\nFrom the grave to the sky\nLord, I lift Your name on high' },
        ]),
      ];
    },

    // Operator-curated Tagalog worship songs. Each has a `paw_tl_*` id so
    // it can never collide with the old auto-generated `seed_tl_*` scaffolds
    // (which were purged). Add new songs to this array — once committed,
    // every fresh install ships with them (and existing installs pick them
    // up on next reload via the seededStarterV7 gate).
    _v7Seeds(sng) {
      const tl = (id, title, author, key, ccli, category, sections) => {
        const s = sng(id, title, author, key, ccli, category, sections);
        s.language = 'tl';
        return s;
      };

      return [
        tl('paw_tl_banal_mong_tahanan', 'Banal Mong Tahanan', 'Hannah Abogado', '', '', 'worship', [
          { label: 'Verse', text: 'Ang puso ko\'y dinudulog sa \'Yo\nNagpapakumbaba, nagsusumamo\nPagindapatin Mong Ikaw ay mamasdan\nMakaniig Ka at sa \'Yo ay pumisan\nAng puso ko\'y dinudulog sa \'Yo\nNagpapakumbaba, nagsusumamo\nPagindapatin Mong Ikaw ay mamasdan\nMakaniig Ka at sa \'Yo ay pumisan' },
          { label: 'Chorus', text: 'Loobin Mong ang buhay ko\'y maging banal Mong tahanan\nLuklukan ng Iyong wagas na pagsinta\nDaluyan ng walang-hanggang mga papuri\'t pagsamba\nMaghari Ka, O Diyos, ngayon at kailanman' },
          { label: 'Verse', text: 'Ang puso ko\'y dinudulog sa \'Yo\nNagpapakumbaba, nagsusumamo\nPagindapatin Mong Ikaw ay mamasdan\nMakaniig Ka at sa \'Yo ay pumisan' },
          { label: 'Chorus', text: 'Loobin Mong ang buhay ko\'y maging banal Mong tahanan\nLuklukan ng Iyong wagas na pagsinta\nDaluyan ng walang-hanggang mga papuri\'t pagsamba\nMaghari Ka, O Diyos, ngayon at kailanman\nMaghari Ka, O Diyos, ngayon at kailanman\nMaghari Ka, O Diyos, ngayon at kailanman' },
        ]),

        tl('paw_tl_diyos_ka_sa_amin', 'Diyos Ka sa Amin', 'Hope Filipino Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'O Diyos, Ikaw ang tunay na dakila sa mundo\nIkaw ang Haring nagmahal ng tulad ko\nGinawa Mo\'ng lahat, pag-ibig Mo ay tapat at wagas' },
          { label: 'Verse 2', text: 'O Diyos, wala nang papantay sa kabutihan Mo\nAng ngalan Mo\'y itataas sa buhay ko\nSundin ang loob Mo, iparinig ang nais Mo' },
          { label: 'Chorus', text: 'Sa lahat ng panahon, Diyos Ka sa amin\nSa lahat ng oras, nariyan para sa \'min\nPanginoong Hesus, purihin Ka\nDakilain Ka sa buhay ko, aming Ama' },
          { label: 'Verse 3', text: 'O Diyos, Ikaw ang tunay na dakila sa mundo\nIkaw ang Haring nagmahal ng tulad ko\nSundin ang loob Mo, iparinig ang nais Mo' },
          { label: 'Chorus', text: 'Sa lahat ng panahon, Diyos Ka sa amin\nSa lahat ng oras, nariyan para sa \'min\nPanginoong Hesus, purihin Ka\nDakilain Ka sa buhay ko\nSa lahat ng panahon, Diyos Ka sa amin\nSa lahat ng oras, nariyan para sa \'min\nPanginoong Hesus, purihin Ka\nDakilain Ka sa buhay ko, aming Ama' },
          { label: 'Chorus', text: 'Sa lahat ng panahon, Diyos Ka sa amin\nSa lahat ng oras, nariyan para sa \'min\nPanginoong Hesus, purihin Ka\nDakilain Ka sa buhay ko\n\'Di nagbabago, Diyos Ka sa amin\nTanging sandigan, nariyan para sa \'min\nPanginoong Hesus, maghari Ka\nMagliwanag Ka sa buhay ko, aming Ama' },
        ]),

        tl('paw_tl_pupurihin_ka_sa_awit', 'Pupurihin Ka sa Awit', 'Musikatha', '', '', 'worship', [
          { label: 'Verse', text: 'Walang-hanggang katapatan\nSa buhay ko\'y lagi Mong laan\nNarito dahil sa biyaya Mo\nHabang-buhay magpupuri sa \'Yo' },
          { label: 'Chorus', text: 'Pupurihin Ka sa awit, itataas ang aking tinig\nItatanghal sa buhay ko\'y tanging Ikaw, O Diyos\nHigit pa sa kalangitan ang Iyong kaluwalhatian\nKadakilaan Mo\'y \'di mapapantayan' },
          { label: 'Verse', text: 'Walang-hanggang katapatan\nSa buhay ko\'y lagi Mong laan\nNarito dahil sa biyaya Mo\nHabang-buhay magpupuri sa \'Yo' },
          { label: 'Chorus', text: 'Pupurihin Ka sa awit, itataas ang aking tinig\nItatanghal sa buhay ko\'y tanging Ikaw, O Diyos\nHigit pa sa kalangitan ang Iyong kaluwalhatian\nKadakilaan Mo\'y \'di mapapantayan' },
          { label: 'Bridge', text: 'Hesus, sa \'Yo ang kapurihan\nKaluwalhatian ngayon at magpakailanman\nHesus, sa \'Yo ang karangalan\nKapangyarihan ngayon at magpakailanman' },
          { label: 'Chorus', text: 'Pupurihin Ka sa awit (Pupurihin), itataas ang aking tinig\nItatanghal sa buhay ko\'y tanging Ikaw, O Diyos\nHigit pa sa kalangitan ang Iyong kaluwalhatian\nKadakilaan Mo\'y \'di mapapantayan' },
          { label: 'Interlude', text: 'O Hesus\nSama-sama Ka naming niluluwalhati\'t pinupuri, O Diyos' },
          { label: 'Chorus', text: 'Pupurihin Ka sa awit (Pupurihin), itataas ang aking tinig (Itataas)\nItatanghal sa buhay ko\'y tanging Ikaw, O Diyos\nHigit pa sa kalangitan ang Iyong kaluwalhatian\nKadakilaan Mo\'y \'di mapapantayan, Hesus' },
          { label: 'Interlude', text: 'Sa \'Yo ang karangalan, kapurihan\nKaluwalhatian, kapangyarihan\nO Hesus, sa \'Yo\nIka\'y karapat-dapat sa aming papuri, O Hesus\nLuwalhati sa \'Yo\nPanginoon, sa \'Yo kami nag-aalay\nNg pinakamataas na papuri\'t pagsamba\nTanggapin mo, O Diyos' },
          { label: 'Bridge', text: 'Hesus, sa \'Yo ang kapurihan\nKaluwalhatian ngayon at magpakailanman\nHesus, sa \'Yo ang karangalan (Ang karangalan)\nKapangyarihan ngayon (O sa \'Yo) at magpakailanman' },
          { label: 'Chorus', text: 'Pupurihin Ka sa awit, itataas ang aking tinig\nItatanghal sa buhay ko\'y tanging Ikaw, O Diyos (Tanging Ikaw)\nHigit pa sa kalangitan ang Iyong kaluwalhatian (Higit pa sa lahat ng bagay)\nKadakilaan Mo\'y \'di mapapantayan (Ang Iyong kadakilaa\'y walang kapantay)\nO Hesus, O Hesus' },
          { label: 'Outro', text: 'Purihin Ka, O Diyos\nLuwalhati\'t pagsamba sa \'Yo\nHallelujah' },
        ]),

        tl('paw_tl_walang_hanggang_sasambahin', 'Walang Hanggang Sasambahin', 'Faithmusic Manila', '', '', 'worship', [
          { label: 'Verse 1', text: 'Nais kong Ika’y maranasan\nPagkilos Mo’y aking inaasam\nPagkat sa Iyo ko lang natagpuan\nAng tunay na kagalakan' },
          { label: 'Verse 2', text: 'Nais kong Ika’y maranasan\nTibok ng puso ko’y Ikaw lamang\nKaya’t ngayon, bukas at kailanman\nPagsamba ko’y iaalay' },
          { label: 'Chorus', text: 'Walang hanggang Kitang pupurihin\nWalang hanggang sasambahin\nBuong laman ng puso kong ito\nAy mamalagi Sa’yo' },
          { label: 'Chorus', text: 'Walang hanggang Kitang pupurihin\nWalang hanggang sasambahin\nBuong laman ng puso kong ito\nAy mamalagi Sa’yo' },
        ]),

        tl('paw_tl_lilim', 'Lilim (In Your Shelter)', 'Victory Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'Panginoon, ang nais ko\nKagandahan Mo ay pagmasdan\nAng pag-ibig Mo sa \'ki\'y tugon\nKailanma\'y \'di pababayaan' },
          { label: 'Pre-Chorus', text: 'Sa Iyo lamang matatagpuan\nSa Iyo lamang' },
          { label: 'Chorus', text: 'Mananatili sa Iyong lilim\nAt sasambahin Ka sa dakong lihim\nMananatili sa Iyong lilim\nNang masumpungan Ka sa dakong lihim' },
          { label: 'Verse 2', text: 'Panginoon, ang ngalan Mo\nAy kalinga at sandigan ko\n\'Di nagbabago pangako Mo\nSalita Mo\'y panghahawakan' },
          { label: 'Pre-Chorus', text: 'Sa Iyo lamang matatagpuan\nSa Iyo lamang' },
          { label: 'Chorus', text: 'Mananatili sa Iyong lilim\nAt sasambahin Ka sa dakong lihim\nMananatili sa Iyong lilim\nNang masumpungan Ka sa dakong lihim\nMananatili sa Iyong lilim\nAt sasambahin Ka sa dakong lihim\nMananatili sa Iyong lilim\nNang masumpungan Ka sa dakong lihim' },
          { label: 'Bridge', text: 'Ang pagpuri ko ay tanging sa \'Yo\nSa \'Yo lamang iniaalay\nO Panginoon, ang puso ko\nSa \'Yo magpakailanman\nAng pagpuri ko ay tanging sa \'Yo\nSa \'Yo lamang iniaalay\nO Panginoon, ang puso ko\nSa \'Yo magpakailanman' },
          { label: 'Chorus', text: 'Mananatili sa Iyong lilim\nAt sasambahin Ka sa dakong lihim\nMananatili sa Iyong lilim\nNang masumpungan Ka sa dakong lihim\nMananatili sa Iyong lilim\nAt sasambahin Ka sa dakong lihim\nMananatili sa Iyong lilim\nNang masumpungan Ka sa dakong lihim' },
        ]),

        tl('paw_tl_maghari', 'Maghari', 'Victory Worship', '', '', 'worship', [
          { label: 'Verse', text: 'Sa gitna ng kaguluhan, ang tinig Mo ay hanap\nSa templo Mong banal, may bagong kagalakan\nAng tanging mananatili ay ang Iyong sinabi\nSa kataas-taasan, Ikaw pa rin ang Hari' },
          { label: 'Chorus', text: 'Dakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka' },
          { label: 'Verse', text: 'Sa gitna ng kaguluhan, ang tinig Mo ay hanap\nSa templo Mong banal, may bagong kagalakan\nAng tanging mananatili ay ang Iyong sinabi\n(Sa kataas-taasan) Sa kataas-taasan, Ikaw pa rin ang Hari' },
          { label: 'Chorus', text: 'Dakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka, oh' },
          { label: 'Bridge', text: 'Sundin ang loob Mo dito sa lupa, tulad ng sa langit\nSa \'Yo ang kaharian, kapangyarihan, at kaluwalhatian\nSundin ang loob Mo dito sa lupa, tulad ng sa langit\nSa \'Yo ang kaharian, kapangyarihan, at kaluwalhatian' },
          { label: 'Chorus', text: 'Dakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka\nDakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka' },
          { label: 'Interlude', text: 'Maghari Ka' },
          { label: 'Chorus', text: 'Dakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka\n(Sino ang makapangyarihan? Sino ang dakila? Awitin natin)\nDakila at kailanma\'y \'di mahihigitan\nAng ngalan Mo ay kaligtasan ko\n(Ang Iyong kaharian)\nAng Iyong kaharian ang aking adhika\nO Diyos, dalangin ko\'y maghari Ka\n(Sabay-sabay, "Sundin ang loob Mo")' },
        ]),

        tl('paw_tl_dakilang_pag_ibig', 'Dakilang Pag-ibig', 'Victory Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'Ako\'y Iyong natagpuan\nSa gitna ng aking kasawian\nNiligtas sa kamatayan\nInakay sa liwanag ng \'Yong pagmamahal' },
          { label: 'Verse 2', text: 'Pinalaya ng Iyong habag\nSa dilim at sa \'king pagkabulag\nNgayon, sa \'Yong biyaya at sa lalim ng pag-ibig\nUmaawit' },
          { label: 'Chorus', text: 'Ang buhay ko\'y tanging sa \'Yo\nLaging sa \'Yo iaalay\nAng puso ko\'y tanging sa \'Yo\nLaging sa \'Yo, Panginoon' },
          { label: 'Verse 3', text: 'Walang ibang kaligtasan\nSa \'Yo, lubos ang kagalingan\nHesus, ako\'y nabihag sa dakila Mong pag-ibig\nUmaawit' },
          { label: 'Chorus', text: 'Ang buhay ko\'y tanging sa \'Yo\nLaging sa \'Yo iaalay\nAng puso ko\'y tanging sa \'Yo\nLaging sa \'Yo, Panginoon\nAng buhay ko\'y tanging sa \'Yo\nLaging sa \'Yo iaalay\nAng puso ko\'y tanging sa \'Yo\nLaging sa \'Yo, Panginoon' },
        ]),

        tl('paw_tl_dakilang_katapatan', 'Dakilang Katapatan', 'PAPURI! & Victory Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'Sadyang kay buti ng ating Panginoon\nMagtatapat sa habang panahon\nMaging sa kabila ng ating pagkukulang\nBiyaya Niya\'y patuloy na laan' },
          { label: 'Verse 2', text: 'Katulad ng pagsinag ng gintong araw\nPatuloy Siyang nagbibigay tanglaw\nKaya sa puso ko\'t damdamin\nKatapatan Niya\'y aking pupurihin' },
          { label: 'Chorus', text: 'Dakila Ka, O Diyos, tapat Ka ngang tunay\nMagmula pa sa ugat ng aming lahi\nMundo\'y magunaw man, maaasahan Kang lagi\nMaging hanggang wakas nitong buhay' },
          { label: 'Verse 3', text: 'Kaya, O Diyos, Ika\'y aking pupurihin\nSa buong mundo\'y aking aawitin\nDakila ang Iyong katapatan\nPag-ibig Mo\'y walang-hanggan' },
          { label: 'Chorus', text: 'Dakila Ka, O Diyos, tapat Ka ngang tunay\nMagmula pa sa ugat ng aming lahi\nMundo\'y magunaw man, maaasahan Kang lagi\nMaging hanggang wakas nitong buhay\nDakila Ka, O Diyos, tapat Ka ngang tunay\nMagmula pa sa ugat ng aming lahi\nMundo\'y magunaw man, maaasahan Kang lagi\nMaging hanggang wakas nitong buhay' },
          { label: 'Interlude', text: 'Dakila\nDakila Ka, O Diyos\nWoah-oh\nWoah-oh\nWoah-oh' },
          { label: 'Chorus', text: 'Dakila Ka, O Diyos, tapat Ka ngang tunay\nMagmula pa sa ugat ng aming lahi\nMundo\'y magunaw man, maaasahan Kang lagi\nMaging hanggang wakas nitong buhay\nDakila Ka, O Diyos, sa habang panahon\nKatapatan Mo\'y matibay na sandigan\nSa bawat pighati, tagumpay man ay naroon\nDaluyan ng pag-asa kung kailanga\'y hinahon\nPag-ibig Mo\'y alay sa \'min noon hanggang ngayon\nDakila Ka, O Diyos' },
          { label: 'Outro', text: 'Dakila\nDakila\nDakila Ka, O Diyos' },
        ]),

        tl('paw_tl_nararapat', 'Nararapat', 'Spring Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'Salamat sa dakila Mong pag-ibig\nSalamat sa pagyakap Mo, Ama\nAng presensiya Mo ang ninanais ko\nAng puso ko ay para lang sa \'Yo' },
          { label: 'Chorus', text: 'Nararapat Ka sa papuri, luwalhati, at pagsamba\nHesus, Ika\'y dakilain magpakailanman\nNararapat Ka sa papuri, luwalhati, at pagsamba\nItataas ang ngalan Mo, Ama' },
          { label: 'Interlude', text: 'Ooh, oh' },
          { label: 'Verse 2', text: 'Kailanma\'y hindi Ka nagbabago\nTiwala ko\'y ibibigay sa \'Yo\nMga pangako Mo panghahawakan ko\nMamamalagi sa kalinga Mo' },
          { label: 'Chorus', text: 'Nararapat Ka sa papuri, luwalhati, at pagsamba\nHesus, Ika\'y dakilain magpakailanman\nNararapat Ka sa papuri, luwalhati, at pagsamba\nItataas ang ngalan Mo, Ama\nNararapat Ka sa papuri, luwalhati, at pagsamba\nHesus, Ika\'y dakilain magpakailanman\nNararapat Ka sa papuri, luwalhati, at pagsamba\nItataas ang ngalan Mo, Ama, oh' },
        ]),

        tl('paw_tl_natagpuan', 'Natagpuan', 'Hope Filipino Worship', '', '', 'worship', [
          { label: 'Verse 1', text: 'Ang tinig Mo ay aking hanap-hanap\nSa gitna ng bawat takot at paghihirap\nSa kabila ng aking pagkukulang\nKatapatan Mo, O Diyos, tanging laan' },
          { label: 'Pre-Chorus', text: 'Sa puso at damdamin, Ika\'y mananatili\nWalang-hanggan ang alay Mong pag-ibig' },
          { label: 'Chorus', text: 'Natagpuan ng \'Yong pag-ibig na dakila\nDoon sa krus, ako\'y Iyong pinalaya\nHesus, ako\'y aawit ng walang-hanggang pagpupuri\nAng puso ko\'y sa \'Yo iaalay, ooh' },
          { label: 'Verse 2', text: 'Panginoon, Ikaw ang kaagapay\nKabutihan Mo sa \'ki\'y \'di nagkukulang\nPanginoon, Ikaw lang ang kailangan\nMagpakailanman, sa \'Yo ako\'y mananahan' },
          { label: 'Pre-Chorus', text: 'Sa puso at damdamin, Ika\'y mananatili\nWalang-hanggan ang alay Mong pag-ibig' },
          { label: 'Chorus', text: 'Natagpuan ng \'Yong pag-ibig na dakila\nDoon sa krus, ako\'y Iyong pinalaya\nHesus, ako\'y aawit ng walang-hanggang pagpupuri\nAng puso ko\'y sa \'Yo iaalay' },
          { label: 'Bridge', text: 'Hangad ko lang ay mamalagi sa presensiya Mo\nNatagpuan, ako\'y binago ng pag-ibig Mo\nHangad ko lang ay mamalagi sa presensiya Mo\nLuwalhatiin ang pangalan Mo\nHangad ko\'y Ikaw, O Diyos\nHangad ko lang ay mamalagi sa presensiya Mo\nNatagpuan, ako\'y binago ng pag-ibig Mo\nHangad ko lang ay mamalagi sa presensiya Mo\nLuwalhatiin ang pangalan Mo' },
          { label: 'Chorus', text: 'Ako ay natagpuan ng \'Yong pag-ibig na dakila\nDoon sa krus, ako\'y Iyong pinalaya\nHesus, ako\'y aawit ng walang-hanggang pagpupuri\nAng puso ko\'y sa \'Yo' },
          { label: 'Bridge', text: 'Hangad ko lang ay mamalagi sa presensiya Mo\nNatagpuan, ako\'y binago ng pag-ibig Mo\nHangad ko lang ay mamalagi sa presensiya Mo\nLuwalhatiin ang pangalan Mo\nLuwalhatiin ang pangalan Mo, O Hesus\nLuwalhatiin ang pangalan Mo' },
        ]),

        tl('paw_tl_sukdulang_biyaya', 'Sukdulang Biyaya', 'Musikatha', '', '', 'worship', [
          { label: 'Verse', text: 'Habang hindi karapat-dapat\nPag-ukulan ng habag at wagas Mong pagsinta\nHabang walang kakayanan\nMasuklian Ka ng mabuti sa lahat Mong ginawa' },
          { label: 'Pre-Chorus', text: 'Niyakap Mo ako sa aking karumihan\nInibig Mo ako ng \'di kayang tumbasan' },
          { label: 'Chorus', text: 'O, Diyos ng katarungan at katuwiran\nNa kahit minsa\'y \'di nabahiran ang kabanala\'t kalwalhatian\nSalamat sa sukdulang biyaya Mo\nO, Diyos ng pag-ibig na mas malawak pa\nKaysa aking mga pagkakasala\nHigit pa sa buhay ko\nSalamat sa sukdulang biyaya Mo' },
          { label: 'Verse', text: 'Habang hindi karapat-dapat\nPag-ukulan ng habag at wagas Mong pagsinta\nHabang walang kakayanan\nMasuklian Ka ng mabuti sa lahat Mong ginawa' },
          { label: 'Pre-Chorus', text: 'Niyakap Mo ako sa aking karumihan\nInibig Mo ako ng \'di kayang tumbasan' },
          { label: 'Chorus', text: 'Oh, Diyos ng katarungan at katuwiran\nNa kahit minsa\'y \'di nabahiran ang kabanala\'t kalwalhatian\nSalamat sa sukdulang biyaya Mo\nO, Diyos ng pag-ibig na mas malawak pa\nKaysa aking mga pagkakasala\nHigit pa sa buhay ko\nSalamat sa sukdulang biyaya Mo (O, aking Diyos)' },
          { label: 'Pre-Chorus', text: 'Niyakap Mo ako sa aking karumihan\nInibig Mo ako ng \'di kayang tumbasan\nNiyakap Mo ako sa aking karumihan\nInibig Mo ako ng \'di kayang tumbasan' },
          { label: 'Chorus', text: 'O, Diyos ng katarungan at katuwiran\nNa kahit minsa\'y \'di nabahiran ang kabanala\'t kalwalhatian\nSalamat sa sukdulang biyaya Mo\nO, Diyos ng pag-ibig na mas malawak pa\nKaysa aking mga pagkakasala\nHigit pa sa buhay ko\nSalamat sa sukdulang biyaya Mo\nSalamat sa sukdulang biyaya Mo' },
          { label: 'Outro', text: 'O, salamat\nLuwalhati, papuri at pasasalamat sa Iyo, o, Diyos\nNapakayaman ng biyayang ipinadadaloy Mo sa aming mga buhay\nSalamat sa Iyong sukdulang biyaya\nHallelujah' },
        ]),

        tl('paw_tl_may_galak', 'May Galak', 'Musikatha', '', '', 'worship', [
          { label: 'Verse', text: 'May galak, may saya\nMay tuwa sa piling ng Diyos\nSapagkat hirap ng puso ay naglalaho\nMay awit, may sayaw\nAt papuri para sa Diyos\nNa hatid ng pusong pinagpala Niyang lubos' },
          { label: 'Chorus', text: 'Handog Niya ay kapayapaan\nHandog Niya ay kagalakan\nHandog Niya ay kalakasan\nSa bawat pusong napapagal\nKaya\'t ang awit ng papuri\nAwit ng pasasalamat\nAt ang awit ng pagsamba\nAy para lang sa Kaniya' },
        ]),

        tl('paw_tl_sayo', 'Sa\'yo', 'Musikatha', '', '', 'worship', [
          { label: 'Verse', text: 'O Diyos, sa \'Yo\'ng lahat ng pagsamba\'t luwalhati\nMaging ang pinakamainam kong awit ay aawitin sa \'Yo\nO Diyos, ang aking isipan ay pagharian Mo\nAt sa \'king puso ay hindi na maglaho tanging pag-ibig sa \'Yo' },
          { label: 'Chorus', text: 'Ano pa ba ang maihahandog ko\nLiban sa buhay kong nanggaling sa \'Yo?\nKung anuman sa sandaling ito\'y tangan\nAt mga bagay na tinuring kong yaman\nIto\'y hindi pa rin sapat sa alay na nararapat sa \'Yo' },
          { label: 'Verse', text: 'O Diyos, sa \'Yo\'ng lahat ng pagsamba\'t luwalhati\nMaging ang pinakamainam kong awit ay aawitin sa \'Yo\nO Diyos, ang aking isipan ay pagharian Mo\nAt sa \'king puso ay hindi na maglaho tanging pag-ibig sa \'Yo' },
          { label: 'Chorus', text: 'Ano pa ba ang maihahandog ko\nLiban sa buhay kong nanggaling sa \'Yo?\nKung anuman sa sandaling ito\'y tangan\nAt mga bagay na tinuring kong yaman\nIto\'y hindi pa rin sapat sa alay na nararapat sa \'Yo' },
          { label: 'Chorus', text: 'Ano pa ba ang maihahandog ko\nLiban sa buhay kong nanggaling sa \'Yo?\nKung anuman sa sandaling ito\'y tangan\nAt mga bagay na tinuring kong yaman\nIto\'y hindi pa rin sapat sa alay na nararapat\nIto\'y hindi pa rin sapat kahit ialay ang lahat sa \'Yo, sa \'Yo' },
        ]),
      ];
    },

    // =========================================================
    // Wiring
    // =========================================================

    _wireMenu() {
      $$('.menu-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._openMenu(btn);
        });
      });
      document.addEventListener('click', () => this._closeMenus());
    },

    _openMenu(anchor) {
      this._closeMenus();
      const name = anchor.dataset.menu;
      const rect = anchor.getBoundingClientRect();
      const entries = this._menuEntries(name);
      if (!entries.length) return;
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = (rect.bottom) + 'px';
      dd.innerHTML = entries.map(e => {
        if (e === 'sep') return '<div class="sep"></div>';
        return `<button data-action="${escapeAttr(e.action)}">
          <span>${escapeHtml(e.label)}</span>
          ${e.shortcut ? `<span class="shortcut">${escapeHtml(e.shortcut)}</span>` : ''}
        </button>`;
      }).join('');
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        this._runAction(btn.dataset.action);
        this._closeMenus();
      });
      document.body.appendChild(dd);
      anchor.classList.add('open');
    },

    _closeMenus() {
      $$('.menu-item.open').forEach(n => n.classList.remove('open'));
      $$('.menu-dropdown').forEach(n => n.remove());
    },

    _menuEntries(name) {
      if (name === 'file') return [
        { action: 'new-song', label: 'New Song',       shortcut: 'N' },
        { action: 'import-song', label: 'Import Song…', shortcut: 'I' },
        { action: 'load-media', label: 'Load Media (PPTX / PDF / Video)…' },
        'sep',
        { action: 'export',    label: 'Export Schedule…' },
        { action: 'import-json', label: 'Import Schedule…' },
      ];
      if (name === 'edit') return [
        { action: 'clear-live', label: 'Clear Live', shortcut: 'Esc' },
        { action: 'blackout',   label: 'Blackout' },
        'sep',
        { action: 'clear-schedule', label: 'Clear Schedule…' },
      ];
      if (name === 'schedule') return [
        { action: 'go-live', label: 'Go Live (selected)' },
        { action: 'next',    label: 'Next Slide',     shortcut: '→' },
        { action: 'prev',    label: 'Previous Slide', shortcut: '←' },
        'sep',
        { action: 'open-projector', label: 'Open Projector Window' },
      ];
      if (name === 'help') return [
        { action: 'help-about', label: 'About Play & Worship' },
      ];
      return [];
    },

    _runAction(action) {
      switch (action) {
        case 'new-song':        this.newSong(); break;
        case 'import-song':     this._openImportSongModal(); break;
        case 'load-media':      this._pickMediaFile(); break;
        case 'export':          this._exportSchedule(); break;
        case 'import-json':     $('#import-json-input').click(); break;
        case 'clear-live':      this.clearLive(); break;
        case 'blackout':        this.blackout(); break;
        case 'clear-schedule':  this._clearSchedule(); break;
        case 'go-live':         this._goLiveFromWorkspace(); break;
        case 'next':            this.nextSlide(); break;
        case 'prev':            this.prevSlide(); break;
        case 'open-projector':  Projector.open(); this._pollProjector(); break;
        case 'help-about':      toast('Play & Worship · Licensed Operator Console · © 2026', 'info'); break;
      }
    },

    _wireToolbar() {
      $('#tb-live-output').addEventListener('click', () => { Projector.open(); this._pollProjector(); toast('Projector window opened', 'ok'); });
      $('#tb-new-song').addEventListener('click',    () => this.newSong());
      $('#tb-import-song').addEventListener('click', () => this._openImportSongModal());
      $('#tb-load-media').addEventListener('click',  () => this._pickMediaFile());
      $('#tb-go-live').addEventListener('click',     () => this._goLiveFromWorkspace());
      $('#tb-clear').addEventListener('click',       () => this.clearLive());
      $('#tb-blackout').addEventListener('click',    () => this.blackout());
      // Export / Import moved into the File dropdown menu. Keep the
      // hidden file input's change handler here so the menu action
      // picks up the selected file.
      $('#import-json-input').addEventListener('change', (e) => this._importScheduleFile(e.target.files[0]));
      $('#tb-motion').addEventListener('click', (e) => { e.stopPropagation(); this._openMotionMenu(e.currentTarget); });
      this._refreshMotionButton();
      $('#tb-countdown').addEventListener('click', (e) => { e.stopPropagation(); this._openCountdownMenu(e.currentTarget); });
      $('#tb-announcement').addEventListener('click', () => this._openAnnouncementModal());
      $('#tb-birthday').addEventListener('click', () => this._openBirthdayModal());
    },

    // -------- Countdown picker --------
    _COUNTDOWN_OPTIONS: [1, 2, 3, 4, 5, 10],

    _SCRIPTURE_SIZES: [70, 80, 90, 100, 110, 120, 140, 160, 180, 200],

    _SCRIPTURE_COLORS: [
      { name: 'White',  value: '#ffffff' },
      { name: 'Gold',   value: '#f3c867' },
      { name: 'Amber',  value: '#e6b652' },
      { name: 'Sky',    value: '#8ecbff' },
      { name: 'Cyan',   value: '#7fe7e0' },
      { name: 'Mint',   value: '#9fe7b8' },
      { name: 'Rose',   value: '#f3b0b0' },
      { name: 'Red',    value: '#e46767' },
      { name: 'Violet', value: '#c9a6ff' },
      { name: 'Black',  value: '#111111' },
    ],

    _SCRIPTURE_BGS: [
      { name: 'Black',     value: '#000000' },
      { name: 'Midnight',  value: '#0b1530' },
      { name: 'Navy',      value: '#111a2e' },
      { name: 'Slate',     value: '#1c2330' },
      { name: 'Charcoal',  value: '#222222' },
      { name: 'Plum',      value: '#1f0f2a' },
      { name: 'Forest',    value: '#0f1f18' },
      { name: 'Maroon',    value: '#2a0f14' },
      { name: 'Cream',     value: '#f5efe2' },
      { name: 'White',     value: '#ffffff' },
    ],

    _openScriptureSizeMenu(anchor, itemIdx) {
      this._closeMenus();
      const item = this.state.schedule[itemIdx];
      if (!item || !item.style) return;
      const rect = anchor.getBoundingClientRect();
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown scripture-size-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = rect.bottom + 'px';
      dd.style.minWidth = `${Math.max(rect.width, 140)}px`;
      dd.innerHTML = this._SCRIPTURE_SIZES.map(n => `
        <button data-scr-size="${n}" class="countdown-menu-item ${n === item.style.fontSize ? 'active' : ''}">
          <span class="countdown-menu-label">${n}%</span>
        </button>
      `).join('');
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-scr-size]');
        if (!btn) return;
        const n = Number(btn.dataset.scrSize);
        this._setScriptureStyle(itemIdx, { fontSize: n });
        this._closeMenus();
      });
      document.body.appendChild(dd);
    },

    _openScriptureColorMenu(anchor, itemIdx) {
      this._closeMenus();
      const item = this.state.schedule[itemIdx];
      if (!item || !item.style) return;
      const rect = anchor.getBoundingClientRect();
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown scripture-color-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = rect.bottom + 'px';
      dd.innerHTML = `
        <div class="scr-color-grid">
          ${this._SCRIPTURE_COLORS.map(c => `
            <button data-scr-color="${escapeAttr(c.value)}" class="scr-color-swatch ${c.value.toLowerCase() === (item.style.textColor || '').toLowerCase() ? 'active' : ''}" title="${escapeAttr(c.name)}" style="background:${escapeAttr(c.value)}"></button>
          `).join('')}
        </div>
      `;
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-scr-color]');
        if (!btn) return;
        this._setScriptureStyle(itemIdx, { textColor: btn.dataset.scrColor });
        this._closeMenus();
      });
      document.body.appendChild(dd);
    },

    _openScriptureBgMenu(anchor, itemIdx) {
      this._closeMenus();
      const item = this.state.schedule[itemIdx];
      if (!item || !item.style) return;
      const rect = anchor.getBoundingClientRect();
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown scripture-color-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = rect.bottom + 'px';
      dd.innerHTML = `
        <div class="scr-color-grid">
          ${this._SCRIPTURE_BGS.map(c => `
            <button data-scr-bg="${escapeAttr(c.value)}" class="scr-color-swatch ${c.value.toLowerCase() === (item.style.bgColor || '').toLowerCase() ? 'active' : ''}" title="${escapeAttr(c.name)}" style="background:${escapeAttr(c.value)}"></button>
          `).join('')}
        </div>
      `;
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-scr-bg]');
        if (!btn) return;
        this._setScriptureStyle(itemIdx, { bgColor: btn.dataset.scrBg });
        this._closeMenus();
      });
      document.body.appendChild(dd);
    },

    // Apply a style patch to one scripture item, rebuild its slides so the
    // style flows into each slide, and push to live if the item is on air.
    _setScriptureStyle(itemIdx, patch) {
      const item = this.state.schedule[itemIdx];
      if (!item || item.kind !== 'scripture') return;
      item.style = { ...(item.style || this._defaultScriptureStyle()), ...patch };
      // If the item has sourceVerses, repaginate rebuilds its slides with the
      // new style. Otherwise, apply the style to each existing slide so old
      // items (pre-sourceVerses) still react to the edit.
      if (Array.isArray(item.sourceVerses) && item.sourceVerses.length) {
        this._repaginateScripture(itemIdx);
      } else {
        item.slides = item.slides.map(s => ({ ...s, style: item.style }));
        Store.setSchedule(this.state.schedule);
        this.renderAll();
        if (this.state.liveScheduleIdx === itemIdx && Projector.isOpen()) this._pushLive();
      }
    },

    _openCountdownMenu(anchor) {
      this._closeMenus();
      const rect = anchor.getBoundingClientRect();
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown countdown-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = rect.bottom + 'px';
      dd.style.minWidth = `${Math.max(rect.width, 180)}px`;
      dd.innerHTML = this._COUNTDOWN_OPTIONS.map(n => `
        <button data-cd-min="${n}" class="countdown-menu-item">
          <span class="countdown-menu-label">${n} minute${n === 1 ? '' : 's'}</span>
          <span class="countdown-menu-duration">${String(n).padStart(2, '0')}:00</span>
        </button>
      `).join('');
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-cd-min]');
        if (!btn) return;
        this.startCountdown(Number(btn.dataset.cdMin));
        this._closeMenus();
      });
      document.body.appendChild(dd);
    },

    // Build and push a countdown "slide" to the projector. The slide only
    // carries an end timestamp + label — the projector runs its own ticker
    // and renders MM:SS locally, which keeps the operator and projector
    // perfectly in sync without constant message traffic.
    startCountdown(minutes, label) {
      const mins = Math.max(1, Number(minutes) || 1);
      const endsAt = Date.now() + mins * 60 * 1000;
      const slide = {
        id: `cd_${Date.now().toString(36)}`,
        kind: 'countdown',
        endsAt,
        label: label || 'Starts in',
      };
      if (!Projector.isOpen()) Projector.open();
      Projector.showSlide(slide);
      // Show on the operator's live monitor too so both ends match.
      this.state.liveScheduleIdx = -1;
      this.state.liveDeck = null;
      this.state.countdownSlide = slide;
      this._renderMonitors();
      toast(`Countdown · ${mins} min${mins === 1 ? '' : 's'}`, 'ok');
    },

    // -------- Announcement --------

    // Defaults for the editor — restored from settings so the operator
    // doesn't have to retype their template on every session. v2 stores
    // an array of slides; v1 keys (announcementTitle/Message) are read as
    // a single-slide fallback so existing sessions don't lose their work.
    _getAnnouncementDraft() {
      const s = Store.getSettings();
      let slides = [];
      if (Array.isArray(s.announcementSlides) && s.announcementSlides.length) {
        slides = s.announcementSlides
          .map(x => ({
            title:   String(x && x.title   != null ? x.title   : '').trim(),
            message: String(x && x.message != null ? x.message : ''),
          }))
          .filter(x => x.title || x.message);
      } else if (s.announcementTitle || s.announcementMessage) {
        slides = [{
          title:   String(s.announcementTitle   || '').trim(),
          message: String(s.announcementMessage || ''),
        }];
      }
      if (!slides.length) slides = [{ title: 'Announcement', message: '' }];
      return { slides };
    },

    // Pull current row values from the modal — drops blank rows on save.
    _collectAnnouncementSlides(rowsEl) {
      return [...rowsEl.querySelectorAll('[data-ann-row]')].map(r => ({
        title:   (r.querySelector('.ann-row-title').value   || '').trim(),
        message: (r.querySelector('.ann-row-message').value || '').trim(),
      })).filter(x => x.title || x.message);
    },

    _persistAnnouncementDraft(slides) {
      Store.setSetting('announcementSlides', slides);
      // Clear legacy single-slide keys so the v1 fallback in
      // _getAnnouncementDraft can't resurrect old content.
      Store.setSetting('announcementTitle', '');
      Store.setSetting('announcementMessage', '');
    },

    _openAnnouncementModal() {
      const draft = this._getAnnouncementDraft();

      const rowHtml = (s) => `
        <div class="ann-row" data-ann-row>
          <div class="ann-row-head">
            <span class="ann-row-num" data-ann-num></span>
            <input type="text" class="ann-row-title" value="${escapeAttr(s.title || '')}" placeholder="Title (optional)">
            <button type="button" class="ann-row-remove" title="Remove" aria-label="Remove">${ICONS.x}</button>
          </div>
          <textarea class="ann-row-message" placeholder="Type your announcement…">${escapeHtml(s.message || '')}</textarea>
        </div>
      `;

      openModal({
        title: 'Announcement',
        bodyHtml: `
          <div class="ez-field">
            <span class="ez-field-label">Slides</span>
            <div class="ann-rows" id="ann-rows">
              ${draft.slides.map(rowHtml).join('')}
            </div>
            <button type="button" class="btn ann-add-row" id="ann-add">+ Add another slide</button>
          </div>
          <p class="help">Each entry becomes its own slide. Use Next/Prev (or ←/→) on air to page through. Blank lines separate paragraphs. Session motion applies as the background.</p>
        `,
        footerHtml: `
          <button class="btn" id="ann-cancel">Cancel</button>
          <button class="btn" id="ann-save">Save</button>
          <button class="btn btn-primary" id="ann-go">Go Live</button>
        `,
        onMount: ({ close, modal }) => {
          const rowsEl = modal.querySelector('#ann-rows');
          const addBtn = modal.querySelector('#ann-add');

          const renumber = () => {
            const rows = rowsEl.querySelectorAll('[data-ann-row]');
            rows.forEach((r, i) => {
              const num = r.querySelector('[data-ann-num]');
              if (num) num.textContent = `Slide ${i + 1}`;
              const rm = r.querySelector('.ann-row-remove');
              if (rm) rm.disabled = rows.length <= 1;
            });
          };

          const wireRow = (row) => {
            const rm = row.querySelector('.ann-row-remove');
            if (rm) rm.addEventListener('click', () => {
              if (rowsEl.querySelectorAll('[data-ann-row]').length <= 1) return;
              row.remove();
              renumber();
            });
          };

          rowsEl.querySelectorAll('[data-ann-row]').forEach(wireRow);
          renumber();
          setTimeout(() => {
            const firstMsg = rowsEl.querySelector('.ann-row-message');
            if (firstMsg) firstMsg.focus();
          }, 30);

          addBtn.addEventListener('click', () => {
            const tpl = document.createElement('div');
            tpl.innerHTML = rowHtml({ title: '', message: '' }).trim();
            const row = tpl.firstElementChild;
            rowsEl.appendChild(row);
            wireRow(row);
            renumber();
            row.querySelector('.ann-row-message').focus();
          });

          modal.querySelector('#ann-cancel').addEventListener('click', close);

          modal.querySelector('#ann-save').addEventListener('click', () => {
            const slides = this._collectAnnouncementSlides(rowsEl);
            if (!slides.length) { toast('Nothing to save.', 'error'); return; }
            this._persistAnnouncementDraft(slides);
            toast(`Saved · ${slides.length} announcement slide${slides.length === 1 ? '' : 's'}`, 'ok');
            close();
          });

          modal.querySelector('#ann-go').addEventListener('click', () => {
            const slides = this._collectAnnouncementSlides(rowsEl);
            if (!slides.length) { toast('Nothing to show.', 'error'); return; }
            this._persistAnnouncementDraft(slides);
            this.showAnnouncement(slides);
            close();
          });
        },
      });
    },

    // Build + push an announcement deck to the projector. Lives outside
    // the schedule, the same way countdown does — so clicking it doesn't
    // disturb whatever item is queued up. Accepts either a single
    // {title,message} (legacy callers) or an array of slide specs.
    showAnnouncement(input) {
      const list = Array.isArray(input)
        ? input
        : (input && (input.title || input.message) ? [{ title: input.title || '', message: input.message || '' }] : []);
      const cleaned = list
        .map(x => ({ title: (x.title || '').trim(), message: (x.message || '').trim() }))
        .filter(x => x.title || x.message);
      if (!cleaned.length) return;
      const batchId = Date.now().toString(36);
      const motion = this.state.sessionMotion || 'none';
      const slides = cleaned.map((s, i) => ({
        id: `ann_${batchId}_${i}`,
        deckId: `ann_${batchId}`,
        kind: 'announcement',
        title: s.title,
        text:  s.message,
        label: cleaned.length > 1 ? `Announcement · ${i + 1}/${cleaned.length}` : 'Announcement',
        style: { motion },
      }));
      this.state.liveDeck = {
        kind: 'announcement',
        label: 'Announcement',
        slides,
        idx: 0,
      };
      this.state.countdownSlide = null;
      this.state.liveScheduleIdx = -1;
      if (!Projector.isOpen()) Projector.open();
      this._pushLive();
      this._renderMonitors();
      const pageInfo = cleaned.length > 1 ? ` · ${cleaned.length} slides` : '';
      toast(`Announcement · Live${pageInfo}`, 'ok');
    },

    // -------- Birthday --------

    _BIRTHDAY_PER_SLIDE_OPTIONS: [1, 2, 3, 4, 6, 8],

    _getBirthdayDraft() {
      const s = Store.getSettings();
      // v2: birthdayPeople is an array of {name,date}. Fall back to the old
      // single-row birthdayName/Date keys so existing sessions don't lose
      // their last-typed values.
      let people = [];
      if (Array.isArray(s.birthdayPeople) && s.birthdayPeople.length) {
        people = s.birthdayPeople
          .map(p => ({ name: String(p && p.name || '').trim(), date: String(p && p.date || '').trim() }))
          .filter(p => p.name || p.date);
      } else if (s.birthdayName || s.birthdayDate) {
        people = [{ name: String(s.birthdayName || '').trim(), date: String(s.birthdayDate || '').trim() }];
      }
      if (!people.length) people = [{ name: '', date: '' }];
      const perSlideRaw = Number(s.birthdayPerSlide);
      const perSlide = this._BIRTHDAY_PER_SLIDE_OPTIONS.includes(perSlideRaw) ? perSlideRaw : 4;
      return {
        greeting: (s.birthdayGreeting != null) ? String(s.birthdayGreeting) : 'Happy Birthday!',
        people,
        perSlide,
      };
    },

    _openBirthdayModal() {
      const draft = this._getBirthdayDraft();

      const rowHtml = (p, i) => `
        <div class="bday-row" data-bday-row>
          <div class="bday-row-fields">
            <input type="text" class="bday-row-name" value="${escapeAttr(p.name || '')}" placeholder="Name (e.g. Sister Maria)">
            <input type="text" class="bday-row-date" value="${escapeAttr(p.date || '')}" placeholder="Birthday (optional, e.g. April 22)">
          </div>
          <button type="button" class="bday-row-remove" title="Remove" aria-label="Remove">${ICONS.x}</button>
        </div>
      `;

      openModal({
        title: 'Birthday Greeting',
        bodyHtml: `
          <label class="ez-field">
            <span class="ez-field-label">Greeting</span>
            <input type="text" id="bday-greet" value="${escapeAttr(draft.greeting)}" placeholder="Happy Birthday!">
          </label>
          <div class="ez-field">
            <span class="ez-field-label">Celebrants</span>
            <div class="bday-rows" id="bday-rows">
              ${draft.people.map(rowHtml).join('')}
            </div>
            <button type="button" class="btn bday-add-row" id="bday-add">+ Add another</button>
          </div>
          <label class="ez-field">
            <span class="ez-field-label">Per slide</span>
            <div class="bday-perslide" id="bday-perslide">
              ${this._BIRTHDAY_PER_SLIDE_OPTIONS.map(n => `
                <button type="button" data-per="${n}" class="bday-perslide-opt${n === draft.perSlide ? ' active' : ''}">${n}</button>
              `).join('')}
              <span class="bday-perslide-hint" id="bday-perslide-hint"></span>
            </div>
          </label>
          <p class="help">Celebrants beyond the "per slide" count will paginate — use Next/Prev (or ←/→) to page through on air.</p>
        `,
        footerHtml: `
          <button class="btn" id="bday-cancel">Cancel</button>
          <button class="btn" id="bday-save">Save</button>
          <button class="btn btn-primary" id="bday-go">Go Live</button>
        `,
        onMount: ({ close, modal }) => {
          const rowsEl   = modal.querySelector('#bday-rows');
          const greetEl  = modal.querySelector('#bday-greet');
          const addBtn   = modal.querySelector('#bday-add');
          const perEl    = modal.querySelector('#bday-perslide');
          const perHint  = modal.querySelector('#bday-perslide-hint');
          let perSlide   = draft.perSlide;

          const countPeople = () => [...rowsEl.querySelectorAll('[data-bday-row]')]
            .filter(r => (r.querySelector('.bday-row-name').value || '').trim()).length;

          const refreshHint = () => {
            const n = countPeople();
            if (!n) { perHint.textContent = ''; return; }
            const slides = Math.max(1, Math.ceil(n / perSlide));
            perHint.textContent = `${n} celebrant${n === 1 ? '' : 's'} · ${slides} slide${slides === 1 ? '' : 's'}`;
          };

          const refreshRemoveButtons = () => {
            const rows = rowsEl.querySelectorAll('[data-bday-row]');
            rows.forEach(r => {
              const btn = r.querySelector('.bday-row-remove');
              if (btn) btn.disabled = rows.length <= 1;
            });
          };

          const wireRow = (row) => {
            const rm = row.querySelector('.bday-row-remove');
            if (rm) rm.addEventListener('click', () => {
              if (rowsEl.querySelectorAll('[data-bday-row]').length <= 1) return;
              row.remove();
              refreshRemoveButtons();
              refreshHint();
            });
            const nameInput = row.querySelector('.bday-row-name');
            if (nameInput) nameInput.addEventListener('input', refreshHint);
          };

          rowsEl.querySelectorAll('[data-bday-row]').forEach(wireRow);
          refreshRemoveButtons();
          refreshHint();
          setTimeout(() => {
            const first = rowsEl.querySelector('.bday-row-name');
            if (first) first.focus();
          }, 30);

          addBtn.addEventListener('click', () => {
            const tpl = document.createElement('div');
            tpl.innerHTML = rowHtml({ name: '', date: '' }, -1).trim();
            const row = tpl.firstElementChild;
            rowsEl.appendChild(row);
            wireRow(row);
            refreshRemoveButtons();
            refreshHint();
            row.querySelector('.bday-row-name').focus();
          });

          perEl.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-per]');
            if (!btn) return;
            perSlide = Number(btn.dataset.per);
            perEl.querySelectorAll('.bday-perslide-opt').forEach(b => {
              b.classList.toggle('active', Number(b.dataset.per) === perSlide);
            });
            refreshHint();
          });

          // Collect + persist helpers shared by Save and Go Live. Returns
          // the collected { greeting, people, perSlide } so Go Live can push
          // live with the same values that were just saved.
          const collect = () => {
            const greeting = (greetEl.value || '').trim() || 'Happy Birthday!';
            const people = [...rowsEl.querySelectorAll('[data-bday-row]')]
              .map(r => ({
                name: (r.querySelector('.bday-row-name').value || '').trim(),
                date: (r.querySelector('.bday-row-date').value || '').trim(),
              }))
              .filter(p => p.name);  // drop blank rows
            return { greeting, people, perSlide };
          };

          const persist = ({ greeting, people, perSlide }) => {
            Store.setSetting('birthdayGreeting', greeting);
            Store.setSetting('birthdayPeople', people);
            Store.setSetting('birthdayPerSlide', perSlide);
            // Clear the v1 single-row keys so the fallback in _getBirthdayDraft
            // doesn't resurrect an old name after the operator removed it.
            Store.setSetting('birthdayName', '');
            Store.setSetting('birthdayDate', '');
          };

          modal.querySelector('#bday-cancel').addEventListener('click', close);

          modal.querySelector('#bday-save').addEventListener('click', () => {
            const v = collect();
            if (!v.people.length) {
              toast('Please enter at least one name.', 'error');
              const first = rowsEl.querySelector('.bday-row-name');
              if (first) first.focus();
              return;
            }
            persist(v);
            toast(`Saved · ${v.people.length} celebrant${v.people.length === 1 ? '' : 's'}`, 'ok');
            close();
          });

          modal.querySelector('#bday-go').addEventListener('click', () => {
            const v = collect();
            if (!v.people.length) {
              toast('Please enter at least one name.', 'error');
              const first = rowsEl.querySelector('.bday-row-name');
              if (first) first.focus();
              return;
            }
            persist(v);
            this.showBirthday(v);
            close();
          });
        },
      });
    },

    showBirthday({ greeting, people, perSlide }) {
      const list = (Array.isArray(people) ? people : []).filter(p => p && p.name);
      if (!list.length) return;
      const per = this._BIRTHDAY_PER_SLIDE_OPTIONS.includes(Number(perSlide))
        ? Number(perSlide)
        : 4;
      // Chunk celebrants into per-slide groups — same payload shape as the
      // single-slide case, just one slide per chunk.
      const chunks = [];
      for (let i = 0; i < list.length; i += per) chunks.push(list.slice(i, i + per));
      const greet = greeting || 'Happy Birthday!';
      const batchId = Date.now().toString(36);
      const slides = chunks.map((group, i) => ({
        id: `bday_${batchId}_${i}`,
        deckId: `bday_${batchId}`,   // shared across this deck so Next/Prev can do a content-only swap
        kind: 'birthday',
        greeting: greet,
        people: group,
        label: chunks.length > 1 ? `Birthday · ${i + 1}/${chunks.length}` : 'Birthday',
      }));
      // Stash a deck so Next/Prev page through the slides. countdownSlide is
      // cleared — _getLiveSlide checks liveDeck first now.
      this.state.liveDeck = {
        kind: 'birthday',
        label: 'Birthday',
        slides,
        idx: 0,
      };
      this.state.countdownSlide = null;
      this.state.liveScheduleIdx = -1;
      if (!Projector.isOpen()) Projector.open();
      this._pushLive();
      this._renderMonitors();
      const summary = list.length === 1 ? list[0].name : `${list.length} celebrants`;
      const pageInfo = chunks.length > 1 ? ` · ${chunks.length} slides` : '';
      toast(`Birthday · ${summary}${pageInfo}`, 'ok');
    },

    // -------- Session motion picker --------

    _MOTION_PRESETS: [
      ['none',      'None'],
      ['kenburns',  'Ken Burns'],
      ['drift',     'Drift'],
      ['bokeh',     'Bokeh'],
      ['rays',      'Rays'],
      ['glow',      'Glow'],
      ['aurora',    'Aurora'],
      ['starfield', 'Starfield'],
      ['embers',    'Embers'],
      ['mist',      'Mist'],
      ['waves',     'Waves'],
      ['breathe',   'Breathe'],
      ['particles', 'Random Particles'],
      ['fireflux',  'Fire Flux'],
    ],

    _refreshMotionButton() {
      const cur = this.state.sessionMotion || 'none';
      const row = this._MOTION_PRESETS.find(p => p[0] === cur) || this._MOTION_PRESETS[0];
      const sw = $('#tb-motion-swatch');
      const lb = $('#tb-motion-label');
      if (sw) sw.className = `tb-motion-swatch motion-${row[0]}`;
      if (lb) lb.textContent = `Motion: ${row[1]}`;
    },

    _openMotionMenu(anchor) {
      this._closeMenus();
      const rect = anchor.getBoundingClientRect();
      const cur = this.state.sessionMotion || 'none';
      const dd = document.createElement('div');
      dd.className = 'menu-dropdown motion-dropdown';
      dd.style.left = rect.left + 'px';
      dd.style.top  = rect.bottom + 'px';
      dd.style.minWidth = `${Math.max(rect.width, 220)}px`;
      dd.innerHTML = this._MOTION_PRESETS.map(([k, label]) => `
        <button data-motion="${k}" class="motion-menu-item ${k === cur ? 'active' : ''}">
          <span class="motion-menu-swatch motion-${k}"></span>
          <span class="motion-menu-label">${label}</span>
          ${k === cur ? '<span class="motion-menu-check">✓</span>' : ''}
        </button>
      `).join('');
      dd.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-motion]');
        if (!btn) return;
        this._setSessionMotion(btn.dataset.motion);
        this._closeMenus();
      });
      document.body.appendChild(dd);
    },

    _setSessionMotion(motion) {
      this.state.sessionMotion = motion || 'none';
      try { Store.setSetting('sessionMotion', this.state.sessionMotion); } catch {}
      this._refreshMotionButton();
      // Re-render everything that paints a text slide + push the change to
      // the projector so a live song/scripture updates immediately.
      this.renderAll();
      if (this.state.liveScheduleIdx >= 0 && Projector.isOpen()) this._pushLive();
    },

    _wireTabs() {
      $$('.lib-tab').forEach(btn => {
        btn.addEventListener('click', () => this._setLibraryTab(btn.dataset.tab));
      });
    },

    _setLibraryTab(tab) {
      this.state.libraryTab = tab;
      $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
      this._renderLibrary();
    },

    _wireTransport() {
      $('#tp-prev').addEventListener('click', () => this.prevSlide());
      $('#tp-go').addEventListener('click',   () => this.go());
      $('#tp-next').addEventListener('click', () => this.nextSlide());
    },

    _wireShortcutsMenu() {
      const btn = $('#menu-shortcuts');
      if (!btn) return;
      btn.addEventListener('click', () => this._openShortcutsModal());
    },

    _openShortcutsModal() {
      openModal({
        title: 'Keyboard Shortcuts',
        bodyHtml: `
          <dl class="kb kb-modal">
            <dt>Space</dt><dd>Go — push Preview to Live</dd>
            <dt>→ / ↓ / PgDn</dt><dd>Next slide</dd>
            <dt>← / ↑ / PgUp</dt><dd>Previous slide</dd>
            <dt>Esc</dt><dd>Clear live output</dd>
            <dt>Ctrl+S</dt><dd>Confirm auto-save (everything is saved automatically)</dd>
            <dt>N</dt><dd>New Song</dd>
            <dt>I</dt><dd>Import Song</dd>
            <dt>S</dt><dd>Songs library tab</dd>
            <dt>H</dt><dd>Hymn library tab</dd>
            <dt>B</dt><dd>Scripture library tab</dd>
            <dt>M</dt><dd>Media library tab</dd>
            <dt>F1</dt><dd>Countdown</dd>
            <dt>Dbl-click verse</dt><dd>Go Live (Scripture only)</dd>
            <dt>F</dt><dd>(in projector) Fullscreen</dd>
          </dl>
        `,
      });
    },

    _wireKeyboard() {
      document.addEventListener('keydown', (e) => {
        if (modalOpen) return;

        // Ctrl+S / Cmd+S — the app auto-saves every change, so there's no
        // explicit save to run. Swallow the browser's "Save Page As…"
        // dialog and surface a small confirmation toast instead. Handled
        // before the input-field bailout so it works while typing in the
        // song editor too.
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault();
          toast('✓ Auto-saved', 'ok');
          return;
        }

        const ae = document.activeElement;
        if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) return;

        // Skip letter shortcuts when a modifier is held so the browser's
        // own Ctrl+N / Cmd+S / etc. still work.
        const plain = !e.ctrlKey && !e.metaKey && !e.altKey;
        switch (e.key) {
          case ' ': case 'Spacebar':
            e.preventDefault(); this.go(); break;
          case 'ArrowRight': case 'ArrowDown': case 'PageDown':
            e.preventDefault(); this.nextSlide({ stayInItem: true }); break;
          case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
            e.preventDefault(); this.prevSlide({ stayInItem: true }); break;
          case 'Escape':
            e.preventDefault(); this.clearLive(); break;
          case 'n': case 'N':
            if (plain) { e.preventDefault(); this.newSong(); }
            break;
          case 'i': case 'I':
            if (plain) { e.preventDefault(); this._openImportSongModal(); }
            break;
          case 's': case 'S':
            if (plain) { e.preventDefault(); this._setLibraryTab('songs'); }
            break;
          case 'h': case 'H':
            // H now jumps to Songs + Hymns category (Hymn is no longer a
            // top-level library tab; it lives inside the Songs panel).
            if (plain) {
              e.preventDefault();
              this.state.songCategory = 'hymnal';
              Store.setSetting('songCategory', 'hymnal');
              this._setLibraryTab('songs');
            }
            break;
          case 'b': case 'B':
            if (plain) { e.preventDefault(); this._setLibraryTab('bible'); }
            break;
          case 'm': case 'M':
            if (plain) { e.preventDefault(); this._setLibraryTab('media'); }
            break;
          case 'F1': {
            e.preventDefault();
            const cdBtn = $('#tb-countdown');
            if (cdBtn) cdBtn.click();
            break;
          }
        }
      });
    },

    _pollProjector() {
      const on = Projector.isOpen();
      if (on !== this.state.projectorConnected) {
        this.state.projectorConnected = on;
        this._renderStatus();
      }
    },

    // =========================================================
    // Status / projector pill
    // =========================================================

    _renderStatus() {
      const pill = $('#projector-pill');
      if (this.state.projectorConnected) {
        pill.className = 'pill pill-ok';
        pill.innerHTML = '<span class="dot"></span>PROJECTOR · CONNECTED';
      } else {
        pill.className = 'pill pill-mute';
        pill.innerHTML = '<span class="dot"></span>PROJECTOR · DISCONNECTED';
      }

      const live = $('#live-pill');
      if (this.state.liveScheduleIdx >= 0) live.classList.remove('hidden');
      else live.classList.add('hidden');

      const songCount = Store.getSongs().length;
      $('#status-counts').textContent = `${songCount} song${songCount === 1 ? '' : 's'} · ${this.state.schedule.length} schedule item${this.state.schedule.length === 1 ? '' : 's'}`;

      // Status text (left)
      let txt = 'Ready';
      if (this.state.liveScheduleIdx >= 0) {
        const item = this.state.schedule[this.state.liveScheduleIdx];
        if (item) txt = `Live · ${item.title} · slide ${this.state.currentSlideIdx + 1}/${item.slides.length}`;
      }
      $('#status-text').textContent = txt;
    },

    // =========================================================
    // Schedule bar
    // =========================================================

    _renderSchedule() {
      const bar = $('#schedule-bar');
      const s = this.state.schedule;
      if (s.length === 0) {
        bar.innerHTML = '<div class="schedule-empty">No items in schedule</div>';
        return;
      }

      // Bucket items by section while keeping each item's original schedule
      // index so click / drag / remove handlers still target the right slot.
      const buckets = { song: [], hymn: [], scripture: [], media: [] };
      s.forEach((item, i) => {
        if (item.kind === 'scripture') return buckets.scripture.push({ item, i });
        if (item.kind === 'pptx' || item.kind === 'video') return buckets.media.push({ item, i });
        if (item.kind === 'song') {
          const refSong = item.refId ? Store.getSong(item.refId) : null;
          const cat = refSong ? (refSong.category || 'worship') : 'worship';
          if (cat === 'hymnal') return buckets.hymn.push({ item, i });
          return buckets.song.push({ item, i });
        }
        buckets.song.push({ item, i });
      });

      const sections = [
        { key: 'song',      label: 'SONGS',     items: buckets.song },
        { key: 'hymn',      label: 'HYMNS',     items: buckets.hymn },
        { key: 'scripture', label: 'SCRIPTURE', items: buckets.scripture },
        { key: 'media',     label: 'MEDIA',     items: buckets.media },
      ].filter(sec => sec.items.length > 0);

      bar.innerHTML = sections.map(sec => `
        <div class="sched-section" data-section="${sec.key}">
          <div class="sched-section-label">${sec.label}</div>
          ${sec.items.map(({ item, i }) => {
            const live = this.state.liveScheduleIdx === i;
            const sel  = this.state.selectedScheduleIdx === i;
            const cls = `sched-card ${sel ? 'selected' : ''} ${live ? 'live' : ''}`.trim();
            const count = `${item.slides.length} slide${item.slides.length === 1 ? '' : 's'}`;
            const title = item.title || '';
            const sub   = item.subtitle || '';
            return `
              <div class="${cls}" draggable="true" data-idx="${i}">
                <div class="sched-main">
                  <span class="sched-title">${escapeHtml(title)}</span>
                  ${sub ? `<span class="sched-sub">— ${escapeHtml(sub)}</span>` : ''}
                </div>
                ${live ? '<span class="sched-live-badge">LIVE</span>' : ''}
                <span class="sched-count">${count}</span>
                <button class="sched-remove" data-remove="${i}" title="Remove">${ICONS.x}</button>
              </div>
            `;
          }).join('')}
        </div>
      `).join('');

      // Click handlers + drag
      $$('.sched-card', bar).forEach(card => {
        const i = parseInt(card.dataset.idx, 10);

        card.addEventListener('click', (e) => {
          if (e.target.closest('.sched-remove')) return;
          this.selectScheduleItem(i);
        });
        card.addEventListener('dblclick', () => this.goLiveSchedule(i));

        const rm = card.querySelector('.sched-remove');
        if (rm) rm.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeScheduleItem(i);
        });

        // Drag-to-reorder
        card.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/ez-sched', String(i));
          e.dataTransfer.effectAllowed = 'move';
          card.classList.add('dragging');
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
        card.addEventListener('dragover', (e) => {
          if (e.dataTransfer.types.includes('text/ez-sched')) {
            e.preventDefault();
            card.classList.add('drag-over');
          }
        });
        card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
        card.addEventListener('drop', (e) => {
          card.classList.remove('drag-over');
          const fromStr = e.dataTransfer.getData('text/ez-sched');
          if (fromStr === '') return;
          e.preventDefault();
          const from = parseInt(fromStr, 10);
          const to   = parseInt(card.dataset.idx, 10);
          if (from === to) return;
          this._moveScheduleItem(from, to);
        });
      });
    },

    _kindLabel(kind) {
      return { song: 'SONG', scripture: 'SCRIPTURE', pptx: 'PRESENTATION', video: 'VIDEO' }[kind] || kind.toUpperCase();
    },

    _moveScheduleItem(from, to) {
      const s = this.state.schedule.slice();
      const [m] = s.splice(from, 1);
      s.splice(to, 0, m);
      this.state.schedule = s;
      // Update live/selected indexes to follow the move
      const fix = (idx) => {
        if (idx < 0) return idx;
        if (idx === from) return to;
        if (from < idx && to >= idx) return idx - 1;
        if (from > idx && to <= idx) return idx + 1;
        return idx;
      };
      this.state.liveScheduleIdx = fix(this.state.liveScheduleIdx);
      this.state.selectedScheduleIdx = fix(this.state.selectedScheduleIdx);
      Store.setSchedule(this.state.schedule);
      this.renderAll();
    },

    selectScheduleItem(i) {
      // Single click only: mark the card as selected (updates toolbar
      // "Go Live" target + Preview monitor) without replacing whatever the
      // operator currently has open in the workspace. Use double-click to
      // switch the workspace view.
      this.state.selectedScheduleIdx = i;
      this.state.previewSlideIdx = 0;
      this.renderAll();
    },

    removeScheduleItem(i) {
      this.state.schedule.splice(i, 1);
      const fix = (idx) => {
        if (idx < 0) return -1;
        if (idx === i) return -1;
        if (idx > i) return idx - 1;
        return idx;
      };
      this.state.liveScheduleIdx = fix(this.state.liveScheduleIdx);
      this.state.selectedScheduleIdx = fix(this.state.selectedScheduleIdx);
      if (this.state.liveScheduleIdx < 0) {
        this.state.currentSlideIdx = 0;
        Projector.clear();
      }
      Store.setSchedule(this.state.schedule);
      this.renderAll();
    },

    _clearSchedule() {
      if (this.state.schedule.length === 0) return;
      if (!confirm('Clear the entire schedule?')) return;
      this.state.schedule = [];
      this.state.selectedScheduleIdx = -1;
      this.state.liveScheduleIdx = -1;
      this.state.currentSlideIdx = 0;
      Projector.clear();
      Store.setSchedule([]);
      this.renderAll();
    },

    addToSchedule(item) {
      this.state.schedule.push(item);
      Store.setSchedule(this.state.schedule);
      this.renderAll();
    },

    // Custom Yes / No confirmation modal. Replaces the browser confirm()
    // dialog so the UI stays inside the app.
    _confirm({ title = 'Confirm', message = 'Are you sure?', yesLabel = 'Yes', noLabel = 'No', danger = true }, onYes) {
      openModal({
        title,
        bodyHtml: `<p class="confirm-msg">${escapeHtml(message)}</p>`,
        footerHtml: `
          <button class="btn" data-confirm-no>${escapeHtml(noLabel)}</button>
          <button class="btn ${danger ? 'btn-solid-danger' : 'btn-primary'}" data-confirm-yes>${escapeHtml(yesLabel)}</button>
        `,
        onMount: ({ close, modal }) => {
          modal.querySelector('[data-confirm-no]').addEventListener('click', close);
          modal.querySelector('[data-confirm-yes]').addEventListener('click', () => { close(); onYes && onYes(); });
        },
      });
    },

    // =========================================================
    // Library panel — 3 tabs
    // =========================================================

    _renderLibrary() {
      const body = $('#lib-body');
      // Preserve the scroller's scrollTop across re-renders so clicking a
      // row deep in the list doesn't jump back to the top. Only restore
      // when we're rebuilding the same tab — switching tabs should start
      // at the top of the new list.
      const prevScroller = body.querySelector('.lib-scroll');
      const prevTop = prevScroller ? prevScroller.scrollTop : 0;
      const sameTab = this._lastLibraryTab === this.state.libraryTab;
      this._lastLibraryTab = this.state.libraryTab;
      body.innerHTML = '';
      if (this.state.libraryTab === 'songs')       this._renderLibrarySongs(body);
      else if (this.state.libraryTab === 'music')  this._renderLibraryMusic(body);
      else if (this.state.libraryTab === 'bible')  this._renderLibraryBible(body);
      else if (this.state.libraryTab === 'media')  this._renderLibraryMedia(body);
      if (sameTab && prevTop) {
        const newScroller = body.querySelector('.lib-scroll');
        if (newScroller) newScroller.scrollTop = prevTop;
      }
    },

    // -------- Songs tab --------

    _renderLibrarySongs(body) {
      const category = this.state.songCategory || 'worship';
      const placeholder = category === 'hymnal' ? 'Search hymns…' : 'Search songs…';
      const curLang = this.state.songLanguage || 'en';
      body.innerHTML = `
        <div class="lib-lang-toggle">
          <button class="lib-lang-btn${curLang === 'en' ? ' active' : ''}" data-lang="en">English</button>
          <button class="lib-lang-btn${curLang === 'tl' ? ' active' : ''}" data-lang="tl">Tagalog</button>
        </div>
        <div class="lib-cat-toggle">
          <button class="lib-cat-btn${category === 'worship' ? ' active' : ''}" data-cat="worship" data-tip="Praise and Worship songs">Worship</button>
          <button class="lib-cat-btn${category === 'hymnal' ? ' active' : ''}" data-cat="hymnal" data-tip="Hymnal">Hymns</button>
        </div>
        <div class="lib-search">
          <div class="search-box">
            <span data-icon="search"></span>
            <input id="lib-song-search" type="search" placeholder="${placeholder}" value="${escapeAttr(this.state.songSearch)}">
          </div>
        </div>
        <div class="lib-scroll" id="lib-song-list"></div>
        <div class="lib-actions">
          <button class="btn btn-primary" id="lib-song-new">${ICONS.plus}<span>New</span></button>
          <button class="btn" id="lib-song-add">${ICONS['to-schedule']}<span>Add</span></button>
        </div>
      `;

      this._renderSongList(body);

      $$('.lib-lang-btn', body).forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.songLanguage = btn.dataset.lang;
          Store.setSetting('songLanguage', this.state.songLanguage);
          $$('.lib-lang-btn', body).forEach(x => x.classList.toggle('active', x === btn));
          this._renderSongList(body);
        });
      });
      $$('.lib-cat-btn', body).forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.songCategory = btn.dataset.cat;
          Store.setSetting('songCategory', this.state.songCategory);
          // Full re-render so the search placeholder + newSong default update too.
          this._renderLibrarySongs(body);
        });
      });
      $('#lib-song-search', body).addEventListener('input', (e) => {
        this.state.songSearch = e.target.value;
        // Re-render only the list so the search input keeps focus + caret.
        this._renderSongList(body);
      });
      $('#lib-song-new', body).addEventListener('click', () => this.newSong());
      $('#lib-song-add', body).addEventListener('click', () => {
        const id = this.state.activeSongId || this.state.editingSong;
        if (!id) return toast('Select a song first.', 'error');
        this.addSongToSchedule(id);
      });
    },

    _renderSongList(body) {
      const list = $('#lib-song-list', body);
      if (!list) return;
      const category = this.state.songCategory || 'worship';
      const q = this.state.songSearch.toLowerCase().trim();
      const lang = this.state.songLanguage || 'en';
      let songs = Store.getSongs();
      // Filter by category. Treat songs without a category as 'worship' for
      // backwards compatibility with existing data.
      songs = songs.filter(s => (s.category || 'worship') === category);
      // Filter by language. Songs without an explicit language tag default
      // to 'en' so the pre-existing library stays visible on the English tab.
      songs = songs.filter(s => (s.language || 'en') === lang);
      if (q) songs = songs.filter(s =>
        (s.title || '').toLowerCase().includes(q) || (s.author || '').toLowerCase().includes(q)
      );
      // Auto-sort alphabetically by title, case + accent insensitive, and
      // locale-aware so e.g. "10,000 Reasons" vs "A Mighty Fortress" land
      // in a sensible order for the operator.
      songs.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base', numeric: true })
      );

      if (songs.length === 0) {
        const noun = category === 'hymnal' ? 'hymns' : 'songs';
        list.innerHTML = `<div class="bible-state">${q ? 'No matches.' : `No ${noun} yet.`}<div class="mono">CLICK NEW TO CREATE ONE</div></div>`;
        return;
      }
      const activeId = this.state.activeSongId || this.state.editingSong;
      list.innerHTML = songs.map(s => `
        <div class="lib-row ${s.id === activeId ? 'active' : ''}" data-song-id="${escapeAttr(s.id)}">
          <div class="lib-row-ico">${ICONS.music}</div>
          <div class="lib-row-body">
            <div class="lib-row-title">${escapeHtml(s.title || 'Untitled')}</div>
            <div class="lib-row-sub">${escapeHtml(s.author || '')}</div>
          </div>
          <button class="lib-row-del" data-del-song="${escapeAttr(s.id)}" title="Delete">${ICONS.trash}</button>
        </div>
      `).join('');

      $$('.lib-row', list).forEach(row => {
        const id = row.dataset.songId;
        // Single or double click: open the song in the workspace (read-only
        // slides). Never goes live / adds to schedule from here — use the
        // header buttons, or double-click a slide card, instead.
        row.addEventListener('click', (e) => {
          // Ignore clicks on the delete button (its own handler runs).
          if (e.target.closest('.lib-row-del')) return;
          this.previewSong(id);
        });
      });

      $$('[data-del-song]', list).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.delSong;
          const song = Store.getSong(id);
          if (!song) return;
          const noun = (song.category === 'hymnal') ? 'hymn' : 'song';
          this._confirm({
            title: `Delete ${noun}?`,
            message: `Do you want to delete the ${noun} "${song.title || 'Untitled'}"?`,
            yesLabel: 'Yes, delete',
            noLabel: 'No',
          }, () => {
            Store.deleteSong(id);
            if (this.state.editingSong === id) this.state.editingSong = null;
            if (this.state.activeSongId === id) this.state.activeSongId = null;
            toast(`Deleted · ${song.title || 'Untitled'}`, 'info');
            this.renderAll();
          });
        });
      });
    },

    // -------- Music tab --------
    // MP3 / audio library backed by MediaStore (IndexedDB). Operators can
    // upload audio files, preview them inline, and remove them. Only one
    // track plays at a time.

    _renderLibraryMusic(body) {
      body.innerHTML = `
        <div class="lib-actions lib-music-upload">
          <button class="btn btn-primary" id="lib-music-upload" data-tip="Upload MP3 or other audio files">${ICONS.upload}<span>Upload Music</span></button>
          <input type="file" id="lib-music-input" accept="audio/*" multiple hidden>
        </div>
        <div class="lib-search">
          <div class="search-box">
            <span data-icon="search"></span>
            <input id="lib-music-search" type="search" placeholder="Search music…" value="${escapeAttr(this.state.musicSearch || '')}">
          </div>
        </div>
        <div class="lib-scroll" id="lib-music-list">
          <div class="bible-state">Loading…</div>
        </div>
      `;

      const input  = $('#lib-music-input', body);
      const upBtn  = $('#lib-music-upload', body);
      const search = $('#lib-music-search', body);

      upBtn.addEventListener('click', () => input.click());
      input.addEventListener('change', async (e) => {
        const files = [...(e.target.files || [])];
        if (!files.length) return;
        let added = 0, skipped = 0;
        for (const f of files) {
          if (!f.type || !f.type.startsWith('audio/')) { skipped++; continue; }
          try {
            await MediaStore.putAudio({
              id: `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              name: f.name.replace(/\.[^.]+$/, ''),
              type: f.type,
              size: f.size,
              blob: f,
              createdAt: Date.now(),
            });
            added++;
          } catch (err) { console.warn('music upload', err); }
        }
        input.value = '';
        if (added)   toast(`Added ${added} track${added === 1 ? '' : 's'}`, 'ok');
        if (skipped) toast(`Skipped ${skipped} non-audio file${skipped === 1 ? '' : 's'}`, 'error');
        this._renderLibraryMusicList(body);
      });

      search.addEventListener('input', (e) => {
        this.state.musicSearch = e.target.value;
        this._renderLibraryMusicList(body);
      });

      this._renderLibraryMusicList(body);
    },

    async _renderLibraryMusicList(body) {
      const list = $('#lib-music-list', body);
      if (!list) return;
      let tracks = [];
      try { tracks = await MediaStore.getAudio(); } catch (_) {}
      const q = (this.state.musicSearch || '').toLowerCase().trim();
      if (q) tracks = tracks.filter(t => (t.name || '').toLowerCase().includes(q));
      tracks.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base', numeric: true }));

      if (tracks.length === 0) {
        list.innerHTML = `<div class="bible-state">${q ? 'No matches.' : 'No music yet.'}<div class="mono">${q ? '' : 'UPLOAD AN MP3 TO GET STARTED'}</div></div>`;
        return;
      }

      list.innerHTML = tracks.map(t => `
        <div class="lib-row lib-music-row" data-music-id="${escapeAttr(t.id)}">
          <button class="lib-music-play" data-music-play="${escapeAttr(t.id)}" title="Play">${ICONS.play}</button>
          <div class="lib-row-body">
            <div class="lib-row-title">${escapeHtml(t.name || 'Untitled')}</div>
            <div class="lib-row-sub">${this._formatBytes(t.size)}</div>
          </div>
          <button class="lib-row-del" data-del-music="${escapeAttr(t.id)}" title="Delete">${ICONS.trash}</button>
        </div>
      `).join('');

      // Re-hydrate inline SVGs in the rendered buttons (ICONS are inlined but
      // `data-icon="..."` placeholders elsewhere need hydration).
      hydrateIcons(list);

      $$('[data-music-play]', list).forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.musicPlay;
          await this._toggleMusicPlayback(id, btn);
        });
      });
      $$('[data-del-music]', list).forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.delMusic;
          this._confirm({
            title: 'Delete track?',
            message: 'Remove this track from the Music library?',
            yesLabel: 'Yes, delete',
            noLabel: 'No',
          }, async () => {
            if (this._musicAudioId === id) this._stopMusic();
            await MediaStore.deleteAudio(id);
            toast('Track deleted', 'info');
            this._renderLibraryMusicList(body);
          });
        });
      });
    },

    async _toggleMusicPlayback(id, btn) {
      const rowBtns = $$('.lib-music-play');
      // If this track is already playing — pause it.
      if (this._musicAudioEl && this._musicAudioId === id && !this._musicAudioEl.paused) {
        this._musicAudioEl.pause();
        if (btn) btn.innerHTML = ICONS.play;
        return;
      }
      // If the same track is paused — resume.
      if (this._musicAudioEl && this._musicAudioId === id && this._musicAudioEl.paused) {
        try { await this._musicAudioEl.play(); } catch (_) {}
        if (btn) btn.innerHTML = ICONS.pause;
        return;
      }
      // Otherwise swap to the new track.
      this._stopMusic();
      let tracks = [];
      try { tracks = await MediaStore.getAudio(); } catch (_) {}
      const track = tracks.find(t => t.id === id);
      if (!track || !track.blob) return toast('Track missing', 'error');

      const url = URL.createObjectURL(track.blob);
      const audio = new Audio(url);
      audio.addEventListener('ended', () => {
        if (btn) btn.innerHTML = ICONS.play;
        this._stopMusic();
      });
      this._musicAudioEl = audio;
      this._musicAudioId = id;
      this._musicAudioUrl = url;
      try { await audio.play(); } catch (_) {}
      rowBtns.forEach(b => { b.innerHTML = ICONS.play; });
      if (btn) btn.innerHTML = ICONS.pause;
    },

    _stopMusic() {
      if (this._musicAudioEl) {
        try { this._musicAudioEl.pause(); } catch (_) {}
        try { this._musicAudioEl.src = ''; } catch (_) {}
      }
      if (this._musicAudioUrl) {
        try { URL.revokeObjectURL(this._musicAudioUrl); } catch (_) {}
      }
      this._musicAudioEl = null;
      this._musicAudioId = null;
      this._musicAudioUrl = null;
    },

    _formatBytes(n) {
      if (!n && n !== 0) return '';
      if (n < 1024) return `${n} B`;
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
      return `${(n / 1024 / 1024).toFixed(1)} MB`;
    },

    // -------- Bible tab --------

    _renderLibraryBible(body) {
      const bkOpts = Bible.BIBLE_BOOKS;
      const otGroup = bkOpts.filter(b => b.t === 'OT').map(b =>
        `<option value="${escapeAttr(b.name)}" ${b.name === this.state.bibleBook ? 'selected' : ''}>${escapeHtml(b.name)}</option>`
      ).join('');
      const ntGroup = bkOpts.filter(b => b.t === 'NT').map(b =>
        `<option value="${escapeAttr(b.name)}" ${b.name === this.state.bibleBook ? 'selected' : ''}>${escapeHtml(b.name)}</option>`
      ).join('');

      const bk = bkOpts.find(b => b.name === this.state.bibleBook) || bkOpts[0];
      const chapterOpts = [];
      for (let i = 1; i <= bk.chapters; i++) {
        chapterOpts.push(`<option value="${i}" ${i === this.state.bibleChapter ? 'selected' : ''}>${i}</option>`);
      }

      // Translations grouped by source: public-domain first, then licensed
      // (API.Bible). Labels include the full name so the dropdown is
      // self-explanatory without a tooltip.
      const pub = Bible.TRANSLATIONS.filter(t => t.source === 'bibleapi');
      const lic = Bible.TRANSLATIONS.filter(t => t.source !== 'bibleapi');
      const transOption = t => `<option value="${escapeAttr(t.code)}" ${t.code === this.state.bibleTranslation ? 'selected' : ''}>${escapeHtml(t.name)} — ${escapeHtml(t.full)}</option>`;
      const transOpts = `
        ${pub.length ? `<optgroup label="Public Domain">${pub.map(transOption).join('')}</optgroup>` : ''}
        ${lic.length ? `<optgroup label="Licensed">${lic.map(transOption).join('')}</optgroup>` : ''}
      `;

      // Searchable book combobox — button shows the current book; clicking
      // opens a menu with a search input at the top and the full book list
      // (grouped by OT/NT) below. Typing filters the list.
      const curBook = this.state.bibleBook;
      const otItems = bkOpts.filter(b => b.t === 'OT').map(b =>
        `<button type="button" class="book-combo-item${b.name === curBook ? ' active' : ''}" data-book="${escapeAttr(b.name)}" role="option">${escapeHtml(b.name)}</button>`
      ).join('');
      const ntItems = bkOpts.filter(b => b.t === 'NT').map(b =>
        `<button type="button" class="book-combo-item${b.name === curBook ? ' active' : ''}" data-book="${escapeAttr(b.name)}" role="option">${escapeHtml(b.name)}</button>`
      ).join('');

      // Chapter combobox — same button + menu style as the book combo,
      // but the menu content is a compact grid of chapter numbers.
      const curChapter = this.state.bibleChapter;
      const chapterGridItems = [];
      for (let i = 1; i <= bk.chapters; i++) {
        chapterGridItems.push(
          `<button type="button" class="chapter-combo-item${i === curChapter ? ' active' : ''}" data-chapter="${i}" role="option">${i}</button>`
        );
      }

      // Verse combobox — picks a specific verse in the current chapter.
      // Verse count comes from loaded chapter data; if not loaded yet the
      // grid is built lazily when the menu opens so we always have a count.
      const curVerse = this.state.bibleSelectedVerse;
      const verseCount = this.state.bibleData?.verses?.length || 0;
      const verseGridItems = [];
      for (let i = 1; i <= verseCount; i++) {
        verseGridItems.push(
          `<button type="button" class="chapter-combo-item${i === curVerse ? ' active' : ''}" data-verse="${i}" role="option">${i}</button>`
        );
      }

      body.innerHTML = `
        <div class="bible-controls">
          <div class="bible-row">
            <div class="book-combo" id="bible-book-combo">
              <button type="button" class="book-combo-button" id="bible-book-btn" aria-haspopup="listbox" aria-expanded="false">
                <span class="book-combo-label" id="bible-book-label">${escapeHtml(curBook)}</span>
                <span class="book-combo-chev">▾</span>
              </button>
              <div class="book-combo-menu hidden" id="bible-book-menu">
                <div class="book-combo-search-wrap">
                  <input type="text" class="book-combo-search" id="bible-book-search" placeholder="Search book…" autocomplete="off" spellcheck="false">
                </div>
                <div class="book-combo-list" id="bible-book-list" role="listbox">
                  <div class="book-combo-group-label" data-group="OT">Old Testament</div>
                  ${otItems}
                  <div class="book-combo-group-label" data-group="NT">New Testament</div>
                  ${ntItems}
                </div>
              </div>
            </div>
            <div class="chapter-combo verse-combo" id="bible-verse-combo">
              <button type="button" class="book-combo-button chapter-combo-button" id="bible-verse-btn" aria-haspopup="listbox" aria-expanded="false" title="Verse">
                <span class="book-combo-label" id="bible-verse-label">${curVerse || '—'}</span>
                <span class="book-combo-chev">▾</span>
              </button>
              <div class="book-combo-menu chapter-combo-menu hidden" id="bible-verse-menu">
                <div class="chapter-combo-grid" id="bible-verse-list" role="listbox">
                  ${verseGridItems.join('') || '<div class="verse-combo-empty">Loading chapter…</div>'}
                </div>
              </div>
            </div>
            <div class="chapter-combo" id="bible-chapter-combo">
              <button type="button" class="book-combo-button chapter-combo-button" id="bible-chapter-btn" aria-haspopup="listbox" aria-expanded="false" title="Chapter">
                <span class="book-combo-label" id="bible-chapter-label">${curChapter}</span>
                <span class="book-combo-chev">▾</span>
              </button>
              <div class="book-combo-menu chapter-combo-menu hidden" id="bible-chapter-menu">
                <div class="chapter-combo-grid" id="bible-chapter-list" role="listbox">
                  ${chapterGridItems.join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="bible-row">
            <select class="select" id="bible-trans" title="Translation">${transOpts}</select>
          </div>
        </div>
        <div class="lib-scroll bible-list" id="bible-list"></div>
        <div class="lib-actions">
          <button class="btn" id="bible-jump">${ICONS.jump}<span>Jump to…</span></button>
          <button class="btn btn-primary" id="bible-add">${ICONS['to-schedule']}<span>Add</span></button>
        </div>
      `;

      this._wireBookCombo(body);
      this._wireVerseCombo(body);
      this._wireChapterCombo(body);
      $('#bible-trans', body).addEventListener('change', (e) => {
        this.state.bibleTranslation = e.target.value;
        Store.setSetting('translation', this.state.bibleTranslation);
        this._renderLibrary();
        this._loadBibleChapter();
      });
      $('#bible-jump', body).addEventListener('click', () => this._openJumpModal());
      $('#bible-add', body).addEventListener('click', () => this._addSelectedVerseToSchedule());

      this._renderBibleList();
    },

    _renderBibleList() {
      const list = $('#bible-list');
      if (!list) return;

      if (this.state.bibleLoading) {
        list.innerHTML = '<div class="bible-state"><span class="mono">LOADING…</span>Fetching chapter from the scripture service…</div>';
        return;
      }
      if (this.state.bibleError) {
        list.innerHTML = `
          <div class="bible-state error">
            <span class="mono">COULDN'T LOAD</span>
            ${escapeHtml(this.state.bibleError)}
            <button class="btn btn-sm" id="bible-retry">Retry</button>
          </div>
        `;
        $('#bible-retry').addEventListener('click', () => this._loadBibleChapter());
        return;
      }

      const data = this.state.bibleData;
      if (!data || !data.verses || !data.verses.length) {
        list.innerHTML = '<div class="bible-state">Select a chapter to read.</div>';
        return;
      }

      const sel = new Set(this.state.bibleSelectedVerses);
      list.innerHTML = data.verses.map(v => `
        <div class="verse-row ${sel.has(v.verse) ? 'active' : ''}" data-verse="${v.verse}">
          <span class="verse-num">${v.verse}</span>${escapeHtml(v.text)}
        </div>
      `).join('');

      $$('.verse-row', list).forEach(row => {
        const vn = parseInt(row.dataset.verse, 10);
        row.addEventListener('click', (e) => {
          if (e.shiftKey && this.state.bibleSelectedVerse != null) {
            // Shift+click: select range from anchor to vn (inclusive).
            e.preventDefault();
            const anchor = this.state.bibleSelectedVerse;
            const lo = Math.min(anchor, vn);
            const hi = Math.max(anchor, vn);
            const inRange = data.verses
              .map(v => v.verse)
              .filter(n => n >= lo && n <= hi);
            this.state.bibleSelectedVerses = inRange;
          } else if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd+click: toggle this verse in/out of the selection.
            const cur = new Set(this.state.bibleSelectedVerses);
            if (cur.has(vn)) cur.delete(vn); else cur.add(vn);
            this.state.bibleSelectedVerses = [...cur].sort((a, b) => a - b);
            this.state.bibleSelectedVerse = vn;
          } else {
            // Plain click: single-select.
            this.state.bibleSelectedVerses = [vn];
            this.state.bibleSelectedVerse = vn;
          }
          this._renderBibleList();
        });
        // Double-click: go Live with the current selection (single or multiple).
        row.addEventListener('dblclick', () => {
          if (this.state.bibleSelectedVerses.length <= 1) {
            this.state.bibleSelectedVerses = [vn];
            this.state.bibleSelectedVerse = vn;
          }
          this._goLiveVerse();
        });
      });
    },

    // Build a paginated scripture item from the current verse selection and
    // push the first slide Live. Long passages become multiple slides — use
    // Next/Prev (or Space) to advance through them.
    _goLiveVerse() {
      const verses = this._getSelectedVersesData();
      if (!verses.length) return toast('Select a verse first.', 'error');
      const style = this._defaultScriptureStyle();
      const payload = this._buildScripturePayload(verses, style);
      const item = {
        id: Store.newId('svc'),
        kind: 'scripture',
        title: payload.title,
        subtitle: `${payload.subtitle}${payload.slides.length > 1 ? ' · ' + payload.slides.length + ' slides' : ''}`,
        slides: payload.slides,
        // Stash raw verses + translation so the workspace "Verses / slide"
        // control can repaginate this item later without re-selecting.
        sourceVerses: verses,
        translation: this.state.bibleTranslation,
        style,
      };
      this.state.schedule.push(item);
      Store.setSchedule(this.state.schedule);
      if (!Projector.isOpen()) Projector.open();
      this._goLiveAt(this.state.schedule.length - 1, 0);
      toast(`Live · ${payload.title}${payload.slides.length > 1 ? ` (${payload.slides.length} slides)` : ''}`, 'ok');
    },

    async _loadBibleChapter() {
      this.state.bibleLoading = true;
      this.state.bibleError = null;
      this.state.bibleData = null;
      this._renderBibleList();
      try {
        const data = await Bible.fetchChapter(
          this.state.bibleBook, this.state.bibleChapter, this.state.bibleTranslation
        );
        this.state.bibleData = data;
        this.state.bibleLoading = false;
        this._renderBibleList();
      } catch (e) {
        this.state.bibleLoading = false;
        this.state.bibleError = e.message || 'Network error';
        this._renderBibleList();
      }
    },

    _selectVerse(n) {
      this.state.bibleSelectedVerse = n;
      this.state.bibleSelectedVerses = [n];
      this._renderBibleList();
    },

    // Rebuild one scripture item's slides from its stashed sourceVerses,
    // without saving or re-rendering. Returns true if it actually changed
    // so the batched caller can avoid a wasted commit. No-op for items
    // without sourceVerses (older items that predate this field).
    _repaginateScriptureItem(itemIdx) {
      const item = this.state.schedule[itemIdx];
      if (!item || item.kind !== 'scripture' || !Array.isArray(item.sourceVerses) || !item.sourceVerses.length) return false;

      // Temporarily restore the item's original translation so the rebuilt
      // reference labels match what the user saw when they added it.
      const savedTrans = this.state.bibleTranslation;
      if (item.translation) this.state.bibleTranslation = item.translation;
      const payload = this._buildScripturePayload(item.sourceVerses, item.style);
      this.state.bibleTranslation = savedTrans;

      item.slides = payload.slides;
      item.subtitle = `${payload.subtitle}${payload.slides.length > 1 ? ' · ' + payload.slides.length + ' slides' : ''}`;

      // Clamp cursors so live / preview stay inside bounds.
      if (this.state.liveScheduleIdx === itemIdx) {
        this.state.currentSlideIdx = clamp(this.state.currentSlideIdx, 0, item.slides.length - 1);
      }
      if (this.state.selectedScheduleIdx === itemIdx) {
        this.state.previewSlideIdx = clamp(this.state.previewSlideIdx, 0, item.slides.length - 1);
      }
      return true;
    },

    // Re-split one existing scripture schedule item into new slides based
    // on the current versesPerSlide setting.
    _repaginateScripture(itemIdx) {
      if (!this._repaginateScriptureItem(itemIdx)) return;
      Store.setSchedule(this.state.schedule);
      this.renderAll();
      if (this.state.liveScheduleIdx === itemIdx && Projector.isOpen()) this._pushLive();
    },

    // Repaginate every scripture item in the schedule at once — used when
    // the "Verses / slide" dropdown changes so every scripture item
    // (not just the one currently on screen) picks up the new size.
    _repaginateAllScripture() {
      let changed = false;
      for (let i = 0; i < this.state.schedule.length; i++) {
        if (this._repaginateScriptureItem(i)) changed = true;
      }
      if (!changed) return;
      Store.setSchedule(this.state.schedule);
      this.renderAll();
      const li = this.state.liveScheduleIdx;
      const liveItem = li >= 0 ? this.state.schedule[li] : null;
      if (liveItem && liveItem.kind === 'scripture' && Projector.isOpen()) this._pushLive();
    },

    _addSelectedVerseToSchedule() {
      const verses = this._getSelectedVersesData();
      if (!verses.length) return toast('Select a verse first.', 'error');
      const style = this._defaultScriptureStyle();
      const payload = this._buildScripturePayload(verses, style);
      this.addToSchedule({
        id: Store.newId('svc'),
        kind: 'scripture',
        title: payload.title,
        subtitle: `${payload.subtitle}${payload.slides.length > 1 ? ' · ' + payload.slides.length + ' slides' : ''}`,
        slides: payload.slides,
        // Keep the raw verse objects on the schedule item so the workspace
        // "Verses / slide" control can re-paginate this item on the fly
        // without requiring the user to re-select and re-add.
        sourceVerses: verses,
        translation: this.state.bibleTranslation,
        style,
      });
      toast(`Added · ${payload.title}${payload.slides.length > 1 ? ` (${payload.slides.length} slides)` : ''}`, 'ok');
    },

    // Return selected verse objects in numerical order.
    _getSelectedVersesData() {
      const data = this.state.bibleData;
      const sel = this.state.bibleSelectedVerses || [];
      if (!data || !sel.length) return [];
      const sorted = [...sel].sort((a, b) => a - b);
      return sorted.map(n => data.verses.find(v => v.verse === n)).filter(Boolean);
    },

    // Format a verse-range label for one chunk.
    _formatVerseRange(verses) {
      const first = verses[0];
      const nums = verses.map(v => v.verse);
      if (verses.length === 1) return `${first.book} ${first.chapter}:${first.verse}`;
      const contiguous = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
      return contiguous
        ? `${first.book} ${first.chapter}:${nums[0]}-${nums[nums.length - 1]}`
        : `${first.book} ${first.chapter}:${nums.join(',')}`;
    },

    // Build a paginated scripture item: 1 or more slides, capped by
    // state.versesPerSlide so long passages don't overflow the projector.
    // Returns { title, subtitle, slides[] }.
    _defaultScriptureStyle() {
      return {
        bgColor: '#000000',
        textColor: '#ffffff',
        fontFamily: 'serif',
        fontSize: 100,
        align: 'center',
        motion: 'none',
      };
    },

    _buildScripturePayload(verses, style) {
      const tr = this.state.bibleTranslation.toUpperCase();
      const overallTitle = this._formatVerseRange(verses);
      const per = Math.max(1, this.state.versesPerSlide || 2);
      const slideStyle = style || this._defaultScriptureStyle();

      // Chunk while keeping contiguous runs together. If the user picked
      // non-contiguous verses, each contiguous run is paginated separately.
      const runs = [];
      let cur = [];
      for (const v of verses) {
        if (!cur.length || v.verse === cur[cur.length - 1].verse + 1) cur.push(v);
        else { runs.push(cur); cur = [v]; }
      }
      if (cur.length) runs.push(cur);

      // Wrap verse numbers in an invisible separator (U+2063) so the
      // renderer can colorize them without the marker being visible if
      // something falls back to plain text rendering.
      const V = '⁣';
      const slides = [];
      for (const run of runs) {
        for (let i = 0; i < run.length; i += per) {
          const chunk = run.slice(i, i + per);
          const refRange = this._formatVerseRange(chunk);
          const text = chunk.length === 1
            ? chunk[0].text
            : chunk.map(v => `${V}${v.verse}${V} ${v.text}`).join('  ');
          slides.push({
            id: Store.newId('sl'),
            kind: 'scripture',
            text,
            reference: `${refRange} · ${tr}`,
            style: slideStyle,
          });
        }
      }
      return { title: overallTitle, subtitle: tr, slides };
    },

    // Wire up the searchable book combobox in the Scripture tab header.
    // The button shows the current book; clicking opens a dropdown with a
    // live-filter search at the top and the full OT/NT book list below.
    _wireBookCombo(body) {
      const combo  = $('#bible-book-combo', body);
      const btn    = $('#bible-book-btn',    body);
      const menu   = $('#bible-book-menu',   body);
      const search = $('#bible-book-search', body);
      const list   = $('#bible-book-list',   body);
      if (!combo || !btn || !menu || !search || !list) return;

      let active = -1;
      const items = () => [...list.querySelectorAll('.book-combo-item:not(.hidden)')];
      const clearHover = () => list.querySelectorAll('.book-combo-item.hovered').forEach(el => el.classList.remove('hovered'));
      const setActive = (i) => {
        const xs = items();
        clearHover();
        active = -1;
        if (i >= 0 && i < xs.length) {
          xs[i].classList.add('hovered');
          xs[i].scrollIntoView({ block: 'nearest' });
          active = i;
        }
      };

      const filterList = (q) => {
        const n = (q || '').toLowerCase().trim();
        const nCompact = n.replace(/\s+/g, '');
        list.querySelectorAll('.book-combo-item').forEach(el => {
          if (!n) { el.classList.remove('hidden'); return; }
          const book = Bible.BIBLE_BOOKS.find(b => b.name === el.dataset.book);
          const nm = (book?.name || '').toLowerCase();
          const nmNoLead = nm.replace(/^[123]\s+/, '');
          const aliases = (book?.aliases || []).map(a => a.toLowerCase());
          const hit =
            nm.includes(n) ||
            nmNoLead.startsWith(n) ||
            aliases.some(a => a.startsWith(n) || a.replace(/\s+/g, '').startsWith(nCompact));
          el.classList.toggle('hidden', !hit);
        });
        // Hide a group label if every item beneath it (up to the next group
        // label) is filtered out.
        const children = [...list.children];
        for (let i = 0; i < children.length; i++) {
          const c = children[i];
          if (!c.classList.contains('book-combo-group-label')) continue;
          let any = false;
          for (let j = i + 1; j < children.length; j++) {
            const n2 = children[j];
            if (n2.classList.contains('book-combo-group-label')) break;
            if (!n2.classList.contains('hidden')) { any = true; break; }
          }
          c.classList.toggle('hidden', !any);
        }
      };

      const open = () => {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        search.value = '';
        filterList('');
        setTimeout(() => search.focus(), 20);
        // Scroll the currently-selected book into view.
        const cur = list.querySelector('.book-combo-item.active');
        if (cur) cur.scrollIntoView({ block: 'center' });
      };
      const close = () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        clearHover();
        active = -1;
      };
      const isOpen = () => !menu.classList.contains('hidden');

      btn.addEventListener('click', () => {
        // Intentionally let the event bubble up — each combo registers a
        // document click listener that closes it when the click is outside
        // its own tree, so clicking another combo's button closes any
        // currently-open menus.
        isOpen() ? close() : open();
      });

      search.addEventListener('input', (e) => {
        filterList(e.target.value);
        const xs = items();
        setActive(xs.length ? 0 : -1);
      });

      search.addEventListener('keydown', (e) => {
        const xs = items();
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (xs.length) setActive((active + 1) % xs.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (xs.length) setActive((active - 1 + xs.length) % xs.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const pick = (active >= 0 && xs[active]) ? xs[active] : xs[0];
          if (pick) { this._selectBook(pick.dataset.book); close(); }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          close();
          btn.focus();
        }
      });

      list.addEventListener('click', (e) => {
        const item = e.target.closest('.book-combo-item');
        if (!item) return;
        this._selectBook(item.dataset.book);
        close();
      });

      // Close when clicking outside the combo.
      const outsideClose = (e) => { if (!combo.contains(e.target)) close(); };
      document.addEventListener('click', outsideClose);
      // Clean up the listener when the library re-renders by removing it
      // on the next pointerdown outside the tree — simpler: tie lifetime
      // to the combo by storing it on the element.
      combo.__outsideClose = outsideClose;
    },

    _selectBook(name) {
      if (!name || name === this.state.bibleBook) return;
      this.state.bibleBook = name;
      this.state.bibleChapter = 1;
      this.state.bibleSelectedVerse = null;
      this.state.bibleSelectedVerses = [];
      Store.setSetting('lastBook', this.state.bibleBook);
      this._renderLibrary();
      this._loadBibleChapter();
    },

    // Chapter combobox — same look as the book combo but the menu content
    // is a grid of chapter numbers (N chapters depends on the book).
    _wireChapterCombo(body) {
      const combo = $('#bible-chapter-combo', body);
      const btn   = $('#bible-chapter-btn',    body);
      const menu  = $('#bible-chapter-menu',   body);
      const list  = $('#bible-chapter-list',   body);
      if (!combo || !btn || !menu || !list) return;

      let active = -1;
      const items = () => [...list.querySelectorAll('.chapter-combo-item')];
      const clearHover = () => list.querySelectorAll('.chapter-combo-item.hovered').forEach(el => el.classList.remove('hovered'));
      const setActive = (i) => {
        const xs = items();
        clearHover();
        active = -1;
        if (i >= 0 && i < xs.length) {
          xs[i].classList.add('hovered');
          xs[i].scrollIntoView({ block: 'nearest' });
          active = i;
        }
      };

      const open = () => {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        // Start keyboard nav at the currently-selected chapter.
        const xs = items();
        const curIdx = xs.findIndex(el => el.classList.contains('active'));
        setActive(curIdx >= 0 ? curIdx : 0);
        const cur = list.querySelector('.chapter-combo-item.active');
        if (cur) cur.scrollIntoView({ block: 'center' });
        // Focus the menu itself so keyboard nav works without a separate input.
        list.setAttribute('tabindex', '0');
        setTimeout(() => list.focus(), 20);
      };
      const close = () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        clearHover();
        active = -1;
      };
      const isOpen = () => !menu.classList.contains('hidden');

      btn.addEventListener('click', () => {
        // Intentionally let the event bubble up — each combo registers a
        // document click listener that closes it when the click is outside
        // its own tree, so clicking another combo's button closes any
        // currently-open menus.
        isOpen() ? close() : open();
      });

      list.addEventListener('keydown', (e) => {
        const xs = items();
        // Guess the grid column count from the first two row's layout —
        // safer to just read from CSS, but a fixed 6 works with our grid.
        const cols = 6;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (xs.length) setActive((active + 1) % xs.length);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (xs.length) setActive((active - 1 + xs.length) % xs.length);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (xs.length) setActive(Math.min(xs.length - 1, active + cols));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (xs.length) setActive(Math.max(0, active - cols));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const pick = (active >= 0 && xs[active]) ? xs[active] : null;
          if (pick) { this._selectChapter(parseInt(pick.dataset.chapter, 10)); close(); }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          close();
          btn.focus();
        }
      });

      list.addEventListener('click', (e) => {
        const item = e.target.closest('.chapter-combo-item');
        if (!item) return;
        this._selectChapter(parseInt(item.dataset.chapter, 10));
        close();
      });

      const outsideClose = (e) => { if (!combo.contains(e.target)) close(); };
      document.addEventListener('click', outsideClose);
      combo.__outsideClose = outsideClose;
    },

    _selectChapter(n) {
      if (!Number.isFinite(n) || n < 1) return;
      if (n === this.state.bibleChapter) return;
      this.state.bibleChapter = n;
      // Intentionally keep bibleSelectedVerse across chapter changes so the
      // verse button stays populated. The verse list just won't highlight
      // anything if the number isn't in the new chapter — user can pick a
      // different verse from the verse combo at any time.
      Store.setSetting('lastChapter', this.state.bibleChapter);
      this._renderLibrary();
      this._loadBibleChapter();
    },

    // Verse combobox — same look as the chapter combo, but the grid shows
    // verse numbers (1..N) for the CURRENT chapter. Picking a verse
    // selects it in the list below and scrolls it into view.
    _wireVerseCombo(body) {
      const combo = $('#bible-verse-combo', body);
      const btn   = $('#bible-verse-btn',   body);
      const menu  = $('#bible-verse-menu',  body);
      const list  = $('#bible-verse-list',  body);
      if (!combo || !btn || !menu || !list) return;

      let active = -1;
      const items = () => [...list.querySelectorAll('.chapter-combo-item')];
      const clearHover = () => list.querySelectorAll('.chapter-combo-item.hovered').forEach(el => el.classList.remove('hovered'));
      const setActive = (i) => {
        const xs = items();
        clearHover();
        active = -1;
        if (i >= 0 && i < xs.length) {
          xs[i].classList.add('hovered');
          xs[i].scrollIntoView({ block: 'nearest' });
          active = i;
        }
      };

      // Repopulate the grid at open time — in case the chapter finished
      // loading after the library was last rendered.
      const repopulate = () => {
        const verses = this.state.bibleData?.verses || [];
        if (verses.length === 0) {
          list.innerHTML = '<div class="verse-combo-empty">Loading chapter…</div>';
          return;
        }
        const cur = this.state.bibleSelectedVerse;
        list.innerHTML = verses.map(v =>
          `<button type="button" class="chapter-combo-item${v.verse === cur ? ' active' : ''}" data-verse="${v.verse}" role="option">${v.verse}</button>`
        ).join('');
      };

      const open = () => {
        repopulate();
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        const xs = items();
        const curIdx = xs.findIndex(el => el.classList.contains('active'));
        setActive(curIdx >= 0 ? curIdx : (xs.length ? 0 : -1));
        const cur = list.querySelector('.chapter-combo-item.active');
        if (cur) cur.scrollIntoView({ block: 'center' });
        list.setAttribute('tabindex', '0');
        setTimeout(() => list.focus(), 20);
      };
      const close = () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        clearHover();
        active = -1;
      };
      const isOpen = () => !menu.classList.contains('hidden');

      btn.addEventListener('click', () => {
        // Intentionally let the event bubble up — each combo registers a
        // document click listener that closes it when the click is outside
        // its own tree, so clicking another combo's button closes any
        // currently-open menus.
        isOpen() ? close() : open();
      });

      list.addEventListener('keydown', (e) => {
        const xs = items();
        const cols = 6;
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (xs.length) setActive((active + 1) % xs.length);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (xs.length) setActive((active - 1 + xs.length) % xs.length);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (xs.length) setActive(Math.min(xs.length - 1, active + cols));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (xs.length) setActive(Math.max(0, active - cols));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const pick = (active >= 0 && xs[active]) ? xs[active] : null;
          if (pick) { this._selectVerseNumber(parseInt(pick.dataset.verse, 10)); close(); }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          close();
          btn.focus();
        }
      });

      list.addEventListener('click', (e) => {
        const item = e.target.closest('.chapter-combo-item');
        if (!item) return;
        this._selectVerseNumber(parseInt(item.dataset.verse, 10));
        close();
      });

      const outsideClose = (e) => { if (!combo.contains(e.target)) close(); };
      document.addEventListener('click', outsideClose);
      combo.__outsideClose = outsideClose;
    },

    _selectVerseNumber(n) {
      if (!Number.isFinite(n) || n < 1) return;
      this.state.bibleSelectedVerse = n;
      this.state.bibleSelectedVerses = [n];
      // Update the button label in place so we don't need a full re-render.
      const label = document.querySelector('#bible-verse-label');
      if (label) label.textContent = String(n);
      this._renderBibleList();
      // Scroll the verse into view inside the list.
      const row = document.querySelector(`.verse-row[data-verse="${n}"]`);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    // Wire the bible-book autocomplete dropdown onto any text input.
    // Used by both the "Jump to…" modal and the inline search bar in the
    // Scripture tab, so both behave identically — type a book name to see
    // suggestions, Arrow nav / Tab / click to pick, Enter to jump.
    _wireJumpAutocomplete({ input, list, onJump }) {
      const splitRef = (raw) => {
        const v = (raw || '').replace(/\s+/g, ' ');
        const m = v.match(/^\s*((?:[123]\s+)?[a-z][a-z\s]*?)\s*(\d.*)?$/i);
        if (!m) return { book: v.trim(), rest: '' };
        return { book: (m[1] || '').trim(), rest: (m[2] || '').trim() };
      };

      let matches = [];
      let active  = -1;

      const hide = () => { list.classList.add('hidden'); list.innerHTML = ''; active = -1; matches = []; };

      const compute = (needle) => {
        if (!needle) return [];
        const n = needle.toLowerCase();
        const nCompact = n.replace(/\s+/g, '');
        return Bible.BIBLE_BOOKS.filter(b => {
          const nm = b.name.toLowerCase();
          const nmNoLead = nm.replace(/^[123]\s+/, '');
          if (nm.startsWith(n)) return true;
          if (nmNoLead.startsWith(n)) return true;
          if ((b.aliases || []).some(a => {
            const al = a.toLowerCase();
            return al.startsWith(n) || al.replace(/\s+/g, '').startsWith(nCompact);
          })) return true;
          return false;
        }).slice(0, 10);
      };

      const render = () => {
        if (matches.length === 0) { hide(); return; }
        list.innerHTML = matches.map((b, i) => `
          <button type="button" class="jump-sugg-item${i === active ? ' active' : ''}" data-idx="${i}" role="option">
            <span class="jump-sugg-name">${escapeHtml(b.name)}</span>
            <span class="jump-sugg-meta">${b.chapters} ch · ${b.t}</span>
          </button>
        `).join('');
        list.classList.remove('hidden');
        const act = list.querySelector('.jump-sugg-item.active');
        if (act) act.scrollIntoView({ block: 'nearest' });
      };

      const refresh = () => {
        const { book } = splitRef(input.value);
        matches = compute(book);
        if (active >= matches.length) active = matches.length - 1;
        if (active < 0 && matches.length > 0) active = 0;
        render();
      };

      const pick = (i) => {
        const b = matches[i];
        if (!b) return;
        const { rest } = splitRef(input.value);
        input.value = rest ? `${b.name} ${rest}` : `${b.name} `;
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        hide();
      };

      input.addEventListener('input', refresh);
      input.addEventListener('focus', refresh);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const q = input.value.trim();
          if (!q) return;

          // 1) Already a complete reference (e.g. "John 3:16", "Proverbs 3 1")
          if (Bible.parseRef(q)) { hide(); onJump(q); return; }

          // 2) Book name only — resolve via highlighted autocomplete if
          //    we have one, else compute fresh. Default to chapter 1,
          //    preserving any chapter/verse the user already typed.
          const { book: bookPart, rest } = splitRef(q);
          let book = (active >= 0 && matches[active]) ? matches[active] : null;
          if (!book) {
            const fresh = compute(bookPart);
            if (fresh.length > 0) book = fresh[0];
          }
          if (book) {
            hide();
            onJump(rest ? `${book.name} ${rest}` : `${book.name} 1`);
            return;
          }

          // 3) Nothing matched — let onJump surface the "Unrecognized" toast.
          onJump(q);
          return;
        }
        if (list.classList.contains('hidden') || matches.length === 0) return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          active = (active + 1) % matches.length;
          render();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          active = (active - 1 + matches.length) % matches.length;
          render();
        } else if (e.key === 'Escape') {
          e.stopPropagation();
          hide();
        } else if (e.key === 'Tab') {
          if (active >= 0) { e.preventDefault(); pick(active); }
        }
      });

      list.addEventListener('mousedown', (e) => {
        const btn = e.target.closest('.jump-sugg-item');
        if (!btn) return;
        e.preventDefault();
        pick(Number(btn.dataset.idx));
      });

      // Hide after focus leaves, but wait a tick so list mousedown still fires.
      input.addEventListener('blur', () => setTimeout(hide, 150));
    },

    _openJumpModal() {
      openModal({
        title: 'Jump to Reference',
        bodyHtml: `
          <div class="mono">ENTER A BIBLE REFERENCE</div>
          <div class="jump-search">
            <input type="text" id="jump-input" placeholder="e.g. John 3:16 or Psalms 23" autocomplete="off" spellcheck="false">
            <div class="jump-suggest hidden" id="jump-suggest" role="listbox"></div>
          </div>
          <div class="help">Type a few letters to see matching books. e.g. <b>p</b> → Psalms, Proverbs, Philippians…</div>
        `,
        footerHtml: `
          <button class="btn" data-close>Cancel</button>
          <button class="btn btn-primary" id="jump-go">Go</button>
        `,
        onMount: ({ close, modal }) => {
          const input = modal.querySelector('#jump-input');
          const list  = modal.querySelector('#jump-suggest');
          setTimeout(() => input.focus(), 20);
          this._wireJumpAutocomplete({
            input, list,
            onJump: (q) => this._doJump(q, close),
          });
          modal.querySelector('#jump-go').addEventListener('click', () => this._doJump(input.value, close));
          modal.querySelector('[data-close]').addEventListener('click', close);
        },
      });
    },

    _doJump(raw, close) {
      const parsed = Bible.parseRef(raw);
      if (!parsed) return toast('Unrecognized reference.', 'error');
      this.state.bibleBook = parsed.book;
      this.state.bibleChapter = parsed.chapter;
      this.state.bibleSelectedVerse = parsed.verseStart || null;
      // If the reference includes a range (e.g. "John 3:16-17"), preselect the
      // whole range so it lights up + can be sent live as one combined slide.
      if (parsed.verseStart && parsed.verseEnd && parsed.verseEnd > parsed.verseStart) {
        const range = [];
        for (let i = parsed.verseStart; i <= parsed.verseEnd; i++) range.push(i);
        this.state.bibleSelectedVerses = range;
      } else if (parsed.verseStart) {
        this.state.bibleSelectedVerses = [parsed.verseStart];
      } else {
        this.state.bibleSelectedVerses = [];
      }
      Store.setSetting('lastBook', parsed.book);
      Store.setSetting('lastChapter', parsed.chapter);
      this.state.libraryTab = 'bible';
      $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'bible'));
      this._renderLibrary();
      this._loadBibleChapter().then(() => {
        if (parsed.verseStart) {
          const row = $(`.verse-row[data-verse="${parsed.verseStart}"]`);
          if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      close();
    },

    // -------- Media tab --------

    _renderLibraryMedia(body) {
      const decks = this.state.pptxDocs;
      const clips = this.state.videoClips;
      const isEmpty = decks.length === 0 && clips.length === 0;

      const deckRows = decks.map(d => {
        const kindLabel = d.source === 'pdf' ? 'PDF'
                        : d.source === 'image' ? 'IMAGE'
                        : 'PPTX';
        const sub = d.source === 'image'
          ? kindLabel
          : `${kindLabel} · ${d.slides.length} slide${d.slides.length === 1 ? '' : 's'}`;
        return `
          <div class="lib-row ${d.id === this.state.activePptxId ? 'active' : ''}" data-pptx-id="${escapeAttr(d.id)}">
            <div class="lib-row-ico">${ICONS.media}</div>
            <div class="lib-row-body">
              <div class="lib-row-title">${escapeHtml(d.title)}</div>
              <div class="lib-row-sub">${sub}</div>
            </div>
            <button class="lib-row-del" data-del-pptx="${escapeAttr(d.id)}" title="Delete">${ICONS.trash}</button>
          </div>
        `;
      }).join('');

      const videoRows = clips.map(v => {
        const secs = v.duration ? `${Math.round(v.duration)}s` : '';
        return `
          <div class="lib-row ${v.id === this.state.activeVideoId ? 'active' : ''}" data-video-id="${escapeAttr(v.id)}">
            <div class="lib-row-ico">${ICONS.media}</div>
            <div class="lib-row-body">
              <div class="lib-row-title">${escapeHtml(v.title)}</div>
              <div class="lib-row-sub">VIDEO${secs ? ' · ' + secs : ''}</div>
            </div>
            <button class="lib-row-del" data-del-video="${escapeAttr(v.id)}" title="Delete">${ICONS.trash}</button>
          </div>
        `;
      }).join('');

      body.innerHTML = `
        <div class="lib-scroll" id="lib-media-list">
          ${isEmpty
            ? `<div class="media-empty">
                 <span class="mono">NO MEDIA LOADED</span>
                 Click <b>Load Media</b> to import a PPTX, PDF, image, or video.
                 <div class="media-tip"><b>Tip:</b> PPTX shows only the first image + text per slide. For complex layouts, export as <b>PDF</b> from PowerPoint and load the PDF instead — it renders pixel-perfect.</div>
               </div>`
            : `${deckRows}${videoRows}`
          }
        </div>
        <div class="lib-actions">
          <button class="btn btn-primary" id="lib-media-load">${ICONS.upload}<span>Load Media</span></button>
          <button class="btn" id="lib-media-add">${ICONS['to-schedule']}<span>Add</span></button>
        </div>
      `;

      $$('[data-pptx-id]', body).forEach(row => {
        const id = row.dataset.pptxId;
        row.addEventListener('click', (e) => {
          if (e.target.closest('.lib-row-del')) return;
          if (this.state.activePptxId !== id) this.state.activePptxSlideIdx = 0;
          this.state.activePptxId = id;
          this.state.activeVideoId = null;
          this.state.editingSong = null;
          this.state.selectedScheduleIdx = -1;
          this._renderLibrary();
          this._renderCenter();
        });
      });

      $$('[data-video-id]', body).forEach(row => {
        const id = row.dataset.videoId;
        row.addEventListener('click', (e) => {
          if (e.target.closest('.lib-row-del')) return;
          this.state.activeVideoId = id;
          this.state.activePptxId = null;
          this.state.editingSong = null;
          this.state.selectedScheduleIdx = -1;
          this._renderLibrary();
          this._renderCenter();
        });
      });

      $$('[data-del-pptx]', body).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.delPptx;
          const deck = this.state.pptxDocs.find(d => d.id === id);
          if (!deck) return;
          const noun = deck.source === 'pdf' ? 'PDF' : 'presentation';
          this._confirm({
            title: `Delete ${noun}?`,
            message: `Do you want to delete the ${noun} "${deck.title}"?`,
            yesLabel: 'Yes, delete',
            noLabel: 'No',
          }, () => {
            this.state.pptxDocs = this.state.pptxDocs.filter(d => d.id !== id);
            if (this.state.activePptxId === id) this.state.activePptxId = null;
            if (typeof MediaStore !== 'undefined') MediaStore.deleteDeck(id);
            toast(`Deleted · ${deck.title}`, 'info');
            this.renderAll();
          });
        });
      });

      $$('[data-del-video]', body).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.delVideo;
          const clip = this.state.videoClips.find(v => v.id === id);
          if (!clip) return;
          this._confirm({
            title: 'Delete video?',
            message: `Do you want to delete the video "${clip.title}"?`,
            yesLabel: 'Yes, delete',
            noLabel: 'No',
          }, () => {
            this.state.videoClips = this.state.videoClips.filter(v => v.id !== id);
            if (this.state.activeVideoId === id) this.state.activeVideoId = null;
            if (clip.url) { try { URL.revokeObjectURL(clip.url); } catch {} }
            if (typeof MediaStore !== 'undefined') MediaStore.deleteVideo(id);
            toast(`Deleted · ${clip.title}`, 'info');
            this.renderAll();
          });
        });
      });

      $('#lib-media-load', body).addEventListener('click', () => this._pickMediaFile());
      $('#lib-media-add', body).addEventListener('click', () => {
        if (this.state.activeVideoId) return this.addVideoToSchedule(this.state.activeVideoId);
        if (this.state.activePptxId)  return this.addPptxToSchedule(this.state.activePptxId);
        toast('Select a deck or video first.', 'error');
      });
    },

    // =========================================================
    // Center panel
    // =========================================================

    _renderCenter() {
      const c = $('#center');

      // Priority: song editor > active song slides > active pptx > active video
      // > schedule item > empty state
      if (this.state.editingSong) {
        return this._renderSongEditor(c);
      }
      if (this.state.activeSongId) {
        return this._renderSongSlides(c);
      }
      if (this.state.activePptxId) {
        return this._renderPptxSlides(c);
      }
      if (this.state.activeVideoId) {
        return this._renderVideoDetail(c);
      }
      // Only show a schedule item in the workspace when it's live
      // (entered via double-click / Go Live). Single-click on a card only
      // highlights it — it doesn't take over the workspace.
      if (this.state.liveScheduleIdx >= 0) {
        return this._renderScheduleSlides(c);
      }

      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">Workspace</div>
          <div class="center-meta">SELECT A SCHEDULE ITEM OR SONG</div>
        </div>
        <div class="center-body">
          <div class="center-empty">
            <div class="big-ico">${ICONS.slides}</div>
            <h3>Nothing selected</h3>
            <p>Open a song from the library, load media, or double-click a schedule card to see its slides here.</p>
          </div>
        </div>
      `;
    },

    _renderScheduleSlides(c) {
      const itemIdx = this.state.liveScheduleIdx;
      const item = this.state.schedule[itemIdx];
      if (!item) { this.state.liveScheduleIdx = -1; return this._renderCenter(); }

      const isScripture = item.kind === 'scripture';
      // Ensure existing scripture items have a style so the edit buttons
      // can mutate something. Older items added before this feature fall
      // back to default here.
      if (isScripture && !item.style) item.style = this._defaultScriptureStyle();
      const sStyle = isScripture ? item.style : null;
      const scriptureEdit = isScripture ? `
        <button class="btn btn-sm ctr-scr-btn" id="ctr-scr-size" title="Font size">
          <span class="ctr-scr-glyph">A</span>
          <span class="ctr-scr-sub">${sStyle.fontSize}%</span>
        </button>
        <button class="btn btn-sm ctr-scr-btn" id="ctr-scr-color" title="Text color">
          <span class="ctr-scr-dot" style="background:${escapeAttr(sStyle.textColor)}"></span>
        </button>
        <button class="btn btn-sm ctr-scr-btn" id="ctr-scr-bg" title="Background color">
          <span class="ctr-scr-dot ctr-scr-dot-bg" style="background:${escapeAttr(sStyle.bgColor || '#000')}"></span>
        </button>
      ` : '';
      const scripturePager = isScripture ? `
        <div class="center-pager">
          <label class="mono">VERSES / SLIDE</label>
          <select class="select select-sm" id="ctr-verses-per-slide">
            ${[1,2,3,4,5,6].map(n => `<option value="${n}" ${n === this.state.versesPerSlide ? 'selected' : ''}>${n}</option>`).join('')}
          </select>
        </div>
      ` : '';

      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">${escapeHtml(item.title || 'Untitled')}</div>
          <div class="center-meta">${escapeHtml(this._kindLabel(item.kind))} · ${item.slides.length} SLIDE${item.slides.length === 1 ? '' : 'S'}</div>
          <div class="center-actions">
            ${item.kind === 'song' && item.refId ? `<button class="btn btn-sm" id="ctr-edit">${ICONS.edit}<span>Edit</span></button>` : ''}
            ${scriptureEdit}
            ${scripturePager}
          </div>
        </div>
        <div class="center-body">
          <div class="slide-grid" id="slide-grid"></div>
        </div>
      `;

      if (isScripture) {
        $('#ctr-verses-per-slide', c).addEventListener('change', (e) => {
          const n = parseInt(e.target.value, 10);
          if (!(n > 0)) return;
          this.state.versesPerSlide = n;
          Store.setSetting('versesPerSlide', n);
          // Apply to every scripture item in the schedule, not just the
          // one being viewed — so a single change stays consistent across
          // the whole service.
          this._repaginateAllScripture();
        });
        $('#ctr-scr-size', c).addEventListener('click', (e) => {
          e.stopPropagation();
          this._openScriptureSizeMenu(e.currentTarget, itemIdx);
        });
        $('#ctr-scr-color', c).addEventListener('click', (e) => {
          e.stopPropagation();
          this._openScriptureColorMenu(e.currentTarget, itemIdx);
        });
        $('#ctr-scr-bg', c).addEventListener('click', (e) => {
          e.stopPropagation();
          this._openScriptureBgMenu(e.currentTarget, itemIdx);
        });
      }

      const grid = $('#slide-grid', c);
      item.slides.forEach((s, i) => {
        const isLive = this.state.currentSlideIdx === i;
        const isPrev = this.state.selectedScheduleIdx === itemIdx && this.state.previewSlideIdx === i;
        grid.appendChild(this._renderSlideCard(s, i, {
          isLive,
          isPreview: isPrev,
          onClick: () => { this.state.selectedScheduleIdx = itemIdx; this.state.previewSlideIdx = i; this.renderAll(); },
          onDblClick: () => this._goLiveAt(itemIdx, i),
        }));
      });

      if (item.kind === 'song' && item.refId) {
        const eb = $('#ctr-edit', c);
        if (eb) eb.addEventListener('click', () => this.openSong(item.refId));
      }
    },

    _renderPptxSlides(c) {
      const deck = this.state.pptxDocs.find(d => d.id === this.state.activePptxId);
      if (!deck) { this.state.activePptxId = null; return this._renderCenter(); }

      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">${escapeHtml(deck.title)}</div>
          <div class="center-meta">PRESENTATION · ${deck.slides.length} SLIDE${deck.slides.length === 1 ? '' : 'S'}</div>
          <div class="center-actions">
            <button class="btn btn-sm" id="pptx-add">${ICONS['to-schedule']}<span>Add to Schedule</span></button>
          </div>
        </div>
        <div class="center-body">
          <div class="slide-grid" id="slide-grid"></div>
        </div>
      `;
      $('#pptx-add', c).addEventListener('click', () => this.addPptxToSchedule(deck.id));

      const grid = $('#slide-grid', c);
      deck.slides.forEach((s, i) => {
        const card = document.createElement('div');
        const isPreview = i === clamp(this.state.activePptxSlideIdx || 0, 0, Math.max(0, deck.slides.length - 1));
        card.className = `slide-card ${isPreview ? 'selected' : ''}`.trim();
        card.innerHTML = `
          <div class="slide-preview image">
            <canvas width="480" height="270"></canvas>
          </div>
          <div class="slide-foot">
            <span class="slide-label">SLIDE</span>
            <span class="slide-num">${String(i + 1).padStart(2, '0')}/${String(deck.slides.length).padStart(2, '0')}</span>
          </div>
        `;
        grid.appendChild(card);
        const canvas = card.querySelector('canvas');
        Pptx.renderToCanvas(s, canvas);

        card.addEventListener('click', () => this._previewPptxSlide(deck, i));
        card.addEventListener('dblclick', () => this._goLivePptxSlide(deck, i));
      });
    },

    async _previewPptxSlide(deck, idx) {
      this.state.activePptxSlideIdx = clamp(idx, 0, Math.max(0, deck.slides.length - 1));
      // Make sure the previewed page has a rendered data URL so the Preview
      // monitor can show it. Other pages stay lazy.
      const s = deck.slides[this.state.activePptxSlideIdx];
      if (s && !s.__dataUrl) {
        try { s.__dataUrl = await Pptx.renderToDataUrl(s); } catch {}
      }
      this._renderCenter();
      this._renderMonitors();
    },

    async _goLivePptxSlide(deck, idx) {
      // Schedule items store pre-rendered dataUrls, so make sure every slide
      // has one before we insert the deck — otherwise arrow nav through the
      // live item would hit blanks on pages we never previewed.
      for (const s of deck.slides) {
        if (!s.__dataUrl) {
          try { s.__dataUrl = await Pptx.renderToDataUrl(s); } catch {}
        }
      }
      // Reuse an existing schedule entry for this deck if one is already
      // there (matches the song/video flow) so repeat Go Live clicks don't
      // pile duplicate copies into the schedule.
      let schedIdx = this.state.schedule.findIndex(
        it => it.kind === 'pptx' && it.refId === deck.id
      );
      if (schedIdx < 0) {
        this.addPptxToSchedule(deck.id);
        schedIdx = this.state.schedule.length - 1;
      }
      if (schedIdx >= 0) this._goLiveAt(schedIdx, idx);
    },

    _renderVideoDetail(c) {
      const clip = this.state.videoClips.find(v => v.id === this.state.activeVideoId);
      if (!clip) { this.state.activeVideoId = null; return this._renderCenter(); }

      const secs = clip.duration ? `${Math.round(clip.duration)}s` : '';
      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">${escapeHtml(clip.title)}</div>
          <div class="center-meta">VIDEO${secs ? ' · ' + secs : ''}${clip.duration ? ' · DOUBLE-CLICK THUMBNAIL TO GO LIVE' : ''}</div>
          <div class="center-actions">
            <button class="btn btn-sm" id="vid-add">${ICONS['to-schedule']}<span>Add to Schedule</span></button>
          </div>
        </div>
        <div class="center-body">
          <div class="video-detail">
            <div class="slide-grid" id="slide-grid"></div>
            <video id="vid-player" src="${escapeAttr(clip.url)}" controls playsinline style="width:100%;max-height:calc(100vh - 360px);background:#000;margin-top:12px;"></video>
          </div>
        </div>
      `;

      // Single slide card: matches the song / pptx pattern — double-click
      // the thumbnail to push this video Live.
      const slide = {
        id: `vid_card_${clip.id}`,
        kind: 'video',
        label: 'VIDEO',
        blobId: clip.id,
        posterUrl: clip.posterUrl,
        loop: true,
        muted: false,
      };
      const grid = $('#slide-grid', c);
      const card = this._renderSlideCard(slide, 0, {
        onClick: () => this._previewVideo(clip),
        onDblClick: () => this._goLiveVideo(clip),
      });
      grid.appendChild(card);

      $('#vid-add', c).addEventListener('click', () => this.addVideoToSchedule(clip.id));
      this._previewVideo(clip);
    },

    _renderSlideCard(slide, idx, opts = {}) {
      const card = document.createElement('div');
      card.className = `slide-card ${opts.isLive ? 'live' : ''} ${opts.isPreview ? 'selected' : ''}`.trim();

      const isScripture = slide.kind === 'scripture';
      const isImage = slide.kind === 'image' && slide.dataUrl;
      const isVideo = slide.kind === 'video';

      if (isVideo) {
        card.innerHTML = `
          <div class="slide-preview image video-thumb">
            ${slide.posterUrl ? `<img src="${escapeAttr(slide.posterUrl)}" alt="">` : ''}
            <div class="video-play">▶</div>
          </div>
          <div class="slide-foot">
            <span class="slide-label">${escapeHtml(slide.label || 'VIDEO')}</span>
            <span class="slide-num">${String(idx + 1).padStart(2, '0')}</span>
          </div>
        `;
      } else if (isImage) {
        card.innerHTML = `
          <div class="slide-preview image">
            <img src="${escapeAttr(slide.dataUrl)}" alt="">
            ${slide.reference ? `<div class="slide-ref">${escapeHtml(slide.reference)}</div>` : ''}
          </div>
          <div class="slide-foot">
            <span class="slide-label">${escapeHtml(slide.label || 'SLIDE')}</span>
            <span class="slide-num">${String(idx + 1).padStart(2, '0')}</span>
          </div>
        `;
      } else {
        const s = this._styleAttrs(slide.style);
        const body = isScripture
          ? this._scriptureHtml(slide.text || '')
          : escapeHtml(slide.text || '');
        card.innerHTML = `
          <div class="slide-preview ${isScripture ? 'scripture' : 'song'} ${s.motionClass}" style="${s.wrap}">
            <pre style="${s.text}">${body}</pre>
            ${slide.reference ? `<div class="slide-ref">${escapeHtml(slide.reference)}</div>` : ''}
          </div>
          <div class="slide-foot">
            <span class="slide-label">${escapeHtml(slide.label || (isScripture ? 'SCRIPTURE' : 'SLIDE'))}</span>
            <span class="slide-num">${String(idx + 1).padStart(2, '0')}</span>
          </div>
        `;
      }

      if (opts.onClick)    card.addEventListener('click',    opts.onClick);
      if (opts.onDblClick) card.addEventListener('dblclick', opts.onDblClick);
      return card;
    },

    // Scripture text carries verse-number markers (U+2063) inserted by
    // _buildScripturePayload. These helpers convert markers to <span
    // class="vnum"> so verse numbers can be styled distinctly.
    _scriptureHtml(text) {
      if (!text) return '';
      return String(text).split('⁣').map((p, i) =>
        i % 2 === 1
          ? `<span class="vnum">${escapeHtml(p)}</span>`
          : escapeHtml(p)
      ).join('');
    },

    _appendScriptureNodes(el, text) {
      el.innerHTML = '';
      if (!text) return;
      const parts = String(text).split('⁣');
      parts.forEach((p, i) => {
        if (i % 2 === 1) {
          const span = document.createElement('span');
          span.className = 'vnum';
          span.textContent = p;
          el.appendChild(span);
        } else if (p) {
          el.appendChild(document.createTextNode(p));
        }
      });
    },

    // Build inline style strings for a song/scripture slide.
    // Returns { wrap, text, motionClass } — caller assigns wrap to the
    // background container, text to the text element, and adds the motion
    // class (if any) so the CSS can drive the animation via a pseudo layer.
    _styleAttrs(style) {
      if (!style) return { wrap: '', text: '', motionClass: '' };
      const fontMap = {
        system:  "'Segoe UI', system-ui, -apple-system, sans-serif",
        serif:   "'Source Serif 4', Georgia, 'Times New Roman', serif",
        display: "'Trebuchet MS', 'Segoe UI', sans-serif",
        mono:    "ui-monospace, 'Consolas', monospace",
      };
      const font = fontMap[style.fontFamily] || fontMap.system;
      const sz = Number(style.fontSize) || 100;
      // The bg-image is exposed as a CSS variable so motion presets can paint
      // it via a pseudo-element and animate transforms on that layer.
      const bgVar = style.bgImage ? `--bg-image:url("${style.bgImage}");` : '';
      const bg = style.bgImage
        ? `background: ${style.bgColor} url("${style.bgImage}") center/cover no-repeat;`
        : `background: ${style.bgColor};`;
      const wrap = `${bgVar}${bg}color:${style.textColor};text-align:${style.align || 'center'};`;
      const text = `color:${style.textColor};font-family:${font};font-size:${sz}%;text-align:${style.align || 'center'};`;
      // Session motion — a live operator-level choice — is authoritative for
      // text slides. The per-song style.motion is treated as a legacy fallback
      // only if the operator has not chosen one for the session.
      const motion = (this.state && this.state.sessionMotion) || style.motion || 'none';
      const motionClass = motion && motion !== 'none' ? `motion-${motion}` : '';
      return { wrap, text, motionClass };
    },

    // =========================================================
    // Song editor
    // =========================================================

    openSong(id) {
      this.state.editingSong = id;
      this.state.activeSongId = null;
      this.state.activePptxId = null;
      this.state.activeVideoId = null;
      this.state.selectedScheduleIdx = -1;
      this.renderAll();
    },

    // Show a song as a read-only slide deck (no edit fields).
    previewSong(id) {
      const switched = this.state.activeSongId !== id;
      this.state.activeSongId = id;
      if (switched) this.state.activeSongSlideIdx = 0;
      this.state.editingSong = null;
      this.state.activePptxId = null;
      this.state.activeVideoId = null;
      this.state.selectedScheduleIdx = -1;
      this.renderAll();
    },

    _renderSongSlides(c) {
      const song = Store.getSong(this.state.activeSongId);
      if (!song) { this.state.activeSongId = null; return this._renderCenter(); }

      const slides = Store.songToSlides(song);
      // Highlight the currently-live slide if this song is on air.
      const liveItem = this.state.liveScheduleIdx >= 0
        ? this.state.schedule[this.state.liveScheduleIdx] : null;
      const isThisSongLive = !!(liveItem && liveItem.kind === 'song' && liveItem.refId === song.id);
      const liveSlideIdx = isThisSongLive ? this.state.currentSlideIdx : -1;

      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">${escapeHtml(song.title || 'Untitled')}</div>
          <div class="center-meta">SONG · ${slides.length} SLIDE${slides.length === 1 ? '' : 'S'}${song.author ? ' · ' + escapeHtml(song.author).toUpperCase() : ''}</div>
          <div class="center-actions">
            <button class="btn btn-sm" id="song-edit">${ICONS.edit}<span>Edit</span></button>
            <button class="btn btn-sm" id="song-add-sched">${ICONS['to-schedule']}<span>Add to Schedule</span></button>
          </div>
        </div>
        <div class="center-body">
          <div class="slide-grid" id="slide-grid"></div>
        </div>
      `;

      const grid = $('#slide-grid', c);
      const previewIdx = clamp(this.state.activeSongSlideIdx || 0, 0, Math.max(0, slides.length - 1));
      slides.forEach((s, i) => {
        const card = this._renderSlideCard(s, i, {
          isLive: i === liveSlideIdx,
          isPreview: i === previewIdx,
          onClick: () => this._previewSongSlide(song, slides, i),
          onDblClick: () => this._goLiveSongSlide(song, slides, i),
        });
        grid.appendChild(card);
      });

      $('#song-edit', c).addEventListener('click', () => this.openSong(song.id));
      $('#song-add-sched', c).addEventListener('click', () => this.addSongToSchedule(song.id));
    },

    _previewSongSlide(song, slides, idx) {
      // State-only update. `_getPreviewSlide` reads activeSongSlideIdx so the
      // Preview monitor, the clicked card's highlight, and the Go Live target
      // all stay in sync after the next render.
      this.state.activeSongSlideIdx = clamp(idx, 0, Math.max(0, slides.length - 1));
      this._renderCenter();
      this._renderMonitors();
    },

    _goLiveSongSlide(song, slides, idx) {
      // Reuse an existing schedule entry for this song if there is one,
      // otherwise add it once. Avoids piling duplicate copies into the
      // schedule on every double-click.
      let schedIdx = this.state.schedule.findIndex(
        it => it.kind === 'song' && it.refId === song.id
      );
      if (schedIdx < 0) {
        this.addSongToSchedule(song.id);
        schedIdx = this.state.schedule.length - 1;
      }
      if (schedIdx >= 0) this._goLiveAt(schedIdx, idx);
    },

    newSong(category) {
      // Default the category to whatever Worship/Hymns toggle is currently
      // active in the Songs tab, and inherit the language filter too so
      // clicking New on the Tagalog + Hymns view gives you a Tagalog hymn.
      if (!category) category = this.state.songCategory || 'worship';
      const language = this.state.songLanguage || 'en';
      const s = Store.newSong({ category, language });
      s._isDraft = true;
      // If the operator had another draft going, silently drop it when empty,
      // or keep them in the existing editor when there's unsaved content.
      if (this.state.draftSong && this._draftHasContent(this.state.draftSong)) {
        return toast('Finish or discard the current draft first', 'info');
      }
      this.state.draftSong = s;
      this.state.editingSong = s.id;
      this.state.activeSongId = null;
      this.state.activePptxId = null;
      this.state.activeVideoId = null;
      this.state.selectedScheduleIdx = -1;
      this.renderAll();
      toast(category === 'hymnal' ? 'New hymn draft — click Save to add it to your library' : 'New song draft — click Save to add it to your library', 'info');
    },

    _draftHasContent(s) {
      if (!s) return false;
      const titleChanged = s.title && s.title !== 'Untitled Song';
      const hasAuthor = !!(s.author && s.author.trim());
      const hasCcli = !!(s.ccli && s.ccli.trim());
      const hasLyrics = Array.isArray(s.sections) && s.sections.some(sec => sec.text && sec.text.trim());
      return titleChanged || hasAuthor || hasCcli || hasLyrics;
    },

    _renderSongEditor(c) {
      const draft = this.state.draftSong && this.state.draftSong.id === this.state.editingSong
        ? this.state.draftSong : null;
      const song = draft || Store.getSong(this.state.editingSong);
      if (!song) { this.state.editingSong = null; return this._renderCenter(); }
      const isDraft = !!draft;

      // Preserve scroll + focus across re-renders so actions like
      // "add section" or changing the style don't snap the editor back
      // to the top or yank focus out of a textarea.
      const prevBody = c.querySelector('.center-body');
      const prevScroll = prevBody ? prevBody.scrollTop : 0;
      const ae = document.activeElement;
      let focusRestore = null;
      if (ae && c.contains(ae)) {
        const sec = ae.closest('.sec-card');
        const sid = sec ? sec.dataset.sid : null;
        if (sid) {
          focusRestore = {
            sid,
            kind: ae.tagName === 'TEXTAREA' ? 'textarea' : (ae.classList.contains('sec-label-in') ? 'label' : null),
            selStart: ae.selectionStart,
            selEnd:   ae.selectionEnd,
          };
        }
      }

      c.innerHTML = `
        <div class="center-head">
          <div class="center-title">${isDraft ? (song.category === 'hymnal' ? 'New Hymn' : 'New Song') : 'Edit Song'}${isDraft ? ' <span class="draft-tag">DRAFT</span>' : ''}</div>
          <div class="center-meta">${Store.songToSlides(song).length} SLIDE${Store.songToSlides(song).length === 1 ? '' : 'S'}</div>
          <div class="center-actions">
            <button class="btn btn-sm" id="song-close">${ICONS.x}<span>${isDraft ? 'Discard' : 'Close'}</span></button>
            <button class="btn btn-sm" id="song-add">${ICONS['to-schedule']}<span>Add to Schedule</span></button>
            ${isDraft ? '' : `<button class="btn btn-sm btn-danger" id="song-del">${ICONS.trash}<span>Delete</span></button>`}
            <button class="btn btn-sm btn-primary" id="song-save">${ICONS.save}<span>Save</span></button>
          </div>
        </div>
        <div class="center-body">
          <div class="song-editor" id="song-editor-root"></div>
        </div>
      `;

      const root = $('#song-editor-root', c);
      const buildSectionCard = (sec, idx) => {
        const sc = document.createElement('div');
        sc.className = 'sec-card';
        sc.dataset.sid = sec.id;
        sc.innerHTML = `
          <div class="sec-bar">
            <input class="sec-label-in" type="text" value="${escapeAttr(sec.label)}">
            <div class="sec-actions">
              <button class="icon-btn" data-sec-up title="Move up">${ICONS.up}</button>
              <button class="icon-btn" data-sec-down title="Move down">${ICONS.down}</button>
              <button class="icon-btn danger" data-sec-del title="Delete section">${ICONS.trash}</button>
            </div>
          </div>
          <div class="sec-body">
            <textarea placeholder="Lyrics here. A blank line splits this section into multiple projector slides.">${escapeHtml(sec.text || '')}</textarea>
          </div>
        `;
        // Listeners
        sc.querySelector('.sec-label-in').addEventListener('input', (e) => { sec.label = e.target.value; Store.saveSong(song); this._updateSlideCountBadge(song); });
        sc.querySelector('textarea').addEventListener('input', (e) => { sec.text = e.target.value; Store.saveSong(song); this._updateSlideCountBadge(song); });
        sc.querySelector('[data-sec-up]').addEventListener('click', () => {
          if (idx > 0) {
            [song.sections[idx - 1], song.sections[idx]] = [song.sections[idx], song.sections[idx - 1]];
            Store.saveSong(song); this._renderSongEditor(c);
          }
        });
        sc.querySelector('[data-sec-down]').addEventListener('click', () => {
          if (idx < song.sections.length - 1) {
            [song.sections[idx + 1], song.sections[idx]] = [song.sections[idx], song.sections[idx + 1]];
            Store.saveSong(song); this._renderSongEditor(c);
          }
        });
        sc.querySelector('[data-sec-del]').addEventListener('click', () => {
          if (song.sections.length === 1) return toast('Keep at least one section.', 'error');
          song.sections = song.sections.filter(x => x.id !== sec.id);
          Store.saveSong(song); this._renderSongEditor(c);
        });
        return sc;
      };

      // Title
      const titleField = document.createElement('div');
      titleField.className = 'song-title-field';
      titleField.innerHTML = `<input type="text" value="${escapeAttr(song.title)}" placeholder="Song title">`;
      titleField.querySelector('input').addEventListener('input', (e) => {
        song.title = e.target.value; Store.saveSong(song);
        const sel = $('.center-title', c);
        if (sel) sel.textContent = 'Edit Song';
        this._renderStatus();
      });
      root.appendChild(titleField);

      // Meta
      const meta = document.createElement('div');
      meta.className = 'song-meta';
      const curLang = song.language || 'en';
      meta.innerHTML = `
        <div class="meta-field"><label>Author</label><input type="text" data-k="author" value="${escapeAttr(song.author)}"></div>
        <div class="meta-field"><label>Tempo (BPM)</label><input type="text" data-k="tempo" value="${escapeAttr(song.tempo)}"></div>
        <div class="meta-field meta-field-wide">
          <label>Language</label>
          <div class="meta-lang-chips">
            <button type="button" class="meta-lang-chip${curLang === 'en' ? ' active' : ''}" data-lang="en">English</button>
            <button type="button" class="meta-lang-chip${curLang === 'tl' ? ' active' : ''}" data-lang="tl">Tagalog</button>
          </div>
        </div>
      `;
      $$('.meta-field input', meta).forEach(inp => {
        inp.addEventListener('input', (e) => { song[inp.dataset.k] = e.target.value; Store.saveSong(song); });
      });
      $$('.meta-lang-chip', meta).forEach(chip => {
        chip.addEventListener('click', () => {
          song.language = chip.dataset.lang;
          Store.saveSong(song);
          $$('.meta-lang-chip', meta).forEach(c => c.classList.toggle('active', c === chip));
          // Re-render the library so the song appears under the right language.
          this._renderLibrary();
        });
      });
      root.appendChild(meta);

      // Style panel
      root.appendChild(this._buildStylePanel(song));

      const lab = document.createElement('div');
      lab.className = 'sections-label';
      lab.textContent = 'SECTIONS · BLANK LINE = NEW SLIDE';
      root.appendChild(lab);

      song.sections.forEach((sec, i) => root.appendChild(buildSectionCard(sec, i)));

      // Add buttons
      const addBar = document.createElement('div');
      addBar.className = 'add-section-bar';
      const addLabels = ['Verse', 'Chorus', 'Bridge', 'Pre-Chorus', 'Tag', 'Outro'];
      addBar.innerHTML = addLabels.map(l =>
        `<button class="btn btn-sm" data-add-sec="${escapeAttr(l)}">${ICONS.plus}<span>${escapeHtml(l)}</span></button>`
      ).join('');
      root.appendChild(addBar);
      $$('[data-add-sec]', addBar).forEach(btn => {
        btn.addEventListener('click', () => {
          const base = btn.dataset.addSec;
          let label = base;
          if (base === 'Verse') {
            const n = song.sections.filter(s => /^verse\b/i.test(s.label)).length + 1;
            label = `Verse ${n}`;
          }
          song.sections.push({ id: Store.newId('sec'), label, text: '' });
          Store.saveSong(song);
          this._renderSongEditor(c);
        });
      });

      // Header actions
      $('#song-close', c).addEventListener('click', () => {
        if (isDraft) {
          const discard = () => {
            this.state.draftSong = null;
            this.state.editingSong = null;
            this.renderAll();
            toast('Draft discarded', 'info');
          };
          if (this._draftHasContent(song)) {
            return this._confirm({
              title: 'Discard draft?',
              message: `You haven't saved this ${song.category === 'hymnal' ? 'hymn' : 'song'} yet. Discard your changes?`,
              yesLabel: 'Discard',
              noLabel: 'Keep editing',
            }, discard);
          }
          return discard();
        }
        // Existing song — drop edit mode but keep the song selected so we land back on its slides view.
        this.state.activeSongId = this.state.editingSong;
        this.state.editingSong = null;
        this.renderAll();
      });
      $('#song-add', c).addEventListener('click', () => {
        // Pressing "Add to Schedule" on a draft is a strong signal of intent,
        // so persist the draft first, then queue it.
        if (isDraft) {
          delete song._isDraft;
          this.state.draftSong = null;
          Store.saveSong(song);
        }
        this.addSongToSchedule(song.id);
      });
      const delBtn = $('#song-del', c);
      if (delBtn) delBtn.addEventListener('click', () => {
        const noun = (song.category === 'hymnal') ? 'hymn' : 'song';
        this._confirm({
          title: `Delete ${noun}?`,
          message: `Do you want to delete the ${noun} "${song.title || 'Untitled'}"?`,
          yesLabel: 'Yes, delete',
          noLabel: 'No',
        }, () => {
          Store.deleteSong(song.id);
          this.state.editingSong = null;
          if (this.state.activeSongId === song.id) this.state.activeSongId = null;
          toast(`Deleted · ${song.title || 'Untitled'}`, 'info');
          this.renderAll();
        });
      });
      $('#song-save', c).addEventListener('click', () => this._saveSong(song));

      // Restore scroll + caret after the rebuild above.
      const newBody = c.querySelector('.center-body');
      if (newBody && prevScroll) newBody.scrollTop = prevScroll;
      if (focusRestore) {
        const target = c.querySelector(`.sec-card[data-sid="${focusRestore.sid}"]`);
        if (target) {
          const el = focusRestore.kind === 'textarea'
            ? target.querySelector('textarea')
            : focusRestore.kind === 'label'
              ? target.querySelector('.sec-label-in')
              : null;
          if (el) {
            el.focus();
            try { el.setSelectionRange(focusRestore.selStart || 0, focusRestore.selEnd || 0); } catch {}
          }
        }
      }
    },

    _buildStylePanel(song) {
      if (!song.style) song.style = Store.defaultStyle();
      const st = song.style;
      const wrap = document.createElement('div');
      wrap.className = 'style-panel';

      const themes = Object.keys(Store.THEMES);
      wrap.innerHTML = `
        <div class="style-title">STYLE</div>
        <div class="style-row">
          <label>Theme</label>
          <div class="theme-chips">
            ${themes.map(t => `
              <button class="theme-chip ${st.theme === t ? 'active' : ''}" data-theme="${t}"
                style="background:${Store.THEMES[t].bgColor};color:${Store.THEMES[t].textColor};">
                ${t}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="style-row">
          <label>Background</label>
          <div class="style-controls">
            <input type="color" data-k="bgColor" value="${escapeAttr(st.bgColor)}">
            <button class="btn btn-xs" data-bg-upload>${ICONS.upload}<span>Image</span></button>
            <button class="btn btn-xs" data-bg-clear ${st.bgImage ? '' : 'disabled'}>${ICONS.x}<span>Clear image</span></button>
          </div>
        </div>
        ${st.bgImage ? `<div class="style-row"><label></label><div class="bg-thumb"><img src="${escapeAttr(st.bgImage)}"></div></div>` : ''}
        <div class="style-row">
          <label>Text color</label>
          <div class="style-controls">
            <input type="color" data-k="textColor" value="${escapeAttr(st.textColor)}">
          </div>
        </div>
        <div class="style-row">
          <label>Font</label>
          <div class="style-controls">
            <select data-k="fontFamily">
              <option value="system" ${st.fontFamily === 'system' ? 'selected' : ''}>System Sans</option>
              <option value="serif"  ${st.fontFamily === 'serif'  ? 'selected' : ''}>Serif</option>
              <option value="display" ${st.fontFamily === 'display' ? 'selected' : ''}>Display</option>
              <option value="mono"   ${st.fontFamily === 'mono'   ? 'selected' : ''}>Mono</option>
            </select>
          </div>
        </div>
        <div class="style-row">
          <label>Size</label>
          <div class="style-controls">
            <input type="range" data-k="fontSize" min="60" max="180" step="5" value="${Number(st.fontSize) || 100}">
            <span class="style-val" id="style-size-val">${Number(st.fontSize) || 100}%</span>
          </div>
        </div>
        <div class="style-row">
          <label>Align</label>
          <div class="align-chips">
            ${['left','center','right'].map(a => `
              <button class="align-chip ${st.align === a ? 'active' : ''}" data-align="${a}">${a}</button>
            `).join('')}
          </div>
        </div>
      `;
      // Motion is set by the operator at play time, not saved per-song — see
      // the Motion picker in the toolbar.

      const commit = () => {
        Store.saveSong(song);
        this._restyleScheduleFor(song);
        this._renderMonitors();
      };

      $$('.theme-chip', wrap).forEach(b => b.addEventListener('click', () => {
        const t = b.dataset.theme;
        song.style = { ...Store.defaultStyle(t), bgImage: st.bgImage };
        commit();
        this._renderSongEditor($('#center'));
      }));

      $$('[data-k]', wrap).forEach(el => el.addEventListener('input', (e) => {
        const k = el.dataset.k;
        let v = e.target.value;
        if (k === 'fontSize') {
          v = Number(v);
          const s = $('#style-size-val', wrap); if (s) s.textContent = `${v}%`;
        }
        song.style[k] = v;
        commit();
      }));

      $$('.align-chip', wrap).forEach(b => b.addEventListener('click', () => {
        song.style.align = b.dataset.align;
        $$('.align-chip', wrap).forEach(x => x.classList.toggle('active', x === b));
        commit();
      }));

      $('[data-bg-upload]', wrap).addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', async (e) => {
          const f = e.target.files[0];
          if (!f) return;
          if (f.size > 6 * 1024 * 1024) return toast('Image too large (max 6 MB)', 'error');
          const r = new FileReader();
          r.onload = () => {
            song.style.bgImage = r.result;
            commit();
            this._renderSongEditor($('#center'));
          };
          r.readAsDataURL(f);
        });
        input.click();
      });

      $('[data-bg-clear]', wrap).addEventListener('click', () => {
        song.style.bgImage = '';
        commit();
        this._renderSongEditor($('#center'));
      });

      return wrap;
    },

    // When a song's style changes, update style on its scheduled slides
    // (preserving IDs / text) so the live output reflects the edit.
    _restyleScheduleFor(song) {
      let changed = false;
      for (const item of this.state.schedule) {
        if (item.kind === 'song' && item.refId === song.id) {
          for (const s of item.slides) {
            if (s.kind === 'song' || s.kind === 'scripture') s.style = song.style;
          }
          changed = true;
        }
      }
      if (changed) Store.setSchedule(this.state.schedule);

      // If the currently live slide belongs to this song, re-push it.
      const liveIdx = this.state.liveScheduleIdx;
      if (liveIdx >= 0) {
        const liveItem = this.state.schedule[liveIdx];
        if (liveItem && liveItem.kind === 'song' && liveItem.refId === song.id && Projector.isOpen()) {
          this._pushLive();
        }
      }
    },

    _saveSong(song) {
      // Promote a draft into the real library on first save.
      if (song._isDraft) {
        delete song._isDraft;
        if (this.state.draftSong && this.state.draftSong.id === song.id) {
          this.state.draftSong = null;
        }
      }
      Store.saveSong(song);
      // Propagate title/slide updates to any existing schedule entries for this song
      let changed = false;
      this.state.schedule = this.state.schedule.map(item => {
        if (item.kind === 'song' && item.refId === song.id) {
          changed = true;
          return {
            ...item,
            title: song.title,
            subtitle: song.author || '',
            slides: Store.songToSlides(song),
          };
        }
        return item;
      });
      if (changed) Store.setSchedule(this.state.schedule);
      toast('Saved', 'ok');
      // Close the editor and drop the operator into the song's read-only
      // slide view so they can immediately see the result of their edits.
      this.state.editingSong = null;
      this.state.activeSongId = song.id;
      this.renderAll();
    },

    addSongToSchedule(id) {
      const s = Store.getSong(id);
      if (!s) return;
      this.addToSchedule({
        id: Store.newId('svc'),
        kind: 'song',
        refId: s.id,
        title: s.title || 'Untitled',
        subtitle: s.author || '',
        slides: Store.songToSlides(s),
      });
      toast(`Added · ${s.title}`, 'ok');
    },

    _updateSlideCountBadge(song) {
      const meta = $('.center-head .center-meta');
      if (meta) {
        const n = Store.songToSlides(song).length;
        meta.textContent = `${n} SLIDE${n === 1 ? '' : 'S'}`;
      }
    },

    // =========================================================
    // PPTX
    // =========================================================

    _pickPptxFile() { return this._pickMediaFile(); },

    _pickMediaFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pptx,.pdf,image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,video/*,.mp4,.webm,.mov,.m4v,.ogv';
      input.multiple = true;
      input.addEventListener('change', async (e) => {
        for (const f of e.target.files) await this.loadMediaFile(f);
      });
      input.click();
    },

    async loadMediaFile(file) {
      const name = (file.name || '').toLowerCase();
      const type = file.type || '';
      if (name.endsWith('.pptx')) return this.loadPptx(file);
      if (name.endsWith('.pdf'))  return this.loadPdf(file);
      if (type.startsWith('video/') || /\.(mp4|webm|mov|m4v|ogv)$/i.test(name)) {
        return this.loadVideo(file);
      }
      if (type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp)$/i.test(name)) {
        return this.loadImage(file);
      }
      toast(`Unsupported file: ${file.name}`, 'error');
    },

    // Wrap a loose image file in the same shape the Media tab already
    // renders — a pptx-style deck with a single image slide. This lets
    // images share the go-live / add-to-schedule / thumbnail paths the
    // PPTX and PDF decks use without introducing a fourth media type.
    loadImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result || '');
          const deck = {
            id: `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
            source: 'image',
            title: file.name.replace(/\.[^.]+$/, ''),
            slides: [{
              id: `img_sl_${Date.now().toString(36)}`,
              text: '',
              imageDataUrl: dataUrl,
              __dataUrl: dataUrl,
            }],
            createdAt: Date.now(),
          };
          this.state.pptxDocs.unshift(deck);
          this.state.libraryTab = 'media';
          $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'media'));
          this.state.activePptxId = deck.id;
          this.state.activePptxSlideIdx = 0;
          this.state.activeVideoId = null;
          this._renderLibrary();
          this._renderCenter();
          if (typeof MediaStore !== 'undefined') MediaStore.putDeck(deck);
          toast(`Loaded · ${deck.title}`, 'ok');
          resolve();
        };
        reader.onerror = () => {
          toast(`Failed to read image: ${file.name}`, 'error');
          resolve();
        };
        reader.readAsDataURL(file);
      });
    },

    async loadPdf(file) {
      toast(`Parsing ${file.name}…`, 'info');
      try {
        const deck = await Pdf.parse(file);
        this.state.pptxDocs.unshift(deck);
        this.state.libraryTab = 'media';
        $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'media'));
        this.state.activePptxId = deck.id;
        this.state.activePptxSlideIdx = 0;
        this.state.activeVideoId = null;
        this._renderLibrary();
        this._renderCenter();
        if (typeof MediaStore !== 'undefined') MediaStore.putDeck(deck);
        const total = deck.totalPages || deck.slides.length;
        if (deck.failedPages && deck.failedPages.length) {
          toast(`Loaded ${deck.slides.length}/${total} pages — failed: ${deck.failedPages.join(', ')}`, 'error');
        } else {
          toast(`Loaded · ${deck.slides.length} page${deck.slides.length === 1 ? '' : 's'}`, 'ok');
        }
      } catch (e) {
        console.error(e);
        toast(`PDF parse failed: ${e.message || e}`, 'error');
      }
    },

    async loadVideo(file) {
      toast(`Loading ${file.name}…`, 'info');
      try {
        const clip = await Video.parse(file);
        this.state.videoClips.unshift(clip);
        this.state.libraryTab = 'media';
        $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'media'));
        this.state.activeVideoId = clip.id;
        this.state.activePptxId = null;
        this._renderLibrary();
        this._renderCenter();
        // Persist without the per-document object URL — it won't survive a
        // reload. The blob is what matters; we rehydrate a fresh URL on boot.
        if (typeof MediaStore !== 'undefined') {
          const { url, ...persist } = clip;
          MediaStore.putVideo(persist);
        }
        toast(`Loaded · ${file.name}`, 'ok');
      } catch (e) {
        console.error(e);
        toast(`Video load failed: ${e.message || e}`, 'error');
      }
    },

    // Projector reads video blobs via window.opener.App.getVideoBlob().
    // We key by the clip id so the slide payload stays small and
    // serializable — no Blob cloning through BroadcastChannel.
    getVideoBlob(clipId) {
      const c = this.state.videoClips.find(x => x.id === clipId);
      return c ? c.blob : null;
    },

    addVideoToSchedule(id) {
      const v = this.state.videoClips.find(x => x.id === id);
      if (!v) return;
      const slide = {
        id: Store.newId('sl'),
        kind: 'video',
        label: 'VIDEO',
        blobId: v.id,
        posterUrl: v.posterUrl,
        loop: true,
        muted: false,
        text: '',
      };
      this.addToSchedule({
        id: Store.newId('svc'),
        kind: 'video',
        title: v.title,
        subtitle: v.duration ? `${Math.round(v.duration)}s` : 'video',
        slides: [slide],
      });
      toast(`Added · ${v.title}`, 'ok');
    },

    _previewVideo(clip) {
      const stage = $('#preview-stage');
      stage.innerHTML = '';
      stage.className = 'monitor-stage video';
      const v = document.createElement('video');
      v.src = clip.url;
      v.muted = true;
      v.loop = true;
      v.autoplay = true;
      v.playsInline = true;
      v.controls = false;
      v.style.width = '100%';
      v.style.height = '100%';
      v.style.objectFit = 'contain';
      v.style.background = '#000';
      stage.appendChild(v);
      $('#preview-ref').textContent = clip.title.toUpperCase();
    },

    _goLiveVideo(clip) {
      // Route through the schedule just like _goLiveSongSlide does, so
      // the LIVE monitor, schedule highlight, and transport controls all
      // reflect the on-air state. Reuse an existing schedule entry for
      // this clip if there is one, otherwise add it once.
      let schedIdx = this.state.schedule.findIndex(
        it => it.kind === 'video' && it.slides[0] && it.slides[0].blobId === clip.id
      );
      if (schedIdx < 0) {
        this.addVideoToSchedule(clip.id);
        schedIdx = this.state.schedule.length - 1;
      }
      if (schedIdx >= 0) this._goLiveAt(schedIdx, 0);
    },

    async loadPptx(file) {
      if (!/\.pptx$/i.test(file.name)) return toast('Only .pptx files.', 'error');
      toast(`Parsing ${file.name}…`, 'info');
      try {
        const deck = await Pptx.parse(file);
        this.state.pptxDocs.unshift(deck);
        this.state.libraryTab = 'media';
        $$('.lib-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'media'));
        this.state.activePptxId = deck.id;
        this.state.activePptxSlideIdx = 0;
        this.state.activeVideoId = null;
        // Pre-render data URIs off the main thread bursts (keep simple: serial)
        for (const s of deck.slides) {
          try { s.__dataUrl = await Pptx.renderToDataUrl(s); } catch {}
        }
        this._renderLibrary();
        this._renderCenter();
        if (typeof MediaStore !== 'undefined') MediaStore.putDeck(deck);
        toast(`Loaded · ${deck.slides.length} slides`, 'ok');
        if (!this._pptxHintShown) {
          this._pptxHintShown = true;
          setTimeout(() => toast(
            'PPTX shows first image + text only. Export as PDF for pixel-perfect slides.',
            'info'
          ), 900);
        }
      } catch (e) {
        console.error(e);
        toast(`Parse failed: ${e.message || e}`, 'error');
      }
    },

    addPptxToSchedule(id) {
      const d = this.state.pptxDocs.find(x => x.id === id);
      if (!d) return;
      const slides = d.slides.map((s, i) => ({
        id: Store.newId('sl'),
        kind: 'image',
        label: 'SLIDE',
        dataUrl: s.__dataUrl,
        text: s.text,
      }));
      this.addToSchedule({
        id: Store.newId('svc'),
        kind: 'pptx',
        refId: d.id,
        title: d.title,
        subtitle: `${slides.length} slides`,
        slides,
      });
      toast(`Added · ${d.title}`, 'ok');
    },

    // =========================================================
    // Import / Export
    // =========================================================

    _exportSchedule() {
      const payload = Store.exportAll();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `ez-worship-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('Schedule exported', 'ok');
    },

    _importScheduleFile(file) {
      if (!file) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const data = JSON.parse(r.result);
          Store.importAll(data);
          this.state.schedule = Store.getSchedule();
          toast('Import complete', 'ok');
          this.renderAll();
        } catch (e) {
          toast(`Import failed: ${e.message || e}`, 'error');
        }
      };
      r.onerror = () => toast('Could not read file.', 'error');
      r.readAsText(file);
    },

    // =========================================================
    // Song Import modal
    // =========================================================

    _openImportSongModal() {
      const body = document.createElement('div');
      body.innerHTML = `
        <div class="mono">PASTE LYRICS · [VERSE 1] / [CHORUS] MARKERS AUTO-DETECTED</div>
        <input type="text" id="imp-title" placeholder="Song title (optional)">
        <textarea id="imp-text" placeholder="[Verse 1]
First line here
Second line here

[Chorus]
..."></textarea>
      `;
      const m = openModal({
        title: 'Import Song',
        bodyEl: body,
        footerHtml: `
          <button class="btn" data-close>Cancel</button>
          <button class="btn btn-primary" id="imp-go">Import</button>
        `,
        onMount: ({ close, modal }) => {
          setTimeout(() => modal.querySelector('#imp-title').focus(), 20);
          modal.querySelector('[data-close]').addEventListener('click', close);
          modal.querySelector('#imp-go').addEventListener('click', () => {
            this._doImportSong(
              modal.querySelector('#imp-title').value,
              modal.querySelector('#imp-text').value,
              close
            );
          });
        },
      });
    },

    _doImportSong(title, raw, close) {
      const text = (raw || '').trim();
      if (!text) return toast('Paste some lyrics first.', 'error');

      const sections = this._parseLyrics(text);
      // Place imported songs into whichever song-like tab is active so the
      // user lands in the right list, and inherit the current language
      // toggle so a Tagalog import lands under the Tagalog tab.
      const category = this.state.libraryTab === 'hymnal' ? 'hymnal' : 'worship';
      const language = this.state.songLanguage || 'en';
      const s = Store.newSong({
        title: (title || '').trim() || 'Imported Song',
        sections,
        category,
        language,
      });
      Store.saveSong(s);
      this.openSong(s.id);
      const langLabel = language === 'tl' ? 'Tagalog' : 'English';
      toast(`Imported to ${langLabel} · ${sections.length} section${sections.length === 1 ? '' : 's'}`, 'ok');
      close();
    },

    // Recognize section labels in many formats — bracketed ([Verse 1]),
    // parenthesized ((Chorus)), plain ("Verse 1"), all-caps ("CHORUS"),
    // colon-suffixed ("Chorus:"), and Tagalog equivalents (Koro, Tulay,
    // Talata, Saknong). Returns the cleaned label or null.
    _detectSectionLabel(rawLine) {
      if (rawLine == null) return null;
      let s = String(rawLine).trim();
      if (!s || s.length > 30) return null;
      // Strip wrapping brackets / parens / braces
      s = s.replace(/^[\[({]/, '').replace(/[\])}]$/, '').trim();
      // Strip a trailing colon / period
      s = s.replace(/[:.,]\s*$/, '').trim();
      if (!s) return null;
      const lower = s.toLowerCase();
      const KEYWORDS = [
        'verse', 'chorus', 'bridge',
        'pre-chorus', 'prechorus', 'pre chorus',
        'post-chorus', 'postchorus',
        'intro', 'outro', 'tag', 'ending', 'refrain', 'interlude',
        'hook', 'vamp', 'turnaround', 'instrumental', 'coda', 'stanza',
        // Tagalog
        'koro', 'talata', 'tulay', 'saknong',
      ];
      for (const kw of KEYWORDS) {
        if (lower === kw) return s;
        // Allow a trailing number / section index: "Verse 1", "Chorus 2",
        // "Verse-2", "Verse.1"
        if (lower.startsWith(kw)) {
          const rest = lower.slice(kw.length).replace(/^[-.\s]+/, '').trim();
          if (!rest) return s;
          if (/^\d[\d\s.]*$/.test(rest)) return s;
        }
      }
      return null;
    },

    _parseLyrics(raw) {
      const text = (raw || '').replace(/\r/g, '').trim();
      if (!text) return [];

      const out = [];
      const lines = text.split('\n');
      let cur = null;
      let sawLabel = false;

      for (const line of lines) {
        const label = this._detectSectionLabel(line);
        if (label !== null) {
          sawLabel = true;
          if (cur) out.push(cur);
          cur = { id: Store.newId('sec'), label, text: '' };
        } else {
          if (!cur) cur = { id: Store.newId('sec'), label: 'Verse 1', text: '' };
          cur.text += (cur.text ? '\n' : '') + line;
        }
      }
      if (cur) out.push(cur);

      // If no section labels were found anywhere, fall back to splitting
      // on blank lines and auto-labeling each chunk Verse 1 / Verse 2 / …
      if (!sawLabel) {
        const chunks = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
        return chunks.map((t, i) => ({
          id: Store.newId('sec'),
          label: `Verse ${i + 1}`,
          text: t,
        }));
      }

      return out
        .map(s => ({ ...s, text: s.text.replace(/^\s+|\s+$/g, '') }))
        .filter(s => s.text || s.label);
    },

    // =========================================================
    // Live / transport
    // =========================================================

    goLiveSchedule(idx) {
      if (idx < 0 || idx >= this.state.schedule.length) return toast('Select a schedule item first.', 'error');
      this._goLiveAt(idx, 0);
    },

    // Router for the "Go Live" toolbar button. Whatever the operator is
    // previewing or has selected wins over the live schedule item — so
    // clicking a song slide / pptx page / video / verse and hitting Go Live
    // sends *that* to the output, instead of re-triggering what was already
    // live. Falls back to the selected schedule item's previewed slide.
    _goLiveFromWorkspace() {
      if (this.state.activeSongId) {
        const song = Store.getSong(this.state.activeSongId);
        if (song) {
          const slides = Store.songToSlides(song);
          if (slides.length) {
            const i = clamp(this.state.activeSongSlideIdx || 0, 0, slides.length - 1);
            return this._goLiveSongSlide(song, slides, i);
          }
        }
      }
      if (this.state.activePptxId) {
        const deck = this.state.pptxDocs.find(d => d.id === this.state.activePptxId);
        if (deck && deck.slides.length) {
          const i = clamp(this.state.activePptxSlideIdx || 0, 0, deck.slides.length - 1);
          return this._goLivePptxSlide(deck, i);
        }
      }
      if (this.state.activeVideoId) {
        const clip = this.state.videoClips.find(v => v.id === this.state.activeVideoId);
        if (clip) return this._goLiveVideo(clip);
      }
      if ((this.state.bibleSelectedVerses || []).length > 0) {
        return this._goLiveVerse();
      }
      const sIdx = this.state.selectedScheduleIdx;
      if (sIdx >= 0 && this.state.schedule[sIdx]) {
        const item = this.state.schedule[sIdx];
        const i = clamp(this.state.previewSlideIdx || 0, 0, Math.max(0, item.slides.length - 1));
        return this._goLiveAt(sIdx, i);
      }
      toast('Select a slide, scripture, or schedule item first.', 'error');
    },

    _goLiveAt(idx, slideIdx) {
      const item = this.state.schedule[idx];
      if (!item || !item.slides.length) return;
      this.state.liveScheduleIdx = idx;
      this.state.currentSlideIdx = clamp(slideIdx, 0, item.slides.length - 1);
      this.state.selectedScheduleIdx = idx;
      // Mirror live: preview shows the same slide that just went live.
      // The operator can change preview by clicking a different slide card.
      this.state.previewSlideIdx = this.state.currentSlideIdx;
      // Exit any other workspace view so the live schedule item's slides
      // actually appear in the center panel.
      this.state.editingSong = null;
      this.state.activeSongId = null;
      this.state.activePptxId = null;
      this.state.activeVideoId = null;
      // Drop any countdown that was showing — otherwise _getLiveSlide would
      // keep returning it and _pushLive would re-send the countdown to the
      // projector instead of the slide we just asked for.
      this.state.countdownSlide = null;
      this.state.liveDeck = null;
      if (!Projector.isOpen()) Projector.open();
      this._pushLive();
      this.renderAll();
    },

    _pushLive() {
      const slide = this._getLiveSlide();
      if (!slide) { Projector.clear(); return; }
      if (!Projector.isOpen()) toast('Projector is not open.', 'error');
      else Projector.showSlide(this._withSessionMotion(slide));
    },

    // Overlay the session-level motion choice onto the slide's style before
    // sending to the projector. Only text-based slides (song / scripture)
    // accept motion; video and image-based slides pass through unchanged so
    // existing motion/content (e.g. a loop video) isn't disturbed.
    _withSessionMotion(slide) {
      if (!slide || !slide.style) return slide;
      if (slide.kind !== 'song' && slide.kind !== 'scripture') return slide;
      const motion = this.state.sessionMotion || 'none';
      return { ...slide, style: { ...slide.style, motion } };
    },

    _getLiveSlide() {
      // Out-of-band paged deck (multi-slide birthday, etc.) takes top priority.
      const d = this.state.liveDeck;
      if (d && d.slides && d.slides.length) {
        const i = clamp(d.idx || 0, 0, d.slides.length - 1);
        return d.slides[i];
      }
      // Countdown slides live outside the schedule and take precedence.
      if (this.state.countdownSlide) return this.state.countdownSlide;
      const idx = this.state.liveScheduleIdx;
      if (idx < 0) return null;
      const item = this.state.schedule[idx];
      return item && item.slides[this.state.currentSlideIdx] || null;
    },

    _getPreviewSlide() {
      // When the operator is previewing an item from the library (song, pptx,
      // video) in the center workspace, the Preview monitor should track the
      // clicked slide there — otherwise the monitor would disagree with the
      // highlighted slide card. Workspace state wins over schedule state.
      if (this.state.activeSongId) {
        const song = Store.getSong(this.state.activeSongId);
        if (song) {
          const slides = Store.songToSlides(song);
          if (slides.length) {
            const i = clamp(this.state.activeSongSlideIdx || 0, 0, slides.length - 1);
            return { slide: slides[i], label: `${song.title || 'SONG'} · ${i + 1}/${slides.length}` };
          }
        }
      }
      if (this.state.activePptxId) {
        const deck = this.state.pptxDocs.find(d => d.id === this.state.activePptxId);
        if (deck && deck.slides.length) {
          const i = clamp(this.state.activePptxSlideIdx || 0, 0, deck.slides.length - 1);
          const s = deck.slides[i];
          return {
            slide: { id: s.id, kind: 'image', dataUrl: s.__dataUrl || '' },
            label: `${deck.title} · ${i + 1}/${deck.slides.length}`,
          };
        }
      }
      if (this.state.activeVideoId) {
        const clip = this.state.videoClips.find(v => v.id === this.state.activeVideoId);
        if (clip) {
          return {
            slide: { id: clip.id, kind: 'image', dataUrl: clip.posterUrl || '' },
            label: clip.title || 'VIDEO',
          };
        }
      }
      // Default behavior: Preview mirrors Live. The operator only sees
      // something different when they explicitly click a slide card in
      // the center panel (which sets previewSlideIdx).
      if (this.state.selectedScheduleIdx < 0) {
        if (this.state.liveScheduleIdx < 0) return null;
        const it = this.state.schedule[this.state.liveScheduleIdx];
        const s = it && it.slides[this.state.currentSlideIdx];
        if (!s) return null;
        return { slide: s, label: `${it.title} · ${this.state.currentSlideIdx + 1}/${it.slides.length}` };
      }
      const it = this.state.schedule[this.state.selectedScheduleIdx];
      if (!it) return null;
      const s = it.slides[this.state.previewSlideIdx];
      if (!s) return null;
      return { slide: s, label: `${it.title} · ${this.state.previewSlideIdx + 1}/${it.slides.length}` };
    },

    go() {
      const sIdx = this.state.selectedScheduleIdx;
      const lIdx = this.state.liveScheduleIdx;
      // Nothing live yet → start either the selected item or the first.
      if (lIdx < 0) {
        if (sIdx >= 0) return this._goLiveAt(sIdx, this.state.previewSlideIdx);
        if (this.state.schedule.length) return this._goLiveAt(0, 0);
        return;
      }
      // If preview is showing a different slide than what's live, push it.
      const isMirror = sIdx === lIdx && this.state.previewSlideIdx === this.state.currentSlideIdx;
      if (sIdx >= 0 && !isMirror) {
        return this._goLiveAt(sIdx, this.state.previewSlideIdx);
      }
      // Otherwise advance the live item.
      this.nextSlide();
    },

    // `stayInItem: true` pins navigation to the current schedule item — at
    // the end of the item, next becomes a no-op instead of auto-advancing
    // into the next schedule slot. Used by the keyboard arrow handler so
    // accidental keypresses don't change which song/scripture is on air.
    nextSlide(opts) {
      const stayInItem = !!(opts && opts.stayInItem);
      // Paged out-of-band deck (e.g. multi-slide birthday) — page within it.
      const d = this.state.liveDeck;
      if (d && d.slides && d.slides.length) {
        if (d.idx < d.slides.length - 1) {
          d.idx++;
          this._pushLive();
          this.renderAll();
        }
        return;
      }
      const idx = this.state.liveScheduleIdx;
      if (idx < 0) {
        if (!stayInItem && this.state.schedule.length) this._goLiveAt(0, 0);
        return;
      }
      const item = this.state.schedule[idx];
      if (!item) return;
      if (this.state.currentSlideIdx < item.slides.length - 1) {
        this.state.currentSlideIdx++;
      } else {
        if (!stayInItem && idx < this.state.schedule.length - 1) {
          return this._goLiveAt(idx + 1, 0);
        }
        return;  // at end of item (pinned) or at end of schedule
      }
      // Mirror preview to live so Preview keeps showing what's on screen.
      if (this.state.selectedScheduleIdx === idx) {
        this.state.previewSlideIdx = this.state.currentSlideIdx;
      }
      this._pushLive();
      this.renderAll();
    },

    prevSlide(opts) {
      const stayInItem = !!(opts && opts.stayInItem);
      const d = this.state.liveDeck;
      if (d && d.slides && d.slides.length) {
        if (d.idx > 0) {
          d.idx--;
          this._pushLive();
          this.renderAll();
        }
        return;
      }
      const idx = this.state.liveScheduleIdx;
      if (idx < 0) return;
      if (this.state.currentSlideIdx > 0) {
        this.state.currentSlideIdx--;
      } else if (!stayInItem && idx > 0) {
        const prev = this.state.schedule[idx - 1];
        if (!prev) return;
        return this._goLiveAt(idx - 1, prev.slides.length - 1);
      } else {
        return;
      }
      if (this.state.selectedScheduleIdx === idx) {
        this.state.previewSlideIdx = this.state.currentSlideIdx;
      }
      this._pushLive();
      this.renderAll();
    },

    clearLive() {
      this.state.liveScheduleIdx = -1;
      this.state.currentSlideIdx = 0;
      this.state.countdownSlide = null;
      this.state.liveDeck = null;
      Projector.setBlackout(false);
      Projector.clear();
      this.renderAll();
    },

    blackout() {
      const on = Projector.toggleBlackout();
      toast(on ? 'BLACK' : 'Back to LIVE', on ? 'info' : 'ok');
      this._renderMonitors();
    },

    // =========================================================
    // Monitors
    // =========================================================

    _renderMonitors() {
      // Live monitor
      const liveStage = $('#live-stage');
      const liveSlide = this._getLiveSlide();
      this._monitorSlideHtml(liveStage, liveSlide, { role: 'live' });
      $('#live-ref').textContent = liveSlide
        ? (liveSlide.reference || liveSlide.label || '').toString().toUpperCase()
        : '—';
      const liveWrap = $('.monitor-live');
      const bo = Projector.getState().blackout;
      liveWrap.classList.toggle('blackout', !!bo && !!liveSlide);

      // Preview monitor
      const prev = this._getPreviewSlide();
      const prevStage = $('#preview-stage');
      this._monitorSlideHtml(prevStage, prev ? prev.slide : null, { role: 'preview' });
      $('#preview-ref').textContent = prev ? prev.label.toUpperCase() : '—';

      // Toolbar live indicators — highlight whichever of the live-control
      // buttons matches the current projector state so the operator can
      // tell at a glance what is on screen.
      this._refreshToolbarLiveState();
    },

    // Pulse the toolbar button whose action is currently on the projector.
    // The "Clear" button is inert here — nothing is playing when the
    // output is empty, so there's nothing to identify.
    _refreshToolbarLiveState() {
      const liveSlide = this._getLiveSlide();
      const blackout  = Projector.getState().blackout;
      const kind      = liveSlide ? liveSlide.kind : null;

      const set = (selector, active) => {
        const el = $(selector);
        if (el) el.classList.toggle('tbar-live', !!active);
      };

      set('#tb-countdown',    kind === 'countdown');
      set('#tb-announcement', kind === 'announcement');
      set('#tb-birthday',     kind === 'birthday');
      set('#tb-blackout',     !!blackout);
    },

    _monitorSlideHtml(stage, slide, opts = {}) {
      const role = opts.role || 'live';
      // Keep a playing video element intact across unrelated re-renders so
      // playback doesn't restart from 0 on every renderAll().
      const prevId = stage.dataset.slideId || '';
      const nextId = slide ? slide.id : '';
      const isPlayingVideo = role === 'live' && slide && slide.kind === 'video';
      if (isPlayingVideo && prevId === nextId && stage.querySelector('video')) {
        return;
      }
      // Same-deck announcement paging — swap text only so the motion
      // preset on the monitor preview doesn't restart each Next.
      if (slide && slide.kind === 'announcement' && slide.deckId
          && stage.dataset.deckId === slide.deckId
          && stage.classList.contains('announcement')) {
        [...stage.querySelectorAll('.ann-title, .ann-message')].forEach(n => n.remove());
        if (slide.title) {
          const t = document.createElement('div');
          t.className = 'ann-title';
          t.textContent = slide.title;
          stage.appendChild(t);
        }
        if (slide.text) {
          const m = document.createElement('pre');
          m.className = 'ann-message';
          m.textContent = slide.text;
          stage.appendChild(m);
        }
        stage.dataset.slideId = nextId;
        return;
      }
      // Same-deck birthday navigation — swap just the people list so the
      // monitor's twinkle layers don't restart on every Next.
      if (slide && slide.kind === 'birthday' && slide.deckId
          && stage.dataset.deckId === slide.deckId
          && stage.classList.contains('birthday')) {
        const prevContent = stage.querySelector('.bday-content');
        if (prevContent) {
          const people = Array.isArray(slide.people) && slide.people.length
            ? slide.people
            : (slide.name ? [{ name: slide.name, date: slide.date || '' }] : []);
          ['bday-count-1', 'bday-count-2', 'bday-count-3', 'bday-count-few', 'bday-count-many', 'bday-count-lots']
            .forEach(c => stage.classList.remove(c));
          const n = people.length;
          if (n <= 1)       stage.classList.add('bday-count-1');
          else if (n === 2) stage.classList.add('bday-count-2');
          else if (n === 3) stage.classList.add('bday-count-3');
          else if (n === 4) stage.classList.add('bday-count-few');
          else if (n <= 8)  stage.classList.add('bday-count-many');
          else              stage.classList.add('bday-count-lots');
          prevContent.outerHTML = `
            <div class="bday-content">
              <div class="bday-greeting">${escapeHtml(slide.greeting || 'Happy Birthday!')}</div>
              <div class="bday-people">
                ${people.map(p => `
                  <div class="bday-person">
                    <div class="bday-name">${escapeHtml(p.name || '')}</div>
                    ${p.date ? `<div class="bday-date">${escapeHtml(p.date)}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          stage.dataset.slideId = nextId;
          return;
        }
      }
      // Tear down any prior countdown ticker before we blow away the DOM.
      if (stage.__cdInterval) { clearInterval(stage.__cdInterval); stage.__cdInterval = null; }
      stage.className = 'monitor-stage';
      stage.innerHTML = '';
      stage.dataset.slideId = nextId;
      stage.dataset.deckId = (slide && slide.deckId) ? slide.deckId : '';
      if (!slide) return;

      if (slide.kind === 'announcement') {
        stage.classList.add('announcement');
        const motion = (slide.style && slide.style.motion) || this.state.sessionMotion || 'none';
        if (motion && motion !== 'none') stage.classList.add(`motion-${motion}`);
        if (slide.title) {
          const t = document.createElement('div');
          t.className = 'ann-title';
          t.textContent = slide.title;
          stage.appendChild(t);
        }
        if (slide.text) {
          const m = document.createElement('pre');
          m.className = 'ann-message';
          m.textContent = slide.text;
          stage.appendChild(m);
        }
        return;
      }

      if (slide.kind === 'birthday') {
        stage.classList.add('birthday');
        const people = Array.isArray(slide.people) && slide.people.length
          ? slide.people
          : (slide.name ? [{ name: slide.name, date: slide.date || '' }] : []);
        const n = people.length;
        if (n <= 1)       stage.classList.add('bday-count-1');
        else if (n === 2) stage.classList.add('bday-count-2');
        else if (n === 3) stage.classList.add('bday-count-3');
        else if (n === 4) stage.classList.add('bday-count-few');
        else if (n <= 8)  stage.classList.add('bday-count-many');
        else              stage.classList.add('bday-count-lots');
        stage.innerHTML = `
          <div class="bday-content">
            <div class="bday-greeting">${escapeHtml(slide.greeting || 'Happy Birthday!')}</div>
            <div class="bday-people">
              ${people.map(p => `
                <div class="bday-person">
                  <div class="bday-name">${escapeHtml(p.name || '')}</div>
                  ${p.date ? `<div class="bday-date">${escapeHtml(p.date)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
        return;
      }

      if (slide.kind === 'countdown') {
        stage.classList.add('countdown');
        stage.innerHTML = `
          <div class="cd-label">${escapeHtml(slide.label || '')}</div>
          <div class="cd-time" data-cd-time>00:00</div>
        `;
        const timeEl = stage.querySelector('[data-cd-time]');
        let lastSec = -1;
        const tick = () => {
          const remaining = Math.max(0, slide.endsAt - Date.now());
          const totalSec = Math.ceil(remaining / 1000);
          const mm = Math.floor(totalSec / 60);
          const ss = totalSec % 60;
          const display = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
          if (timeEl.textContent !== display) timeEl.textContent = display;

          const inFinal = remaining > 0 && totalSec <= 10;
          const inCritical = remaining > 0 && totalSec <= 3;
          stage.classList.toggle('final', inFinal);
          stage.classList.toggle('critical', inCritical);

          if (totalSec !== lastSec) {
            lastSec = totalSec;
            if (inFinal) {
              timeEl.classList.remove('beat');
              void timeEl.offsetWidth;
              timeEl.classList.add('beat');
            }
          }

          if (remaining <= 0 && stage.__cdInterval) {
            clearInterval(stage.__cdInterval);
            stage.__cdInterval = null;
            stage.classList.remove('final', 'critical');
            timeEl.classList.remove('beat');
          }
        };
        tick();
        stage.__cdInterval = setInterval(tick, 200);
        return;
      }

      if (slide.kind === 'image' && slide.dataUrl) {
        stage.classList.add('image');
        const img = document.createElement('img');
        img.src = slide.dataUrl;
        stage.appendChild(img);
        return;
      }
      if (slide.kind === 'video') {
        stage.classList.add('image');
        const clip = this.state.videoClips.find(v => v.id === slide.blobId);
        const url = clip && clip.url;
        // Only the LIVE monitor actually plays the video, so there's
        // never more than one thing "playing" at a time.
        if (role === 'live' && url) {
          const v = document.createElement('video');
          v.src = url;
          v.autoplay = true;
          v.loop = slide.loop !== false;
          v.muted = true;                 // projector carries audio; monitor stays muted
          v.playsInline = true;
          v.controls = false;
          v.style.width = '100%';
          v.style.height = '100%';
          v.style.objectFit = 'contain';
          v.style.background = '#000';
          if (slide.posterUrl) v.poster = slide.posterUrl;
          stage.appendChild(v);
          v.play().catch(() => {});
        } else {
          // Preview (or no blob available): just show the poster + a
          // play badge so the operator can see what's queued.
          if (slide.posterUrl) {
            const img = document.createElement('img');
            img.src = slide.posterUrl;
            stage.appendChild(img);
          }
          const badge = document.createElement('div');
          badge.className = 'video-play';
          badge.textContent = '▶';
          stage.appendChild(badge);
        }
        return;
      }
      if (slide.kind === 'scripture') stage.classList.add('scripture');
      const s = this._styleAttrs(slide.style);
      if (s.wrap) stage.setAttribute('style', s.wrap);
      if (s.motionClass) stage.classList.add(s.motionClass);
      const pre = document.createElement('pre');
      if (slide.kind === 'scripture') {
        this._appendScriptureNodes(pre, slide.text || '');
      } else {
        pre.textContent = slide.text || '';
      }
      if (s.text) pre.setAttribute('style', s.text);
      stage.appendChild(pre);
      if (slide.reference) {
        const ref = document.createElement('div');
        ref.className = 'mref';
        ref.textContent = slide.reference;
        stage.appendChild(ref);
      }
    },
  };

  // Kick off — guarded so boot only happens once
  window.App = App;
  let _booted = false;

  // Hardcoded operator credentials (client-side gate, not real security —
  // source is visible in the browser, and git history retains prior values).
  // Treat these as a soft gate to deter casual tire-kickers, not an
  // access-control mechanism. Rotate them for your deployment.
  const AUTH_USER = 'PAW';
  const AUTH_PASS = '1234';
  const AUTH_KEY  = 'playandworship.auth.v1';
  // Magic-link secret — append `?k=<this>` to the URL to skip the login
  // gate. Kept separate from the password so the password itself never
  // appears in a shared URL. Rotate on each deployment.
  const AUTH_LINK = 'paw-invite-2026-kR9mX2';

  // Run the branded splash, then reveal the app.
  const _showSplash = () => {
    const loader = document.getElementById('app-loader');
    const status = document.getElementById('loader-status');
    if (!loader) return;
    loader.classList.remove('hidden');
    const steps = [
      { at:    0, msg: 'Initializing…' },
      { at:  900, msg: 'Loading library…' },
      { at: 1800, msg: 'Preparing scripture…' },
      { at: 2700, msg: 'Ready to lead.' },
    ];
    steps.forEach(s => setTimeout(() => {
      if (!status) return;
      status.textContent = s.msg;
      status.classList.remove('step-change');
      void status.offsetWidth;
      status.classList.add('step-change');
    }, s.at));
    setTimeout(() => loader.classList.add('hidden'), 3500);
  };

  // Wire the login form. On correct submit, hide gate and boot the app.
  const _wireLoginGate = () => {
    const gate  = document.getElementById('login-gate');
    const form  = document.getElementById('login-form');
    const user  = document.getElementById('login-user');
    const pass  = document.getElementById('login-pass');
    const error = document.getElementById('login-error');
    const card  = form && form.querySelector ? form : null;
    if (!form) return;

    // Autofocus username on mount
    setTimeout(() => user && user.focus(), 50);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = (user.value || '').trim();
      const p = pass.value || '';
      if (u === AUTH_USER && p === AUTH_PASS) {
        try { sessionStorage.setItem(AUTH_KEY, 'true'); } catch {}
        if (error) error.textContent = '';
        if (gate) {
          gate.classList.add('hiding');
          setTimeout(() => gate.remove(), 500);
        }
        App.init();
        _showSplash();
      } else {
        if (error) error.textContent = 'Invalid username or password.';
        if (form) {
          form.classList.remove('shake');
          void form.offsetWidth;
          form.classList.add('shake');
        }
        if (pass) { pass.value = ''; pass.focus(); }
      }
    });
  };

  // Authenticated session guard. Demo preview (?demo=1) bypasses everything.
  const boot = () => {
    if (_booted) return;
    _booted = true;

    const params  = new URLSearchParams(location.search);
    const isDemo  = params.get('demo') === '1';
    // Magic-link: `?k=<AUTH_LINK>` skips the login gate and marks this
    // session authenticated. We mint the session token and strip the `k`
    // param from the visible URL so the secret isn't left sitting in the
    // address bar / browser history any longer than necessary.
    const linkKey = params.get('k');
    if (linkKey && linkKey === AUTH_LINK) {
      try { sessionStorage.setItem(AUTH_KEY, 'true'); } catch {}
      try {
        params.delete('k');
        const q = params.toString();
        const clean = location.pathname + (q ? '?' + q : '') + location.hash;
        history.replaceState(null, '', clean);
      } catch {}
    }
    const isAuthed = (() => { try { return sessionStorage.getItem(AUTH_KEY) === 'true'; } catch { return false; } })();
    const gate    = document.getElementById('login-gate');
    const loader  = document.getElementById('app-loader');

    if (isDemo) {
      if (gate) gate.remove();
      document.body.classList.add('no-loader');
      App.init();
      return;
    }

    if (isAuthed) {
      if (gate) gate.remove();
      App.init();
      _showSplash();
      return;
    }

    // Not authenticated — hide splash, show login gate, wait for submit.
    if (loader) loader.classList.add('hidden');
    _wireLoginGate();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

})();
