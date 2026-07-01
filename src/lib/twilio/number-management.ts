export type TwilioNumberChangePlan = {
  shouldReleasePreviousNumber: boolean;
  previousNumberSid: string | null;
};

export function getTwilioNumberChangePlan(input: {
  currentNumberSid?: string | null;
  replacingExistingNumber: boolean;
}): TwilioNumberChangePlan {
  const previousNumberSid = input.currentNumberSid?.trim() || null;

  return {
    shouldReleasePreviousNumber: Boolean(input.replacingExistingNumber && previousNumberSid),
    previousNumberSid,
  };
}
