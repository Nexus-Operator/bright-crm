import { prisma } from "./prisma";

const DIALPAD_API_BASE = "https://dialpad.com/api/v2";
const DIALPAD_AUTH_URL = "https://dialpad.com/oauth2/authorize";
const DIALPAD_TOKEN_URL = "https://dialpad.com/oauth2/token";

// Scopes we need
const SCOPES = [
  "recordings_export",
  "message_content_export",
  "calls:list",
  "offline_access",
].join(" ");

export function getDialpadAuthUrl(state: string) {
  const clientId = process.env.DIALPAD_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/dialpad/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId!,
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
  });

  return `${DIALPAD_AUTH_URL}?${params.toString()}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch(DIALPAD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.DIALPAD_CLIENT_ID!,
      client_secret: process.env.DIALPAD_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/dialpad/callback`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(DIALPAD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.DIALPAD_CLIENT_ID!,
      client_secret: process.env.DIALPAD_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error("Token refresh failed");

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  }>;
}

async function getAccessToken(userId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId, provider: "dialpad" } },
  });

  if (!integration?.accessToken) {
    throw new Error("Dialpad not connected");
  }

  // Check if token is expired and refresh
  if (
    integration.tokenExpiry &&
    integration.tokenExpiry < new Date() &&
    integration.refreshToken
  ) {
    const tokens = await refreshAccessToken(integration.refreshToken);
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || integration.refreshToken,
        tokenExpiry: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
      },
    });
    return tokens.access_token;
  }

  return integration.accessToken;
}

async function dialpadFetch(
  userId: string,
  path: string,
  options: RequestInit = {}
) {
  const token = await getAccessToken(userId);

  const res = await fetch(`${DIALPAD_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dialpad API error (${res.status}): ${text}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// ─── Calls ──────────────────────────────────────────────

export async function initiateCall(
  userId: string,
  phoneNumber: string,
  options?: { customData?: string }
) {
  return dialpadFetch(userId, "/call/initiate", {
    method: "POST",
    body: JSON.stringify({
      phone_number: phoneNumber,
      custom_data: options?.customData,
    }),
  });
}

export async function hangUpCall(userId: string, callId: number) {
  return dialpadFetch(userId, "/call/actions/hangup", {
    method: "PUT",
    body: JSON.stringify({ call_id: callId }),
  });
}

export async function getCallInfo(userId: string, callId: number) {
  return dialpadFetch(userId, `/call/get_call_info?call_id=${callId}`);
}

export async function listCalls(
  userId: string,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.startDate) params.set("started_after", options.startDate);
  if (options?.endDate) params.set("started_before", options.endDate);

  return dialpadFetch(userId, `/call/list?${params.toString()}`);
}

export async function getCallAiRecap(userId: string, callId: number) {
  return dialpadFetch(userId, `/call/ai_recap?call_id=${callId}`);
}

// ─── SMS ────────────────────────────────────────────────

export async function sendSms(
  userId: string,
  toNumber: string,
  text: string,
  fromNumber?: string
) {
  return dialpadFetch(userId, "/sms/send", {
    method: "POST",
    body: JSON.stringify({
      to_number: toNumber,
      text,
      ...(fromNumber && { from_number: fromNumber }),
    }),
  });
}

// ─── Contacts ───────────────────────────────────────────

export async function createContact(
  userId: string,
  contact: {
    first_name: string;
    last_name: string;
    phones?: string[];
    emails?: string[];
    company_name?: string;
    job_title?: string;
  }
) {
  return dialpadFetch(userId, "/contacts/create", {
    method: "POST",
    body: JSON.stringify(contact),
  });
}

export async function listContacts(
  userId: string,
  options?: { limit?: number; cursor?: string }
) {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.cursor) params.set("cursor", options.cursor);

  return dialpadFetch(userId, `/contacts/list?${params.toString()}`);
}

export async function getContact(userId: string, contactId: string) {
  return dialpadFetch(userId, `/contacts/get?id=${contactId}`);
}

export async function updateContact(
  userId: string,
  contactId: string,
  data: {
    first_name?: string;
    last_name?: string;
    phones?: string[];
    emails?: string[];
    company_name?: string;
    job_title?: string;
  }
) {
  return dialpadFetch(userId, "/contacts/update", {
    method: "PATCH",
    body: JSON.stringify({ id: contactId, ...data }),
  });
}

export async function deleteContact(userId: string, contactId: string) {
  return dialpadFetch(userId, `/contacts/delete?id=${contactId}`, {
    method: "DELETE",
  });
}

// ─── Webhooks ───────────────────────────────────────────

export async function createWebhook(userId: string, hookUrl: string) {
  return dialpadFetch(userId, "/webhooks/create", {
    method: "POST",
    body: JSON.stringify({ hook_url: hookUrl }),
  });
}

export async function createCallEventSubscription(
  userId: string,
  webhookId: string
) {
  return dialpadFetch(userId, "/call_event_subscription/create", {
    method: "POST",
    body: JSON.stringify({ webhook_id: webhookId }),
  });
}

// ─── Users ──────────────────────────────────────────────

export async function getCurrentUser(userId: string) {
  return dialpadFetch(userId, "/users/get");
}

export function isDialpadConfigured() {
  return !!(
    process.env.DIALPAD_CLIENT_ID && process.env.DIALPAD_CLIENT_SECRET
  );
}

export function getDialpadMiniDialerUrl() {
  return process.env.DIALPAD_CTI_CLIENT_ID
    ? `https://dialpad.com/apps/${process.env.DIALPAD_CTI_CLIENT_ID}`
    : null;
}
