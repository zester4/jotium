import { FunctionDeclaration, Type } from "@google/genai";
import { DateTime, Duration } from "luxon";

export class DateTimeTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "datetime_tool",
      description: "A tool for date and time operations including formatting, parsing, timezone conversions, and calculations",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform with the datetime tool",
            enum: [
              "get_current_time",
              "format_date",
              "parse_date",
              "convert_timezone",
              "calculate_difference",
              "add_duration",
              "subtract_duration",
              "is_valid_date",
              "get_relative_time"
            ]
          },
          format: {
            type: Type.STRING,
            description: "The format string for date formatting (e.g., 'yyyy-MM-dd HH:mm:ss')"
          },
          inputDate: {
            type: Type.STRING,
            description: "Input date string to parse or process"
          },
          fromTimezone: {
            type: Type.STRING,
            description: "Source timezone (e.g., 'America/New_York', 'Europe/London')"
          },
          toTimezone: {
            type: Type.STRING,
            description: "Target timezone for conversion"
          },
          duration: {
            type: Type.OBJECT,
            description: "Duration to add or subtract",
            properties: {
              years: { type: Type.NUMBER },
              months: { type: Type.NUMBER },
              days: { type: Type.NUMBER },
              hours: { type: Type.NUMBER },
              minutes: { type: Type.NUMBER },
              seconds: { type: Type.NUMBER }
            }
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        case "get_current_time":
          return this.getCurrentTime(args.format);
        case "format_date":
          return this.formatDate(args.inputDate, args.format);
        case "parse_date":
          return this.parseDate(args.inputDate, args.format);
        case "convert_timezone":
          return this.convertTimezone(args.inputDate, args.fromTimezone, args.toTimezone);
        case "calculate_difference":
          return this.calculateDifference(args.inputDate, args.secondDate);
        case "add_duration":
          return this.addDuration(args.inputDate, args.duration);
        case "subtract_duration":
          return this.subtractDuration(args.inputDate, args.duration);
        case "is_valid_date":
          return this.isValidDate(args.inputDate);
        case "get_relative_time":
          return this.getRelativeTime(args.inputDate);
        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        action: args.action
      };
    }
  }

  private getCurrentTime(format?: string): any {
    const now = DateTime.now();
    return {
      success: true,
      action: "get_current_time",
      data: {
        formatted: format ? now.toFormat(format) : now.toISO(),
        timestamp: now.toMillis(),
        timezone: now.zoneName,
        offset: now.offset
      }
    };
  }

  private formatDate(date: string, format: string): any {
    const dt = DateTime.fromISO(date);
    return {
      success: true,
      action: "format_date",
      data: {
        formatted: dt.toFormat(format),
        original: date
      }
    };
  }

  private parseDate(date: string, format?: string): any {
    const dt = format ? DateTime.fromFormat(date, format) : DateTime.fromISO(date);
    return {
      success: true,
      action: "parse_date",
      data: {
        iso: dt.toISO(),
        timestamp: dt.toMillis(),
        valid: dt.isValid,
        parts: {
          year: dt.year,
          month: dt.month,
          day: dt.day,
          hour: dt.hour,
          minute: dt.minute,
          second: dt.second
        }
      }
    };
  }

  private convertTimezone(date: string, fromZone: string, toZone: string): any {
    const dt = DateTime.fromISO(date, { zone: fromZone }).setZone(toZone);
    return {
      success: true,
      action: "convert_timezone",
      data: {
        converted: dt.toISO(),
        fromZone,
        toZone,
        offset: dt.offset
      }
    };
  }

  private calculateDifference(date1: string, date2: string): any {
    const dt1 = DateTime.fromISO(date1);
    const dt2 = DateTime.fromISO(date2);
    const diff = dt2.diff(dt1, ['years', 'months', 'days', 'hours', 'minutes', 'seconds']);
    return {
      success: true,
      action: "calculate_difference",
      data: {
        difference: diff.toObject(),
        milliseconds: dt2.diff(dt1).milliseconds
      }
    };
  }

  private addDuration(date: string, duration: Duration): any {
    const dt = DateTime.fromISO(date).plus(duration);
    return {
      success: true,
      action: "add_duration",
      data: {
        result: dt.toISO(),
        original: date,
        duration
      }
    };
  }

  private subtractDuration(date: string, duration: Duration): any {
    const dt = DateTime.fromISO(date).minus(duration);
    return {
      success: true,
      action: "subtract_duration",
      data: {
        result: dt.toISO(),
        original: date,
        duration
      }
    };
  }

  private isValidDate(date: string): any {
    const dt = DateTime.fromISO(date);
    return {
      success: true,
      action: "is_valid_date",
      data: {
        isValid: dt.isValid,
        invalidReason: dt.invalidReason
      }
    };
  }

  private getRelativeTime(date: string): any {
    const dt = DateTime.fromISO(date);
    const now = DateTime.now();
    return {
      success: true,
      action: "get_relative_time",
      data: {
        relative: dt.toRelative(),
        relative_calendar: dt.toRelativeCalendar(),
        from_now: dt > now ? 'future' : 'past'
      }
    };
  }
}
