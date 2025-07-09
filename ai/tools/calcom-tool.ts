import { FunctionDeclaration, Type } from "@google/genai";

export class CalComTool {
  private apiKey: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor(apiKey: string, baseUrl: string = "https://api.cal.com", apiVersion: string = "2024-08-13") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.apiVersion = apiVersion;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "cal-api-version": this.apiVersion
    };
  }

  private async makeRequest(endpoint: string, method: string = "GET", body?: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        throw new Error(`Cal.com API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Cal.com API request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "calcom_scheduler",
      description: "Comprehensive Cal.com scheduling tool for managing bookings, events, schedules, availability, and more. Supports both v1 and v2 API endpoints for maximum compatibility.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_booking",
              "get_bookings",
              "get_booking",
              "cancel_booking",
              "reschedule_booking",
              "get_available_slots",
              "create_event_type",
              "get_event_types",
              "update_event_type",
              "delete_event_type",
              "get_schedules",
              "create_schedule",
              "update_schedule",
              "get_availability",
              "set_availability",
              "get_profile",
              "update_profile",
              "get_teams",
              "create_team",
              "get_team_members",
              "add_team_member",
              "get_webhooks",
              "create_webhook",
              "delete_webhook",
              "get_integrations",
              "connect_calendar",
              "get_busy_times",
              "create_instant_booking",
              "get_recurring_bookings"
            ]
          },
          // Booking parameters
          eventTypeId: {
            type: Type.NUMBER,
            description: "ID of the event type for booking operations"
          },
          bookingUid: {
            type: Type.STRING,
            description: "Unique identifier for a specific booking"
          },
          start: {
            type: Type.STRING,
            description: "Start time in ISO 8601 format (e.g., '2024-12-25T10:00:00Z')"
          },
          end: {
            type: Type.STRING,
            description: "End time in ISO 8601 format (e.g., '2024-12-25T11:00:00Z')"
          },
          timeZone: {
            type: Type.STRING,
            description: "Timezone for the booking (e.g., 'America/New_York', 'Europe/London')"
          },
          attendee: {
            type: Type.OBJECT,
            description: "Attendee information for booking",
            properties: {
              name: { type: Type.STRING, description: "Attendee's full name" },
              email: { type: Type.STRING, description: "Attendee's email address" },
              phone: { type: Type.STRING, description: "Attendee's phone number" },
              timeZone: { type: Type.STRING, description: "Attendee's timezone" }
            }
          },
          // Event Type parameters
          eventType: {
            type: Type.OBJECT,
            description: "Event type configuration",
            properties: {
              title: { type: Type.STRING, description: "Event type title" },
              slug: { type: Type.STRING, description: "URL slug for the event type" },
              length: { type: Type.NUMBER, description: "Duration in minutes" },
              description: { type: Type.STRING, description: "Event description" },
              price: { type: Type.NUMBER, description: "Price for paid events" },
              currency: { type: Type.STRING, description: "Currency code (e.g., 'USD', 'EUR')" },
              requiresConfirmation: { type: Type.BOOLEAN, description: "Whether booking requires confirmation" },
              disableGuests: { type: Type.BOOLEAN, description: "Disable additional guests" },
              minimumBookingNotice: { type: Type.NUMBER, description: "Minimum notice required in minutes" },
              beforeEventBuffer: { type: Type.NUMBER, description: "Buffer time before event in minutes" },
              afterEventBuffer: { type: Type.NUMBER, description: "Buffer time after event in minutes" },
              locations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Location type (e.g., 'integrations:zoom', 'inPerson', 'phone')" },
                    address: { type: Type.STRING, description: "Physical address for in-person meetings" },
                    link: { type: Type.STRING, description: "Meeting link for virtual meetings" }
                  }
                },
                description: "Meeting locations"
              }
            }
          },
          // Schedule parameters
          scheduleId: {
            type: Type.NUMBER,
            description: "ID of the schedule"
          },
          schedule: {
            type: Type.OBJECT,
            description: "Schedule configuration",
            properties: {
              name: { type: Type.STRING, description: "Schedule name" },
              timeZone: { type: Type.STRING, description: "Schedule timezone" },
              availability: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    days: {
                      type: Type.ARRAY,
                      items: { type: Type.NUMBER },
                      description: "Days of week (0=Sunday, 1=Monday, etc.)"
                    },
                    startTime: { type: Type.STRING, description: "Start time (e.g., '09:00')" },
                    endTime: { type: Type.STRING, description: "End time (e.g., '17:00')" }
                  }
                },
                description: "Availability windows"
              }
            }
          },
          // Search and filter parameters
          username: {
            type: Type.STRING,
            description: "Username for user-specific operations"
          },
          eventTypeSlug: {
            type: Type.STRING,
            description: "Event type slug for slot availability"
          },
          organizationSlug: {
            type: Type.STRING,
            description: "Organization slug for organization-specific operations"
          },
          teamId: {
            type: Type.NUMBER,
            description: "Team ID for team operations"
          },
          status: {
            type: Type.STRING,
            description: "Booking status filter",
            enum: ["upcoming", "recurring", "past", "cancelled", "accepted", "rejected", "pending"]
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (default: 10)"
          },
          offset: {
            type: Type.NUMBER,
            description: "Number of results to skip for pagination (default: 0)"
          },
          // Webhook parameters
          webhook: {
            type: Type.OBJECT,
            description: "Webhook configuration",
            properties: {
              subscriberUrl: { type: Type.STRING, description: "URL to receive webhook notifications" },
              eventTriggers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Events that trigger the webhook (e.g., 'BOOKING_CREATED', 'BOOKING_CANCELLED')"
              },
              active: { type: Type.BOOLEAN, description: "Whether webhook is active" },
              payloadTemplate: { type: Type.STRING, description: "Custom payload template" }
            }
          },
          webhookId: {
            type: Type.STRING,
            description: "Webhook ID for webhook operations"
          },
          // Recurring booking parameters
          recurringCount: {
            type: Type.NUMBER,
            description: "Number of recurring bookings to create"
          },
          // Team parameters
          team: {
            type: Type.OBJECT,
            description: "Team configuration",
            properties: {
              name: { type: Type.STRING, description: "Team name" },
              slug: { type: Type.STRING, description: "Team URL slug" },
              bio: { type: Type.STRING, description: "Team description" },
              logo: { type: Type.STRING, description: "Team logo URL" },
              hideBranding: { type: Type.BOOLEAN, description: "Hide Cal.com branding" }
            }
          },
          // Additional parameters
          notes: {
            type: Type.STRING,
            description: "Additional notes for bookings"
          },
          metadata: {
            type: Type.OBJECT,
            description: "Additional metadata as key-value pairs"
          },
          rescheduleReason: {
            type: Type.STRING,
            description: "Reason for rescheduling a booking"
          },
          cancellationReason: {
            type: Type.STRING,
            description: "Reason for cancelling a booking"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📅 Cal.com ${args.action}: ${JSON.stringify(args, null, 2)}`);

      switch (args.action) {
        // Booking Operations
        case "create_booking":
          return await this.createBooking(args);
        case "get_bookings":
          return await this.getBookings(args);
        case "get_booking":
          return await this.getBooking(args.bookingUid);
        case "cancel_booking":
          return await this.cancelBooking(args.bookingUid, args.cancellationReason);
        case "reschedule_booking":
          return await this.rescheduleBooking(args);
        case "create_instant_booking":
          return await this.createInstantBooking(args);
        case "get_recurring_bookings":
          return await this.getRecurringBookings(args.bookingUid);

        // Availability and Slots
        case "get_available_slots":
          return await this.getAvailableSlots(args);
        case "get_busy_times":
          return await this.getBusyTimes(args);

        // Event Types
        case "create_event_type":
          return await this.createEventType(args.eventType);
        case "get_event_types":
          return await this.getEventTypes(args);
        case "update_event_type":
          return await this.updateEventType(args.eventTypeId, args.eventType);
        case "delete_event_type":
          return await this.deleteEventType(args.eventTypeId);

        // Schedules
        case "get_schedules":
          return await this.getSchedules(args);
        case "create_schedule":
          return await this.createSchedule(args.schedule);
        case "update_schedule":
          return await this.updateSchedule(args.scheduleId, args.schedule);

        // Profile and Availability
        case "get_profile":
          return await this.getProfile();
        case "update_profile":
          return await this.updateProfile(args);
        case "get_availability":
          return await this.getAvailability(args);
        case "set_availability":
          return await this.setAvailability(args);

        // Teams
        case "get_teams":
          return await this.getTeams();
        case "create_team":
          return await this.createTeam(args.team);
        case "get_team_members":
          return await this.getTeamMembers(args.teamId);
        case "add_team_member":
          return await this.addTeamMember(args.teamId, args);

        // Webhooks
        case "get_webhooks":
          return await this.getWebhooks();
        case "create_webhook":
          return await this.createWebhook(args.webhook);
        case "delete_webhook":
          return await this.deleteWebhook(args.webhookId);

        // Integrations
        case "get_integrations":
          return await this.getIntegrations();
        case "connect_calendar":
          return await this.connectCalendar(args);

        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error: unknown) {
      console.error("❌ Cal.com operation failed:", error);
      return {
        success: false,
        error: `Cal.com operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  // Booking Methods
  private async createBooking(args: any): Promise<any> {
    const bookingData: any = {
      eventTypeId: args.eventTypeId,
      start: args.start,
      end: args.end,
      attendee: args.attendee,
      metadata: args.metadata || {},
      timeZone: args.timeZone || "UTC"
    };

    if (args.notes) bookingData.notes = args.notes;
    if (args.recurringCount) bookingData.recurringCount = args.recurringCount;

    const result = await this.makeRequest("/v2/bookings", "POST", bookingData);
    return { success: true, booking: result, action: "create_booking" };
  }

  private async getBookings(args: any): Promise<any> {
    let endpoint = "/v2/bookings?";
    const params = new URLSearchParams();
    
    if (args.status) params.append("status", args.status);
    if (args.limit) params.append("limit", args.limit.toString());
    if (args.offset) params.append("offset", args.offset.toString());
    if (args.eventTypeId) params.append("eventTypeId", args.eventTypeId.toString());

    const result = await this.makeRequest(`${endpoint}${params.toString()}`);
    return { success: true, bookings: result, action: "get_bookings" };
  }

  private async getBooking(bookingUid: string): Promise<any> {
    const result = await this.makeRequest(`/v2/bookings/${bookingUid}`);
    return { success: true, booking: result, action: "get_booking" };
  }

  private async cancelBooking(bookingUid: string, reason?: string): Promise<any> {
    const cancelData: any = { allRemainingBookings: false };
    if (reason) cancelData.cancellationReason = reason;

    const result = await this.makeRequest(`/v2/bookings/${bookingUid}/cancel`, "DELETE", cancelData);
    return { success: true, result, action: "cancel_booking" };
  }

  private async rescheduleBooking(args: any): Promise<any> {
    const rescheduleData: any = {
      start: args.start,
      end: args.end
    };
    if (args.rescheduleReason) rescheduleData.rescheduleReason = args.rescheduleReason;

    const result = await this.makeRequest(`/v2/bookings/${args.bookingUid}`, "PATCH", rescheduleData);
    return { success: true, booking: result, action: "reschedule_booking" };
  }

  private async createInstantBooking(args: any): Promise<any> {
    const bookingData = {
      eventTypeId: args.eventTypeId,
      start: args.start,
      end: args.end,
      attendee: args.attendee,
      instant: true,
      timeZone: args.timeZone || "UTC"
    };

    const result = await this.makeRequest("/v2/bookings", "POST", bookingData);
    return { success: true, booking: result, action: "create_instant_booking" };
  }

  private async getRecurringBookings(bookingUid: string): Promise<any> {
    const result = await this.makeRequest(`/v2/bookings/${bookingUid}`);
    return { success: true, recurringBookings: result, action: "get_recurring_bookings" };
  }

  // Availability and Slots Methods
  private async getAvailableSlots(args: any): Promise<any> {
    let endpoint = "/v2/slots?";
    const params = new URLSearchParams();
    
    if (args.eventTypeId) params.append("eventTypeId", args.eventTypeId.toString());
    if (args.eventTypeSlug && args.username) {
      params.append("eventTypeSlug", args.eventTypeSlug);
      params.append("username", args.username);
    }
    if (args.organizationSlug) params.append("organizationSlug", args.organizationSlug);
    if (args.start) params.append("start", args.start);
    if (args.end) params.append("end", args.end);
    if (args.timeZone) params.append("timeZone", args.timeZone);

    const result = await this.makeRequest(`${endpoint}${params.toString()}`);
    return { success: true, slots: result, action: "get_available_slots" };
  }

  private async getBusyTimes(args: any): Promise<any> {
    let endpoint = "/v2/busy?";
    const params = new URLSearchParams();
    
    if (args.username) params.append("username", args.username);
    if (args.start) params.append("start", args.start);
    if (args.end) params.append("end", args.end);
    if (args.timeZone) params.append("timeZone", args.timeZone);

    const result = await this.makeRequest(`${endpoint}${params.toString()}`);
    return { success: true, busyTimes: result, action: "get_busy_times" };
  }

  // Event Type Methods
  private async createEventType(eventType: any): Promise<any> {
    const result = await this.makeRequest("/v2/event-types", "POST", eventType);
    return { success: true, eventType: result, action: "create_event_type" };
  }

  private async getEventTypes(args: any): Promise<any> {
    let endpoint = "/v2/event-types";
    const params = new URLSearchParams();
    
    if (args.username) params.append("username", args.username);
    if (args.limit) params.append("limit", args.limit.toString());
    if (args.offset) params.append("offset", args.offset.toString());

    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;

    const result = await this.makeRequest(endpoint);
    return { success: true, eventTypes: result, action: "get_event_types" };
  }

  private async updateEventType(eventTypeId: number, eventType: any): Promise<any> {
    const result = await this.makeRequest(`/v2/event-types/${eventTypeId}`, "PATCH", eventType);
    return { success: true, eventType: result, action: "update_event_type" };
  }

  private async deleteEventType(eventTypeId: number): Promise<any> {
    const result = await this.makeRequest(`/v2/event-types/${eventTypeId}`, "DELETE");
    return { success: true, result, action: "delete_event_type" };
  }

  // Schedule Methods
  private async getSchedules(args: any): Promise<any> {
    let endpoint = "/v2/schedules";
    const params = new URLSearchParams();
    
    if (args.limit) params.append("limit", args.limit.toString());
    if (args.offset) params.append("offset", args.offset.toString());

    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;

    const result = await this.makeRequest(endpoint);
    return { success: true, schedules: result, action: "get_schedules" };
  }

  private async createSchedule(schedule: any): Promise<any> {
    const result = await this.makeRequest("/v2/schedules", "POST", schedule);
    return { success: true, schedule: result, action: "create_schedule" };
  }

  private async updateSchedule(scheduleId: number, schedule: any): Promise<any> {
    const result = await this.makeRequest(`/v2/schedules/${scheduleId}`, "PATCH", schedule);
    return { success: true, schedule: result, action: "update_schedule" };
  }

  // Profile and Availability Methods
  private async getProfile(): Promise<any> {
    const result = await this.makeRequest("/v2/me");
    return { success: true, profile: result, action: "get_profile" };
  }

  private async updateProfile(profileData: any): Promise<any> {
    const result = await this.makeRequest("/v2/me", "PATCH", profileData);
    return { success: true, profile: result, action: "update_profile" };
  }

  private async getAvailability(args: any): Promise<any> {
    let endpoint = "/v2/availability";
    if (args.scheduleId) endpoint += `?scheduleId=${args.scheduleId}`;
    
    const result = await this.makeRequest(endpoint);
    return { success: true, availability: result, action: "get_availability" };
  }

  private async setAvailability(args: any): Promise<any> {
    const result = await this.makeRequest("/v2/availability", "POST", args.schedule);
    return { success: true, availability: result, action: "set_availability" };
  }

  // Team Methods
  private async getTeams(): Promise<any> {
    const result = await this.makeRequest("/v2/teams");
    return { success: true, teams: result, action: "get_teams" };
  }

  private async createTeam(team: any): Promise<any> {
    const result = await this.makeRequest("/v2/teams", "POST", team);
    return { success: true, team: result, action: "create_team" };
  }

  private async getTeamMembers(teamId: number): Promise<any> {
    const result = await this.makeRequest(`/v2/teams/${teamId}/members`);
    return { success: true, members: result, action: "get_team_members" };
  }

  private async addTeamMember(teamId: number, memberData: any): Promise<any> {
    const result = await this.makeRequest(`/v2/teams/${teamId}/members`, "POST", memberData);
    return { success: true, member: result, action: "add_team_member" };
  }

  // Webhook Methods
  private async getWebhooks(): Promise<any> {
    const result = await this.makeRequest("/v2/webhooks");
    return { success: true, webhooks: result, action: "get_webhooks" };
  }

  private async createWebhook(webhook: any): Promise<any> {
    const result = await this.makeRequest("/v2/webhooks", "POST", webhook);
    return { success: true, webhook: result, action: "create_webhook" };
  }

  private async deleteWebhook(webhookId: string): Promise<any> {
    const result = await this.makeRequest(`/v2/webhooks/${webhookId}`, "DELETE");
    return { success: true, result, action: "delete_webhook" };
  }

  // Integration Methods
  private async getIntegrations(): Promise<any> {
    const result = await this.makeRequest("/v2/integrations");
    return { success: true, integrations: result, action: "get_integrations" };
  }

  private async connectCalendar(args: any): Promise<any> {
    const result = await this.makeRequest("/v2/integrations/calendar", "POST", args);
    return { success: true, integration: result, action: "connect_calendar" };
  }
}
