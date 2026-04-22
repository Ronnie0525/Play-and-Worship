/* ============================================================
   mediaStore.js — IndexedDB-backed persistence for media assets.

   localStorage (used by store.js for songs/schedule/settings) caps
   out around 5–10 MB and can't hold raw Blobs, so it isn't a fit
   for PDF page dataURLs, large PPTX decks, images, or video blobs.
   IndexedDB handles gigabytes and stores Blobs/Files by reference,
   which is exactly what this app needs for the Media library.

   Two object stores:
     - decks:  PPTX / PDF / image decks (pptxDocs shape)
     - videos: video clips with their raw File blobs
   ============================================================ */

const MediaStore = (() => {

  const DB_NAME = 'worship-media';
  const DB_VERSION = 1;
  const STORE_DECKS = 'decks';
  const STORE_VIDEOS = 'videos';

  let dbPromise = null;

  const open = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        return reject(new Error('IndexedDB not available'));
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_DECKS)) {
          db.createObjectStore(STORE_DECKS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
          db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  };

  const reqP = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const withStore = async (name, mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(name, mode);
      const store = tx.objectStore(name);
      const out = fn(store);
      tx.oncomplete = () => resolve(out);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  };

  const getAll    = (name)      => withStore(name, 'readonly', s => reqP(s.getAll()));
  const put       = (name, rec) => withStore(name, 'readwrite', s => reqP(s.put(rec)));
  const del       = (name, id)  => withStore(name, 'readwrite', s => reqP(s.delete(id)));
  const clearAll  = (name)      => withStore(name, 'readwrite', s => reqP(s.clear()));

  return {
    // Fire-and-forget open so the handshake happens once, early.
    init: () => open().catch(e => console.warn('MediaStore init failed', e)),

    getDecks:    async () => { try { return await getAll(STORE_DECKS); } catch { return []; } },
    putDeck:     (deck)   => put(STORE_DECKS, deck).catch(e => console.warn('putDeck', e)),
    deleteDeck:  (id)     => del(STORE_DECKS, id).catch(e => console.warn('deleteDeck', e)),
    clearDecks:  ()       => clearAll(STORE_DECKS).catch(e => console.warn('clearDecks', e)),

    getVideos:   async () => { try { return await getAll(STORE_VIDEOS); } catch { return []; } },
    putVideo:    (video)  => put(STORE_VIDEOS, video).catch(e => console.warn('putVideo', e)),
    deleteVideo: (id)     => del(STORE_VIDEOS, id).catch(e => console.warn('deleteVideo', e)),
    clearVideos: ()       => clearAll(STORE_VIDEOS).catch(e => console.warn('clearVideos', e)),
  };
})();
