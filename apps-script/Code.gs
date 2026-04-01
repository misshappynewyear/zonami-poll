const SHEET_NAMES = {
  suggestions: "suggestions_private",
  approved: "approved_public",
  votes: "votes_private",
};

const APPROVAL_DEFAULT = "not approved";
const COUNTED_DEFAULT = "yes";
const FRAUD_DEFAULT = "not fraudulent";
const ALLOWED_CATEGORIES = ["Illustrator", "Influencers", "Writers"];
const DISCORD_WEBHOOK_PROPERTY = "DISCORD_WEBHOOK_URL";
const ALLOWED_SUGGESTION_FIELDS = ["creator_name", "category", "link", "reason", "metadata_json"];
const ALLOWED_VOTE_FIELDS = ["action", "creator_id", "category", "metadata_json"];
const MAX_SUGGESTIONS_PER_HOUR = 3;
const MAX_SUGGESTIONS_PER_DAY = 10;

function doPost(e) {
  try {
    Logger.log("doPost received: %s", JSON.stringify(debugEvent_(e)));
    const data = parseRequestBody_(e);
    Logger.log("parsed payload: %s", JSON.stringify(data));
    const flags = getFeatureFlags_();
    if (data.action === "vote") {
      if (!flags.enableVotes) {
        throw new Error("Voting is currently closed.");
      }
      return handleVoteSubmit_(data, flags);
    }

    if (!flags.enableSuggestions) {
      throw new Error("Suggestions are currently closed.");
    }

    return handleSuggestionSubmit_(data, flags);
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: error.message || "Unexpected error.",
    });
  }
}

function doGet(e) {
  const action = cleanString_(e && e.parameter ? e.parameter.action : "");

  if (action === "approved") {
    return getApprovedCreators_();
  }

  if (action === "config") {
    return jsonResponse_({
      ok: true,
      ...getFeatureFlags_(),
    });
  }

  Logger.log("doGet pinged");
  return jsonResponse_({
    ok: true,
    message: "Suggestion endpoint is running.",
  });
}

function parseRequestBody_(e) {
  if (!e) {
    throw new Error("Missing request.");
  }

  if (e.parameter && Object.keys(e.parameter).length) {
    Logger.log("parseRequestBody_: using e.parameter");
    validateAllowedFields_(Object.keys(e.parameter), ALLOWED_SUGGESTION_FIELDS.concat(ALLOWED_VOTE_FIELDS));
    let metadata = {};
    if (e.parameter.metadata_json) {
      try {
        metadata = JSON.parse(e.parameter.metadata_json);
      } catch (_error) {
        metadata = {};
      }
    }

    return {
      action: cleanString_(e.parameter.action, 40),
      creator_id: cleanString_(e.parameter.creator_id, 120),
      creator_name: cleanString_(e.parameter.creator_name),
      category: cleanString_(e.parameter.category),
      link: cleanString_(e.parameter.link),
      reason: cleanString_(e.parameter.reason),
      metadata,
    };
  }

  if (!e.postData || !e.postData.contents) {
    throw new Error("Missing request body.");
  }

  const rawBody = String(e.postData.contents || "").trim();
  Logger.log("parseRequestBody_: raw body preview: %s", rawBody.slice(0, 500));

  if (rawBody.includes("=") && rawBody.includes("&")) {
    Logger.log("parseRequestBody_: using urlencoded body fallback");
    const params = {};
    rawBody.split("&").forEach((pair) => {
      const [rawKey, rawValue = ""] = pair.split("=");
      const key = decodeURIComponent((rawKey || "").replace(/\+/g, " "));
      const value = decodeURIComponent((rawValue || "").replace(/\+/g, " "));
      params[key] = value;
    });

    let metadata = {};
    if (params.metadata_json) {
      try {
        metadata = JSON.parse(params.metadata_json);
      } catch (_error) {
        metadata = {};
      }
    }

    validateAllowedFields_(Object.keys(params), ALLOWED_SUGGESTION_FIELDS.concat(ALLOWED_VOTE_FIELDS));

    return {
      action: cleanString_(params.action, 40),
      creator_id: cleanString_(params.creator_id, 120),
      creator_name: cleanString_(params.creator_name),
      category: cleanString_(params.category),
      link: cleanString_(params.link),
      reason: cleanString_(params.reason),
      metadata,
    };
  }

  let parsed;
  try {
    Logger.log("parseRequestBody_: attempting JSON parse");
    parsed = JSON.parse(rawBody);
  } catch (_error) {
    throw new Error("Request body must be valid JSON.");
  }

  validateAllowedFields_(Object.keys(parsed || {}), ["creator_name", "category", "link", "reason", "metadata", "action", "creator_id"]);

  return {
    action: cleanString_(parsed.action, 40),
    creator_id: cleanString_(parsed.creator_id, 120),
    creator_name: cleanString_(parsed.creator_name),
    category: cleanString_(parsed.category),
    link: cleanString_(parsed.link),
    reason: cleanString_(parsed.reason),
    metadata: parsed.metadata && typeof parsed.metadata === "object" ? parsed.metadata : {},
  };
}

