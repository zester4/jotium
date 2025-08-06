//ai/tools/GoogleCalendarTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getDecryptedOAuthAccessToken } from "@/db/queries";

export class GoogleCalendarTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_calendar_operations",
      description: "Interact with Google Calendar to create events, list events, update events, delete events, and manage calendars. Requires Google OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: ["create_event", "list_events", "get_event", "update_event", "delete_event", "list_calendars", "create_calendar"]
          },
          // Calendar ID (defaults to 'primary')
          calendarId: {
            type: Type.STRING,
            description: "Calendar ID (default: 'primary' for main calendar)"
          },
          // Event creation/update parameters
          summary: {
            type: Type.STRING,
            description: "Event title/summary (required for create_event and update_event)"
          },
          description: {
            type: Type.STRING,
            description: "Event description"
          },
          location: {
            type: Type.STRING,
            description: "Event location"
          },
          startDateTime: {
            type: Type.STRING,
            description: "Event start date/time in ISO format (e.g., '2024-03-15T10:00:00Z') or date for all-day events (e.g., '2024-03-15')"
          },
          endDateTime: {
            type: Type.STRING,
            description: "Event end date/time in ISO format (e.g., '2024-03-15T11:00:00Z') or date for all-day events (e.g., '2024-03-15')"
          },
          timeZone: {
            type: Type.STRING,
            description: "Time zone for the event (e.g., 'America/New_York', 'UTC'). Default: UTC"
          },
          allDay: {
            type: Type.BOOLEAN,
            description: "Whether this is an all-day event (default: false)"
          },
          attendees: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                email: { type: Type.STRING },
                displayName: { type: Type.STRING },
                optional: { type: Type.BOOLEAN }
              }
            },
            description: "Event attendees with email, displayName, and optional status"
          },
          recurrence: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Recurrence rules (e.g., ['RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR'])"
          },
          reminders: {
            type: Type.OBJECT,
            properties: {
              useDefault: { type: Type.BOOLEAN },
              overrides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    method: { type: Type.STRING },
                    minutes: { type: Type.NUMBER }
                  }
                }
              }
            },
            description: "Event reminders configuration"
          },
          conferenceData: {
            type: Type.OBJECT,
            properties: {
              createRequest: {
                type: Type.OBJECT,
                properties: {
                  requestId: { type: Type.STRING },
                  conferenceSolutionKey: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            description: "Conference/meeting link data (e.g., Google Meet)"
          },
          // Event ID for get, update, delete operations
          eventId: {
            type: Type.STRING,
            description: "Event ID (required for get_event, update_event, delete_event)"
          },
          // List events parameters
          timeMin: {
            type: Type.STRING,
            description: "Lower bound for event start time (ISO format)"
          },
          timeMax: {
            type: Type.STRING,
            description: "Upper bound for event start time (ISO format)"
          },
          maxResults: {
            type: Type.NUMBER,
            description: "Maximum number of events to return (default: 10, max: 2500)"
          },
          orderBy: {
            type: Type.STRING,
            description: "Order of events returned",
            enum: ["startTime", "updated"]
          },
          // Calendar creation parameters
          calendarSummary: {
            type: Type.STRING,
            description: "Calendar title/summary (required for create_calendar)"
          },
          calendarDescription: {
            type: Type.STRING,
            description: "Calendar description"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ 
        userId: this.userId, 
        service: "gmail" // Using gmail service for Google OAuth
      });

      if (!accessToken) {
        return {
          success: false,
          error: "Google OAuth connection not found. Please connect your Google account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      const calendarId = args.calendarId || 'primary';

      switch (args.action) {
        case "create_event":
          return await this.createEvent(args, headers, calendarId);
        case "list_events":
          return await this.listEvents(args, headers, calendarId);
        case "get_event":
          return await this.getEvent(args, headers, calendarId);
        case "update_event":
          return await this.updateEvent(args, headers, calendarId);
        case "delete_event":
          return await this.deleteEvent(args, headers, calendarId);
        case "list_calendars":
          return await this.listCalendars(headers);
        case "create_calendar":
          return await this.createCalendar(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Google Calendar operation failed:", error);
      return {
        success: false,
        error: `Google Calendar operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async createEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.summary) {
      return { success: false, error: "Event summary is required" };
    }
    if (!args.startDateTime) {
      return { success: false, error: "Event start date/time is required" };
    }
    if (!args.endDateTime) {
      return { success: false, error: "Event end date/time is required" };
    }

    const event = this.buildEventObject(args);

    const url = args.conferenceData 
      ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?conferenceDataVersion=1`
      : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async listEvents(args: any, headers: any, calendarId: string): Promise<any> {
    const params = new URLSearchParams();
    if (args.timeMin) params.append('timeMin', args.timeMin);
    if (args.timeMax) params.append('timeMax', args.timeMax);
    if (args.maxResults) params.append('maxResults', String(Math.min(args.maxResults, 2500)));
    if (args.orderBy) params.append('orderBy', args.orderBy);
    params.append('singleEvents', 'true'); // Expand recurring events

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list events: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      events: result.items?.map((event: any) => this.formatEvent(event)) || [],
      nextPageToken: result.nextPageToken,
      nextSyncToken: result.nextSyncToken
    };
  }

  private async getEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async updateEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const event = this.buildEventObject(args);

    const url = args.conferenceData 
      ? `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}?conferenceDataVersion=1`
      : `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update event: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      event: this.formatEvent(result)
    };
  }

  private async deleteEvent(args: any, headers: any, calendarId: string): Promise<any> {
    if (!args.eventId) {
      return { success: false, error: "Event ID is required" };
    }

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${args.eventId}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to delete event: ${error}` };
    }

    return {
      success: true,
      message: "Event deleted successfully"
    };
  }

  private async listCalendars(headers: any): Promise<any> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to list calendars: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      calendars: result.items?.map((calendar: any) => ({
        id: calendar.id,
        summary: calendar.summary,
        description: calendar.description,
        timeZone: calendar.timeZone,
        accessRole: calendar.accessRole,
        primary: calendar.primary || false,
        selected: calendar.selected || false,
        backgroundColor: calendar.backgroundColor,
        foregroundColor: calendar.foregroundColor
      })) || []
    };
  }

  private async createCalendar(args: any, headers: any): Promise<any> {
    if (!args.calendarSummary) {
      return { success: false, error: "Calendar summary is required" };
    }

    const calendar = {
      summary: args.calendarSummary,
      description: args.calendarDescription || '',
      timeZone: args.timeZone || 'UTC'
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars', {
      method: 'POST',
      headers,
      body: JSON.stringify(calendar)
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create calendar: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      calendar: {
        id: result.id,
        summary: result.summary,
        description: result.description,
        timeZone: result.timeZone
      }
    };
  }

  private buildEventObject(args: any): any {
    const event: any = {
      summary: args.summary
    };

    if (args.description) event.description = args.description;
    if (args.location) event.location = args.location;

    // Handle start and end times
    if (args.allDay) {
      event.start = { date: args.startDateTime.split('T')[0] };
      event.end = { date: args.endDateTime.split('T')[0] };
    } else {
      event.start = { 
        dateTime: args.startDateTime,
        timeZone: args.timeZone || 'UTC'
      };
      event.end = { 
        dateTime: args.endDateTime,
        timeZone: args.timeZone || 'UTC'
      };
    }

    if (args.attendees && Array.isArray(args.attendees)) {
      event.attendees = args.attendees.map((attendee: any) => ({
        email: attendee.email,
        displayName: attendee.displayName,
        optional: attendee.optional || false
      }));
    }

    if (args.recurrence && Array.isArray(args.recurrence)) {
      event.recurrence = args.recurrence;
    }

    if (args.reminders) {
      event.reminders = args.reminders;
    } else {
      event.reminders = { useDefault: true };
    }

    if (args.conferenceData) {
      event.conferenceData = args.conferenceData;
    }

    return event;
  }

  private formatEvent(event: any): any {
    return {
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees || [],
      creator: event.creator,
      organizer: event.organizer,
      status: event.status,
      htmlLink: event.htmlLink,
      hangoutLink: event.hangoutLink,
      conferenceData: event.conferenceData,
      recurrence: event.recurrence,
      reminders: event.reminders,
      created: event.created,
      updated: event.updated
    };
  }
}