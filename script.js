const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZcpu5-WtfC0CdTDCG-OEjFQgmeP0CvL8yHlVKNO-PevQaGeHC25jzs_Aqwd9nYU32/exec";

// ====================== 2. DEFINIZIONE CATEGORIE ======================
const CATEGORIES = {
  anime: {
    label: "Anime",
    icon: "🎴",
    accent: "blue",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" },
      { key: "filmanime", label: "Film Anime", type: "checkbox" },
      { key: "finitoIl", label: "Finito il", type: "date" }
    ]
  },
  serie: {
    label: "Serie TV",
    icon: "📺",
    accent: "purple",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" },
      { key: "finitoIl", label: "Finito il", type: "date" }
    ]
  },
  film: {
    label: "Film",
    icon: "🎬",
    accent: "red",
    fields: [
      { key: "nome", label: "Nome film", type: "text", required: true },
      { key: "durata", label: "Durata totale", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con Lore", type: "checkbox" },
      { key: "finitoIl", label: "Finito il", type: "date" }
    ]
  },
  giochi: {
    label: "Giochi",
    icon: "🎮",
    accent: "green",
    fields: [
      { key: "nome", label: "Nome gioco", type: "text", required: true },
      { key: "ore", label: "Ore", type: "duration" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: "any" },
      { key: "opinione", label: "Opinione", type: "textarea" },
      { key: "finitoIl", label: "Finito il", type: "date" }
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
      
      // Salviamo le voci in una variabile per non doverle riscaricare ogni volta che ordiniamo
      const originalEntries = res.entries;
      let currentSort = "timeline"; // <-- IMPOSTATO IL NUOVO DEFAULT AL CRONOLOGICO

      // 1. Recap Generale
      container.appendChild(renderArchiveSummary(categoriaKey, originalEntries));

      // 2. Controlli di Ordinamento
      const controls = el("div", "archive-controls");
      const label = el("span", "sort-label", "Ordina per: ");
      const select = document.createElement("select");
      select.className = "sort-select";
      
      // <-- NUOVE OPZIONI DI ORDINAMENTO -->
      const options = [
        { value: "timeline", text: "Cronologico (Mesi)" },
        { value: "default", text: "Ordine di Inserimento" },
        { value: "nome", text: "Nome (A-Z)" },
        { value: "durata", text: "Durata (Maggiore - Minore)" },
        { value: "lore", text: "Visti con Lore" }
      ];

      options.forEach(function(optData) {
        const opt = document.createElement("option");
        opt.value = optData.value;
        opt.textContent = optData.text;
        select.appendChild(opt);
      });

      controls.appendChild(label);
      controls.appendChild(select);
      container.appendChild(controls);

      // 3. Contenitore della lista dinamica
      const listContainer = el("div", "archive-list-container");
      container.appendChild(listContainer);

      // Funzione interna per ordinare e disegnare le card
      function renderSortedList() {
        listContainer.innerHTML = "";
        
        // Creiamo una copia della lista originale
        let sorted = originalEntries.slice();

        // <-- NUOVA LOGICA DI ORDINAMENTO -->
        if (currentSort === "timeline") {
          sorted.sort((a, b) => {
            const da = parseItalianDate(a.finitoIl);
            const db = parseItalianDate(b.finitoIl);
            if (da === null && db === null) return 0;
            if (da === null) return 1;
            if (db === null) return -1;
            return db.getTime() - da.getTime(); 
          });
        } else if (currentSort === "nome") {
          sorted.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        } else if (currentSort === "durata") {
          sorted.sort((a, b) => {
            const durA = parseDurationStr(a.durata || a.ore || "");
            const durB = parseDurationStr(b.durata || b.ore || "");
            return durB - durA;
          });
        } else if (currentSort === "lore") {
          sorted.sort((a, b) => {
            const valA = (a.conLei === true || a.conLei === "Sì") ? 1 : 0;
            const valB = (b.conLei === true || b.conLei === "Sì") ? 1 : 0;
            return valB - valA; 
          });
        }

        // Creiamo fisicamente le card
        const list = el("div", "archive-list");
        let currentMonthYear = null;

        sorted.forEach(function (entry) {
          
          // <-- CREAZIONE DEI BANNER DELLA TIMELINE -->
          if (currentSort === "timeline") {
            const d = parseItalianDate(entry.finitoIl);
            let monthYearStr = "Senza Data"; 
            
            if (d) {
              const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
              monthYearStr = mesi[d.getMonth()] + " " + d.getFullYear();
            }
            
            if (monthYearStr !== currentMonthYear) {
              currentMonthYear = monthYearStr;
              const banner = el("div", "timeline-banner");
              banner.textContent = monthYearStr;
              list.appendChild(banner);
            }
          }

          list.appendChild(renderArchiveCard(categoriaKey, entry));
        });
        
        listContainer.appendChild(list);
      }

      // Quando l'utente cambia opzione nella tendina, riordiniamo!
      select.addEventListener("change", function(e) {
        currentSort = e.target.value;
        renderSortedList();
      });

      // Primo caricamento (ordine di default)
      renderSortedList();
    })
    .catch(function (err) {
      container.innerHTML = "";
      container.appendChild(el("p", "archive-status error",
        "⚠️ Non riesco a leggere l'archivio: " + err.message + ". Controlla l'URL."));
    });
}

