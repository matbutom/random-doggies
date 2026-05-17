const LOCAL_CREATIONS_KEY = "randomAnimals.creations";
const PUBLIC_CREATIONS_KEY = "randomAnimals.publicCreations";
const AUTHOR_NAME_KEY = "randomAnimals.authorName";
const SPAN_CLASSES = ["span-1", "span-1", "span-2", "span-2", "span-3"];

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function writeList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentAuthorName() {
  const input = document.getElementById("author-name");
  const fromInput = input?.value.trim();
  const stored = localStorage.getItem(AUTHOR_NAME_KEY)?.trim();
  return fromInput || stored || "";
}

function authorFor(creation) {
  return creation.author || localStorage.getItem(AUTHOR_NAME_KEY) || "Anónimo";
}

function sizeClassFor(creation, index) {
  const source = creation.id || `${index}`;
  let sum = index;
  for (let i = 0; i < source.length; i++) sum += source.charCodeAt(i);
  return SPAN_CLASSES[sum % SPAN_CLASSES.length];
}

function makeButton(label, onClick) {
  const button = document.createElement("button");
  button.className = "btn";
  button.type = "button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function emptyState(text) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = text;
  return empty;
}

function renderCards(target, creations, options = {}) {
  const template = document.getElementById("creation-card-template");
  target.innerHTML = "";

  if (!creations.length) {
    target.appendChild(emptyState(options.emptyText || "Todavía no hay creaciones."));
    return;
  }

  creations.forEach((creation, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const img = node.querySelector("img");
    const author = node.querySelector("p");
    const actions = node.querySelector(".card-actions");

    node.classList.add(sizeClassFor(creation, index));
    img.src = creation.image;
    img.alt = `Creación de ${authorFor(creation)}`;
    author.textContent = authorFor(creation);

    if (options.actionsForCreation) {
      for (const action of options.actionsForCreation(creation)) {
        actions.appendChild(action);
      }
    } else {
      actions.remove();
    }

    target.appendChild(node);
  });
}

function syncAuthorInput() {
  const input = document.getElementById("author-name");
  if (!input) return;
  input.value = localStorage.getItem(AUTHOR_NAME_KEY) || "";
  input.addEventListener("input", () => {
    localStorage.setItem(AUTHOR_NAME_KEY, input.value.trim());
  });
}

function updateStoredAuthor() {
  const author = currentAuthorName();
  const input = document.getElementById("author-name");
  if (!author) {
    input?.focus();
    return;
  }

  localStorage.setItem(AUTHOR_NAME_KEY, author);
  writeList(
    LOCAL_CREATIONS_KEY,
    readList(LOCAL_CREATIONS_KEY).map((creation) => ({ ...creation, author })),
  );
  writeList(
    PUBLIC_CREATIONS_KEY,
    readList(PUBLIC_CREATIONS_KEY).map((creation) => ({ ...creation, author })),
  );
  renderGallery();
}

function setupAuthorButton() {
  document
    .getElementById("btn-update-author")
    ?.addEventListener("click", updateStoredAuthor);
}

function publishCreation(creation) {
  const author = currentAuthorName();
  if (!author) {
    const input = document.getElementById("author-name");
    input?.focus();
    return;
  }

  localStorage.setItem(AUTHOR_NAME_KEY, author);
  const localCreations = readList(LOCAL_CREATIONS_KEY).map((item) =>
    item.id === creation.id ? { ...item, author } : item,
  );
  writeList(LOCAL_CREATIONS_KEY, localCreations);

  const publicCreations = readList(PUBLIC_CREATIONS_KEY);
  if (publicCreations.some((item) => item.sourceId === creation.id)) return;

  publicCreations.unshift({
    ...creation,
    author,
    id: `public-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sourceId: creation.id,
    publishedAt: new Date().toISOString(),
  });

  writeList(PUBLIC_CREATIONS_KEY, publicCreations.slice(0, 120));
  renderGallery();
}

function deleteLocalCreation(id) {
  const creations = readList(LOCAL_CREATIONS_KEY).filter((item) => item.id !== id);
  writeList(LOCAL_CREATIONS_KEY, creations);
  renderGallery();
}

function setupTabs() {
  const buttons = document.querySelectorAll("[data-tab]");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      document
        .querySelectorAll(".tab-panel")
        .forEach((panel) => panel.classList.toggle("active", panel.id === `panel-${tab}`));
    });
  });
}

function renderGallery() {
  const localCreations = readList(LOCAL_CREATIONS_KEY);
  const publicCreations = readList(PUBLIC_CREATIONS_KEY);
  const publishedSourceIds = new Set(publicCreations.map((item) => item.sourceId));

  renderCards(document.getElementById("public-creations"), publicCreations, {
    emptyText: "Todavía no hay criaturas publicadas.",
  });

  renderCards(document.getElementById("local-creations"), localCreations, {
    emptyText: "Guarda una criatura desde el generador para verla aquí.",
    actionsForCreation: (creation) => {
      const isPublished = publishedSourceIds.has(creation.id);
      return [
        makeButton(isPublished ? "[ publicada ]" : "[ publicar ]", () =>
          publishCreation(creation),
        ),
        makeButton("[ eliminar ]", () => deleteLocalCreation(creation.id)),
      ];
    },
  });
}

setupTabs();
syncAuthorInput();
setupAuthorButton();
renderGallery();
