
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZcpu5-WtfC0CdTDCG-OEjFQgmeP0CvL8yHlVKNO-PevQaGeHC25jzs_Aqwd9nYU32/exec";

// ====================== 2. DEFINIZIONE CATEGORIE ======================
const CATEGORIES = {
  anime: {
    label: "Anime",
    icon: "🎴",
    accent: "rose",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" },
      { key: "filmanime", label: "Film Anime", type: "checkbox" } 
    ]
  },
  serie: {
    label: "Serie TV",
    icon: "📺",
    accent: "teal",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" }
    ]
  },
  film: {
    label: "Film",
    icon: "🎬",
    accent: "gold",
    fields: [
      { key: "nome", label: "Nome film", type: "text", required: true },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "data", label: "Data", type: "date" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" }
    ]
  },
  giochi: {
    label: "Giochi",
    icon: "🎮",
    accent: "violet",
    // Qui tratto "ore" come duration (ore + minuti) per mostrare "4h 30m" coerentemente.
    fields: [
      { key: "nome", label: "Nome gioco", type: "text", required: true },
      { key: "ore", label: "Ore", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "finitoIl", label: "Finito il", type: "date" },
      { key: "opinione", label: "Opinione", type: "textarea" }
    ]
  }
};

// ====================== 3. STATO DELL'APP ======================
const state = {
  view: "home",
  categoria: null,
  tab: "add"
};

const app = document.getElementById("app");

// ====================== 4. RENDER ======================
function render() {
  app.innerHTML = "";
  if (state.view === "home") {
    app.appendChild(renderHome());
  } else {
    app.appendChild(renderCategory(state.categoria));
  }
}

