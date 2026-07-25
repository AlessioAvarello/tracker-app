/**
 * SCHEDARIO — logica dell'app
 * ----------------------------------------------------
 * Nessun framework: solo JS puro che ricostruisce l'interfaccia dentro
 * #app in base allo stato corrente. Se non hai mai letto codice così,
 * segui i commenti: ogni sezione fa una cosa sola.
 */

// ====================== 1. CONFIGURAZIONE ======================
// Incolla qui l'URL che ottieni facendo il Deploy > Web App dell'Apps Script
// (vedi README.md, punto 3). Deve finire con /exec
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZcpu5-WtfC0CdTDCG-OEjFQgmeP0CvL8yHlVKNO-PevQaGeHC25jzs_Aqwd9nYU32/exec";

// ====================== 2. DEFINIZIONE CATEGORIE ======================
// Questa è l'unica fonte di verità per i campi dei form e dell'archivio.
// L'ordine e le chiavi (key) devono corrispondere a COLUMN_ORDER in Code.gs.
const CATEGORIES = {
  anime: {
    label: "Anime",
    icon: "🎴",
    accent: "rose",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali (stagione)", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "text", placeholder: "es. 4h 30m" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: 0.5 },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con la ragazza", type: "checkbox" }
    ]
  },
  serie: {
    label: "Serie TV",
    icon: "📺",
    accent: "teal",
    fields: [
      { key: "nome", label: "Nome serie", type: "text", required: true },
      { key: "stagione", label: "Stagione", type: "number", min: 1, step: 1 },
      { key: "episodiTotali", label: "Episodi totali (stagione)", type: "number", min: 1, step: 1 },
      { key: "durata", label: "Durata totale", type: "text", placeholder: "es. 4h 30m" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: 0.5 },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con la ragazza", type: "checkbox" }
    ]
  },
  film: {
    label: "Film",
    icon: "🎬",
    accent: "gold",
    fields: [
      { key: "nome", label: "Nome film", type: "text", required: true },
      { key: "durata", label: "Durata totale", type: "text", placeholder: "es. 2h 10m" },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: 0.5 },
      { key: "commento", label: "Commento", type: "textarea" },
      { key: "conLei", label: "Visto con la ragazza", type: "checkbox" }
    ]
  },
  giochi: {
    label: "Giochi",
    icon: "🎮",
    accent: "violet",
    fields: [
      { key: "nome", label: "Nome gioco", type: "text", required: true },
      { key: "voto", label: "Voto", type: "number", min: 0, max: 10, step: 0.5 },
      { key: "finitoIl", label: "Finito il", type: "date" },
      { key: "opinione", label: "Opinione", type: "textarea" }
    ]
  }
};

// ====================== 3. STATO DELL'APP ======================
const state = {
  view: "home",     // "home" | "category"
  categoria: null,  // "anime" | "serie" | "film" | "giochi"
  tab: "add"        // "add" | "archive"
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
  wrap.appendChild(el("p", "eyebrow", "il tuo diario di visione"));
  wrap.appendChild(el("h1", "title", "Schedario"));

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

  // header
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

  // tabs
  const tabs = el("div", "tabs");
  const addTab = el("button", "tab-btn" + (state.tab === "add" ? " active" : ""), "➕ Aggiungi");
  const archiveTab = el("button", "tab-btn" + (state.tab === "archive" ? " active" : ""), "📂 Archivio");
  addTab.addEventListener("click", function () { state.tab = "add"; render(); });
  archiveTab.addEventListener("click", function () { state.tab = "archive"; render(); });
  tabs.appendChild(addTab);
  tabs.appendChild(archiveTab);
  wrap.appendChild(tabs);

  // content
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
      const input = form.querySelector('[name="' + field.key + '"]');
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

  const top = el("div", "archive-card-top");
  top.appendChild(el("h3", "archive-card-title", entry.nome || "(senza nome)"));
  if (entry.voto !== "" && entry.voto !== undefined && entry.voto !== null) {
    top.appendChild(el("span", "vote-stamp", String(entry.voto)));
  }
  card.appendChild(top);

  const meta = el("div", "archive-card-meta");
  cat.fields.forEach(function (field) {
    if (field.key === "nome" || field.key === "voto" || field.key === "commento" || field.key === "opinione") return;
    const val = entry[field.key];
    if (val === "" || val === undefined || val === null) return;
    if (field.type === "checkbox") {
      if (val === "Sì" || val === true) meta.appendChild(el("span", "meta-chip", "💕 " + field.label));
      return;
    }
    meta.appendChild(el("span", "meta-chip", field.label + ": " + val));
  });
  if (entry.data) meta.appendChild(el("span", "meta-chip meta-date", entry.data));
  card.appendChild(meta);

  const noteText = entry.commento || entry.opinione;
  if (noteText) card.appendChild(el("p", "archive-card-note", noteText));

  return card;
}

// ====================== 5. CHIAMATE AL BACKEND ======================
function saveEntry(payload) {
  // Content-Type "text/plain" (invece di application/json) evita che il
  // browser mandi una richiesta di preflight CORS, che Apps Script non
  // gestisce. Il backend fa comunque JSON.parse del contenuto ricevuto.
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

// ====================== AVVIO ======================
render();