function validateSuggestionPayload_(data) {
  if (!data.creator_name || data.creator_name.length > 80) {
    throw new Error("Creator name is required and must be 80 characters or fewer.");
  }

  if (!ALLOWED_CATEGORIES.includes(data.category)) {
    throw new Error("Category is invalid.");
  }

  if (!data.link || data.link.length > 500 || !/^https?:\/\//i.test(data.link)) {
    throw new Error("Link must be a valid URL.");
  }

  if (!data.reason || data.reason.length > 2000) {
    throw new Error("Reason is required and must be 2000 characters or fewer.");
  }
}

function handleSuggestionSubmit_(data, flags) {
  validateSuggestionPayload_(data);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.suggestions);
  if (!sheet) {
    throw new Error(`Missing sheet: ${SHEET_NAMES.suggestions}`);
  }

  const metadata = buildMetadata_(data, "suggestion");
  enforceSuggestionSecurity_(sheet, data, metadata);

  const submissionId = createSubmissionId_();
  const timestamp = new Date();
  const metadataJson = JSON.stringify(metadata);

  sheet.appendRow([
    submissionId,
    timestamp,
    data.creator_name,
    data.category,
    data.link,
    data.reason,
    APPROVAL_DEFAULT,
    "",
    metadataJson,
    "",
  ]);

  const rowNumber = sheet.getLastRow();

  if (flags.discordSuggestions) {
    const webhookResult = sendDiscordSuggestionAlert_({
      submissionId,
      timestamp,
      creator_name: data.creator_name,
      category: data.category,
      link: data.link,
      reason: data.reason,
    });
    sheet.getRange(rowNumber, 11).setValue(webhookResult);
  } else {
    sheet.getRange(rowNumber, 11).setValue("webhook:disabled");
  }

  return jsonResponse_({
    ok: true,
    submission_id: submissionId,
    message: "Suggestion saved.",
  });
}

function enforceSuggestionSecurity_(sheet, data, metadata) {
  if (!metadata.browser_token) {
    throw new Error("Missing browser token.");
  }

  const recentStats = getSuggestionStatsForToken_(sheet, metadata.browser_token);
  if (recentStats.hourCount >= MAX_SUGGESTIONS_PER_HOUR) {
    throw new Error("Too many suggestions from this browser. Please wait before sending another one.");
  }

  if (recentStats.dayCount >= MAX_SUGGESTIONS_PER_DAY) {
    throw new Error("Daily suggestion limit reached for this browser.");
  }

  if (hasDuplicateSuggestionForToken_(sheet, metadata.browser_token, data.creator_name, data.link)) {
    throw new Error("You already sent this creator from this browser.");
  }
}

