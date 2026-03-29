const SUBMISSION_ENDPOINT = window.VOTE_PAGE_CONFIG?.submissionEndpoint ?? "";
const APPROVED_ENDPOINT = SUBMISSION_ENDPOINT ? `${SUBMISSION_ENDPOINT}?action=approved` : "";
const LANGUAGE_STORAGE_KEY = "ZNCCA-lang";
const DAILY_VOTE_STORAGE_KEY = "ZNCCA-vd";
const LANGUAGE_CODES = ["en", "es", "fr", "pt", "ja", "zh", "ko", "hi", "it", "id", "vi", "tl", "ar"];
const RTL_LANGUAGES = new Set(["ar"]);
const translations = window.VOTE_PAGE_LOCALES || {};

const heroCta = document.getElementById("heroCta");
const languageSelect = document.getElementById("languageSelect");
const brandServer = document.getElementById("brandServer");
const brandAwards = document.getElementById("brandAwards");
const heroBrandServer = document.getElementById("heroBrandServer");
const heroTitle = document.getElementById("heroTitle");
const introTitle = document.getElementById("introTitle");
const introBody = document.getElementById("introBody");
const phaseDescription = document.getElementById("phaseDescription");
const participateKicker = document.getElementById("participateKicker");
const votePhaseTitle = document.getElementById("votePhaseTitle");
const votePhaseSection = document.getElementById("participate");
const votePhaseCopy = document.getElementById("votePhaseCopy");
const voteCategoryChooser = document.getElementById("voteCategoryChooser");
const voteCategoryView = document.getElementById("voteCategoryView");
const voteResultView = document.getElementById("voteResultView");
const voteCategoryButtons = Array.from(document.querySelectorAll(".vote-category-button"));
const voteSearchPanel = document.getElementById("voteSearchPanel");
const voteSearchInput = document.getElementById("voteSearchInput");
const voteCandidateGrid = document.getElementById("voteCandidateGrid");
const voteCandidateTemplate = document.getElementById("voteCandidateTemplate");
const voteResultKicker = document.getElementById("voteResultKicker");
const voteResultName = document.getElementById("voteResultName");
const voteShareDate = document.getElementById("voteShareDate");
const voteShareArt = document.getElementById("voteShareArt");
const voteShareInitials = document.getElementById("voteShareInitials");
const voteShareStamp = document.getElementById("voteShareStamp");
const voteShareBrandLink = document.getElementById("voteShareBrandLink");
const voteShareCopy = document.getElementById("voteShareCopy");
const shareOnXButton = document.getElementById("shareOnXButton");
const shareOnFacebookButton = document.getElementById("shareOnFacebookButton");
const nativeShareButton = document.getElementById("nativeShareButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const creatorsKicker = document.getElementById("creatorsKicker");
const creatorsTitle = document.getElementById("creatorsTitle");
const creatorGrid = document.getElementById("creatorGrid");
const creatorTemplate = document.getElementById("creatorCardTemplate");
const creatorFilters = Array.from(document.querySelectorAll(".creator-filter"));
const creatorFilterButtons = creatorFilters.filter((button) => button.dataset.filter);
const creatorPagination = document.getElementById("creatorPagination");
const creatorPrevButton = document.getElementById("creatorPrevButton");
const creatorNextButton = document.getElementById("creatorNextButton");
const creatorPageStatus = document.getElementById("creatorPageStatus");
const creatorSearchToggle = document.getElementById("creatorSearchToggle");
const creatorSearchPanel = document.getElementById("creatorSearchPanel");
const creatorSearchInput = document.getElementById("creatorSearchInput");
const rulesKicker = document.getElementById("rulesKicker");
const rulesTitle = document.getElementById("rulesTitle");
const voteRuleList = document.querySelector(".vote-rule-list");
const discordKicker = document.getElementById("discordKicker");
const discordTitle = document.getElementById("discordTitle");
const discordBody = document.getElementById("discordBody");
const discordCta = document.getElementById("discordCta");

for (const code of LANGUAGE_CODES) {
  if (!translations[code] && translations.en) {
    translations[code] = { ...translations.en, categories: { ...translations.en.categories } };
  }
}

const state = {
  currentLanguage: detectLanguage(),
  creators: [],
  selectedCategory: "",
  votedCreator: null,
  hasVotedToday: hasStoredVoteForToday(),
  voteSearchQuery: "",
  showcaseSelection: [],
  activeCreatorFilter: "slideshow",
  creatorPage: 0,
  creatorSearchQuery: ""
};

const CREATORS_PER_PAGE = 5;
const RANDOM_CREATORS_PER_VIEW = 3;

function detectLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && LANGUAGE_CODES.includes(stored)) return stored;
  const browserLanguages = [navigator.language, ...(navigator.languages || [])]
    .filter(Boolean)
    .map((value) => value.toLowerCase());
  for (const language of browserLanguages) {
    const base = language.split("-")[0];
    if (LANGUAGE_CODES.includes(language)) return language;
    if (LANGUAGE_CODES.includes(base)) return base;
  }
  return "en";
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hasStoredVoteForToday() {
  return localStorage.getItem(DAILY_VOTE_STORAGE_KEY) === getTodayKey();
}

