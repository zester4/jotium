import { FunctionDeclaration, Type } from "@google/genai";
import { z } from "zod";

export class GetWeatherTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "get_weather",
      description: "Get the current weather at a specific latitude and longitude using Open-Meteo API.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          latitude: {
            type: Type.NUMBER,
            description: "Latitude of the location."
          },
          longitude: {
            type: Type.NUMBER,
            description: "Longitude of the location."
          }
        },
        required: ["latitude", "longitude"]
      }
    };
  }

  async execute(args: { latitude: number; longitude: number }): Promise<any> {
    try {
      // Validate input
      const schema = z.object({
        latitude: z.number(),
        longitude: z.number(),
      });
      const { latitude, longitude } = schema.parse(args);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`
      );
      const weatherData = await response.json();
      return {
        success: true,
        latitude,
        longitude,
        weather: weatherData,
        fetchedAt: new Date().toISOString(),
      };
    } catch (error: unknown) {
      console.error("❌ Weather fetch failed:", error);
      return {
        success: false,
        error: `Weather fetch failed: ${error instanceof Error ? error.message : String(error)}`,
        latitude: args.latitude,
        longitude: args.longitude,
      };
    }
  }
}