function buildMetadata_(data, pageType) {
  const input = data.metadata || {};

  return {
    browser_token: cleanString_(input.browser_token, 200),
    user_agent: cleanString_(input.user_agent, 500),
    language: cleanString_(input.language, 80),
    timezone: cleanString_(input.timezone, 120),
    screen: cleanString_(input.screen, 80),
    referrer: cleanString_(input.referrer, 500),
    submitted_at_client: cleanString_(input.submitted_at_client, 120),
    page: cleanString_(pageType, 40) || "suggestion",
  };
}

function createSubmissionId_() {
  return `sub_${Utilities.getUuid().replace(/-/g, "").slice(0, 16)}`;
}

function createVoteId_() {
  return `vote_${Utilities.getUuid().replace(/-/g, "").slice(0, 16)}`;
}

function validateVotePayload_(data) {
  if (!data.creator_id || !/^sub_[a-z0-9]{16}$/i.test(data.creator_id)) {
    throw new Error("Creator ID is required and must be valid.");
  }

  if (data.category && !ALLOWED_CATEGORIES.includes(data.category)) {
    throw new Error("Category is invalid.");
  }
}

function validateAllowedFields_(keys, allowedFields) {
  const invalidKeys = (keys || []).filter((key) => allowedFields.indexOf(key) === -1);
  if (invalidKeys.length) {
    throw new Error(`Unexpected fields: ${invalidKeys.join(", ")}`);
  }
}

function normalizeForCompare_(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function getSuggestionStatsForToken_(sheet, browserToken) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { hourCount: 0, dayCount: 0 };
  }

  const values = sheet.getRange(2, 2, lastRow - 1, 8).getValues();
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  let hourCount = 0;
  let dayCount = 0;

  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    const timestamp = row[0];
    const metadataJson = row[7];
    if (!(timestamp instanceof Date)) continue;

    const metadata = safeParseJson_(metadataJson);
    const rowBrowserToken = cleanString_(metadata.browser_token, 200);
    if (rowBrowserToken !== browserToken) continue;

    if (timestamp >= hourAgo) hourCount += 1;
    if (timestamp >= dayAgo) dayCount += 1;
  }

  return { hourCount, dayCount };
}

function hasDuplicateSuggestionForToken_(sheet, browserToken, creatorName, link) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }

  const values = sheet.getRange(2, 3, lastRow - 1, 7).getValues();
  const normalizedName = normalizeForCompare_(creatorName);
  const normalizedLink = normalizeForCompare_(link);

  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    const rowName = normalizeForCompare_(row[0]);
    const rowLink = normalizeForCompare_(row[2]);
    const metadata = safeParseJson_(row[6]);
    const rowBrowserToken = cleanString_(metadata.browser_token, 200);

    if (rowBrowserToken !== browserToken) continue;
    if (rowName === normalizedName && rowLink === normalizedLink) {
      return true;
    }
  }

  return false;
}

function safeParseJson_(value) {
  try {
    return JSON.parse(String(value || "{}"));
  } catch (_error) {
    return {};
  }
}

function cleanString_(value, maxLength) {
  const normalized = String(value || "").trim();
  if (!maxLength) {
    return normalized;
  }

  return normalized.slice(0, maxLength);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function debugEvent_(e) {
  const parameterKeys = e && e.parameter ? Object.keys(e.parameter) : [];
  const postData = e && e.postData
    ? {
        type: e.postData.type || "",
        length: (e.postData.contents || "").length,
        preview: String(e.postData.contents || "").slice(0, 300),
      }
    : null;

  return {
    parameterKeys,
    postData,
  };
}

function sendDiscordSuggestionAlert_(suggestion) {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty(DISCORD_WEBHOOK_PROPERTY);
  if (!webhookUrl) {
    Logger.log("Discord webhook not configured.");
    return "webhook:not_configured";
  }

  const message = {
    content: "New suggestion for review.",
    embeds: [
      {
        title: suggestion.creator_name,
        description: "A new creator suggestion was submitted from the public page.",
        color: 0xef7d1a,
        fields: [
          { name: "Category", value: suggestion.category || "-", inline: true },
          { name: "Submission ID", value: suggestion.submissionId || "-", inline: true },
          { name: "Profile Link", value: suggestion.link || "-", inline: false },
          { name: "Why Included", value: truncateForDiscord_(suggestion.reason, 1000), inline: false },
        ],
        footer: {
          text: "ZoNami Suggestions",
        },
        timestamp: new Date(suggestion.timestamp).toISOString(),
      },
    ],
  };

  try {
    const response = UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(message),
      muteHttpExceptions: true,
    });
    Logger.log("Discord webhook status: %s", response.getResponseCode());
    return `webhook:${response.getResponseCode()}`;
  } catch (error) {
    Logger.log("Discord webhook failed: %s", error.message || error);
    return `webhook:failed:${error.message || error}`;
  }
}

