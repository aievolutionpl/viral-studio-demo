// Galeria demo: czyta /api/examples (skan public/demo) i buduje karty z realnymi plikami.
const gallery = document.getElementById('gallery');
const count = document.getElementById('galleryCount');

const state = new Map();

async function load() {
  try {
    const res = await fetch('examples.json');
    const data = await res.json();
    const items = data.examples || [];
    if (!items.length) {
      gallery.innerHTML = '<p class="ex-load">Brak przykładów — uruchom <code>node scripts/demo.js</code>.</p>';
      count.textContent = '0 przykładów';
      return;
    }
    count.textContent = `${items.length} ${items.length === 1 ? 'przykład' : 'przykładów'} · wszystkie z jednego zdjęcia`;
    items.forEach(render);
  } catch (err) {
    gallery.innerHTML = `<p class="ex-load">Błąd wczytywania: ${err.message}</p>`;
  }
}

function render(item) {
  const el = document.createElement('article');
  el.className = 'ex';
  el.innerHTML = `
    <div class="ex-media">
      <span class="ex-badge">${item.category || 'viral'}</span>
      <span class="ex-dur">${item.duration}s</span>
      ${item.scene ? `<img class="stage" src="${item.scene}" alt="Scena ${item.name}" loading="lazy">` : ''}
      <video class="stage hide" src="${item.video}" muted loop playsinline preload="none" poster="${item.poster || item.scene || ''}"></video>
      <span class="play-hint">▶ naciśnij, aby odtworzyć</span>
    </div>
    <div class="ex-info">
      <h3>${item.name}</h3>
      <p>${item.tagline || ''}</p>
      <span class="ex-tag">${item.model || 'nano-banana-2 → seedance'}</span>
    </div>`;

  const media = el.querySelector('.ex-media');
  const video = el.querySelector('video');
  const img = el.querySelector('img.stage');
  const hint = el.querySelector('.play-hint');

  media.addEventListener('click', async () => {
    if (!video.src) video.src = item.video;
    try {
      if (video.paused) {
        // pauza innych
        document.querySelectorAll('.ex video').forEach((v) => {
          if (v !== video) { v.pause(); v.classList.add('hide'); }
          const i = v.parentElement.querySelector('img.stage');
          if (i) i.classList.remove('hide');
        });
        await video.play();
        video.classList.remove('hide');
        img?.classList.add('hide');
        hint.hidden = true;
      } else {
        video.pause();
        video.classList.add('hide');
        img?.classList.remove('hide');
        hint.hidden = false;
      }
    } catch (e) {
      hint.textContent = 'Nie mogę odtworzyć pliku';
    }
  });

  video.addEventListener('ended', () => {
    video.classList.add('hide');
    img?.classList.remove('hide');
    hint.hidden = false;
  });

  gallery.appendChild(el);
}

load();
