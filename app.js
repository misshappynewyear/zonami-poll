const BROWSER_TOKEN_STORAGE_KEY = "ZNCCA-bt";
const LANGUAGE_STORAGE_KEY = "ZNCCA-lang";
const SUBMISSION_ENDPOINT = window.VOTE_PAGE_CONFIG?.submissionEndpoint ?? "";
const APPROVED_ENDPOINT = SUBMISSION_ENDPOINT ? `${SUBMISSION_ENDPOINT}?action=approved` : "";
const LANGUAGE_CODES = ["en", "es", "fr", "pt", "ja", "zh", "ko", "hi", "it", "id", "vi", "tl", "ar"];
const RTL_LANGUAGES = new Set(["ar"]);

const translations = window.VOTE_PAGE_LOCALES || {};

for (const code of LANGUAGE_CODES) {
  if (!translations[code]) {
    translations[code] = { ...translations.en, categories: { ...translations.en.categories } };
  }
}

const creatorCounter = document.getElementById("creatorCounter");
const phaseTitle = document.getElementById("phaseTitle");
const phaseDescription = document.getElementById("phaseDescription");
const actionLabel = document.querySelector("[data-action-label]");
const participateTitle = document.getElementById("participateTitle");
const feedbackMessage = document.getElementById("feedbackMessage");
const creatorGrid = document.getElementById("creatorGrid");
const creatorTemplate = document.getElementById("creatorCardTemplate");
const suggestionForm = document.getElementById("suggestionForm");
const creatorNameInput = suggestionForm.elements.namedItem("name");
const loadingPanel = document.getElementById("loadingPanel");
const successPanel = document.getElementById("successPanel");
const successTitle = document.getElementById("successTitle");
const suggestAgainButton = document.getElementById("suggestAgainButton");
const ruleList = document.getElementById("ruleList");
const creatorFilters = Array.from(document.querySelectorAll(".creator-filter"));
const creatorPagination = document.getElementById("creatorPagination");
const creatorPrevButton = document.getElementById("creatorPrevButton");
const creatorNextButton = document.getElementById("creatorNextButton");
const creatorPageStatus = document.getElementById("creatorPageStatus");
const creatorSearchToggle = document.getElementById("creatorSearchToggle");
const creatorSearchPanel = document.getElementById("creatorSearchPanel");
const creatorSearchInput = document.getElementById("creatorSearchInput");
const languageSelect = document.getElementById("languageSelect");

let state = loadState();
let currentLanguage = detectLanguage();
let showcaseSelection = [];
let showcaseTimerStarted = false;
let activeCreatorFilter = "slideshow";
let creatorPage = 0;
let creatorSearchQuery = "";
let creatorsLoading = Boolean(APPROVED_ENDPOINT);
const CREATORS_PER_PAGE = 5;
const RANDOM_CREATORS_PER_VIEW = 3;

const i18nKeyMap = {
  "brand.server": "brandServer",
  "brand.awards": "brandAwards",
  "lang.label": "languageLabel",
  "hero.title": "heroTitle",
  "hero.cta": "heroCta",
  "hero.vote_count": "currentVoteCount",
  "hero.proposed_creators": "proposedCreators",
  "intro.title": "introTitle",
  "intro.body": "introBody",
  "intro.phase_description": "phaseDescription",
  "participate.kicker": "joinEvent",
  "participate.title": "suggestionPeriod",
  "form.creator_name": "creatorName",
  "form.creator_name_placeholder": "creatorNamePlaceholder",
  "form.category": "category",
  "form.category_placeholder": "categoryPlaceholder",
  "form.link": "link",
  "form.link_placeholder": "linkPlaceholder",
  "form.reason": "reason",
  "form.reason_placeholder": "reasonPlaceholder",
  "form.submit": "submitSuggestion",
  "loading.kicker": "submitting",
  "loading.title": "sendingSuggestion",
  "loading.body": "loadingBody",
  "success.kicker": "suggestionReceived",
  "success.body": "successBody",
  "success.cta": "suggestAgain",
  "creators.kicker": "creatorRanking",
  "creators.title": "suggestedCreators",
  "filters.slideshow": "slideshow",
  "filters.artists": "artists",
  "filters.influencers": "influencers",
  "filters.writers": "writers",
  "rules.kicker": "rules",
  "rules.title": "rulesTitle",
    "rewards.kicker": "eventHighlights",
    "rewards.title": "rewardsTitle",
    "rewards.stage_title": "suggestionStage",
    "rewards.stage_body": "suggestionStageBody",
    "rewards.daily_title": "dailyVoting",
    "rewards.daily_body": "dailyVotingBody",
    "rewards.reveal_title": "rankingReveal",
    "rewards.reveal_body": "rankingRevealBody",
    "discord.kicker": "discordKicker",
    "discord.title": "discordTitle",
    "discord.body": "discordBody",
    "discord.cta": "discordCta",
  };
function detectLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && LANGUAGE_CODES.includes(stored)) return stored;
  const browserLanguages = [navigator.language, ...(navigator.languages || [])].filter(Boolean).map((item) => item.toLowerCase());
  for (const lang of browserLanguages) {
    const base = lang.split("-")[0];
    if (LANGUAGE_CODES.includes(lang)) return lang;
    if (LANGUAGE_CODES.includes(base)) return base;
  }
  return "en";
}

function t(key, params = {}) {
  const table = translations[currentLanguage] || translations.en;
  const resolvedKey = i18nKeyMap[key] || key;
  if (resolvedKey.startsWith("category.")) {
    return categoryLabel(resolvedKey.slice("category.".length));
  }
  let value = table[resolvedKey] ?? translations.en[resolvedKey] ?? key;
  for (const [param, replacement] of Object.entries(params)) {
    value = value.replace(`{${param}}`, replacement);
  }
  return value;
}

function categoryLabel(value) {
  return (translations[currentLanguage] || translations.en).categories[value] || value;
}

function getBrowserToken() {
  const existing = localStorage.getItem(BROWSER_TOKEN_STORAGE_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(BROWSER_TOKEN_STORAGE_KEY, created);
  return created;
}

function buildSubmissionMetadata() {
  return {
    browser_token: getBrowserToken(),
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer,
    submitted_at_client: new Date().toISOString(),
  };
}

function normalizeCategory(value) {
  if (["Illustrator", "Influencers", "Writers"].includes(value)) return value;
  return "Influencers";
}

function normalizeLink(value, name = "creator") {
  if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) return value.trim();
  const slug = String(name || "creator").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `https://zonami.example/${slug || "creator"}`;
}

function normalizeCreatorEntry(entry) {
  return { ...entry, platform: normalizeCategory(entry.platform), region: normalizeLink(entry.region, entry.name) };
}

function loadState() {
  return { creators: [] };
}

function saveState() {
  return;
}

function setFeedback(message, type = "") {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) feedbackMessage.classList.add(`is-${type}`);
}

function showSuggestionSuccess(name) {
  loadingPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  successPanel.classList.remove("is-hidden");
  successPanel.dataset.creatorName = name;
  successTitle.textContent = t("thankYou", { name });
}

function showSuggestionForm() {
  loadingPanel.classList.add("is-hidden");
  successPanel.classList.add("is-hidden");
  delete successPanel.dataset.creatorName;
  suggestionForm.classList.remove("is-hidden");
}

function showSuggestionLoading() {
  successPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  loadingPanel.classList.remove("is-hidden");
}

function validateCreatorNameField() {
  if (!creatorNameInput) return true;
  const value = creatorNameInput.value.trim();
  if (value.startsWith("@")) {
    creatorNameInput.setCustomValidity(t("withoutAt"));
    creatorNameInput.reportValidity();
    return false;
  }
  creatorNameInput.setCustomValidity("");
  return true;
}

function getAllCreators() {
  return [...state.creators];
}

function sortedCreators() {
  return getAllCreators().sort((left, right) => left.name.localeCompare(right.name));
}

