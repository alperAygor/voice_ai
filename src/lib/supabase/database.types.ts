export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agent_config: {
        Row: {
          id: string;
          business_id: string;
          system_prompt: string | null;
          voice_id: string | null;
          greeting_message: string | null;
          escalation_rules: Json;
          vapi_assistant_id: string | null;
          language: Database["public"]["Enums"]["supported_language"];
          vapi_phone_number_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          system_prompt?: string | null;
          voice_id?: string | null;
          greeting_message?: string | null;
          escalation_rules?: Json;
          vapi_assistant_id?: string | null;
          language?: Database["public"]["Enums"]["supported_language"];
          vapi_phone_number_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agent_config"]["Insert"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          business_id: string;
          call_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          service_type: string | null;
          scheduled_at: string;
          address: string | null;
          notes: string | null;
          google_calendar_event_id: string | null;
          status: Database["public"]["Enums"]["appointment_status"];
          reminder_sent_at: string | null;
          reminder_call_id: string | null;
          customer_confirmed_at: string | null;
          customer_cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          call_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          service_type?: string | null;
          scheduled_at: string;
          address?: string | null;
          notes?: string | null;
          google_calendar_event_id?: string | null;
          status?: Database["public"]["Enums"]["appointment_status"];
          reminder_sent_at?: string | null;
          reminder_call_id?: string | null;
          customer_confirmed_at?: string | null;
          customer_cancelled_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
        Relationships: [];
      };
      appointment_action_tokens: {
        Row: {
          id: string;
          appointment_id: string;
          business_id: string;
          token: string;
          action: Database["public"]["Enums"]["appointment_action_token_type"];
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          business_id: string;
          token: string;
          action: Database["public"]["Enums"]["appointment_action_token_type"];
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_action_tokens"]["Insert"]>;
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          business_id: string | null;
          actor_user_id: string | null;
          event_type: string;
          severity: Database["public"]["Enums"]["audit_event_severity"];
          source: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          actor_user_id?: string | null;
          event_type: string;
          severity?: Database["public"]["Enums"]["audit_event_severity"];
          source: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_events"]["Insert"]>;
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          industry: Database["public"]["Enums"]["industry_type"];
          phone_number: string | null;
          owner_user_id: string;
          business_hours: Json;
          service_area: string | null;
          google_calendar_connected: boolean;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          twilio_phone_number_sid: string | null;
          subscription_status: Database["public"]["Enums"]["subscription_status_type"];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: Database["public"]["Enums"]["industry_type"];
          phone_number?: string | null;
          owner_user_id: string;
          business_hours?: Json;
          service_area?: string | null;
          google_calendar_connected?: boolean;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          twilio_phone_number_sid?: string | null;
          subscription_status?: Database["public"]["Enums"]["subscription_status_type"];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["businesses"]["Insert"]>;
        Relationships: [];
      };
      business_services: {
        Row: {
          id: string;
          business_id: string;
          service_name: string;
          description: string | null;
          is_emergency_eligible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          service_name: string;
          description?: string | null;
          is_emergency_eligible?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_services"]["Insert"]>;
        Relationships: [];
      };
      calls: {
        Row: {
          id: string;
          business_id: string;
          vapi_call_id: string | null;
          caller_number: string | null;
          started_at: string | null;
          ended_at: string | null;
          duration_seconds: number | null;
          transcript: string | null;
          summary: string | null;
          outcome: Database["public"]["Enums"]["call_outcome"] | null;
          cost_usd: number | string | null;
          recording_url: string | null;
          direction: Database["public"]["Enums"]["call_direction"];
          sentiment: Database["public"]["Enums"]["call_sentiment"] | null;
          urgency: Database["public"]["Enums"]["call_urgency"] | null;
          analysis_json: Json | null;
          transfer_reason: string | null;
          callback_of_call_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          vapi_call_id?: string | null;
          caller_number?: string | null;
          started_at?: string | null;
          ended_at?: string | null;
          duration_seconds?: number | null;
          transcript?: string | null;
          summary?: string | null;
          outcome?: Database["public"]["Enums"]["call_outcome"] | null;
          cost_usd?: number | string | null;
          recording_url?: string | null;
          direction?: Database["public"]["Enums"]["call_direction"];
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null;
          urgency?: Database["public"]["Enums"]["call_urgency"] | null;
          analysis_json?: Json | null;
          transfer_reason?: string | null;
          callback_of_call_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["calls"]["Insert"]>;
        Relationships: [];
      };
      google_calendar_tokens: {
        Row: {
          id: string;
          business_id: string;
          access_token: string;
          refresh_token: string;
          token_expiry: string;
          calendar_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          access_token: string;
          refresh_token: string;
          token_expiry: string;
          calendar_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["google_calendar_tokens"]["Insert"]>;
        Relationships: [];
      };
      google_oauth_states: {
        Row: {
          id: string;
          business_id: string;
          owner_user_id: string;
          state_token: string;
          redirect_path: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          owner_user_id: string;
          state_token: string;
          redirect_path?: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["google_oauth_states"]["Insert"]>;
        Relationships: [];
      };
      schedule_exceptions: {
        Row: {
          id: string;
          business_id: string;
          date: string;
          type: Database["public"]["Enums"]["schedule_exception_type"];
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          date: string;
          type?: Database["public"]["Enums"]["schedule_exception_type"];
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["schedule_exceptions"]["Insert"]>;
        Relationships: [];
      };
      sms_messages: {
        Row: {
          id: string;
          business_id: string;
          call_id: string | null;
          appointment_id: string | null;
          to_phone: string;
          body: string;
          status: string;
          twilio_sid: string | null;
          channel: Database["public"]["Enums"]["message_channel"];
          sent_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          call_id?: string | null;
          appointment_id?: string | null;
          to_phone: string;
          body: string;
          status?: string;
          twilio_sid?: string | null;
          channel?: Database["public"]["Enums"]["message_channel"];
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sms_messages"]["Insert"]>;
        Relationships: [];
      };
      usage_billing: {
        Row: {
          id: string;
          business_id: string;
          month: string;
          total_minutes: number | string;
          total_cost_usd: number | string;
          plan_included_minutes: number | string;
          overage_minutes: number | string;
          overage_cost_usd: number | string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          month: string;
          total_minutes?: number | string;
          total_cost_usd?: number | string;
          plan_included_minutes?: number | string;
          overage_minutes?: number | string;
          overage_cost_usd?: number | string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage_billing"]["Insert"]>;
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          event_type: string;
          status: string;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          event_id: string;
          event_type: string;
          status?: string;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["webhook_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      appointment_status: "confirmed" | "cancelled" | "completed";
      appointment_action_token_type: "confirm" | "cancel";
      audit_event_severity: "info" | "warning" | "error";
      call_direction: "inbound" | "outbound";
      call_outcome:
        | "appointment_booked"
        | "info_provided"
        | "transferred_to_human"
        | "missed"
        | "emergency_flagged"
        | "voicemail";
      call_sentiment: "positive" | "neutral" | "negative";
      call_urgency: "low" | "medium" | "high" | "emergency";
      industry_type: "plumbing" | "electrical" | "hvac" | "other";
      message_channel: "sms" | "whatsapp";
      schedule_exception_type: "closed" | "custom_hours";
      subscription_status_type:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete";
      supported_language: "tr" | "en" | "es" | "fr" | "de" | "it";
    };
    CompositeTypes: Record<string, never>;
  };
};
