import { google } from "googleapis";
import { prisma } from "./prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`
  );
}

export function getAuthUrl(state: string) {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent",
  });
}

export async function getAuthenticatedClient(userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "google" } },
  });

  if (!integration?.refreshToken) {
    return null;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: integration.accessToken,
    refresh_token: integration.refreshToken,
    expiry_date: integration.tokenExpiry?.getTime(),
  });

  // Auto-refresh if token expired
  if (integration.tokenExpiry && integration.tokenExpiry < new Date()) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: credentials.access_token,
        tokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : null,
      },
    });
    oauth2Client.setCredentials(credentials);
  }

  return oauth2Client;
}

export async function sendEmail(
  userId: string,
  to: string,
  subject: string,
  body: string,
  htmlBody?: string
) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const gmail = google.gmail({ version: "v1", auth });

  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: ${htmlBody ? "text/html" : "text/plain"}; charset="UTF-8"`,
    "",
    htmlBody || body,
  ];

  const message = messageParts.join("\n");
  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: encodedMessage },
  });

  return result.data;
}

export async function listEmails(
  userId: string,
  query?: string,
  maxResults = 20
) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const gmail = google.gmail({ version: "v1", auth });

  const list = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  if (!list.data.messages) return [];

  const messages = await Promise.all(
    list.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "To", "Subject", "Date"],
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name === name)?.value || "";

      return {
        id: detail.data.id,
        threadId: detail.data.threadId,
        snippet: detail.data.snippet,
        from: getHeader("From"),
        to: getHeader("To"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        labelIds: detail.data.labelIds,
      };
    })
  );

  return messages;
}

export async function getEmailDetail(userId: string, messageId: string) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const gmail = google.gmail({ version: "v1", auth });

  const detail = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = detail.data.payload?.headers || [];
  const getHeader = (name: string) =>
    headers.find((h) => h.name === name)?.value || "";

  // Extract body
  let body = "";
  const payload = detail.data.payload;
  if (payload?.body?.data) {
    body = Buffer.from(payload.body.data, "base64").toString("utf-8");
  } else if (payload?.parts) {
    const textPart = payload.parts.find(
      (p) => p.mimeType === "text/plain" || p.mimeType === "text/html"
    );
    if (textPart?.body?.data) {
      body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
    }
  }

  return {
    id: detail.data.id,
    threadId: detail.data.threadId,
    snippet: detail.data.snippet,
    from: getHeader("From"),
    to: getHeader("To"),
    subject: getHeader("Subject"),
    date: getHeader("Date"),
    body,
  };
}

export async function listCalendarEvents(
  userId: string,
  timeMin?: string,
  timeMax?: string,
  maxResults = 20
) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date().toISOString();
  const result = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin || now,
    timeMax,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  return (result.data.items || []).map((event) => ({
    id: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    htmlLink: event.htmlLink,
    attendees: event.attendees?.map((a) => ({
      email: a.email,
      displayName: a.displayName,
      responseStatus: a.responseStatus,
    })),
    status: event.status,
  }));
}

export async function createCalendarEvent(
  userId: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    startDateTime: string;
    endDateTime: string;
    attendeeEmails?: string[];
  }
) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const calendar = google.calendar({ version: "v3", auth });

  const result = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    requestBody: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startDateTime, timeZone: "America/New_York" },
      end: { dateTime: event.endDateTime, timeZone: "America/New_York" },
      attendees: event.attendeeEmails?.map((email) => ({ email })),
    },
  });

  return {
    id: result.data.id,
    htmlLink: result.data.htmlLink,
    summary: result.data.summary,
    start: result.data.start,
    end: result.data.end,
  };
}

export async function deleteCalendarEvent(userId: string, eventId: string) {
  const auth = await getAuthenticatedClient(userId);
  if (!auth) throw new Error("Google not connected");

  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId: "primary", eventId });
}
