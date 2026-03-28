const STORAGE_KEY = "one-piece-creator-vote-demo";
const SUBMISSION_ENDPOINT = window.VOTE_PAGE_CONFIG?.submissionEndpoint ?? "";
const APPROVED_ENDPOINT = SUBMISSION_ENDPOINT ? `${SUBMISSION_ENDPOINT}?action=approved` : "";

const seedCreators = [
  {
    id: crypto.randomUUID(),
    name: "Tekking101",
    platform: "Influencers",
    region: "https://www.youtube.com/@Tekking101",
    pitch: "Deep lore dives, chaotic energy, and years of consistent ZoNami coverage.",
    votes: 12482,
  },
  {
    id: crypto.randomUUID(),
    name: "The Drawk Show",
    platform: "Influencers",
    region: "https://www.youtube.com/@TheDrawkShow",
    pitch: "Fast reactions, chapter discussion, and strong community engagement.",
    votes: 9317,
  },
  {
    id: crypto.randomUUID(),
    name: "GrandLineReview",
    platform: "Writers",
    region: "https://www.youtube.com/@GrandLineReview",
    pitch: "Sharp editing, accessible breakdowns, and reliable series coverage.",
    votes: 11605,
  },
  {
    id: crypto.randomUUID(),
    name: "Merphy Napier",
    platform: "Writers",
    region: "https://www.youtube.com/@MerphyNapier42",
    pitch: "Fresh-reader perspective with emotional analysis and thoughtful reactions.",
    votes: 8422,
  },
  {
    id: crypto.randomUUID(),
    name: "Randy Troy",
    platform: "Influencers",
    region: "https://www.youtube.com/@RandyTroy",
    pitch: "Strong live discussions, theory talk, and event-level fandom energy.",
    votes: 7012,
  },
  {
    id: crypto.randomUUID(),
    name: "King Recon",
    platform: "Illustrator",
    region: "https://www.youtube.com/@KingRecon",
    pitch: "Long-form chapter streams and veteran ZoNami community presence.",
    votes: 7786,
  },
];

const defaultState = {
  phase: "suggest",
  creators: seedCreators,
  submissions: [],
  voteLog: {},
};

function normalizeCategory(value) {
  if (["Illustrator", "Influencers", "Writers"].includes(value)) {
    return value;
  }

  return "Influencers";
}

function normalizeLink(value, name = "creator") {
  if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) {
    return value.trim();
  }

  const slug = String(name || "creator")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `https://zonami.example/${slug || "creator"}`;
}

function normalizeCreatorEntry(entry) {
  return {
    ...entry,
    platform: normalizeCategory(entry.platform),
    region: normalizeLink(entry.region, entry.name),
  };
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      creators:
        Array.isArray(parsed.creators) && parsed.creators.length
          ? parsed.creators.map(normalizeCreatorEntry)
          : seedCreators.map(normalizeCreatorEntry),
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions.map(normalizeCreatorEntry) : [],
      voteLog: parsed.voteLog ?? {},
    };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
    return structuredClone(defaultState);
  }
}

let state = loadState();
state.phase = "suggest";
state.creators = state.creators.map(normalizeCreatorEntry);
state.submissions = state.submissions.map(normalizeCreatorEntry);
let showcaseOffset = 0;
let showcaseTimerStarted = false;
let activeCreatorFilter = "slideshow";

const phaseContent = {
  suggest: {
    title: "Suggestion Period",
    description: "Submit your favorite creators so they can enter the official vote.",
    actionLabel: "Suggest A Creator",
    participateTitle: "Suggested Creators",
    rules: [
      "Fans can submit creators during the suggestion period with a short pitch.",
      "Duplicate suggestions are allowed in this demo, but the final event should review and merge them.",
      "Only creators focused on ZoNami content should move into the public vote.",
    ],
  },
  vote: {
    title: "Voting Period",
    description: "The public ballot is now open. Support one creator at a time and push the rankings higher.",
    actionLabel: "Vote For A Creator",
    participateTitle: "Vote For Your Favorite Creator",
    rules: [
      "Fans can vote once per creator per day in this demo implementation.",
      "Voting eligibility resets when the local calendar date changes in the browser.",
      "Final ranking is determined by total accumulated votes across the event.",
    ],
  },
};

