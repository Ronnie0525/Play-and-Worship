/* ============================================================
   pdf.js — parse .pdf with PDF.js, render pages to data URLs.
   Output shape mirrors Pptx.parse so the Media tab can treat
   PDFs and PPTX decks the same way.
   ============================================================ */

const Pdf = (() => {

  const WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const RENDER_SCALE = 1.5;

  const lib = () => {
    const g = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
    if (!g) throw new Error('PDF.js is not loaded');
    if (g.GlobalWorkerOptions && !g.GlobalWorkerOptions.workerSrc) {
      g.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    }
    return g;
  };

  const readAsArrayBuffer = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('read'));
    r.readAsArrayBuffer(file);
  });

  const parse = async (file) => {
    const pdfjs = lib();
    const buf = await readAsArrayBuffer(file);
    const doc = await pdfjs.getDocument({ data: buf }).promise;

    const slides = [];
    const failed = [];
    for (let n = 1; n <= doc.numPages; n++) {
      try {
        const page = await doc.getPage(n);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        slides.push({
          id: `pg_${n}_${Math.random().toString(36).slice(2, 6)}`,
          text: '',
          imageDataUrl,
          __dataUrl: imageDataUrl,
        });

        // Yield to the event loop so the UI stays responsive on big PDFs.
        await new Promise(r => setTimeout(r, 0));
      } catch (e) {
        console.warn(`PDF page ${n} render failed`, e);
        failed.push(n);
      }
    }

    if (slides.length === 0) {
      throw new Error(`No pages could be rendered (${doc.numPages} page${doc.numPages === 1 ? '' : 's'} total).`);
    }

    return {
      id: `pdf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      source: 'pdf',
      title: file.name.replace(/\.pdf$/i, ''),
      slides,
      totalPages: doc.numPages,
      failedPages: failed,
      createdAt: Date.now(),
    };
  };

  return { parse };
})();
