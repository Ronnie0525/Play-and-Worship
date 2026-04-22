/* ============================================================
   bible.js — 66-book data, translations, fetcher, ref parser.

   Two sources, routed by the `source` field on each translation:
     • bible-api.com            → free public-domain translations
     • api.scripture.api.bible  → licensed translations (NIV, NLT, ASND…)

   NOTE: the API.Bible key below is client-side (visible in source).
   Lock it down in your API.Bible dashboard by adding allowed referrers
   (playandworship.app, localhost, 127.0.0.1) so stolen keys can't be
   reused from other domains.
   ============================================================ */

const Bible = (() => {

  const API_BIBLE_KEY  = 'YDz3xAgKKdLkyhJk04spu';
  const API_BIBLE_BASE = 'https://rest.api.bible/v1';

  const BIBLE_BOOKS = [
    // Old Testament
    { name: 'Genesis',         chapters: 50, t: 'OT', aliases: ['gen','ge','gn'] },
    { name: 'Exodus',          chapters: 40, t: 'OT', aliases: ['exo','ex','exod'] },
    { name: 'Leviticus',       chapters: 27, t: 'OT', aliases: ['lev','lv'] },
    { name: 'Numbers',         chapters: 36, t: 'OT', aliases: ['num','nm','nu'] },
    { name: 'Deuteronomy',     chapters: 34, t: 'OT', aliases: ['deut','dt','de'] },
    { name: 'Joshua',          chapters: 24, t: 'OT', aliases: ['josh','jos'] },
    { name: 'Judges',          chapters: 21, t: 'OT', aliases: ['judg','jdg','jg'] },
    { name: 'Ruth',            chapters: 4,  t: 'OT', aliases: ['ru','rut'] },
    { name: '1 Samuel',        chapters: 31, t: 'OT', aliases: ['1sam','1 sam','1sa','1s'] },
    { name: '2 Samuel',        chapters: 24, t: 'OT', aliases: ['2sam','2 sam','2sa','2s'] },
    { name: '1 Kings',         chapters: 22, t: 'OT', aliases: ['1kgs','1 kgs','1ki','1k'] },
    { name: '2 Kings',         chapters: 25, t: 'OT', aliases: ['2kgs','2 kgs','2ki','2k'] },
    { name: '1 Chronicles',    chapters: 29, t: 'OT', aliases: ['1chron','1 chron','1ch','1chr'] },
    { name: '2 Chronicles',    chapters: 36, t: 'OT', aliases: ['2chron','2 chron','2ch','2chr'] },
    { name: 'Ezra',            chapters: 10, t: 'OT', aliases: ['ezr'] },
    { name: 'Nehemiah',        chapters: 13, t: 'OT', aliases: ['neh','ne'] },
    { name: 'Esther',          chapters: 10, t: 'OT', aliases: ['est','es'] },
    { name: 'Job',             chapters: 42, t: 'OT', aliases: ['jb'] },
    { name: 'Psalms',          chapters: 150, t:'OT', aliases: ['ps','psa','psalm'] },
    { name: 'Proverbs',        chapters: 31, t: 'OT', aliases: ['prov','pr','prv'] },
    { name: 'Ecclesiastes',    chapters: 12, t: 'OT', aliases: ['ecc','eccl','ec'] },
    { name: 'Song of Solomon', chapters: 8,  t: 'OT', aliases: ['song','sos','ss','canticles','cant'] },
    { name: 'Isaiah',          chapters: 66, t: 'OT', aliases: ['isa','is'] },
    { name: 'Jeremiah',        chapters: 52, t: 'OT', aliases: ['jer','je'] },
    { name: 'Lamentations',    chapters: 5,  t: 'OT', aliases: ['lam','la'] },
    { name: 'Ezekiel',         chapters: 48, t: 'OT', aliases: ['ezek','eze','ezk'] },
    { name: 'Daniel',          chapters: 12, t: 'OT', aliases: ['dan','dn','da'] },
    { name: 'Hosea',           chapters: 14, t: 'OT', aliases: ['hos','ho'] },
    { name: 'Joel',            chapters: 3,  t: 'OT', aliases: ['jl'] },
    { name: 'Amos',            chapters: 9,  t: 'OT', aliases: ['am'] },
    { name: 'Obadiah',         chapters: 1,  t: 'OT', aliases: ['obad','oba','ob'] },
    { name: 'Jonah',           chapters: 4,  t: 'OT', aliases: ['jon','jnh'] },
    { name: 'Micah',           chapters: 7,  t: 'OT', aliases: ['mic','mi'] },
    { name: 'Nahum',           chapters: 3,  t: 'OT', aliases: ['nah','na'] },
    { name: 'Habakkuk',        chapters: 3,  t: 'OT', aliases: ['hab','hb'] },
    { name: 'Zephaniah',       chapters: 3,  t: 'OT', aliases: ['zeph','zep','zp'] },
    { name: 'Haggai',          chapters: 2,  t: 'OT', aliases: ['hag','hg'] },
    { name: 'Zechariah',       chapters: 14, t: 'OT', aliases: ['zech','zec','zc'] },
    { name: 'Malachi',         chapters: 4,  t: 'OT', aliases: ['mal','ml'] },
    // New Testament
    { name: 'Matthew',         chapters: 28, t: 'NT', aliases: ['matt','mt'] },
    { name: 'Mark',            chapters: 16, t: 'NT', aliases: ['mk','mrk'] },
    { name: 'Luke',            chapters: 24, t: 'NT', aliases: ['lk','luk'] },
    { name: 'John',            chapters: 21, t: 'NT', aliases: ['jn','jhn','joh'] },
    { name: 'Acts',            chapters: 28, t: 'NT', aliases: ['act','ac'] },
    { name: 'Romans',          chapters: 16, t: 'NT', aliases: ['rom','ro','rm'] },
    { name: '1 Corinthians',   chapters: 16, t: 'NT', aliases: ['1cor','1 cor','1co'] },
    { name: '2 Corinthians',   chapters: 13, t: 'NT', aliases: ['2cor','2 cor','2co'] },
    { name: 'Galatians',       chapters: 6,  t: 'NT', aliases: ['gal','ga'] },
    { name: 'Ephesians',       chapters: 6,  t: 'NT', aliases: ['eph','ephes'] },
    { name: 'Philippians',     chapters: 4,  t: 'NT', aliases: ['phil','php','pp'] },
    { name: 'Colossians',      chapters: 4,  t: 'NT', aliases: ['col','co'] },
    { name: '1 Thessalonians', chapters: 5,  t: 'NT', aliases: ['1thess','1 thess','1th'] },
    { name: '2 Thessalonians', chapters: 3,  t: 'NT', aliases: ['2thess','2 thess','2th'] },
    { name: '1 Timothy',       chapters: 6,  t: 'NT', aliases: ['1tim','1 tim','1ti'] },
    { name: '2 Timothy',       chapters: 4,  t: 'NT', aliases: ['2tim','2 tim','2ti'] },
    { name: 'Titus',           chapters: 3,  t: 'NT', aliases: ['tit','ti'] },
    { name: 'Philemon',        chapters: 1,  t: 'NT', aliases: ['philem','phm','phlm'] },
    { name: 'Hebrews',         chapters: 13, t: 'NT', aliases: ['heb','he'] },
    { name: 'James',           chapters: 5,  t: 'NT', aliases: ['jas','jm'] },
    { name: '1 Peter',         chapters: 5,  t: 'NT', aliases: ['1pet','1 pet','1pe','1p'] },
    { name: '2 Peter',         chapters: 3,  t: 'NT', aliases: ['2pet','2 pet','2pe','2p'] },
    { name: '1 John',          chapters: 5,  t: 'NT', aliases: ['1jn','1 jn','1jo','1joh'] },
    { name: '2 John',          chapters: 1,  t: 'NT', aliases: ['2jn','2 jn','2jo','2joh'] },
    { name: '3 John',          chapters: 1,  t: 'NT', aliases: ['3jn','3 jn','3jo','3joh'] },
    { name: 'Jude',            chapters: 1,  t: 'NT', aliases: ['jud','jd'] },
    { name: 'Revelation',      chapters: 22, t: 'NT', aliases: ['rev','rv','apoc'] },
  ];

  // Book name → API.Bible USX/OSIS ID (3-letter code)
  const BOOK_API_ID = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
    'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
    '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
    '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST',
    'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG',
    'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
    'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON', 'Micah': 'MIC',
    'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP', 'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN', 'Acts': 'ACT', 'Romans': 'ROM',
    '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'Galatians': 'GAL', 'Ephesians': 'EPH',
    'Philippians': 'PHP', 'Colossians': 'COL', '1 Thessalonians': '1TH', '2 Thessalonians': '2TH',
    '1 Timothy': '1TI', '2 Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM',
    'Hebrews': 'HEB', 'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE',
    '1 John': '1JN', '2 John': '2JN', '3 John': '3JN', 'Jude': 'JUD', 'Revelation': 'REV',
  };

  const TRANSLATIONS = [
    // Free public-domain (bible-api.com)
    { code: 'web',  name: 'WEB',  full: 'World English Bible',        source: 'bibleapi' },
    { code: 'kjv',  name: 'KJV',  full: 'King James Version',          source: 'bibleapi' },
    { code: 'asv',  name: 'ASV',  full: 'American Standard Version',   source: 'bibleapi' },
    { code: 'ylt',  name: 'YLT',  full: "Young's Literal Translation", source: 'bibleapi' },
    { code: 'bbe',  name: 'BBE',  full: 'Bible in Basic English',      source: 'bibleapi' },
    // Licensed (API.Bible) — resolved at runtime from your subscription
    { code: 'niv',  name: 'NIV',  full: 'New International Version', source: 'apibible', language: 'eng', abbr: 'NIV' },
    { code: 'nlt',  name: 'NLT',  full: 'New Living Translation',    source: 'apibible', language: 'eng', abbr: 'NLT' },
    { code: 'asnd', name: 'ASND', full: 'Ang Salita ng Diyos',       source: 'apibible', language: 'tgl', abbr: 'ASND' },
  ];

  // Lookup: normalized-name -> book
  const normalize = (s) => String(s || '').toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
  const bookMap = new Map();
  for (const b of BIBLE_BOOKS) {
    bookMap.set(normalize(b.name), b);
    for (const a of b.aliases) bookMap.set(normalize(a), b);
  }
  const findBook = (raw) => {
    if (!raw) return null;
    const n = normalize(raw);
    if (bookMap.has(n)) return bookMap.get(n);
    for (const [k, v] of bookMap) if (k.startsWith(n) && n.length >= 3) return v;
    return null;
  };

  // Chapter cache (keyed by book|chapter|translation)
  const cache = new Map();
  const cacheKey = (book, chapter, translation) => `${book}|${chapter}|${translation}`;

  // ---------- bible-api.com (public-domain translations) ----------

  const fetchFromBibleApi = async (book, chapter, translation) => {
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const verses = (data.verses || []).map(v => ({
      book: v.book_name || book,
      chapter: v.chapter || chapter,
      verse: v.verse,
      text: String(v.text || '').replace(/\s+/g, ' ').trim(),
    }));
    return {
      reference: data.reference || `${book} ${chapter}`,
      translation,
      translationName: data.translation_name || translation.toUpperCase(),
      verses,
    };
  };

  // ---------- API.Bible (licensed translations) ----------

  const bibleIdCache = new Map();
  const resolveApiBibleId = async (meta) => {
    const key = `${meta.language || 'eng'}:${meta.abbr}`;
    if (bibleIdCache.has(key)) return bibleIdCache.get(key);

    const url = `${API_BIBLE_BASE}/bibles${meta.language ? `?language=${meta.language}` : ''}`;
    const res = await fetch(url, { headers: { 'api-key': API_BIBLE_KEY } });
    if (!res.ok) throw new Error(`${meta.abbr} — API.Bible responded ${res.status}. Check your key / referrer restrictions.`);
    const data = await res.json();

    const matches = (b) =>
      b.abbreviation === meta.abbr ||
      b.abbreviationLocal === meta.abbr ||
      (b.name || '').toUpperCase().includes(meta.abbr);
    const found = (data.data || []).find(matches);
    if (!found) throw new Error(`${meta.abbr} isn't available in your API.Bible subscription.`);

    bibleIdCache.set(key, found.id);
    return found.id;
  };

  const fetchFromApiBible = async (book, chapter, meta) => {
    const bibleId = await resolveApiBibleId(meta);
    const bookId  = BOOK_API_ID[book];
    if (!bookId) throw new Error(`Unsupported book: ${book}`);

    const chapterId = `${bookId}.${chapter}`;
    const url = `${API_BIBLE_BASE}/bibles/${bibleId}/chapters/${chapterId}`
      + `?content-type=text&include-verse-numbers=true&include-notes=false`
      + `&include-titles=false&include-chapter-numbers=false`;

    const res = await fetch(url, { headers: { 'api-key': API_BIBLE_KEY } });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${meta.abbr} ${book} ${chapter}`);
    const data = await res.json();
    const content = (data.data && data.data.content) || '';

    // Text body looks like "     [1] In the beginning...  [2] And the earth..."
    // Grab each verse by scanning for "[N]" markers and taking everything
    // up to the next one.
    const verses = [];
    const re = /\[(\d+)\]([\s\S]*?)(?=\[\d+\]|$)/g;
    let m;
    while ((m = re.exec(content)) !== null) {
      const verseNum = parseInt(m[1], 10);
      const text = m[2].replace(/\s+/g, ' ').trim();
      if (text) verses.push({ book, chapter: parseInt(chapter, 10), verse: verseNum, text });
    }

    return {
      reference: (data.data && data.data.reference) || `${book} ${chapter}`,
      translation: meta.code,
      translationName: meta.full,
      verses,
    };
  };

  // ---------- public fetch ----------

  const fetchChapter = async (book, chapter, translation = 'web') => {
    const key = cacheKey(book, chapter, translation);
    if (cache.has(key)) return cache.get(key);

    const meta = TRANSLATIONS.find(t => t.code === translation);
    if (!meta) throw new Error(`Unknown translation: ${translation}`);

    const result = meta.source === 'apibible'
      ? await fetchFromApiBible(book, chapter, meta)
      : await fetchFromBibleApi(book, chapter, translation);

    cache.set(key, result);
    return result;
  };

  // Parse "John 3:16", "John 3", "1 Corinthians 13:4-7", "Psalms 23",
  // and also space-separated forms like "Proverbs 3 1" or "John 3 16 18"
  // (book chapter [verse[-verse]]). The verse separator can be ':' or spaces.
  const parseRef = (input) => {
    if (!input) return null;
    const s = String(input).trim();
    const m = s.match(/^\s*((?:\d\s*)?[A-Za-z][A-Za-z\s]*?)\s*(\d+)(?:[:\s]+(\d+)(?:\s*[-\s]\s*(\d+))?)?\s*$/);
    if (!m) return null;
    const book = findBook(m[1]);
    if (!book) return null;
    const chapter = parseInt(m[2], 10);
    if (chapter < 1 || chapter > book.chapters) return null;
    const vStart = m[3] ? parseInt(m[3], 10) : null;
    const vEnd   = m[4] ? parseInt(m[4], 10) : vStart;
    return { book: book.name, chapter, verseStart: vStart, verseEnd: vEnd };
  };

  return { BIBLE_BOOKS, TRANSLATIONS, findBook, fetchChapter, parseRef };
})();
