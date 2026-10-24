(() => {
  const C = window.CONTENT;
  const body = document.body;
  const root = body.dataset.root || "";
  const page = body.dataset.page || "home";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.documentElement.classList.add("js");

  /* ---------- Langue ---------- */

  let lang = pickLang();

  function pickLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (fromUrl && C[fromUrl]) return fromUrl;
    try {
      const saved = localStorage.getItem("lang");
      if (saved && C[saved]) return saved;
    } catch (e) { /* stockage indisponible : on garde le français */ }
    return "fr";
  }

  const t = (path) => path.split(".").reduce((obj, key) => (obj == null ? obj : obj[key]), C[lang]);

  /* ---------- Symboles SVG ---------- */

  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false">
  <symbol id="d-sparkle" viewBox="0 0 100 100"><path d="M50 4C54 38 62 46 96 50 62 54 54 62 50 96 46 62 38 54 4 50 38 46 46 38 50 4Z" fill="currentColor"/></symbol>
</svg>`;

  body.insertAdjacentHTML("afterbegin", SPRITE);

  /* ---------- En-tête et pied de page communs ---------- */

  const LOGO = "emilie<span>.</span>";

  const header = `
<a class="skip-link" href="#main" data-i18n="ui.skip"></a>
<header class="site-header">
  <a class="logo" href="${root}index.html" data-i18n-attr="aria-label:ui.home">${LOGO}</a>
  <nav class="site-nav" data-i18n-attr="aria-label:ui.menu">
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-i18n="ui.menu"></button>
    <ul id="site-menu" class="menu">
      <li><a href="${root}index.html#projets" data-i18n="ui.nav.work"></a></li>
      <li><a href="${root}index.html#a-propos" data-i18n="ui.nav.about"></a></li>
      <li><a href="${root}index.html#cv" data-i18n="ui.nav.skills"></a></li>
      <li><a href="${root}index.html#contact" data-i18n="ui.nav.contact"></a></li>
    </ul>
  </nav>
  <div class="lang-switch" role="group" data-i18n-attr="aria-label:ui.langLabel">
    <button type="button" data-set-lang="fr" lang="fr">FR</button>
    <button type="button" data-set-lang="en" lang="en">EN</button>
  </div>
</header>`;

  const footer = `
<footer class="site-footer">
  <p data-i18n="footer.made"></p>
  ${page === "home" ? '<p data-i18n="footer.note"></p>' : ""}
  <a href="#top" data-i18n="ui.top"></a>
</footer>`;

  body.insertAdjacentHTML("afterbegin", header);
  body.insertAdjacentHTML("beforeend", footer);
  body.insertAdjacentHTML("beforeend", '<div class="progress" aria-hidden="true"></div><div class="curtain" aria-hidden="true"></div>');

  /* ---------- Rendu des textes ---------- */

  const renderers = {
    list(el, items) {
      el.replaceChildren(...items.map((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        return li;
      }));
    },
    stats(el, items) {
      el.replaceChildren(...items.map(({ v, l }) => {
        const li = document.createElement("li");
        li.className = "stat reveal";
        const value = document.createElement("strong");
        value.textContent = v;
        const label = document.createElement("span");
        label.textContent = l;
        li.append(value, label);
        return li;
      }));
    },
    timeline(el, items) {
      el.replaceChildren(...items.map(({ when, what, where }) => {
        const li = document.createElement("li");
        const w = document.createElement("span");
        w.className = "when";
        w.textContent = when;
        const title = document.createElement("strong");
        title.textContent = what;
        const place = document.createElement("span");
        place.className = "where";
        place.textContent = where;
        li.append(w, title, place);
        return li;
      }));
    }
  };

  function applyTexts() {
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (typeof value === "string") el.textContent = value;
      el.hidden = value === "";
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, path] = pair.split(":").map((s) => s.trim());
        const value = t(path);
        if (typeof value === "string") el.setAttribute(attr, value);
      });
    });

    document.querySelectorAll("[data-render]").forEach((el) => {
      const items = t(el.dataset.src);
      if (Array.isArray(items)) renderers[el.dataset.render](el, items);
    });

    document.title = t(`meta.${page}.title`);
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t(`meta.${page}.description`));

    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang));
    });

    splitLetters();
    fitBadge();
    document.querySelectorAll("h2.reveal").forEach((el) => {
      el.classList.add("reveal", "words-up");
      splitWords(el);
    });
    document.querySelectorAll("[data-words]").forEach(splitWords);
    observeReveals();
    requestScrollFrame();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, t } }));
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-set-lang]");
    if (!btn || btn.dataset.setLang === lang) return;
    lang = btn.dataset.setLang;
    try { localStorage.setItem("lang", lang); } catch (e) { /* rien à faire */ }
    applyTexts();
  });

  /* ---------- Lettres du titre qui tombent une à une ---------- */

  function splitLetters() {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const text = el.textContent;
      // Le mot entier reste lisible par les lecteurs d'écran, les lettres sont décoratives.
      const readable = document.createElement("span");
      readable.className = "visually-hidden";
      readable.textContent = text;
      el.replaceChildren(readable, ...[...text].map((char, i) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--i", i);
        span.textContent = char;
        return span;
      }));
    });
  }

  /* ---------- Pastille : le texte fait exactement le tour du cercle ---------- */
  // Mesuré à 10 px (le texte tient alors toujours sur le cercle), puis agrandi à la bonne taille.

  function fitBadge() {
    const text = document.querySelector(".badge text");
    if (!text) return;
    text.style.fontSize = "10px";
    const natural = text.getComputedTextLength();
    const circle = document.getElementById("badge-circle").getTotalLength();
    if (natural > 0) text.style.fontSize = `${(10 * circle / natural).toFixed(2)}px`;
  }

  if (document.fonts) document.fonts.ready.then(fitBadge);

  /* ---------- Mots découpés (titres et paragraphes lus au scroll) ---------- */

  function splitWords(el) {
    let i = 0;
    // Les espaces insécables restent dans le mot : « parle ? » ne se coupe pas.
    el.replaceChildren(...el.textContent.split(/([ \t\r\n]+)/).filter(Boolean).map((part) => {
      if (/^[ \t\r\n]+$/.test(part)) return document.createTextNode(part);
      const span = document.createElement("span");
      span.className = "word";
      span.style.setProperty("--i", i++);
      span.textContent = part;
      return span;
    }));
  }

  /* ---------- Menu mobile ---------- */

  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("site-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Apparitions au scroll ---------- */

  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 })
    : null;

  function observeReveals() {
    document.querySelectorAll(".reveal:not(.is-in), .shot:not(.is-in)").forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-in");
    });
  }

  /* ---------- Effets liés au scroll ---------- */
  // Tous recalculés dans une seule image d'animation par scroll.

  const clamp01 = (n) => Math.min(Math.max(n, 0), 1);
  const easeOut = (n) => 1 - (1 - n) * (1 - n);
  const floaters = [...document.querySelectorAll("[data-speed]")];
  const intro = document.querySelector(".intro");
  const hero = document.querySelector(".hero");
  const grow = document.querySelector(".grow");
  const siteHeader = document.querySelector(".site-header");
  const progressBar = document.querySelector(".progress");
  // Même condition que dans le CSS : l'intro n'existe qu'avec cette requête.
  const introQuery = window.matchMedia("(prefers-reduced-motion: no-preference) and (min-height: 560px)");

  function updateParallax(vh) {
    const mid = vh / 2;
    floaters.forEach((el) => {
      const box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      const offset = (box.top + box.height / 2 - mid) * parseFloat(el.dataset.speed);
      el.style.setProperty("--py", `${offset.toFixed(1)}px`);
    });
  }

  // La forme part de 200×100 px et grandit jusqu'à couvrir l'écran, de la couleur de la section suivante.
  function updateIntro(vh) {
    let p = 0;
    if (intro && introQuery.matches) {
      const box = intro.getBoundingClientRect();
      p = clamp01(-box.top / (box.height - vh));
      const maxScale = Math.max(vh / 100, window.innerWidth / 200) * 1.05;
      grow.style.setProperty("--s", (1 + (maxScale - 1) * p).toFixed(3));
      grow.style.setProperty("--p", p.toFixed(3));
    }
    // En-tête transparent seulement tout en haut : dès qu'on défile, le hero passe dessous et il redevient une pilule.
    if (hero && page === "home") {
      const overHero = window.scrollY < 24 && hero.getBoundingClientRect().bottom > 80 && p < 0.5;
      siteHeader.classList.toggle("is-over-hero", overHero);
    }
  }

  // N'écrit un style que s'il change : sans ça, chaque image de scroll recalcule tous les mots et toutes les lignes.
  const setStyle = (el, prop, value) => {
    if (el.style[prop] !== value) el.style[prop] = value;
  };

  // Chaque mot passe de pâle à net pendant que le paragraphe traverse l'écran.
  function updateReading(vh) {
    document.querySelectorAll("[data-words]").forEach((el) => {
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      const words = el.querySelectorAll(".word");
      const p = clamp01((vh * 0.85 - box.top) / (box.height + vh * 0.3)) * words.length;
      words.forEach((word, i) => setStyle(word, "opacity", (0.18 + 0.82 * clamp01(p - i)).toFixed(2)));
    });
  }

  // Les éléments de la liste arrivent de la droite en se redressant, chacun un peu après le précédent.
  // translate/rotate (et non transform) pour garder les rotations déjà posées en CSS.
  // L'angle de départ vient de --slide-rot (6deg par défaut) : une page projet peut le mettre à 0.
  // Il est lu une fois par liste (et relu au redimensionnement), pas à chaque image.
  const slideRot = new Map();

  function updateSlideIn(vh) {
    document.querySelectorAll("[data-slide-in]").forEach((list) => {
      const box = list.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      const p = clamp01((vh - box.top) / (vh * 0.6));
      if (!slideRot.has(list)) slideRot.set(list, parseFloat(getComputedStyle(list).getPropertyValue("--slide-rot") || 6));
      const rot = slideRot.get(list);
      [...list.children].forEach((item, i) => {
        const local = easeOut(clamp01((p - i * 0.12) / 0.4));
        setStyle(item, "opacity", local.toFixed(2));
        setStyle(item, "translate", `${((1 - local) * 100).toFixed(1)}% 0`);
        setStyle(item, "rotate", `${((1 - local) * rot).toFixed(2)}deg`);
      });
    });
  }

  // Hauteur défilable gardée en mémoire : la relire à chaque image forcerait un recalcul de la mise en page.
  let scrollMax = 0;
  const measureScroll = () => { scrollMax = document.documentElement.scrollHeight - window.innerHeight; };
  measureScroll();
  if ("ResizeObserver" in window) new ResizeObserver(measureScroll).observe(body);

  function updateProgress() {
    progressBar.style.setProperty("--progress", scrollMax > 0 ? clamp01(window.scrollY / scrollMax).toFixed(4) : 0);
  }

  let ticking = false;
  let gliding = false;

  function onScrollFrame() {
    ticking = false;
    const vh = window.innerHeight;
    updateProgress();
    updateIntro(vh);
    if (reduceMotion.matches) return;
    updateParallax(vh);
    updateReading(vh);
    updateSlideIn(vh);
  }

  // Pendant le glissé, les effets sont déjà recalculés dans l'image du glissé : inutile de le refaire.
  function requestScrollFrame() {
    if (!ticking && !gliding) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", requestScrollFrame, { passive: true });
  window.addEventListener("resize", () => {
    slideRot.clear();
    measureScroll();
    requestScrollFrame();
  });

  /* ---------- Défilement glissant à la molette ---------- */
  // Uniquement souris/trackpad : le clavier, le tactile et les ancres gardent le scroll natif.

  if (!reduceMotion.matches && window.matchMedia("(pointer: fine)").matches) {
    let target = window.scrollY;
    let current = target;
    let last = null;

    // Amorti calé sur le temps écoulé, pas sur le nombre d'images : le même glissé à 60 Hz et à 120 Hz,
    // et pas de saut quand une image arrive en retard.
    const glide = (now) => {
      const dt = last === null ? 1000 / 60 : Math.min(Math.max(now - last, 0), 50);
      last = now;
      current += (target - current) * (1 - Math.exp(-dt / 150));
      if (Math.abs(target - current) < 0.3) {
        current = target;
        gliding = false;
      }
      window.scrollTo({ top: current, behavior: "instant" });
      // Les effets suivent dans la même image que le défilement, sans attendre l'événement scroll.
      onScrollFrame();
      if (gliding) requestAnimationFrame(glide);
    };

    window.addEventListener("wheel", (event) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.target.closest("canvas, [data-native-scroll]")) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      if (!gliding) current = window.scrollY;
      target = Math.min(Math.max((gliding ? target : current) + event.deltaY * unit, 0), scrollMax);
      if (!gliding) {
        gliding = true;
        last = null;
        requestAnimationFrame(glide);
      }
    }, { passive: false });

    window.addEventListener("scroll", () => {
      if (!gliding) target = window.scrollY;
    }, { passive: true });
  }

  /* ---------- Ancres : le bloc visé arrive centré entre l'en-tête et le bas de l'écran ---------- */
  // Le bloc, ce sont les éléments [data-center] de la section (leur ensemble, du premier au dernier).

  const samePage = (url) => url.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");

  function centerOn(section, behavior) {
    const parts = section.querySelectorAll("[data-center]");
    if (!parts.length) return false;
    let top = Infinity;
    let bottom = -Infinity;
    parts.forEach((el) => {
      const box = el.getBoundingClientRect();
      top = Math.min(top, box.top);
      bottom = Math.max(bottom, box.bottom);
    });
    const headerBottom = (parseFloat(getComputedStyle(siteHeader).top) || 0) + siteHeader.offsetHeight;
    const room = window.innerHeight - headerBottom;
    // Trop haut pour tenir à l'écran : on cale le haut du bloc sous l'en-tête, pour que son titre reste visible.
    const offset = bottom - top <= room ? headerBottom + (room - (bottom - top)) / 2 : headerBottom + 16;
    window.scrollTo({ top: window.scrollY + top - offset, behavior });
    return true;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href*='#']");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    const section = url.hash.length > 1 && samePage(url) && document.getElementById(url.hash.slice(1));
    if (section && centerOn(section, reduceMotion.matches ? "instant" : "smooth")) {
      event.preventDefault();
      history.pushState(null, "", url.hash);
    }
  });

  // Arrivée depuis une autre page (« ← Tous les projets ») : même placement, une fois la page en place.
  if (location.hash.length > 1) {
    const section = document.getElementById(location.hash.slice(1));
    if (section) window.addEventListener("load", () => centerOn(section, "instant"));
  }

  /* ---------- Transition entre les pages ---------- */

  // Le panneau garde la couleur de la page qu'on quitte : il ne change pas de teinte en cours de route.
  const curtain = document.querySelector(".curtain");

  if (!reduceMotion.matches) {
    try {
      const color = sessionStorage.getItem("curtain");
      if (color) {
        sessionStorage.removeItem("curtain");
        curtain.style.background = color;
        curtain.classList.add("is-covered");
        requestAnimationFrame(() => requestAnimationFrame(() => {
          curtain.className = "curtain is-leaving";
        }));
      }
    } catch (e) { /* stockage indisponible : pas de transition à l'arrivée */ }

    curtain.addEventListener("transitionend", () => {
      if (curtain.classList.contains("is-leaving")) {
        curtain.className = "curtain";
        curtain.style.background = "";
      }
    });

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.protocol !== location.protocol) return;
      if (samePage(url)) return; // ancre sur la même page (« / » et « /index.html » compris)

      event.preventDefault();
      curtain.className = "curtain is-covering";
      try { sessionStorage.setItem("curtain", getComputedStyle(curtain).backgroundColor); } catch (e) { /* rien à faire */ }
      // 0,4 s pour couvrir l'écran, puis 0,3 s de pause avant de changer de page.
      setTimeout(() => { location.href = url.href; }, 700);
    });

    // Retour arrière depuis le cache du navigateur : la page revient sans le panneau.
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) curtain.className = "curtain";
    });
  }

  /* ---------- Stickers à déplacer (et à cliquer : ils mènent au projet) ---------- */

  document.querySelectorAll("[data-drag]").forEach((el) => {
    let startX = 0, startY = 0, baseX = 0, baseY = 0;
    let moved = false;

    el.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      el.setPointerCapture(event.pointerId);
      el.classList.add("is-dragging");
      moved = false;
      startX = event.clientX;
      startY = event.clientY;
      baseX = parseFloat(el.style.getPropertyValue("--dx")) || 0;
      baseY = parseFloat(el.style.getPropertyValue("--dy")) || 0;
    });

    el.addEventListener("pointermove", (event) => {
      if (!el.classList.contains("is-dragging")) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.hypot(dx, dy) > 6) moved = true;
      el.style.setProperty("--dx", `${baseX + dx}px`);
      el.style.setProperty("--dy", `${baseY + dy}px`);
    });

    const stop = () => el.classList.remove("is-dragging");
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);

    // Après un vrai glissé, le clic qui suit n'ouvre pas le projet ; un simple clic, si.
    el.addEventListener("click", (event) => {
      if (moved) event.preventDefault();
      moved = false;
    });
  });

  /* ---------- Index des projets : l'affiche suit le nom survolé ---------- */

  const indexImages = document.querySelectorAll(".work-index-media img");
  document.querySelectorAll("[data-show]").forEach((link) => {
    const show = () => indexImages.forEach((img, i) => img.classList.toggle("is-active", i === Number(link.dataset.show)));
    link.addEventListener("pointerenter", show);
    link.addEventListener("focus", show);
  });

  /* ---------- Copier l'adresse email ---------- */

  const copyBtn = document.querySelector("[data-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(t("contact.email"));
        copyBtn.textContent = t("contact.copied");
        setTimeout(() => { copyBtn.textContent = t("contact.copy"); }, 2000);
      } catch (e) {
        window.location.href = `mailto:${t("contact.email")}`;
      }
    });
  }

  /* ---------- Testeur de la typo Touffe ---------- */

  const tester = document.getElementById("type-tester");
  const testerOut = document.getElementById("type-tester-output");
  if (tester && testerOut) {
    const sync = () => { testerOut.textContent = tester.value || t("pages.touffe.tryDefault"); };
    tester.addEventListener("input", sync);
    document.addEventListener("langchange", () => {
      if (!tester.dataset.touched) tester.value = t("pages.touffe.tryDefault");
      sync();
    });
    tester.addEventListener("input", () => { tester.dataset.touched = "1"; }, { once: true });
  }

  applyTexts();
})();