function renderArchiveCard(categoriaKey, entry) {
  const cat = CATEGORIES[categoriaKey];
  const card = el("article", "archive-card accent-" + cat.accent);

  // Aggiunto "filmanime" per non mostrarlo come chip generico sotto
  // Aggiunto anche "finitoIl" qui, così non lo mostra come chip ma lo usiamo per la timeline
  const SKIP_IN_META = ["nome", "voto", "commento", "opinione", "stagione", "filmanime", "finitoIl"];

  const top = el("div", "archive-card-top");
  const heading = el("div", "archive-card-heading");
  heading.appendChild(el("h3", "archive-card-title", entry.nome || "(senza nome)"));
  
  // --- LOGICA BADGE STAGIONE / FILM ---
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

function parseDurationStr(str) {
  if (!str) return 0;
  const match = str.match(/(\d+)h\s*(\d+)m/);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }
  return 0;
}

function formatMinutesToDuration(totalMin) {
  if (totalMin === 0) return "0h 00m";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h + "h " + (m < 10 ? "0" : "") + m + "m";
}

function renderArchiveSummary(categoriaKey, entries) {
  const wrap = el("div", "archive-summary");
  
  let totalItems = entries.length;
  let totalDurationMins = 0;
  let totalEpisodes = 0;

  entries.forEach(function(entry) {
    if (entry.durata) totalDurationMins += parseDurationStr(entry.durata);
    if (entry.ore) totalDurationMins += parseDurationStr(entry.ore);

    if (entry.episodiTotali) {
      const ep = Number(entry.episodiTotali);
      if (!isNaN(ep)) totalEpisodes += ep;
    }
  });

  const formattedDuration = formatMinutesToDuration(totalDurationMins);

  if (categoriaKey === "anime" || categoriaKey === "serie") {
    wrap.appendChild(el("p", "summary-text", "📺 Voci totali: " + totalItems + " | 📼 Episodi visti: " + totalEpisodes + " | ⏱️ Tempo totale: " + formattedDuration));
  } else if (categoriaKey === "film") {
    wrap.appendChild(el("p", "summary-text", "🎬 Film visti: " + totalItems + " | ⏱️ Tempo totale: " + formattedDuration));
  } else if (categoriaKey === "giochi") {
    wrap.appendChild(el("p", "summary-text", "🎮 Giochi giocati: " + totalItems + " | ⏱️ Ore totali: " + formattedDuration));
  }

  return wrap;
}

function parseItalianDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// ====================== AVVIO ======================
render();