const voteCounter = document.getElementById("voteCounter");
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
const creatorSearch = document.getElementById("creatorSearch");
const ruleList = document.getElementById("ruleList");
const phaseTabs = Array.from(document.querySelectorAll(".phase-tab"));
const modePanels = Array.from(document.querySelectorAll(".mode-panel"));
const creatorFilters = Array.from(document.querySelectorAll(".creator-filter"));

function getBrowserToken() {
  const tokenKey = `${STORAGE_KEY}-browser-token`;
  const existing = localStorage.getItem(tokenKey);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  localStorage.setItem(tokenKey, created);
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

async function submitSuggestionToBackend(payload) {
  if (!SUBMISSION_ENDPOINT) {
    return { ok: true, mode: "local-only" };
  }

  const formData = new URLSearchParams();
  formData.set("creator_name", payload.creator_name);
  formData.set("category", payload.category);
  formData.set("link", payload.link);
  formData.set("reason", payload.reason);
  formData.set("metadata_json", JSON.stringify(payload.metadata));

  const response = await fetch(SUBMISSION_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.message || "Submission failed.");
  }

  return result;
}

async function loadApprovedCreatorsFromBackend() {
  if (!APPROVED_ENDPOINT) {
    return [];
  }

  const response = await fetch(APPROVED_ENDPOINT);
  const result = await response.json();

  if (!response.ok || !result.ok || !Array.isArray(result.creators)) {
    throw new Error(result.message || "Could not load approved creators.");
  }

  return result.creators.map((creator) => ({
    id: creator.submission_id || crypto.randomUUID(),
    name: creator.creator_name,
    platform: normalizeCategory(creator.category),
    region: normalizeLink(creator.link, creator.creator_name),
    pitch: creator.reason,
    votes: 0,
  }));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function setFeedback(message, type = "") {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) {
    feedbackMessage.classList.add(`is-${type}`);
  }
}

function setPhase(nextPhase) {
  if (nextPhase !== "suggest") {
    return;
  }

  state.phase = nextPhase;
  phaseTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.phaseTarget === nextPhase);
  });
  modePanels.forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.mode !== nextPhase);
  });

  const content = phaseContent[nextPhase];
  phaseTitle.textContent = content.title;
  phaseDescription.textContent = content.description;
  actionLabel.textContent = content.actionLabel;
  actionLabel.setAttribute("href", nextPhase === "suggest" ? "#participate" : "#hot");
  participateTitle.textContent = content.participateTitle;

  ruleList.innerHTML = "";
  content.rules.forEach((rule) => {
    const item = document.createElement("li");
    item.textContent = rule;
    ruleList.appendChild(item);
  });

  saveState();
  render();
}

function getAllCreators() {
  return [...state.creators, ...state.submissions];
}