function pickRandomCreators(creators, count) {
  const shuffled = [...creators];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

function refreshShowcaseSelection() {
  const creators = sortedCreators();
  showcaseSelection = pickRandomCreators(creators, Math.min(RANDOM_CREATORS_PER_VIEW, creators.length));
}

function showcasedCreators() {
  const creators = sortedCreators();
  if (creators.length <= RANDOM_CREATORS_PER_VIEW) return creators;
  if (!showcaseSelection.length) refreshShowcaseSelection();
  return showcaseSelection;
}

function searchResults() {
  const query = creatorSearchQuery.trim().toLowerCase();
  if (!query) return [];
  return sortedCreators().filter((creator) =>
    [creator.name, creator.region, creator.pitch].some((value) =>
      String(value || "").toLowerCase().includes(query)
    )
  );
}

function visibleCreators() {
  let filtered;
  if (creatorSearchQuery.trim()) {
    filtered = searchResults();
  } else {
    const creators = sortedCreators();
    if (activeCreatorFilter === "slideshow") return showcasedCreators();
    filtered = creators.filter((creator) => creator.platform === activeCreatorFilter);
  }
  const start = creatorPage * CREATORS_PER_PAGE;
  return filtered.slice(start, start + CREATORS_PER_PAGE);
}

function filteredCreatorsCount() {
  if (creatorSearchQuery.trim()) return searchResults().length;
  if (activeCreatorFilter === "slideshow") return sortedCreators().length;
  return sortedCreators().filter((creator) => creator.platform === activeCreatorFilter).length;
}

function renderCreatorPagination() {
  if (!creatorPagination || !creatorPrevButton || !creatorNextButton || !creatorPageStatus) return;
  if (activeCreatorFilter === "slideshow" && !creatorSearchQuery.trim()) {
    creatorPagination.classList.add("is-inactive");
    return;
  }

  const total = filteredCreatorsCount();
  const totalPages = Math.max(1, Math.ceil(total / CREATORS_PER_PAGE));

  if (creatorPage > totalPages - 1) creatorPage = totalPages - 1;

  creatorPagination.classList.toggle("is-inactive", total <= CREATORS_PER_PAGE);
  creatorPageStatus.textContent = `${creatorPage + 1} / ${totalPages}`;
  creatorPrevButton.disabled = creatorPage === 0;
  creatorNextButton.disabled = creatorPage >= totalPages - 1;
}

function renderCreators() {
  creatorGrid.innerHTML = "";
  const creators = visibleCreators();
  creators.forEach((creator) => {
    const fragment = creatorTemplate.content.cloneNode(true);
    fragment.querySelector(".creator-name").textContent = creator.name;
    fragment.querySelector(".creator-category").textContent = categoryLabel(creator.platform);
    const anchor = document.createElement("a");
    anchor.href = creator.region;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.textContent = creator.region;
    fragment.querySelector(".creator-link").replaceChildren(anchor);
    fragment.querySelector(".creator-pitch").textContent = creator.pitch;
    creatorGrid.appendChild(fragment);
  });
  if (!creators.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "creator-card";
    emptyItem.textContent = creatorsLoading ? t("loadingCreators") : t("noCreators");
    creatorGrid.appendChild(emptyItem);
  }
  renderCreatorPagination();
}

function renderCounters() {
  creatorCounter.textContent = String(getAllCreators().length).padStart(2, "0");
}
function applyTranslations() {
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = RTL_LANGUAGES.has(currentLanguage) ? "rtl" : "ltr";
  if (languageSelect) languageSelect.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((node) => {
    node.innerHTML = t(node.dataset.i18nHtml);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  phaseTitle.textContent = t("suggestionPeriod");
  phaseDescription.textContent = t("phaseDescription");
  actionLabel.textContent = t("heroCta");
  participateTitle.textContent = t("suggestedCreators");
  ruleList.innerHTML = "";
  ["rule1", "rule2", "rule3", "rule4"].forEach((key) => {
    const item = document.createElement("li");
    item.innerHTML = t(key);
    ruleList.appendChild(item);
  });
  if (!successPanel.classList.contains("is-hidden")) {
    successTitle.textContent = t("thankYou", { name: successPanel.dataset.creatorName || t("creatorNamePlaceholder") });
  }
  renderCreators();
}

function setLanguage(nextLanguage) {
  currentLanguage = LANGUAGE_CODES.includes(nextLanguage) ? nextLanguage : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  applyTranslations();
}

async function submitSuggestionToBackend(payload) {
  if (!SUBMISSION_ENDPOINT) return { ok: true, mode: "local-only" };
  const formData = new URLSearchParams();
  formData.set("creator_name", payload.creator_name);
  formData.set("category", payload.category);
  formData.set("link", payload.link);
  formData.set("reason", payload.reason);
  formData.set("metadata_json", JSON.stringify(payload.metadata));
  const response = await fetch(SUBMISSION_ENDPOINT, { method: "POST", body: formData });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || t("submitError"));
  return result;
}

async function loadApprovedCreatorsFromBackend() {
  if (!APPROVED_ENDPOINT) return [];
  const response = await fetch(APPROVED_ENDPOINT);
  const result = await response.json();
  if (!response.ok || !result.ok || !Array.isArray(result.creators)) throw new Error(result.message || "Could not load approved creators.");
  return result.creators.map((creator) => ({ id: creator.submission_id || crypto.randomUUID(), name: creator.creator_name, platform: normalizeCategory(creator.category), region: normalizeLink(creator.link, creator.creator_name), pitch: creator.reason }));
}

async function hydrateApprovedCreators() {
  if (!APPROVED_ENDPOINT) return;
  try {
    state.creators = await loadApprovedCreatorsFromBackend();
    creatorsLoading = false;
    refreshShowcaseSelection();
    renderCounters();
    renderCreators();
  } catch {
    creatorsLoading = false;
    renderCounters();
    renderCreators();
  }
}

function startShowcaseRotation() {
  if (showcaseTimerStarted) return;
  showcaseTimerStarted = true;
    window.setInterval(() => {
      if (activeCreatorFilter !== "slideshow") return;
      const creators = sortedCreators();
      if (creators.length <= RANDOM_CREATORS_PER_VIEW) return;
      refreshShowcaseSelection();
      renderCreators();
    }, 10000);
  }

suggestionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(suggestionForm);
  const name = String(formData.get("name") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();
  if (!name || !platform || !region || !pitch) {
    setFeedback(t("fillFields"), "error");
    return;
  }
  if (!validateCreatorNameField()) return;
  if (name.includes("@")) {
    setFeedback(t("withoutAt"), "error");
    return;
  }
  const submitButton = suggestionForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = t("sending");
  showSuggestionLoading();
  try {
    await submitSuggestionToBackend({ creator_name: name, category: platform, link: region, reason: pitch, metadata: buildSubmissionMetadata() });
    suggestionForm.reset();
    setFeedback("", "");
    showSuggestionSuccess(name);
  } catch (error) {
    showSuggestionForm();
    setFeedback(error.message || t("submitError"), "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

creatorNameInput?.addEventListener("input", () => {
  validateCreatorNameField();
});

suggestAgainButton?.addEventListener("click", () => {
  showSuggestionForm();
  setFeedback("", "");
  creatorNameInput?.focus();
});

creatorFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCreatorFilter = button.dataset.filter;
    creatorSearchQuery = "";
    if (creatorSearchInput) creatorSearchInput.value = "";
    creatorSearchPanel?.classList.add("is-hidden");
    creatorSearchToggle?.classList.remove("is-active");
    creatorPage = 0;
    if (activeCreatorFilter === "slideshow") refreshShowcaseSelection();
    creatorFilters.forEach((item) => item.classList.toggle("is-active", item === button));
    renderCreators();
  });
});

creatorSearchToggle?.addEventListener("click", () => {
  const isOpen = !creatorSearchPanel.classList.contains("is-hidden");
  if (!isOpen) {
    creatorSearchPanel.classList.remove("is-hidden");
    creatorSearchToggle.classList.add("is-active");
    creatorSearchInput?.focus();
    return;
  }

  creatorSearchPanel.classList.add("is-hidden");
  creatorSearchToggle.classList.remove("is-active");
  creatorSearchQuery = "";
  if (creatorSearchInput) creatorSearchInput.value = "";
  activeCreatorFilter = "slideshow";
  creatorFilters.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "slideshow"));
  refreshShowcaseSelection();
  creatorPage = 0;
  renderCreators();
});

creatorSearchInput?.addEventListener("input", (event) => {
  creatorSearchQuery = event.target.value || "";
  creatorPage = 0;
  creatorSearchToggle?.classList.toggle("is-active", Boolean(creatorSearchQuery.trim()));
  renderCreators();
});

creatorPrevButton?.addEventListener("click", () => {
  if (creatorPage === 0) return;
  creatorPage -= 1;
  renderCreators();
});

creatorNextButton?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filteredCreatorsCount() / CREATORS_PER_PAGE));
  if (creatorPage >= totalPages - 1) return;
  creatorPage += 1;
  renderCreators();
});

languageSelect?.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

renderCounters();
refreshShowcaseSelection();
applyTranslations();
startShowcaseRotation();
hydrateApprovedCreators();
