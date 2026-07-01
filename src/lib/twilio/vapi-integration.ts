import "server-only";

export async function importPhoneNumberToVapi(
  phoneNumber: string, 
  twilioAccountSid: string, 
  twilioAuthToken: string
): Promise<{ vapiPhoneId: string }> {
  const vapiKey = process.env.VAPI_API_KEY;
  if (!vapiKey) throw new Error("VAPI_API_KEY tanımlı olmalı.");

  const res = await fetch("https://api.vapi.ai/phone-number", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${vapiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      provider: "twilio",
      number: phoneNumber,
      twilioAccountSid,
      twilioAuthToken
    })
  });

  if (!res.ok) {
    throw new Error(`Vapi numara import başarısız: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { vapiPhoneId: data.id };
}

export async function assignPhoneNumberToAssistant(
  vapiPhoneId: string, 
  assistantId: string
): Promise<void> {
  const vapiKey = process.env.VAPI_API_KEY;
  if (!vapiKey) throw new Error("VAPI_API_KEY tanımlı olmalı.");

  const res = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${vapiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      assistantId
    })
  });

  if (!res.ok) {
    throw new Error(`Vapi numara atama başarısız: ${res.status} ${await res.text()}`);
  }
}

export async function deletePhoneNumberFromVapi(vapiPhoneId: string): Promise<void> {
  const vapiKey = process.env.VAPI_API_KEY;
  if (!vapiKey) throw new Error("VAPI_API_KEY tanımlı olmalı.");

  const res = await fetch(`https://api.vapi.ai/phone-number/${vapiPhoneId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${vapiKey}`,
    },
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Vapi numara silme başarısız: ${res.status} ${await res.text()}`);
  }
}