function truncateForDiscord_(value, maxLength) {
  const text = cleanString_(value);
  if (text.length <= maxLength) {
    return text || "-";
  }

  return `${text.slice(0, maxLength - 1)}...`;
}


function getApprovedCreators_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.approved);
  if (!sheet) {
    return jsonResponse_({
      ok: false,
      message: `Missing sheet: ${SHEET_NAMES.approved}`,
    });
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return jsonResponse_({
      ok: true,
      creators: [],
    });
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const creators = values
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => ({
      submission_id: cleanString_(row[0]),
      creator_name: cleanString_(row[1]),
      category: cleanString_(row[2]),
      link: cleanString_(row[3]),
      reason: cleanString_(row[4]),
      image_url: cleanString_(row[5], 1000),
    }));

  return jsonResponse_({
    ok: true,
    creators,
  });
}

function handleVoteSubmit_(data, flags) {
  validateVotePayload_(data);

  const votesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.votes);
  if (!votesSheet) {
    throw new Error(`Missing sheet: ${SHEET_NAMES.votes}`);
  }

  const approvedCreator = getApprovedCreatorById_(data.creator_id);
  if (!approvedCreator) {
    throw new Error("Creator ID is invalid.");
  }

  if (data.category && data.category !== approvedCreator.category) {
    throw new Error("Category does not match the approved creator.");
  }

  const metadata = buildMetadata_(data, "vote");
  if (!metadata.browser_token) {
    throw new Error("Missing browser token.");
  }

  const voteDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  if (hasExistingVoteForDate_(votesSheet, metadata.browser_token, voteDate)) {
    throw new Error("You already voted today.");
  }

  const voteId = createVoteId_();
  const timestamp = new Date();
  const metadataJson = JSON.stringify(metadata);
  const fraudFlag = evaluateVoteFraud_(votesSheet, metadata, voteDate, timestamp);

  votesSheet.appendRow([
    voteId,
    timestamp,
    approvedCreator.creator_id,
    approvedCreator.creator_name,
    approvedCreator.category,
    metadata.browser_token,
    voteDate,
    COUNTED_DEFAULT,
    metadataJson,
    "",
    fraudFlag,
  ]);

  if (flags.discordVotes) {
    // Placeholder for future vote webhook if needed.
  }

  return jsonResponse_({
    ok: true,
    vote_id: voteId,
    message: "Vote saved.",
  });
}

function getFeatureFlags_() {
  const props = PropertiesService.getScriptProperties();
  const phase = cleanString_(props.getProperty("APP_PHASE") || "suggestion");
  const discordSuggestions = parseBoolean_(props.getProperty("DISCORD_SUGGESTIONS"));
  const discordVotes = parseBoolean_(props.getProperty("DISCORD_VOTES"));

  return {
    phase,
    enableSuggestions: phase !== "vote",
    enableVotes: phase === "vote",
    discordSuggestions: discordSuggestions !== null ? discordSuggestions : true,
    discordVotes: discordVotes !== null ? discordVotes : false,
  };
}

function parseBoolean_(value) {
  if (value === null || value === undefined || value === "") return null;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return null;
}

function getApprovedCreatorById_(creatorId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.approved);
  if (!sheet) {
    throw new Error(`Missing sheet: ${SHEET_NAMES.approved}`);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return null;
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    if (cleanString_(row[0]) !== creatorId) continue;
    return {
      creator_id: cleanString_(row[0]),
      creator_name: cleanString_(row[1]),
      category: cleanString_(row[2]),
      link: cleanString_(row[3]),
      reason: cleanString_(row[4]),
    };
  }

  return null;
}

