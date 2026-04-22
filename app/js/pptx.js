/* ============================================================
   pptx.js — parse .pptx with JSZip, render slides to canvas.
   ============================================================ */

const Pptx = (() => {

  const W = 1920, H = 1080;

  const parseXml = (xml) => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('Malformed XML');
    return doc;
  };

  // Get text from a slide: one line per <a:p> paragraph, joined with \n.
  const extractText = (slideXml) => {
    const doc = parseXml(slideXml);
    const paragraphs = doc.getElementsByTagNameNS('*', 'p');
    const lines = [];
    for (const p of paragraphs) {
      const runs = p.getElementsByTagNameNS('*', 't');
      let line = '';
      for (const t of runs) line += t.textContent;
      const trimmed = line.trim();
      if (trimmed) lines.push(trimmed);
    }
    return lines.join('\n').trim();
  };

  const extractImageRels = (relsXml) => {
    const doc = parseXml(relsXml);
    const rels = doc.getElementsByTagNameNS('*', 'Relationship');
    const images = [];
    for (const r of rels) {
      const type = r.getAttribute('Type') || '';
      if (type.endsWith('/image')) images.push(r.getAttribute('Target') || '');
    }
    return images;
  };

  // Rel target is "../media/image1.png" relative to ppt/slides/_rels/slideN.xml.rels
  const resolveMediaPath = (target) => {
    if (!target) return '';
    if (target.startsWith('/')) return target.slice(1);
    const parts = target.split('/');
    const stack = ['ppt', 'slides'];
    for (const p of parts) {
      if (p === '..') stack.pop();
      else if (p !== '.') stack.push(p);
    }
    return stack.join('/');
  };

  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('read'));
    r.readAsDataURL(blob);
  });

  const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });

  // Parse a .pptx File -> { id, title, slides: [{ text, imageDataUrl }] }
  const parse = async (file) => {
    if (typeof JSZip === 'undefined') throw new Error('JSZip is not loaded');
    const zip = await JSZip.loadAsync(file);

    const slidePaths = Object.keys(zip.files)
      .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)[1], 10);
        const nb = parseInt(b.match(/slide(\d+)/)[1], 10);
        return na - nb;
      });

    const slides = [];
    for (const slidePath of slidePaths) {
      const slideXml = await zip.file(slidePath).async('string');
      const text = extractText(slideXml);

      const num = slidePath.match(/slide(\d+)/)[1];
      const relsPath = `ppt/slides/_rels/slide${num}.xml.rels`;
      let imageDataUrl = null;
      if (zip.file(relsPath)) {
        const relsXml = await zip.file(relsPath).async('string');
        const imgs = extractImageRels(relsXml);
        if (imgs.length) {
          const mediaPath = resolveMediaPath(imgs[0]);
          const f = zip.file(mediaPath);
          if (f) {
            try {
              const blob = await f.async('blob');
              imageDataUrl = await blobToDataUrl(blob);
            } catch {}
          }
        }
      }

      slides.push({
        id: `sl_${num}_${Math.random().toString(36).slice(2, 6)}`,
        text,
        imageDataUrl,
      });
    }

    return {
      id: `pptx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      title: file.name.replace(/\.pptx$/i, ''),
      slides,
      createdAt: Date.now(),
    };
  };

  // Render a slide to a canvas (thumbnail or full-res) — sync draw of cached image.
  const renderToCanvas = async (slide, canvas) => {
    const ctx = canvas.getContext('2d');
    const cw = canvas.width, ch = canvas.height;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, cw, ch);

    if (slide.imageDataUrl) {
      try {
        const img = await loadImage(slide.imageDataUrl);
        // cover-fit (so background fills the frame)
        const ar = img.naturalWidth / img.naturalHeight;
        const car = cw / ch;
        let dw, dh;
        if (ar > car) { dh = ch; dw = ch * ar; }
        else          { dw = cw; dh = cw / ar; }
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      } catch {}

      // Subtle scrim for text legibility
      if (slide.text) {
        const g = ctx.createLinearGradient(0, 0, 0, ch);
        g.addColorStop(0, 'rgba(0,0,0,0.30)');
        g.addColorStop(1, 'rgba(0,0,0,0.55)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, cw, ch);
      }
    }

    if (slide.text) {
      const lines = slide.text.split('\n');
      const fontSize = Math.max(16, Math.round(cw * 0.036));
      ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.75)';
      ctx.shadowBlur = Math.round(cw * 0.006);
      ctx.shadowOffsetY = Math.round(cw * 0.002);

      const maxWidth = cw * 0.86;
      const wrapped = [];
      for (const raw of lines) {
        const words = raw.split(/\s+/);
        let cur = '';
        for (const w of words) {
          const test = cur ? cur + ' ' + w : w;
          if (ctx.measureText(test).width > maxWidth && cur) { wrapped.push(cur); cur = w; }
          else cur = test;
        }
        if (cur) wrapped.push(cur);
      }

      const lh = Math.round(fontSize * 1.2);
      const total = wrapped.length * lh;
      let y = (ch - total) / 2 + lh / 2;
      for (const l of wrapped) { ctx.fillText(l, cw / 2, y); y += lh; }
    }
  };

  // Render slide to 1920x1080 data URI (for pushing live).
  const renderToDataUrl = async (slide) => {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    await renderToCanvas(slide, c);
    return c.toDataURL('image/jpeg', 0.9);
  };

  return { parse, renderToCanvas, renderToDataUrl, W, H };
})();