function storeTodayVote() {
  localStorage.setItem(DAILY_VOTE_STORAGE_KEY, getTodayKey());
}

function t(key, params = {}) {
  const table = translations[state.currentLanguage] || translations.en || {};
  const english = translations.en || {};
  let value = table[key] ?? english[key] ?? key;
  for (const [name, replacement] of Object.entries(params)) {
    value = value.replace(`{${name}}`, replacement);
  }
  return value;
}

function categoryLabel(category) {
  const table = translations[state.currentLanguage] || translations.en || {};
  return table.categories?.[category] || category;
}

function displayCategoryLabel(category) {
  if (category === "Illustrator") return t("artists");
  if (category === "Writers") return t("writers");
  if (category === "Influencers") return t("influencers");
  return categoryLabel(category);
}

function singularCategoryLabel(category) {
  const singularLabels = {
    en: { Illustrator: "Illustrator", Writers: "Writer", Influencers: "Influencer" },
    es: { Illustrator: "Ilustrador", Writers: "Escritor", Influencers: "Influencer" },
    fr: { Illustrator: "Illustrateur", Writers: "Auteur", Influencers: "Influenceur" },
    pt: { Illustrator: "Ilustrador", Writers: "Escritor", Influencers: "Influenciador" },
    ja: { Illustrator: "イラストレーター", Writers: "ライター", Influencers: "インフルエンサー" },
    zh: { Illustrator: "画师", Writers: "写手", Influencers: "推广者" },
    ko: { Illustrator: "일러스트레이터", Writers: "작가", Influencers: "인플루언서" },
    hi: { Illustrator: "इलस्ट्रेटर", Writers: "राइटर", Influencers: "इन्फ्लुएंसर" },
    it: { Illustrator: "Illustratore", Writers: "Scrittore", Influencers: "Influencer" },
    id: { Illustrator: "Ilustrator", Writers: "Penulis", Influencers: "Influencer" },
    vi: { Illustrator: "Họa sĩ", Writers: "Tác giả", Influencers: "Influencer" },
    tl: { Illustrator: "Ilustrador", Writers: "Manunulat", Influencers: "Influencer" },
    ar: { Illustrator: "رسام", Writers: "كاتب", Influencers: "مؤثر" }
  };
  const table = singularLabels[state.currentLanguage] || singularLabels.en;
  if (table[category]) return table[category];
  return categoryLabel(category);
}

function normalizeCategory(value) {
  if (value === "Illustrators") return "Illustrator";
  if (value === "Illustrator" || value === "Writers" || value === "Influencers") return value;
  return "Influencers";
}

function normalizeCreator(creator) {
  return {
    id: creator.id || creator.submission_id || crypto.randomUUID(),
    name: creator.name || creator.creator_name || "Unknown Creator",
    category: normalizeCategory(creator.category),
    link: creator.link || creator.region || "",
    reason: creator.reason || creator.pitch || ""
  };
}

function sortedCreators() {
  return [...state.creators].sort((left, right) => left.name.localeCompare(right.name));
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
  state.showcaseSelection = pickRandomCreators(creators, Math.min(RANDOM_CREATORS_PER_VIEW, creators.length));
}

function showcasedCreators() {
  const creators = sortedCreators();
  if (creators.length <= RANDOM_CREATORS_PER_VIEW) return creators;
  if (!state.showcaseSelection.length) refreshShowcaseSelection();
  return state.showcaseSelection;
}

