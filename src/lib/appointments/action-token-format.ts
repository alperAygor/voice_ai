export type AppointmentAction = "confirm" | "cancel";

export function buildAppointmentActionUrl(input: {
  appUrl: string;
  token: string;
  action: AppointmentAction;
}): string {
  const url = new URL("/api/appointments/respond", input.appUrl);
  url.searchParams.set("token", input.token);
  url.searchParams.set("action", input.action);
  return url.toString();
}