function sortedCreators() {
  const query = creatorSearch?.value.trim().toLowerCase() ?? "";
  return getAllCreators()
    .filter((creator) => {
      if (!query) {
        return true;
      }

      return [creator.name, creator.platform, creator.region, creator.pitch]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((left, right) => right.votes - left.votes || left.name.localeCompare(right.name));
}

function showcasedCreators() {
  const creators = sortedCreators();
  if (creators.length <= 3) {
    return creators;
  }

  const normalizedOffset = showcaseOffset % creators.length;
  return Array.from({ length: 3 }, (_, index) => creators[(normalizedOffset + index) % creators.length]);
}

function visibleCreators() {
  const creators = sortedCreators();
  if (activeCreatorFilter === "slideshow") {
    return showcasedCreators();
  }

  return creators.filter((creator) => creator.platform === activeCreatorFilter);
}

function canVote(creatorId) {
  const logEntry = state.voteLog[creatorId];
  return logEntry !== todayKey();
}

function handleVote(creatorId) {
  if (state.phase !== "vote") {
    setFeedback("Switch the page to Voting Period before casting votes.", "error");
    return;
  }

  if (!canVote(creatorId)) {
    setFeedback("You already voted for this creator today in this browser.", "error");
    return;
  }

  const creator = getAllCreators().find((item) => item.id === creatorId);
  if (!creator) {
    return;
  }

  creator.votes += 1;
  state.voteLog[creatorId] = todayKey();
  saveState();
  setFeedback(`Vote recorded for ${creator.name}.`, "success");
  render();
}

function renderCreators() {
  creatorGrid.innerHTML = "";
  const creators = visibleCreators();

  creators.forEach((creator) => {
    const fragment = creatorTemplate.content.cloneNode(true);
    fragment.querySelector(".creator-name").textContent = creator.name;
    fragment.querySelector(".creator-category").textContent = creator.platform;
    const linkElement = fragment.querySelector(".creator-link");
    linkElement.innerHTML = "";
    const anchor = document.createElement("a");
    anchor.href = creator.region;
    anchor.target = "_blank";
    anchor.rel = "noreferrer noopener";
    anchor.textContent = creator.region;
    linkElement.appendChild(anchor);
    fragment.querySelector(".creator-pitch").textContent = creator.pitch;

    creatorGrid.appendChild(fragment);
  });

  if (!creators.length) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "creator-card";
    emptyItem.textContent = "No creators found in this category yet.";
    creatorGrid.appendChild(emptyItem);
  }
}

function renderCounters() {
  const allCreators = getAllCreators();
  const totalVotes = allCreators.reduce((sum, creator) => sum + creator.votes, 0);
  voteCounter.textContent = formatNumber(totalVotes).padStart(7, "0");
  creatorCounter.textContent = String(allCreators.length).padStart(2, "0");
}

function render() {
  renderCounters();
  renderCreators();
}

function showSuggestionSuccess(name) {
  loadingPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  successPanel.classList.remove("is-hidden");
  successTitle.textContent = `Thank you for suggesting ${name}!`;
}

function showSuggestionForm() {
  loadingPanel.classList.add("is-hidden");
  successPanel.classList.add("is-hidden");
  suggestionForm.classList.remove("is-hidden");
}

function showSuggestionLoading() {
  successPanel.classList.add("is-hidden");
  suggestionForm.classList.add("is-hidden");
  loadingPanel.classList.remove("is-hidden");
}

function validateCreatorNameField() {
  if (!creatorNameInput) {
    return true;
  }

  const value = creatorNameInput.value.trim();
  if (value.startsWith("@")) {
    creatorNameInput.setCustomValidity('Do not start the creator name with "@".');
    creatorNameInput.reportValidity();
    return false;
  }

  creatorNameInput.setCustomValidity("");
  return true;
}

function startShowcaseRotation() {
  if (showcaseTimerStarted) {
    return;
  }

  showcaseTimerStarted = true;
  window.setInterval(() => {
    if (activeCreatorFilter !== "slideshow") {
      return;
    }

    const creators = sortedCreators();
    if (creators.length <= 3) {
      return;
    }

    showcaseOffset = (showcaseOffset + 3) % creators.length;
    renderCreators();
  }, 20000);
}

async function hydrateApprovedCreators() {
  if (!APPROVED_ENDPOINT) {
    return;
  }

  try {
    const approvedCreators = await loadApprovedCreatorsFromBackend();
    state.creators = approvedCreators;
    state.submissions = [];
    saveState();
    render();
  } catch (_error) {
    // Keep the local seed data as a fallback if the public list cannot be loaded.
  }
}

suggestionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(suggestionForm);
  const name = String(formData.get("name") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const pitch = String(formData.get("pitch") ?? "").trim();

  if (!name || !platform || !region || !pitch) {
    setFeedback("Fill in every field before sending a suggestion.", "error");
    return;
  }

  if (!validateCreatorNameField()) {
    return;
  }

  if (name.includes("@")) {
    setFeedback('Enter the creator name without "@".', "error");
    return;
  }

  const submitButton = suggestionForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  showSuggestionLoading();

  try {
    await submitSuggestionToBackend({
      creator_name: name,
      category: platform,
      link: region,
      reason: pitch,
      metadata: buildSubmissionMetadata(),
    });

    state.submissions.unshift({
      id: crypto.randomUUID(),
      name,
      platform,
      region,
      pitch,
      votes: 0,
    });

    suggestionForm.reset();
    saveState();
    setFeedback("", "");
    showSuggestionSuccess(name);
    render();
  } catch (error) {
    showSuggestionForm();
    setFeedback(error.message || "Could not submit the suggestion.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

creatorSearch?.addEventListener("input", () => {
  renderCreators();
});

creatorNameInput?.addEventListener("input", () => {
  validateCreatorNameField();
});

suggestAgainButton?.addEventListener("click", () => {
  showSuggestionForm();
  setFeedback("", "");
  creatorNameInput?.focus();
});

phaseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setFeedback("", "");
    setPhase(tab.dataset.phaseTarget);
  });
});

creatorFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCreatorFilter = button.dataset.filter;
    creatorFilters.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    renderCreators();
  });
});

setPhase(state.phase);
startShowcaseRotation();
hydrateApprovedCreators();