function searchResults() {
  const query = state.creatorSearchQuery.trim().toLowerCase();
  if (!query) return [];
  return sortedCreators().filter((creator) =>
    [creator.name, creator.link, creator.reason].some((value) =>
      String(value || "").toLowerCase().includes(query)
    )
  );
}

function filteredCreatorsCount() {
  if (state.creatorSearchQuery.trim()) return searchResults().length;
  if (state.activeCreatorFilter === "slideshow") return sortedCreators().length;
  return sortedCreators().filter((creator) => creator.category === state.activeCreatorFilter).length;
}

function visibleCreators() {
  let filtered;
  if (state.creatorSearchQuery.trim()) {
    filtered = searchResults();
  } else if (state.activeCreatorFilter === "slideshow") {
    return showcasedCreators();
  } else {
    filtered = sortedCreators().filter((creator) => creator.category === state.activeCreatorFilter);
  }

  const start = state.creatorPage * CREATORS_PER_PAGE;
  return filtered.slice(start, start + CREATORS_PER_PAGE);
}

async function loadApprovedCreators() {
  if (!APPROVED_ENDPOINT) return [];
  const response = await fetch(APPROVED_ENDPOINT);
  const result = await response.json();
  if (!response.ok || !result.ok || !Array.isArray(result.creators)) {
    throw new Error(result.message || "Could not load approved creators.");
  }
  return result.creators.map(normalizeCreator);
}

function getInitials(name) {
  const cleaned = String(name || "")
    .replace(/[@_\-]+/g, " ")
    .trim();

  if (!cleaned) return "ZN";

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }

  const single = words[0] || "";
  const capitals = Array.from(single).filter((character, index) => index > 0 && /[A-Z]/.test(character));

  if (capitals.length) {
    return `${single[0]?.toUpperCase() || ""}${capitals[0]}`.slice(0, 2);
  }

  return single.slice(0, 2).toUpperCase() || "ZN";
}

function getThemeIndex(name) {
  const text = String(name || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return (hash % 6) + 1;
}

function formatVoteDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function setFeedback(message, type = "") {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) feedbackMessage.classList.add(`is-${type}`);
}

function applyVoteLockState() {
  heroCta.textContent = state.hasVotedToday ? t("heroVotedCta") : t("heroVoteCta");
  votePhaseSection.classList.toggle("is-hidden", state.hasVotedToday && !state.votedCreator);
  voteCategoryButtons.forEach((button) => {
    button.disabled = state.hasVotedToday;
    button.classList.toggle("is-disabled", state.hasVotedToday);
  });
  if (voteSearchInput) voteSearchInput.disabled = state.hasVotedToday;
}

function renderLanguage() {
  document.documentElement.lang = state.currentLanguage;
  document.documentElement.dir = RTL_LANGUAGES.has(state.currentLanguage) ? "rtl" : "ltr";
  if (languageSelect) languageSelect.value = state.currentLanguage;

  brandServer.textContent = t("brandServer");
  brandAwards.textContent = t("brandAwards");
  heroBrandServer.textContent = t("brandServer");
  heroTitle.textContent = t("heroTitle");
  heroCta.textContent = state.hasVotedToday ? t("heroVotedCta") : t("heroVoteCta");
  introTitle.innerHTML = t("introTitle");
  introBody.innerHTML = t("introBody");
  phaseDescription.textContent = t("phaseDescription");
  participateKicker.textContent = t("joinEvent");
  votePhaseTitle.textContent = t("voteFavorite");
  votePhaseCopy.textContent = t("votePhaseCopy");
  voteSearchInput.placeholder = t("voteSearchPlaceholder");
  voteResultKicker.textContent = t("voteResultKicker");
  voteShareCopy.textContent = t("voteShareCopy");
  rulesKicker.textContent = t("rules");
  rulesTitle.textContent = t("voteRulesTitle");
  discordKicker.textContent = t("discordKicker");
  discordTitle.textContent = t("discordTitle");
  discordBody.textContent = t("discordBody");
  discordCta.textContent = t("discordCta");
  voteShareBrandLink.textContent = t("brandServer");
  creatorsKicker.textContent = t("creatorRanking");
  creatorsTitle.textContent = t("suggestedCreators");
  creatorSearchInput.placeholder = "Search by creator, link, or recommendation";

  voteCategoryButtons.forEach((button) => {
    button.textContent = displayCategoryLabel(button.dataset.category);
  });

  creatorFilterButtons.forEach((button) => {
    if (button.dataset.filter === "slideshow") button.textContent = t("slideshow");
    if (button.dataset.filter === "Illustrator") button.textContent = t("artists");
    if (button.dataset.filter === "Influencers") button.textContent = t("influencers");
    if (button.dataset.filter === "Writers") button.textContent = t("writers");
  });

  renderVoteRules();
  renderCategoryView();
  if (state.votedCreator) renderVoteResult();
  renderCreators();
  applyVoteLockState();
}

