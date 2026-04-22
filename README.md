# Play & Worship

A browser-based worship presentation app modeled on EasyWorship's operator layout. No backend, no install, no build step. Open `index.html` and go.

## Running

1. Open the root `index.html` for the landing page, or open `app/index.html` directly for the operator console. Works in Chrome, Edge, or any Chromium-based browser (Firefox and Safari also work).
2. Click **Live Output** in the toolbar — a second window opens. Drag it to the projector display and press `F` or `F11` to go fullscreen.
3. Build your schedule, hit **Go Live** (or Space).

> The projector window has to be opened by a click — browsers block programmatic `window.open` without a user gesture.

## Layout

- **Menu bar** — File / Edit / Schedule / Help, plus status pills showing projector connection and LIVE state.
- **Toolbar** — Live Output · New Song · Import Song · Load PPTX · Go Live · Clear · Blackout · Export · Import.
- **Schedule bar** — horizontal strip of cards; click = preview, double-click = go live, drag to reorder, hover for × to remove.
- **Library (left)** — three tabs: Songs, Scripture, Media.
- **Center workspace** — slide grid for the selected schedule item or loaded deck; swaps into a song editor when editing.
- **Monitors (right)** — PREVIEW (blue) on top, LIVE (red) below, with transport buttons between them, and a keyboard-shortcut card at the bottom.
- **Status bar** — "Ready" indicator, live state, counts.

## Modules

### Songs
- Full CRUD in `localStorage`.
- Editor has title, author, CCLI, key, tempo.
- Sections can be reordered, renamed, deleted. Six quick-add buttons: + Verse / Chorus / Bridge / Pre-Chorus / Tag / Outro.
- **A blank line inside a section's textarea splits that section into multiple projector slides** — matches how most song tools work.
- **Import Song** modal: paste lyrics with `[Verse 1]`, `[Chorus]` markers and they're parsed; without markers, blank-line-separated chunks become sequential "Verse N" sections.

### Scripture
- All 66 books with correct chapter counts, OT/NT grouped.
- Translations: WEB, KJV, ASV, YLT, BBE (all public domain).
- Chapters fetched live from [bible-api.com](https://bible-api.com); results cached in memory.
- Click verse = select, double-click = add selected verse to schedule.
- **Jump to…** parses "John 3:16", "Psalms 23", "1 Corinthians 13:4-7".
- Last book / chapter / translation persisted.

### Media (PPTX)
- Click **Load .pptx** or drop via the toolbar.
- Parsed client-side with JSZip: text from every `<a:t>` run grouped by paragraph, first image per slide pulled via `_rels`.
- Every slide rendered to a 1920x1080 data URI upfront so going live is instant.
- Click a deck in the library to see its slide grid in the center; double-click a thumbnail to push it live directly, or **Add to Schedule** to queue the whole deck.

## Schedule

- Items: songs, scriptures, or pptx decks.
- Drag cards to reorder. The Live/Selected indices follow the move.
- Click a card to preview its slides in the center workspace. Double-click to go live.
- ✕ on hover removes the card.

## Transport

| Action      | Button | Key          |
|-------------|--------|--------------|
| Go          | Go (red) | Space       |
| Next slide  | Next   | → / PgDn      |
| Prev slide  | Prev   | ← / PgUp      |
| Clear live  | Clear  | Esc          |
| Blackout    | Blackout | B          |
| Fullscreen (projector) | — | F / F11 |

- **Go** pushes the currently-previewed slide to Live. If nothing is selected and nothing is live, it starts the first schedule item.
- **Next** past the last slide of an item auto-advances to the next schedule item.
- **Blackout** drops projector opacity to 0 without clearing state — press B again to bring it back.

## Persistence

Stored in `localStorage`:

| Key                 | Contents                               |
|---------------------|----------------------------------------|
| `worship.songs`     | Song library (array of song objects)   |
| `worship.service`   | Current schedule                       |
| `worship.settings`  | `{ translation, lastBook, lastChapter }` |

PPTX decks currently live in memory only (reloaded each session). Their slides in the schedule keep their rendered data URIs, so schedule-imported decks persist fine.

## Export / Import

- **File → Export Schedule** downloads a JSON blob with songs + schedule + settings.
- **File → Import Schedule** merges songs by ID and replaces the current schedule.

## Projector communication

The main window and projector window talk via `BroadcastChannel('worship-projector')`.

| Direction        | Message                                              |
|------------------|------------------------------------------------------|
| main → projector | `{ type: 'render', payload: { slide, blackout } }`   |
| projector → main | `{ type: 'ready' }` on load/focus                    |

When the projector sends `ready`, the main window re-sends state — so reloading the projector mid-service picks up right where you were.

## Files

```
Play and Worship/
├── index.html                ← marketing / landing page
├── README.md
├── assets/
│   ├── BRAND.md
│   ├── logo.svg              ← web logo (full badge)
│   ├── logo-illustrator.svg  ← editable master for Illustrator
│   ├── logo-mark-dark.svg    ← mark only, myrtle (for light bg)
│   ├── logo-mark-gold.svg    ← mark only, antique gold (neutral)
│   ├── logo-mark-white.svg   ← mark only, white (for dark bg)
│   └── rworship-brand-kit.zip
└── app/
    ├── index.html            ← operator shell
    ├── projector.html        ← output window (inline script, short)
    ├── css/
    │   ├── app.css           ← operator UI
    │   └── projector.css     ← output styles
    └── js/
        ├── app.js            ← single App object, all operator logic
        ├── bible.js          ← 66 books + translations + fetcher + ref parser
        ├── mediaStore.js     ← IndexedDB-backed media blob store
        ├── pdf.js            ← PDF.js loader + per-page renderer
        ├── pptx.js           ← JSZip parser + canvas renderer
        ├── projector.js      ← output-window controller
        ├── store.js          ← localStorage + song/slide helpers
        └── video.js          ← video slide helpers
```

## Content policy

- **No Bible verse text is bundled.** All scripture is fetched live from bible-api.com (public-domain translations only).
- **No song lyrics are bundled.** Songs are empty containers — you add your own CCLI-licensed content.
- No cloud, no telemetry. Everything runs in the browser tab.
