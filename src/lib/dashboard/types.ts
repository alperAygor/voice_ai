export type CallOutcome =
  | "appointment_booked"
  | "info_provided"
  | "transferred_to_human"
  | "missed"
  | "emergency_flagged"
  | "voicemail";

export type CallSentiment = "positive" | "neutral" | "negative";
export type CallUrgency = "low" | "medium" | "high" | "emergency";
export type AppointmentStatus = "confirmed" | "completed" | "cancelled";

export type DashboardCall = {
  id: string;
  caller_number: string | null;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: CallOutcome | null;
  sentiment: CallSentiment | null;
  urgency: CallUrgency | null;
  transcript: string | null;
  summary: string | null;
  analysis_json: unknown;
  recording_url: string | null;
  cost_usd: number | string | null;
};

export type DashboardAppointment = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  service_type: string | null;
  scheduled_at: string;
  notes: string | null;
  status: AppointmentStatus;
  google_calendar_event_id: string | null;
};

export type DashboardScheduleException = {
  id: string;
  date: string;
  type: "closed" | "custom_hours";
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
};