function renderVoteRules() {
  voteRuleList.innerHTML = "";
  ["voteRule1", "voteRule2", "voteRule3"].forEach((key) => {
    const value = t(key);
    if (!value) return;
    const item = document.createElement("li");
    item.innerHTML = value;
    voteRuleList.appendChild(item);
  });
}

function creatorsForCategory(category) {
  const query = state.voteSearchQuery.trim().toLowerCase();
  return state.creators
    .filter((creator) => creator.category === category)
    .filter((creator) => !query || creator.name.toLowerCase().includes(query))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function showChooser() {
  voteCategoryChooser.classList.remove("is-hidden");
  voteSearchPanel.classList.toggle("is-hidden", !state.selectedCategory);
  voteCategoryView.classList.add("is-hidden");
  voteResultView.classList.add("is-hidden");
}

function showCategory(category) {
  state.selectedCategory = category;
  voteCategoryChooser.classList.remove("is-hidden");
  voteSearchPanel.classList.remove("is-hidden");
  voteCategoryView.classList.remove("is-hidden");
  voteResultView.classList.add("is-hidden");
  voteCategoryButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.category === category);
  });
  renderCategoryView();
}

function showResult(creator) {
  state.hasVotedToday = true;
  state.votedCreator = creator;
  storeTodayVote();
  voteCategoryChooser.classList.add("is-hidden");
  voteCategoryView.classList.add("is-hidden");
  voteResultView.classList.remove("is-hidden");
  renderVoteResult();
  setFeedback("", "");
}

function renderCategoryView() {
  if (!state.selectedCategory) return;
  voteCandidateGrid.innerHTML = "";

  const creators = creatorsForCategory(state.selectedCategory);
  for (const creator of creators) {
    const fragment = voteCandidateTemplate.content.cloneNode(true);
    const button = fragment.querySelector(".vote-candidate-button");
    const art = fragment.querySelector(".vote-candidate-art");
    const initials = fragment.querySelector(".vote-candidate-initials");
    const name = fragment.querySelector(".vote-candidate-name");

    art.dataset.category = creator.category;
    art.dataset.theme = String(getThemeIndex(creator.name));
    initials.textContent = getInitials(creator.name);
    name.textContent = creator.name;
    button.setAttribute("aria-label", creator.name);
    button.addEventListener("click", () => showResult(creator));
    voteCandidateGrid.appendChild(fragment);
  }

  if (!creators.length) {
    const empty = document.createElement("li");
    empty.className = "vote-empty-state";
    empty.textContent = t("noCreators");
    voteCandidateGrid.appendChild(empty);
  }
}

function renderVoteResult() {
  if (!state.votedCreator) return;
  const creator = state.votedCreator;
  voteResultName.textContent = creator.name.toUpperCase();
  voteShareDate.textContent = formatVoteDate();
  voteShareInitials.textContent = getInitials(creator.name);
  voteShareArt.dataset.category = creator.category;
  voteShareArt.dataset.theme = String(getThemeIndex(creator.name));
  voteShareStamp.textContent = `My Fav ${singularCategoryLabel(creator.category)}`;
  applyVoteLockState();
  updateShareActions();
}

function renderCreatorPagination() {
  if (state.activeCreatorFilter === "slideshow" && !state.creatorSearchQuery.trim()) {
    creatorPagination.classList.add("is-inactive");
    return;
  }

  const total = filteredCreatorsCount();
  const totalPages = Math.max(1, Math.ceil(total / CREATORS_PER_PAGE));
  if (state.creatorPage > totalPages - 1) state.creatorPage = totalPages - 1;

  creatorPagination.classList.toggle("is-inactive", total <= CREATORS_PER_PAGE);
  creatorPageStatus.textContent = `${state.creatorPage + 1} / ${totalPages}`;
  creatorPrevButton.disabled = state.creatorPage === 0;
  creatorNextButton.disabled = state.creatorPage >= totalPages - 1;
}

