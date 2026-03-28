const SHEET_NAMES = {
  suggestions: "suggestions_private",
  approved: "approved_public",
};

const APPROVAL_DEFAULT = "not approved";
const ALLOWED_CATEGORIES = ["Illustrator", "Influencers", "Writers"];
const DISCORD_WEBHOOK_PROPERTY = "DISCORD_WEBHOOK_URL";

function doPost(e) {
  try {
    Logger.log("doPost received: %s", JSON.stringify(debugEvent_(e)));
    const data = parseRequestBody_(e);
    Logger.log("parsed payload: %s", JSON.stringify(data));
    validateSuggestionPayload_(data);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.suggestions);
    if (!sheet) {
      throw new Error(`Missing sheet: ${SHEET_NAMES.suggestions}`);
    }

    const submissionId = createSubmissionId_();
    const timestamp = new Date();
    const metadataJson = JSON.stringify(buildMetadata_(data));

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

    const webhookResult = sendDiscordSuggestionAlert_({
      submissionId,
      timestamp,
      creator_name: data.creator_name,
      category: data.category,
      link: data.link,
      reason: data.reason,
    });

    sheet.getRange(rowNumber, 11).setValue(webhookResult);

    return jsonResponse_({
      ok: true,
      submission_id: submissionId,
      message: "Suggestion saved.",
    });
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
    let metadata = {};
    if (e.parameter.metadata_json) {
      try {
        metadata = JSON.parse(e.parameter.metadata_json);
      } catch (_error) {
        metadata = {};
      }
    }

    return {
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

    return {
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

  return {
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

function buildMetadata_(data) {
  const input = data.metadata || {};

  return {
    browser_token: cleanString_(input.browser_token, 200),
    user_agent: cleanString_(input.user_agent, 500),
    language: cleanString_(input.language, 80),
    timezone: cleanString_(input.timezone, 120),
    screen: cleanString_(input.screen, 80),
    referrer: cleanString_(input.referrer, 500),
    submitted_at_client: cleanString_(input.submitted_at_client, 120),
    page: "suggestion",
  };
}

function createSubmissionId_() {
  return `sub_${Utilities.getUuid().replace(/-/g, "").slice(0, 16)}`;
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

  const values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const creators = values
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => ({
      submission_id: cleanString_(row[0]),
      creator_name: cleanString_(row[1]),
      category: cleanString_(row[2]),
      link: cleanString_(row[3]),
      reason: cleanString_(row[4]),
    }));

  return jsonResponse_({
    ok: true,
    creators,
  });
}

function testDiscordAuth() {
  return UrlFetchApp.fetch("https://discord.com", {
    method: "get",
    muteHttpExceptions: true,
  }).getResponseCode();
}
