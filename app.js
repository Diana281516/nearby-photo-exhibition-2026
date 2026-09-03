(() => {
  history.scrollRestoration = 'manual';
  const resetToEntrance = () => { if (!location.hash) scrollTo({ top: 0, left: 0, behavior: 'auto' }); };
  resetToEntrance();
  addEventListener('pageshow', () => { resetToEntrance(); requestAnimationFrame(resetToEntrance); setTimeout(resetToEntrance, 120); });
  addEventListener('load', () => { resetToEntrance(); requestAnimationFrame(resetToEntrance); setTimeout(resetToEntrance, 120); });
  const photos = window.EXHIBITION_PHOTOS || [];
  const furry = photos.filter((p) => p.section === '毛茸茸出没');
  const life = photos.filter((p) => p.section === '生活缝隙');
  const uniqueAuthors = new Set(photos.map((p) => p.author));
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  $('#workCount').textContent = String(photos.length).padStart(2, '0');
  $('#authorCount').textContent = String(uniqueAuthors.size).padStart(2, '0');
  $('#heroMedia').style.backgroundImage = `url("${(life[1] || life[0] || photos[0]).src}")`;

  const furryGallery = $('#furryGallery');
  const furryScrubber = $('#furryScrubber');
  furryScrubber.max = String(Math.max(0, furry.length - 1));
  furry.forEach((p, i) => {
    const article = document.createElement('article');
    article.className = `slice-card${i === 0 ? ' is-active' : ''}`;
    article.tabIndex = 0;
    article.dataset.index = String(i);
    article.innerHTML = `<img src="${p.src}" alt="${p.title}，${p.author} 摄" loading="lazy" decoding="async" fetchpriority="low"><div class="slice-label"><small>${String(i + 1).padStart(2, '0')} · 毛茸茸出没</small><h3>${p.title}</h3><p>${p.author}${p.imageIndex > 1 ? ` · 组照 ${p.imageIndex}` : ''}</p></div>`;
    furryGallery.append(article);
  });
  const setFurry = (index) => {
    const cards = $$('.slice-card', furryGallery);
    index = (index + cards.length) % cards.length;
    cards.forEach((card, i) => {
      const distance = Math.min(Math.abs(i - index), cards.length - Math.abs(i - index));
      card.classList.toggle('is-active', i === index);
      card.classList.toggle('is-near', distance <= 3);
    });
    $('#furryProgress').textContent = `${String(index + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    furryScrubber.value = String(index);
    furryScrubber.style.setProperty('--progress', `${cards.length > 1 ? index / (cards.length - 1) * 100 : 0}%`);
    if (innerWidth < 900) cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };
  furryScrubber.addEventListener('input', () => setFurry(+furryScrubber.value));
  furryGallery.addEventListener('click', (e) => { const card = e.target.closest('.slice-card'); if (card) card.classList.contains('is-active') ? openLightbox(furry, +card.dataset.index) : setFurry(+card.dataset.index); });
  furryGallery.addEventListener('keydown', (e) => { const card = e.target.closest('.slice-card'); if (!card) return; if (e.key === 'Enter') openLightbox(furry, +card.dataset.index); if (e.key === 'ArrowRight') setFurry(+card.dataset.index + 1); if (e.key === 'ArrowLeft') setFurry(+card.dataset.index - 1); });
  let furryWheelLocked = false;
  furryGallery.addEventListener('wheel', (e) => {
    if (innerWidth < 900 || Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.25 || Math.abs(e.deltaX) < 8) return;
    e.preventDefault();
    if (furryWheelLocked) return;
    furryWheelLocked = true;
    const active = +$('.slice-card.is-active', furryGallery).dataset.index;
    setFurry(active + (e.deltaX > 0 ? 1 : -1));
    setTimeout(() => furryWheelLocked = false, 260);
  }, { passive: false });
  setFurry(0);

  const lifeGallery = $('#lifeGallery');
  life.forEach((p, i) => {
    const article = document.createElement('article');
    article.className = 'story-card'; article.dataset.index = String(i); article.tabIndex = 0;
    article.innerHTML = `<img src="${p.src}" alt="${p.title}，${p.author} 摄" loading="lazy" decoding="async" fetchpriority="low" draggable="false"><div class="story-caption"><small>${String(i + 1).padStart(2, '0')} / 生活缝隙</small><h3>${p.title}</h3><p>${p.author}${p.imageIndex > 1 ? ` · 组照 ${p.imageIndex}` : ''}</p></div>`;
    lifeGallery.append(article);
  });
  $('#lifeTotal').textContent = String(life.length).padStart(2, '0');
  let lifeTarget = 0, lifeRaf = 0, lifeIndexRaf = 0;
  const storyCards = () => $$('.story-card', lifeGallery);
  const currentStoryIndex = () => {
    const cards = storyCards();
    if (cards.length < 2) return 0;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    const centeredLeft = lifeGallery.scrollLeft + lifeGallery.clientWidth / 2 - cards[0].offsetWidth / 2;
    return Math.max(0, Math.min(cards.length - 1, Math.round((centeredLeft - cards[0].offsetLeft) / step)));
  };
  const storyStep = (dir) => {
    const cards = storyCards();
    const targetIndex = Math.max(0, Math.min(cards.length - 1, currentStoryIndex() + dir));
    lifeTarget = Math.max(0, Math.min(lifeGallery.scrollWidth - lifeGallery.clientWidth, cards[targetIndex].offsetLeft - (lifeGallery.clientWidth - cards[targetIndex].offsetWidth) / 2));
    lifeGallery.scrollTo({ left: lifeTarget, behavior: 'smooth' });
    $('#lifeCurrent').textContent = String(targetIndex + 1).padStart(2, '0');
  };
  $$('[data-story]').forEach((b) => b.addEventListener('click', () => storyStep(b.dataset.story === 'next' ? 1 : -1)));
  lifeGallery.addEventListener('click', (e) => { const card = e.target.closest('.story-card'); if (card) openLightbox(life, +card.dataset.index); });
  lifeGallery.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') storyStep(1); if (e.key === 'ArrowLeft') storyStep(-1); if (e.key === 'Enter' && e.target.closest('.story-card')) openLightbox(life, +e.target.closest('.story-card').dataset.index); });
  const lifeSection = $('#life');
  lifeSection.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    const max = lifeGallery.scrollWidth - lifeGallery.clientWidth;
    const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? innerHeight : 1;
    const base = lifeGallery.scrollLeft;
    const next = Math.max(0, Math.min(max, base + e.deltaY * unit * 1.45));
    const canMove = e.deltaY > 0 ? base < max - 1 : base > 1;
    if (!canMove) return;
    e.preventDefault();
    lifeTarget = next;
    if (!lifeRaf) lifeRaf = requestAnimationFrame(() => {
      lifeGallery.scrollLeft = lifeTarget;
      lifeRaf = 0;
    });
  }, { passive: false });
  let dragStartX = 0, dragStartScroll = 0, didDrag = false;
  lifeGallery.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    e.preventDefault();
    dragStartX = e.clientX;
    dragStartScroll = lifeGallery.scrollLeft;
    didDrag = false;
    lifeGallery.classList.add('is-dragging');
    lifeGallery.setPointerCapture(e.pointerId);
  });
  lifeGallery.addEventListener('pointermove', (e) => {
    if (!lifeGallery.hasPointerCapture(e.pointerId)) return;
    const distance = e.clientX - dragStartX;
    if (Math.abs(distance) > 4) didDrag = true;
    lifeGallery.scrollLeft = dragStartScroll - distance * 1.35;
    lifeTarget = lifeGallery.scrollLeft;
  });
  const finishDrag = (e) => {
    if (lifeGallery.hasPointerCapture(e.pointerId)) lifeGallery.releasePointerCapture(e.pointerId);
    lifeGallery.classList.remove('is-dragging');
  };
  lifeGallery.addEventListener('pointerup', finishDrag);
  lifeGallery.addEventListener('pointercancel', finishDrag);
  lifeGallery.addEventListener('click', (e) => { if (didDrag) { e.preventDefault(); e.stopImmediatePropagation(); didDrag = false; } }, true);
  lifeGallery.addEventListener('scroll', () => {
    if (!lifeRaf) lifeTarget = lifeGallery.scrollLeft;
    if (lifeIndexRaf) return;
    lifeIndexRaf = requestAnimationFrame(() => {
      $('#lifeCurrent').textContent = String(currentStoryIndex() + 1).padStart(2, '0');
      lifeIndexRaf = 0;
    });
  }, { passive: true });

  const dialog = $('#lightbox'); let lightItems = [], lightIndex = 0;
  function openLightbox(list, index) { lightItems = list; lightIndex = index; renderLightbox(); dialog.showModal(); document.body.style.overflow = 'hidden'; }
  function renderLightbox() { const p = lightItems[lightIndex]; $('img', dialog).src = p.src; $('img', dialog).alt = `${p.title}，${p.author} 摄`; $('figcaption span', dialog).textContent = `${String(lightIndex + 1).padStart(2, '0')} / ${String(lightItems.length).padStart(2, '0')}`; $('figcaption strong', dialog).textContent = p.title; $('figcaption small', dialog).textContent = p.author; }
  const moveLightbox = (d) => { lightIndex = (lightIndex + d + lightItems.length) % lightItems.length; renderLightbox(); };
  $('.lightbox-close').addEventListener('click', () => dialog.close()); $('.lightbox-arrow.prev').addEventListener('click', () => moveLightbox(-1)); $('.lightbox-arrow.next').addEventListener('click', () => moveLightbox(1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); dialog.addEventListener('close', () => document.body.style.overflow = ''); dialog.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') moveLightbox(1); if (e.key === 'ArrowLeft') moveLightbox(-1); });

  const observer = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-visible', e.isIntersecting)), { threshold: .15 }); $$('.reveal').forEach((el) => observer.observe(el));
  $('.sound-toggle').addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') === 'true'; e.currentTarget.setAttribute('aria-pressed', String(!on)); e.currentTarget.lastChild.textContent = on ? '静音展厅' : ' 沉浸模式'; });
})();
