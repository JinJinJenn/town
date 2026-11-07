// Town v4's website controls. No placeholder navigation or external UI dependency.
export function createSiteUI(api) {
  const $ = id => document.getElementById(id);
  const dialogs = [...document.querySelectorAll('dialog')];
  const safeLoad = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeSave = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let photoMode = false, previousFocus = null, capturing = false;
  const icons = {
    home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3"/>',
    camera: '<path d="M4 7h4l2-3h4l2 3h4a1 1 0 0 1 1 1v12H3V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="4"/>',
    flower: '<path d="M12 9C4-2 0 9 8 12c-10 4-1 12 4 4 5 8 14 0 4-4 8-3 4-14-4-3Z"/><circle cx="12" cy="12" r="2"/>',
    leaf: '<path d="M20 3C8 2 2 7 4 14s13 8 16-11ZM5 21l10-12"/>',
    book: '<path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v16h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3ZM12 6v16"/>',
    heart: '<path d="M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6Z"/>',
    settings: '<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
  };
  document.querySelectorAll('[data-icon]').forEach(el => {
    const path = icons[el.dataset.icon];
    if (path) el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  });
  function openDialog(dialog) {
    previousFocus = document.activeElement;
    dialogs.forEach(other => { if (other.open) other.close(); });
    api.clearKeys(); dialog.showModal();
  }
  for (const dialog of dialogs) {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => previousFocus?.focus?.({preventScroll:true}));
  }
  function renderResidents() {
    const term = $('resident-search').value.trim().toLowerCase();
    const list = $('resident-list'); list.replaceChildren();
    let count = 0;
    for (const resident of api.residents()) {
      if (!resident.name.toLowerCase().includes(term)) continue;
      const button = document.createElement('button'); button.className = 'resident-entry';
      button.dataset.resident = String(resident.index);
      const avatar = document.createElement('span'); avatar.className = 'resident-avatar';
      avatar.style.setProperty('--avatar-color', ['#d891ac','#9ebdaf','#b3a3c8','#d5b482'][resident.index % 4]);
      avatar.textContent = resident.name[0]; avatar.setAttribute('aria-hidden', 'true');
      const text = document.createElement('span'), name = document.createElement('strong'), activity = document.createElement('small');
      name.textContent = resident.name; activity.textContent = resident.description;
      text.append(name, activity); button.append(avatar, text);
      button.onclick = () => { $('residents-dialog').close(); api.selectResident(resident.index); };
      list.append(button); count++;
    }
    $('resident-results').textContent = count ? `${count} ${count === 1 ? 'resident is' : 'residents are'} here. Select someone to find them in town.` : 'Nobody matches that name. Try another search.';
  }
  $('residents').onclick = () => { $('resident-search').value = ''; renderResidents(); openDialog($('residents-dialog')); $('resident-search').focus(); };
  $('resident-search').addEventListener('input', renderResidents);
  $('about').onclick = () => openDialog($('about-dialog'));
  $('town-tab').onclick = () => { api.reset(); api.clearSelection(); };
  function setPhotoMode(value) {
    photoMode = !!value;
    document.body.classList.toggle('photo-mode', photoMode);
    $('photo-controls').hidden = !photoMode;
    $('photo').setAttribute('aria-pressed', String(photoMode));
    if (photoMode) { api.dismissWelcome(); $('photo-exit').focus({preventScroll:true}); }
    else $('photo').focus({preventScroll:true});
  }
  $('photo').onclick = () => setPhotoMode(!photoMode);
  $('photo-exit').onclick = () => setPhotoMode(false);
  $('photo-save').onclick = async () => {
    if (capturing) return;
    capturing = true; $('photo-save').disabled = true;
    try {
      // Render and snapshot in the same task, before the drawing buffer clears.
      const blob = await api.capture();
      if (!blob) throw new Error('The browser could not capture this frame.');
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = `JinJinJenn-Town-${api.seed().replace(/[^a-z0-9_-]/gi, '-').slice(0,48)}.png`;
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      api.toast('Your town photo is ready.');
    } catch (error) { api.toast(error.message || 'The photo could not be saved. Please try again.'); }
    finally { capturing = false; $('photo-save').disabled = false; }
  };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && photoMode) { event.preventDefault(); setPhotoMode(false); }
  });
  const savedQuality = safeLoad('town.quality.v4');
  $('quality').value = ['balanced','sharp','light'].includes(savedQuality) ? savedQuality : 'balanced';
  api.setQuality($('quality').value);
  $('quality').onchange = () => { api.setQuality($('quality').value); safeSave('town.quality.v4', $('quality').value); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('petals').checked = !reduced && safeLoad('town.petals.v4') !== '0';
  api.setPetals($('petals').checked);
  $('petals').onchange = () => { api.setPetals($('petals').checked); safeSave('town.petals.v4', $('petals').checked ? '1':'0'); };
  return { get photoMode() { return photoMode; }, refresh: renderResidents };
}