function renderHome() {
  const wrap = el("div", "home");
  wrap.appendChild(el("p", "eyebrow", "Alessio Avarello"));
  wrap.appendChild(el("h1", "title", "Tracker"));

  const grid = el("div", "category-grid");
  Object.keys(CATEGORIES).forEach(function (key) {
    const cat = CATEGORIES[key];
    const card = el("button", "category-card accent-" + cat.accent);
    card.innerHTML =
      '<span class="category-icon">' + cat.icon + '</span>' +
      '<span class="category-label">' + cat.label + '</span>';
    card.addEventListener("click", function () {
      state.view = "category";
      state.categoria = key;
      state.tab = "add";
      render();
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}

function renderCategory(categoriaKey) {
  const cat = CATEGORIES[categoriaKey];
  const wrap = el("div", "category-view accent-" + cat.accent);

  const header = el("div", "category-header");
  const back = el("button", "back-btn", "← Categorie");
  back.addEventListener("click", function () {
    state.view = "home";
    state.categoria = null;
    render();
  });
  header.appendChild(back);
  header.appendChild(el("h2", "category-title", cat.icon + " " + cat.label));
  wrap.appendChild(header);

  const tabs = el("div", "tabs");
  const addTab = el("button", "tab-btn" + (state.tab === "add" ? " active" : ""), "➕ Aggiungi");
  const archiveTab = el("button", "tab-btn" + (state.tab === "archive" ? " active" : ""), "📂 Archivio");
  addTab.addEventListener("click", function () { state.tab = "add"; render(); });
  archiveTab.addEventListener("click", function () { state.tab = "archive"; render(); });
  tabs.appendChild(addTab);
  tabs.appendChild(archiveTab);
  wrap.appendChild(tabs);

  const content = el("div", "tab-content");
  if (state.tab === "add") {
    content.appendChild(renderForm(categoriaKey));
  } else {
    content.appendChild(renderArchivePlaceholder());
    loadArchive(categoriaKey, content);
  }
  wrap.appendChild(content);

  return wrap;
}

// ---------- form "aggiungi" ----------
function renderForm(categoriaKey) {
  const cat = CATEGORIES[categoriaKey];
  const form = el("form", "entry-form");

  cat.fields.forEach(function (field) {
    form.appendChild(renderField(field));
  });

  const feedback = el("p", "form-feedback");
  const submitBtn = el("button", "submit-btn", "Salva nel foglio");
  submitBtn.type = "submit";
  form.appendChild(feedback);
  form.appendChild(submitBtn);

  form.addEventListener("submit", function (evt) {
    evt.preventDefault();
    const payload = { categoria: categoriaKey };
    cat.fields.forEach(function (field) {
      if (field.type === "duration") {
        // nomi dinamici basati su field.key
        payload[field.key + "Ore"] = form.querySelector('[name="' + field.key + 'Ore"]').value;
        payload[field.key + "Minuti"] = form.querySelector('[name="' + field.key + 'Minuti"]').value;
        return;
      }
      const input = form.querySelector('[name="' + field.key + '"]');
      if (!input) return;
      payload[field.key] = field.type === "checkbox" ? input.checked : input.value;
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Salvataggio…";
    feedback.textContent = "";
    feedback.className = "form-feedback";

    saveEntry(payload)
      .then(function (res) {
        if (!res.success) throw new Error(res.error || "Errore sconosciuto");
        feedback.textContent = "✅ Salvato nel foglio.";
        feedback.className = "form-feedback success";
        form.reset();
      })
      .catch(function (err) {
        feedback.textContent = "⚠️ Non sono riuscito a salvare: " + err.message + ". Controlla l'URL dell'Apps Script in script.js (vedi README).";
        feedback.className = "form-feedback error";
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Salva nel foglio";
      });
  });

  return form;
}

function renderField(field) {
  const group = el("label", "field field-" + field.type);
  if (field.type === "checkbox") {
    group.classList.add("field-checkbox");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = field.key;
    group.appendChild(input);
    group.appendChild(el("span", "field-label", field.label));
    return group;
  }

  if (field.type === "duration") {
    group.appendChild(el("span", "field-label", field.label));
    const row = el("div", "field-duration-inputs");

    const oreWrap = el("span", "duration-input");
    oreWrap.appendChild(el("span", "duration-input-label", "Ore"));
    const oreInput = document.createElement("input");
    oreInput.type = "number";
    oreInput.min = 0;
    oreInput.step = "1";
    oreInput.name = field.key + "Ore"; // dinamico
    oreInput.placeholder = "0";
    oreWrap.appendChild(oreInput);

    const minWrap = el("span", "duration-input");
    minWrap.appendChild(el("span", "duration-input-label", "Minuti"));
    const minInput = document.createElement("input");
    minInput.type = "number";
    minInput.min = 0;
    minInput.max = 59;
    minInput.step = "1";
    minInput.name = field.key + "Minuti"; // dinamico
    minInput.placeholder = "0";
    minWrap.appendChild(minInput);

    row.appendChild(oreWrap);
    row.appendChild(minWrap);
    group.appendChild(row);
    return group;
  }

  group.appendChild(el("span", "field-label", field.label + (field.required ? " *" : "")));

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 3;
  } else {
    input = document.createElement("input");
    input.type = field.type;
    if (field.min !== undefined) input.min = field.min;
    if (field.max !== undefined) input.max = field.max;
    if (field.step !== undefined) input.step = field.step;
  }
  input.name = field.key;
  if (field.placeholder) input.placeholder = field.placeholder;
  if (field.required) input.required = true;

  group.appendChild(input);
  return group;
}

// ---------- archivio ----------
function renderArchivePlaceholder() {
  const p = el("p", "archive-status", "Carico le voci salvate…");
  p.dataset.role = "archive-status";
  return p;
}

function loadArchive(categoriaKey, container) {
  fetchArchive(categoriaKey)
    .then(function (res) {
      if (!res.success) throw new Error(res.error || "Errore sconosciuto");
      container.innerHTML = "";
      if (res.entries.length === 0) {
        container.appendChild(el("p", "archive-status", "Ancora nessuna voce salvata qui. Aggiungine una dalla scheda \"Aggiungi\"."));
        return;
      }
      
      // -- NUOVO: Aggiungiamo il recap prima della lista --
      container.appendChild(renderArchiveSummary(categoriaKey, res.entries));

      const list = el("div", "archive-list");
      res.entries.forEach(function (entry) {
        list.appendChild(renderArchiveCard(categoriaKey, entry));
      });
      container.appendChild(list);
    })
    .catch(function (err) {
      container.innerHTML = "";
      container.appendChild(el("p", "archive-status error",
        "⚠️ Non riesco a leggere l'archivio: " + err.message + ". Controlla l'URL dell'Apps Script in script.js (vedi README)."));
    });
}

function renderArchiveCard(categoriaKey, entry) {
  const cat = CATEGORIES[categoriaKey];
  const card = el("article", "archive-card accent-" + cat.accent);

  // Aggiunto "filmanime" per non mostrarlo come chip generico sotto
  const SKIP_IN_META = ["nome", "voto", "commento", "opinione", "stagione", "filmanime"];

  const top = el("div", "archive-card-top");
  const heading = el("div", "archive-card-heading");
  heading.appendChild(el("h3", "archive-card-title", entry.nome || "(senza nome)"));
  
  // --- NUOVA LOGICA BADGE STAGIONE / FILM ---
  if (entry.filmanime) {
    heading.appendChild(el("span", "season-badge", "FILM"));
  } else if (entry.stagione !== "" && entry.stagione !== undefined && entry.stagione !== null) {
    heading.appendChild(el("span", "season-badge", "Stagione " + entry.stagione));
  }
  // ------------------------------------------

  top.appendChild(heading);
  if (entry.voto !== "" && entry.voto !== undefined && entry.voto !== null) {
    top.appendChild(el("span", "vote-stamp", String(entry.voto)));
  }
  card.appendChild(top);

  const meta = el("div", "archive-card-meta");
  cat.fields.forEach(function (field) {
    if (SKIP_IN_META.indexOf(field.key) !== -1) return;
    const val = entry[field.key];
    if (val === "" || val === undefined || val === null) return;
    if (field.type === "checkbox") {
      if (val === "Sì" || val === true) meta.appendChild(el("span", "meta-chip", "💕 " + field.label));
      return;
    }
    meta.appendChild(el("span", "meta-chip", field.label + ": " + val));
  });
  card.appendChild(meta);

  const noteText = entry.commento || entry.opinione;
  if (noteText) card.appendChild(el("p", "archive-card-note", noteText));

  return card;
}

// ====================== 5. CHIAMATE AL BACKEND ======================
function saveEntry(payload) {
  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  }).then(function (r) { return r.json(); });
}

function fetchArchive(categoriaKey) {
  return fetch(APPS_SCRIPT_URL + "?categoria=" + encodeURIComponent(categoriaKey))
    .then(function (r) { return r.json(); });
}

// ====================== 6. HELPER DOM ======================
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ====================== 7. HELPER RECAP ARCHIVIO ======================

// Converte una stringa "4h 30m" nel totale dei minuti (es. 270)
function parseDurationStr(str) {
  if (!str) return 0;
  const match = str.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  return 0;
}

// Converte i minuti totali di nuovo in formato "Xh Ym"
function formatMinutesToDuration(totalMin) {
  if (totalMin === 0) return "0h 00m";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h + "h " + (m < 10 ? "0" : "") + m + "m";
}

// Crea il riquadro di recap in base alla categoria
function renderArchiveSummary(categoriaKey, entries) {
  const wrap = el("div", "archive-summary");
  
  let totalItems = entries.length;
  let totalDurationMins = 0;
  let totalEpisodes = 0;

  // Calcola i totali
  entries.forEach(function(entry) {
    // Somma durata (Film, Anime, Serie) o ore (Giochi)
    if (entry.durata) totalDurationMins += parseDurationStr(entry.durata);
    if (entry.ore) totalDurationMins += parseDurationStr(entry.ore);

    // Somma episodi (Anime, Serie)
    if (entry.episodiTotali) {
      const ep = Number(entry.episodiTotali);
      if (!isNaN(ep)) totalEpisodes += ep;
    }
  });

  const formattedDuration = formatMinutesToDuration(totalDurationMins);

  // Costruisce il testo in base alla categoria
  if (categoriaKey === "anime" || categoriaKey === "serie") {
    wrap.appendChild(el("p", "summary-text", "📺 Voci totali: " + totalItems + " | 📼 Episodi visti: " + totalEpisodes + " | ⏱️ Tempo totale: " + formattedDuration));
  } else if (categoriaKey === "film") {
    wrap.appendChild(el("p", "summary-text", "🎬 Film visti: " + totalItems + " | ⏱️ Tempo totale: " + formattedDuration));
  } else if (categoriaKey === "giochi") {
    wrap.appendChild(el("p", "summary-text", "🎮 Giochi giocati: " + totalItems + " | ⏱️ Ore totali: " + formattedDuration));
  }

  return wrap;
}

// ====================== AVVIO ======================
render();