function hasExistingVoteForDate_(sheet, browserToken, voteDate) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return false;
  }

  const values = sheet.getRange(2, 6, lastRow - 1, 2).getValues();
  for (let index = 0; index < values.length; index += 1) {
    const rowBrowserToken = cleanString_(values[index][0], 200);
    const rowVoteDate = cleanString_(values[index][1], 20);
    if (rowBrowserToken === browserToken && rowVoteDate === voteDate) {
      return true;
    }
  }

  return false;
}

function evaluateVoteFraud_(sheet, metadata, voteDate, timestamp) {
  const browserToken = cleanString_(metadata.browser_token, 200);
  if (!browserToken) {
    return "suspicious";
  }

  const fingerprint = buildVoteFingerprint_(metadata);
  let score = 0;
  if (!metadata.user_agent || !metadata.screen || !metadata.timezone) {
    score += 2;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return scoreToFraudLabel_(score);
  }

  const now = timestamp instanceof Date ? timestamp : new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const values = sheet.getRange(2, 2, lastRow - 1, 8).getValues();

  let votesLastHour = 0;
  let votesLastDay = 0;
  let votesLastWeek = 0;
  let votesLastMonth = 0;
  let latestVote = null;
  let fingerprintLastHour = 0;
  let fingerprintLastDay = 0;
  let fingerprintLastTenMinutes = 0;

  for (let index = 0; index < values.length; index += 1) {
    const rowTimestamp = values[index][0];
    const rowBrowserToken = cleanString_(values[index][4], 200);
    const rowMetadataJson = values[index][7];
    const rowFingerprint = buildVoteFingerprint_(safeParseJson_(rowMetadataJson));
    if (!(rowTimestamp instanceof Date)) continue;

    if (rowBrowserToken === browserToken) {
      if (!latestVote || rowTimestamp > latestVote) latestVote = rowTimestamp;
      if (rowTimestamp >= hourAgo) votesLastHour += 1;
      if (rowTimestamp >= dayAgo) votesLastDay += 1;
      if (rowTimestamp >= weekAgo) votesLastWeek += 1;
      if (rowTimestamp >= monthAgo) votesLastMonth += 1;
    }

    if (fingerprint && rowFingerprint === fingerprint) {
      if (rowTimestamp >= tenMinutesAgo) fingerprintLastTenMinutes += 1;
      if (rowTimestamp >= hourAgo) fingerprintLastHour += 1;
      if (rowTimestamp >= dayAgo) fingerprintLastDay += 1;
    }
  }

  if (latestVote && now.getTime() - latestVote.getTime() < 60 * 1000) {
    score += 2;
  }
  if (votesLastHour >= 1) score += 3;
  if (votesLastDay >= 1) score += 3;
  if (votesLastWeek >= 3) score += 2;
  if (votesLastMonth >= 5) score += 2;
  if (fingerprintLastTenMinutes >= 1) score += 2;
  if (fingerprintLastHour >= 2) score += 2;
  if (fingerprintLastDay >= 3) score += 2;

  return scoreToFraudLabel_(score);
}

function buildVoteFingerprint_(metadata) {
  if (!metadata || typeof metadata !== "object") return "";
  const parts = [
    normalizeForCompare_(metadata.user_agent),
    normalizeForCompare_(metadata.screen),
    normalizeForCompare_(metadata.timezone),
    normalizeForCompare_(metadata.language),
  ].filter(Boolean);

  if (!parts.length) return "";
  return parts.join("|");
}

function scoreToFraudLabel_(score) {
  if (score >= 5) return "probably fraudulent";
  if (score >= 3) return "suspicious";
  return FRAUD_DEFAULT;
}

function testDiscordAuth() {
  return UrlFetchApp.fetch("https://discord.com", {
    method: "get",
    muteHttpExceptions: true,
  }).getResponseCode();
}
