import { FunctionDeclaration, Type } from "@google/genai";

export class WeatherTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "get_weather",
      description: "Get current weather and forecast for any location using OpenMeteo API. Provides real-time weather data without requiring an API key.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: "The city and country/state (e.g., 'Los Angeles, CA' or 'London, UK')"
          },
          days: {
            type: Type.NUMBER,
            description: "Number of forecast days to include (1-16, default: 7)"
          },
          units: {
            type: Type.STRING,
            description: "Temperature units: 'celsius', 'fahrenheit' (default: celsius)"
          },
          includeHourly: {
            type: Type.BOOLEAN,
            description: "Include hourly forecast for today (default: false)"
          }
        },
        required: ["location"]
      }
    };
  }

  private async geocodeLocation(location: string): Promise<{ lat: number; lon: number; name: string; country: string } | null> {
    try {
      // Use OpenMeteo's geocoding API
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
      
      console.log(`🌍 Geocoding: "${location}"`);
      const response = await fetch(geocodeUrl);
      const data = await response.json();
      
      if (!data.results || data.results.length === 0) {
        return null;
      }
      
      const result = data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name,
        country: result.country_code?.toUpperCase() || result.country || ''
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  private getWeatherIcon(weatherCode: number, isDay: boolean = true): string {
    // WMO weather codes to icon mapping
    const iconMap: { [key: number]: { day: string; night: string } } = {
      0: { day: "☀️", night: "🌙" }, // Clear sky
      1: { day: "🌤", night: "🌙" }, // Mainly clear
      2: { day: "⛅", night: "☁️" }, // Partly cloudy
      3: { day: "☁️", night: "☁️" }, // Overcast
      45: { day: "🌫", night: "🌫" }, // Fog
      48: { day: "🌫", night: "🌫" }, // Depositing rime fog
      51: { day: "🌦", night: "🌦" }, // Light drizzle
      53: { day: "🌦", night: "🌦" }, // Moderate drizzle
      55: { day: "🌧", night: "🌧" }, // Dense drizzle
      56: { day: "🌨", night: "🌨" }, // Light freezing drizzle
      57: { day: "🌨", night: "🌨" }, // Dense freezing drizzle
      61: { day: "🌦", night: "🌦" }, // Slight rain
      63: { day: "🌧", night: "🌧" }, // Moderate rain
      65: { day: "🌧", night: "🌧" }, // Heavy rain
      66: { day: "🌨", night: "🌨" }, // Light freezing rain
      67: { day: "🌨", night: "🌨" }, // Heavy freezing rain
      71: { day: "🌨", night: "🌨" }, // Slight snow fall
      73: { day: "❄️", night: "❄️" }, // Moderate snow fall
      75: { day: "❄️", night: "❄️" }, // Heavy snow fall
      77: { day: "❄️", night: "❄️" }, // Snow grains
      80: { day: "🌦", night: "🌦" }, // Slight rain showers
      81: { day: "🌧", night: "🌧" }, // Moderate rain showers
      82: { day: "⛈", night: "⛈" }, // Violent rain showers
      85: { day: "🌨", night: "🌨" }, // Slight snow showers
      86: { day: "❄️", night: "❄️" }, // Heavy snow showers
      95: { day: "⛈", night: "⛈" }, // Thunderstorm
      96: { day: "⛈", night: "⛈" }, // Thunderstorm with slight hail
      99: { day: "⛈", night: "⛈" }, // Thunderstorm with heavy hail
    };

    const icons = iconMap[weatherCode] || iconMap[0];
    return isDay ? icons.day : icons.night;
  }

  private getWeatherDescription(weatherCode: number): string {
    const descriptions: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    };

    return descriptions[weatherCode] || "Unknown";
  }

  private getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`⛅ Getting weather for: "${args.location}"`);
      
      // Geocode the location
      const geoData = await this.geocodeLocation(args.location);
      if (!geoData) {
        return {
          success: false,
          error: `Location "${args.location}" not found`,
          location: args.location
        };
      }

      const { lat, lon, name, country } = geoData;
      const days = Math.min(args.days || 7, 16);
      const units = args.units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
      const tempUnit = units === 'fahrenheit' ? '°F' : '°C';

      // Build OpenMeteo API URL
      const baseUrl = 'https://api.open-meteo.com/v1/forecast';
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,snowfall_sum,precipitation_hours,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
        temperature_unit: units,
        wind_speed_unit: 'kmh',
        precipitation_unit: 'mm',
        timeformat: 'iso8601',
        forecast_days: days.toString(),
        timezone: 'auto'
      });

      if (args.includeHourly) {
        params.append('hourly', 'temperature_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m');
      }

      const weatherUrl = `${baseUrl}?${params}`;
      
      console.log(`🌤 Fetching weather data...`);
      const response = await fetch(weatherUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.reason || 'Weather API request failed');
      }

      // Process current weather
      const current = data.current;
      const currentWeather = {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
        weatherDescription: this.getWeatherDescription(current.weather_code),
        icon: this.getWeatherIcon(current.weather_code, current.is_day === 1),
        isDay: current.is_day === 1,
        cloudCover: current.cloud_cover,
        pressure: current.pressure_msl,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: current.wind_direction_10m,
        unit: tempUnit
      };

      // Process daily forecast
      const dailyForecast = data.daily.time.map((date: string, index: number) => ({
        date,
        dayName: this.getDayName(date),
        weatherCode: data.daily.weather_code[index],
        weatherDescription: this.getWeatherDescription(data.daily.weather_code[index]),
        icon: this.getWeatherIcon(data.daily.weather_code[index], true),
        tempMax: Math.round(data.daily.temperature_2m_max[index]),
        tempMin: Math.round(data.daily.temperature_2m_min[index]),
        precipitation: data.daily.precipitation_sum[index],
        precipitationHours: data.daily.precipitation_hours[index],
        windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
        windGusts: Math.round(data.daily.wind_gusts_10m_max[index]),
        sunrise: data.daily.sunrise[index],
        sunset: data.daily.sunset[index]
      }));

      // Process hourly forecast if requested
      let hourlyForecast = null;
      if (args.includeHourly && data.hourly) {
        const today = new Date().toISOString().split('T')[0];
        const todayHours = data.hourly.time
          .map((time: string, index: number) => ({
            time,
            hour: new Date(time).getHours(),
            temperature: Math.round(data.hourly.temperature_2m[index]),
            precipitation: data.hourly.precipitation_probability[index],
            weatherCode: data.hourly.weather_code[index],
            icon: this.getWeatherIcon(data.hourly.weather_code[index], true),
            windSpeed: Math.round(data.hourly.wind_speed_10m[index])
          }))
          .filter((hour: any) => hour.time.startsWith(today))
          .slice(0, 24);
        
        hourlyForecast = todayHours;
      }

      return {
        success: true,
        location: `${name}${country ? `, ${country}` : ''}`,
        coordinates: { lat, lon },
        current: currentWeather,
        daily: dailyForecast,
        hourly: hourlyForecast,
        units: {
          temperature: tempUnit,
          precipitation: 'mm',
          windSpeed: 'km/h',
          pressure: 'hPa'
        },
        lastUpdated: new Date().toISOString(),
        timezone: data.timezone
      };

    } catch (error: unknown) {
      console.error("❌ Weather request failed:", error);
      return {
        success: false,
        error: `Weather request failed: ${error instanceof Error ? error.message : String(error)}`,
        location: args.location
      };
    }
  }
}