function renderCreators() {
  creatorGrid.innerHTML = "";
  const creators = visibleCreators();

  creators.forEach((creator) => {
    const fragment = creatorTemplate.content.cloneNode(true);
    fragment.querySelector(".creator-name").textContent = creator.name;
    fragment.querySelector(".creator-category").textContent = displayCategoryLabel(creator.category);
    const anchor = document.createElement("a");
    anchor.href = creator.link;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.textContent = creator.link;
    fragment.querySelector(".creator-link").replaceChildren(anchor);
    fragment.querySelector(".creator-pitch").textContent = creator.reason;
    creatorGrid.appendChild(fragment);
  });

  if (!creators.length) {
    const empty = document.createElement("li");
    empty.className = "creator-card";
    empty.textContent = t("noCreators");
    creatorGrid.appendChild(empty);
  }

  renderCreatorPagination();
}

function shareText() {
  if (!state.votedCreator) return "";
  return t("shareVoteText", {
    category: singularCategoryLabel(state.votedCreator.category),
    name: state.votedCreator.name
  });
}

function updateShareActions() {
  const text = shareText();
  const url = window.location.href;
  shareOnXButton.href = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  shareOnFacebookButton.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  nativeShareButton.disabled = !navigator.share;
}

async function handleNativeShare() {
  if (!navigator.share) return;
  try {
    await navigator.share({
      title: t("heroTitle"),
      text: shareText(),
      url: window.location.href
    });
  } catch {}
}

function setLanguage(language) {
  state.currentLanguage = LANGUAGE_CODES.includes(language) ? language : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, state.currentLanguage);
  renderLanguage();
}

async function hydrateApprovedCreators() {
  if (!APPROVED_ENDPOINT) return;
  try {
    const approvedCreators = await loadApprovedCreators();
    state.creators = approvedCreators;
    refreshShowcaseSelection();
    if (state.selectedCategory) renderCategoryView();
    renderCreators();
  } catch {}
}

voteCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (state.hasVotedToday) return;
    setFeedback("", "");
    state.voteSearchQuery = "";
    if (voteSearchInput) voteSearchInput.value = "";
    showCategory(button.dataset.category);
  });
});

voteSearchInput?.addEventListener("input", (event) => {
  if (state.hasVotedToday) return;
  state.voteSearchQuery = String(event.target.value || "");
  renderCategoryView();
});

nativeShareButton?.addEventListener("click", handleNativeShare);

languageSelect?.addEventListener("change", (event) => {
  setLanguage(event.target.value);
});

creatorFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeCreatorFilter = button.dataset.filter;
    state.creatorSearchQuery = "";
    state.creatorPage = 0;
    if (creatorSearchInput) creatorSearchInput.value = "";
    creatorSearchPanel?.classList.add("is-hidden");
    creatorSearchToggle?.classList.remove("is-active");
    if (state.activeCreatorFilter === "slideshow") refreshShowcaseSelection();
    creatorFilterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
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
  state.creatorSearchQuery = "";
  if (creatorSearchInput) creatorSearchInput.value = "";
  state.activeCreatorFilter = "slideshow";
  state.creatorPage = 0;
  creatorFilterButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.filter === "slideshow"));
  refreshShowcaseSelection();
  renderCreators();
});

creatorSearchInput?.addEventListener("input", (event) => {
  state.creatorSearchQuery = event.target.value || "";
  state.creatorPage = 0;
  creatorSearchToggle?.classList.toggle("is-active", Boolean(state.creatorSearchQuery.trim()));
  renderCreators();
});

creatorPrevButton?.addEventListener("click", () => {
  if (state.creatorPage === 0) return;
  state.creatorPage -= 1;
  renderCreators();
});

creatorNextButton?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(filteredCreatorsCount() / CREATORS_PER_PAGE));
  if (state.creatorPage >= totalPages - 1) return;
  state.creatorPage += 1;
  renderCreators();
});

refreshShowcaseSelection();
renderLanguage();
showChooser();
hydrateApprovedCreators();

window.setInterval(() => {
  if (state.activeCreatorFilter !== "slideshow") return;
  const creators = sortedCreators();
  if (creators.length <= RANDOM_CREATORS_PER_VIEW) return;
  refreshShowcaseSelection();
  renderCreators();
}, 10000);
