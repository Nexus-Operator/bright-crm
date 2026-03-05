import Twilio from "twilio";

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Twilio credentials not configured");
  }

  return Twilio(accountSid, authToken);
}

function getFromNumber() {
  const number = process.env.TWILIO_PHONE_NUMBER;
  if (!number) throw new Error("TWILIO_PHONE_NUMBER not configured");
  return number;
}

export async function sendSms(to: string, body: string) {
  const client = getClient();
  const message = await client.messages.create({
    body,
    from: getFromNumber(),
    to,
  });

  return {
    sid: message.sid,
    status: message.status,
    to: message.to,
    from: message.from,
    body: message.body,
    dateSent: message.dateSent,
  };
}

export async function makeCall(
  to: string,
  twimlUrl?: string
) {
  const client = getClient();

  // If no TwiML URL, use a simple "connecting you" message
  const url =
    twimlUrl ||
    `${process.env.NEXTAUTH_URL}/api/integrations/twilio/twiml?to=${encodeURIComponent(to)}`;

  const call = await client.calls.create({
    url,
    to,
    from: getFromNumber(),
  });

  return {
    sid: call.sid,
    status: call.status,
    to: call.to,
    from: call.from,
  };
}

export async function getCallLog(limit = 20) {
  const client = getClient();
  const calls = await client.calls.list({ limit });

  return calls.map((call) => ({
    sid: call.sid,
    from: call.from,
    to: call.to,
    status: call.status,
    direction: call.direction,
    duration: call.duration,
    startTime: call.startTime,
    endTime: call.endTime,
  }));
}

export async function getSmsLog(limit = 20) {
  const client = getClient();
  const messages = await client.messages.list({ limit });

  return messages.map((msg) => ({
    sid: msg.sid,
    from: msg.from,
    to: msg.to,
    body: msg.body,
    status: msg.status,
    direction: msg.direction,
    dateSent: msg.dateSent,
  }));
}

export function isTwilioConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}
