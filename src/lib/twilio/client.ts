import "server-only";

export type MessageChannel = "sms" | "whatsapp";

function normalizeWhatsAppAddress(phone: string): string {
  return phone.startsWith("whatsapp:") ? phone : `whatsapp:${phone}`;
}

export async function sendMessage(
  to: string,
  body: string,
  channel: MessageChannel = "sms"
): Promise<{ sid: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = channel === "whatsapp"
    ? process.env.TWILIO_WHATSAPP_FROM
    : process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    throw new Error(
      channel === "whatsapp"
        ? "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ve TWILIO_WHATSAPP_FROM tanımlı olmalı."
        : "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ve TWILIO_PHONE_NUMBER tanımlı olmalı."
    );
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: channel === "whatsapp" ? normalizeWhatsAppAddress(to) : to,
        From: from,
        Body: body,
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Twilio mesaj gönderilemedi: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { sid: data.sid };
}

export async function sendSms(to: string, body: string): Promise<{ sid: string }> {
  return sendMessage(to, body, "sms");
}

export interface TwilioNumber {
  phoneNumber: string;
  friendlyName: string;
  locality?: string;
  region?: string;
}

type TwilioAvailableNumberResponse = {
  available_phone_numbers?: {
    phone_number?: string;
    friendly_name?: string;
    locality?: string;
    region?: string;
  }[];
};

function getTwilioAuth() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID ve TWILIO_AUTH_TOKEN tanımlı olmalı.");
  }
  
  return {
    accountSid,
    auth: Buffer.from(`${accountSid}:${authToken}`).toString("base64")
  };
}

export async function searchAvailableNumbers(countryCode: string = "US", areaCode?: string): Promise<TwilioNumber[]> {
  const { accountSid, auth } = getTwilioAuth();
  
  let url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/AvailablePhoneNumbers/${countryCode}/Local.json`;
  if (areaCode) {
    url += `?AreaCode=${areaCode}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Twilio numara arama başarısız: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as TwilioAvailableNumberResponse;

  return (data.available_phone_numbers || [])
    .filter((num) => num.phone_number)
    .map((num) => ({
      phoneNumber: num.phone_number!,
      friendlyName: num.friendly_name || num.phone_number!,
      locality: num.locality,
      region: num.region,
    }));
}

export async function purchaseNumber(phoneNumber: string): Promise<{ sid: string; phoneNumber: string }> {
  const { accountSid, auth } = getTwilioAuth();
  
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ PhoneNumber: phoneNumber }),
    }
  );

  if (!res.ok) {
    throw new Error(`Twilio numara satın alma başarısız: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { 
    sid: data.sid,
    phoneNumber: data.phone_number
  };
}

export async function releaseNumber(numberSid: string): Promise<void> {
  const { accountSid, auth } = getTwilioAuth();
  
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${numberSid}.json`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Twilio numara bırakma başarısız: ${res.status} ${await res.text()}`);
  }
}
