(() => {
  // Menu mobile
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu-mobile');
  if (burger && menu) {
    const setOpen = open => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      menu.hidden = !open;
    };
    burger.addEventListener('click', () => setOpen(menu.hidden));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !menu.hidden) { setOpen(false); burger.focus(); }
    });
  }

  // Filtres des ressources
  const pills = document.querySelectorAll('.pill');
  const ressources = document.querySelectorAll('.res');
  const vide = document.querySelector('.res-vide');
  pills.forEach(pill => pill.addEventListener('click', () => {
    const actif = pill.getAttribute('aria-pressed') !== 'true';
    pills.forEach(p => p.setAttribute('aria-pressed', 'false'));
    pill.setAttribute('aria-pressed', String(actif));
    const filtre = actif ? pill.dataset.filtre : null;
    let visibles = 0;
    ressources.forEach(r => {
      const montre = !filtre || r.dataset.type === filtre;
      r.hidden = !montre;
      if (montre) visibles++;
    });
    vide.hidden = visibles > 0;
  }));

  // Galerie : on double chaque rangée pour un défilement sans couture
  document.querySelectorAll('.track').forEach(track => {
    [...track.children].forEach(img => {
      const copie = img.cloneNode();
      copie.alt = '';
      copie.setAttribute('aria-hidden', 'true');
      track.append(copie);
    });
  });

  // Formulaire de témoignage (pas de serveur : confirmation locale)
  const form = document.getElementById('form-temoignage');
  const nom = document.getElementById('f-nom');
  const anon = document.getElementById('f-anon');
  const msg = form.querySelector('.form-msg');
  anon.addEventListener('change', () => {
    nom.disabled = anon.checked;
    if (anon.checked) nom.value = '';
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const com = form.elements.commentaire;
    if (!com.value.trim()) {
      msg.dataset.etat = 'erreur';
      msg.textContent = 'Écris ton témoignage avant de l’envoyer.';
      com.focus();
      return;
    }
    msg.dataset.etat = 'ok';
    msg.textContent = 'Merci pour ton témoignage !';
    form.reset();
    nom.disabled = false;
  });

  // Bouton retour en haut
  const haut = document.querySelector('.to-top');
  const onScroll = () => haut.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
