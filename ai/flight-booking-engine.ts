//ai/flight-booking-engine.ts
import { Tool, ToolCall, ToolResult } from "./types";
import { generateUUID } from "@/lib/utils";

export interface FlightSearchContext {
  from: string;
  to: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  tripType?: 'one_way' | 'round_trip';
  flexibility?: 'exact' | 'flexible' | 'weekend';
  budget?: 'budget' | 'standard' | 'premium';
  currentDate: Date;
}

export interface FlightResult {
  id: string;
  airline: string;
  price: number;
  currency: string;
  departure: {
    airport: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    time: string;
    date: string;
  };
  duration: string;
  stops: number;
  cabinClass: string;
  bookingUrl?: string;
}

export interface FlightSearchReport {
  searchParams: FlightSearchContext;
  flights: FlightResult[];
  alternativeDates: Array<{
    date: string;
    averagePrice: number;
    priceChange: number;
  }>;
  insights: string[];
  recommendations: string[];
  bestValue: FlightResult | null;
  cheapest: FlightResult | null;
  fastest: FlightResult | null;
  timestamp: Date;
}

export class EnhancedFlightBookingEngine {
  private tools: Map<string, Tool>;
  private currentDate: Date;

  constructor(tools: Map<string, Tool>) {
    this.tools = tools;
    this.currentDate = new Date();
  }

  async searchFlights(
    context: FlightSearchContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<FlightSearchReport> {
    // Intelligent date processing
    const processedContext = this.processFlightContext(context);
    
    let flightResults: FlightResult[] = [];
    let alternativeDates: any[] = [];
    
    // Primary flight search
    if (this.tools.has('flight_booking')) {
      flightResults = await this.performFlightSearch(processedContext, executeToolFn);
    }
    
    // Get alternative dates for better pricing
    if (processedContext.flexibility !== 'exact' && flightResults.length > 0) {
      alternativeDates = await this.getAlternativeDates(processedContext, executeToolFn, flightResults);
    }
    
    // Analyze results and generate insights
    const insights = this.generateFlightInsights(flightResults, processedContext);
    const recommendations = this.generateFlightRecommendations(flightResults, processedContext);
    
    // Identify best options
    const bestValue = this.findBestValueFlight(flightResults);
    const cheapest = this.findCheapestFlight(flightResults);
    const fastest = this.findFastestFlight(flightResults);
    
    return {
      searchParams: processedContext,
      flights: flightResults,
      alternativeDates,
      insights,
      recommendations,
      bestValue,
      cheapest,
      fastest,
      timestamp: new Date()
    };
  }

  private processFlightContext(context: FlightSearchContext): FlightSearchContext {
    const processed = { ...context };
    processed.currentDate = this.currentDate;
    
    // Intelligent date selection
    if (!processed.departureDate) {
      // Default to next day if no date specified
      const tomorrow = new Date(this.currentDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      processed.departureDate = tomorrow.toISOString().split('T')[0];
      
      console.log(`🗓️ No departure date specified, defaulting to tomorrow: ${processed.departureDate}`);
    } else {
      // Validate and adjust the provided date
      processed.departureDate = this.validateAndAdjustDate(processed.departureDate);
    }
    
    // Set return date for round trips if not specified
    if (processed.tripType === 'round_trip' && !processed.returnDate) {
      const departure = new Date(processed.departureDate);
      const returnDate = new Date(departure);
      returnDate.setDate(departure.getDate() + 7); // Default to 1 week trip
      processed.returnDate = returnDate.toISOString().split('T')[0];
      
      console.log(`🔄 Round trip detected, setting return date to: ${processed.returnDate}`);
    }
    
    // Set intelligent defaults
    processed.passengers = processed.passengers || 1;
    processed.cabinClass = processed.cabinClass || 'economy';
    processed.tripType = processed.tripType || 'round_trip';
    processed.flexibility = processed.flexibility || 'flexible';
    processed.budget = processed.budget || 'standard';
    
    return processed;
  }

  private validateAndAdjustDate(dateString: string): string {
    const inputDate = new Date(dateString);
    const today = new Date(this.currentDate);
    today.setHours(0, 0, 0, 0);
    
    // If date is in the past, move it to tomorrow
    if (inputDate < today) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      console.log(`📅 Adjusted past date ${dateString} to tomorrow: ${tomorrow.toISOString().split('T')[0]}`);
      return tomorrow.toISOString().split('T')[0];
    }
    
    return dateString;
  }

  private async performFlightSearch(
    context: FlightSearchContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>
  ): Promise<FlightResult[]> {
    try {
      const searchArgs: any = {
        origin: context.from,
        destination: context.to,
        departure_date: context.departureDate,
        passengers: context.passengers,
        cabin_class: context.cabinClass
      };

      // Add return date for round trips
      if (context.tripType === 'round_trip' && context.returnDate) {
        searchArgs.return_date = context.returnDate;
      }

      const searchResult = await executeToolFn({
        name: 'flight_booking',
        args: {
          action: 'search_flights',
          ...searchArgs
        },
        id: generateUUID()
      });

      if (searchResult.result?.success && searchResult.result.offers) {
        return this.normalizeFlightResults(searchResult.result.offers);
      }
    } catch (error) {
      console.log(`Flight search failed: ${error}`);
    }
    
    return [];
  }

  private normalizeFlightResults(rawFlights: any[]): FlightResult[] {
    return rawFlights.map(flight => ({
      id: flight.id || generateUUID(),
      airline: flight.owner?.name || flight.airline || flight.carrier || 'Unknown Airline',
      price: parseFloat(flight.total_amount || flight.price || '0'),
      currency: flight.total_currency || flight.currency || 'USD',
      departure: {
        airport: flight.slices?.[0]?.origin || flight.departure?.airport || flight.origin || '',
        time: flight.slices?.[0]?.departure_datetime || flight.departure?.time || flight.departure_time || '',
        date: flight.slices?.[0]?.departure_datetime?.split('T')[0] || flight.departure?.date || flight.departure_date || ''
      },
      arrival: {
        airport: flight.slices?.[0]?.destination || flight.arrival?.airport || flight.destination || '',
        time: flight.slices?.[0]?.arrival_datetime || flight.arrival?.time || flight.arrival_time || '',
        date: flight.slices?.[0]?.arrival_datetime?.split('T')[0] || flight.arrival?.date || flight.arrival_date || ''
      },
      duration: flight.slices?.[0]?.duration || flight.duration || flight.flight_time || '',
      stops: flight.slices?.[0]?.segments?.length - 1 || parseInt(flight.stops || '0'),
      cabinClass: flight.passenger_breakdown?.[0]?.cabin_class || flight.cabin_class || flight.class || 'economy',
      bookingUrl: flight.booking_url || flight.deep_link
    }));
  }

  private async getAlternativeDates(
    context: FlightSearchContext,
    executeToolFn: (toolCall: ToolCall) => Promise<ToolResult>,
    originalFlights: FlightResult[]
  ): Promise<Array<{ date: string; averagePrice: number; priceChange: number }>> {
    const alternatives = [];
    const baseDate = new Date(context.departureDate!);
    
    // Check dates within +/- 3 days for flexible searches
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue; // Skip the original date
      
      const alternativeDate = new Date(baseDate);
      alternativeDate.setDate(baseDate.getDate() + i);
      
      // Don't search past dates
      if (alternativeDate < this.currentDate) continue;
      
      try {
        const altSearchResult = await executeToolFn({
          name: 'flight_booking',
          args: {
            action: 'search_flights',
            origin: context.from,
            destination: context.to,
            departure_date: alternativeDate.toISOString().split('T')[0],
            passengers: context.passengers,
            cabin_class: context.cabinClass
          },
          id: generateUUID()
        });

        if (altSearchResult.result?.success && altSearchResult.result.offers) {
          const flights = this.normalizeFlightResults(altSearchResult.result.offers);
          const averagePrice = flights.reduce((sum, f) => sum + f.price, 0) / flights.length;
          
          alternatives.push({
            date: alternativeDate.toISOString().split('T')[0],
            averagePrice,
            priceChange: 0 // Will be calculated after all searches
          });
        }
      } catch (error) {
        console.log(`Alternative date search failed for ${alternativeDate.toDateString()}: ${error}`);
      }
    }
    
    // Calculate price changes relative to original search results
    const originalPrice = Array.isArray(originalFlights) && originalFlights.length > 0
      ? originalFlights.reduce((sum: number, f: FlightResult) => sum + f.price, 0) / originalFlights.length
      : 0;
    
    return alternatives.map(alt => ({
      ...alt,
      priceChange: originalPrice > 0 ? ((alt.averagePrice - originalPrice) / originalPrice) * 100 : 0
    }));
  }

  private generateFlightInsights(flights: FlightResult[], context: FlightSearchContext): string[] {
    const insights = [];
    
    if (flights.length === 0) {
      insights.push("❌ No flights found for the specified criteria. Try adjusting dates or destinations.");
      return insights;
    }

    const prices = flights.map(f => f.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    insights.push(`💰 Found ${flights.length} flights with prices ranging from ${minPrice.toFixed(0)} to ${maxPrice.toFixed(0)} (avg: ${avgPrice.toFixed(0)})`);
    
    const directFlights = flights.filter(f => f.stops === 0);
    if (directFlights.length > 0) {
      const directAvg = directFlights.reduce((sum, f) => sum + f.price, 0) / directFlights.length;
      insights.push(`✈️ ${directFlights.length} direct flights available (avg: ${directAvg.toFixed(0)})`);
    }
    
    const oneStopFlights = flights.filter(f => f.stops === 1);
    if (oneStopFlights.length > 0) {
      const oneStopAvg = oneStopFlights.reduce((sum, f) => sum + f.price, 0) / oneStopFlights.length;
      const savings = directFlights.length > 0 ? 
        ((directFlights.reduce((sum, f) => sum + f.price, 0) / directFlights.length) - oneStopAvg) : 0;
      insights.push(`🔄 ${oneStopFlights.length} one-stop flights available (avg: ${oneStopAvg.toFixed(0)}${savings > 0 ? `, save ~${savings.toFixed(0)}` : ''})`);
    }
    
    // Airline analysis
    const airlineStats = this.analyzeAirlines(flights);
    if (airlineStats.length > 0) {
      insights.push(`🏢 Top airlines: ${airlineStats.slice(0, 3).map(a => `${a.airline} (${a.count} flights, avg ${a.avgPrice.toFixed(0)})`).join(', ')}`);
    }
    
    // Timing insights
    const morningFlights = flights.filter(f => {
      const hour = parseInt(f.departure.time.split(':')[0]);
      return hour >= 6 && hour < 12;
    });
    
    const afternoonFlights = flights.filter(f => {
      const hour = parseInt(f.departure.time.split(':')[0]);
      return hour >= 12 && hour < 18;
    });
    
    const eveningFlights = flights.filter(f => {
      const hour = parseInt(f.departure.time.split(':')[0]);
      return hour >= 18 || hour < 6;
    });
    
    if (morningFlights.length > 0) {
      const morningAvg = morningFlights.reduce((sum, f) => sum + f.price, 0) / morningFlights.length;
      insights.push(`🌅 Morning flights (6AM-12PM): ${morningFlights.length} options, avg ${morningAvg.toFixed(0)}`);
    }
    
    return insights;
  }

  private generateFlightRecommendations(flights: FlightResult[], context: FlightSearchContext): string[] {
    const recommendations = [];
    
    if (flights.length === 0) {
      recommendations.push("🔍 Try searching for nearby airports or adjusting your travel dates");
      recommendations.push("📅 Consider flying on weekdays (Tuesday-Thursday) for better prices");
      recommendations.push("🕐 Book flights 2-8 weeks in advance for domestic, 3-10 weeks for international");
      return recommendations;
    }

    const bestValue = this.findBestValueFlight(flights);
    const cheapest = this.findCheapestFlight(flights);
    const fastest = this.findFastestFlight(flights);
    
    if (bestValue) {
      recommendations.push(`⭐ Best value: ${bestValue.airline} flight for ${bestValue.price.toFixed(0)} (${bestValue.stops === 0 ? 'direct' : bestValue.stops + ' stop(s)'})`);
    }
    
    if (cheapest && cheapest.id !== bestValue?.id) {
      recommendations.push(`💵 Cheapest option: ${cheapest.airline} for ${cheapest.price.toFixed(0)}`);
    }
    
    if (fastest && fastest.id !== bestValue?.id && fastest.id !== cheapest?.id) {
      recommendations.push(`⚡ Fastest option: ${fastest.airline} (${fastest.duration})`);
    }
    
    // Budget-based recommendations
    if (context.budget === 'budget') {
      const budgetFlights = flights.filter(f => f.stops >= 1).sort((a, b) => a.price - b.price);
      if (budgetFlights.length > 0) {
        recommendations.push("💡 Consider flights with stops to save money");
      }
    } else if (context.budget === 'premium') {
      const premiumFlights = flights.filter(f => f.cabinClass !== 'economy' || f.stops === 0);
      if (premiumFlights.length > 0) {
        recommendations.push("✨ Direct flights and premium cabins available for enhanced comfort");
      }
    }
    
    // Timing recommendations
    const departureHour = parseInt(context.departureDate?.split('T')[1]?.split(':')[0] || '12');
    if (departureHour < 6 || departureHour > 22) {
      recommendations.push("🕐 Consider mid-day flights (10AM-4PM) for better prices and convenience");
    }
    
    // Flexibility recommendations
    if (context.flexibility === 'exact') {
      recommendations.push("📅 Enable flexible dates to see up to 30% savings on alternative travel days");
    }
    
    return recommendations;
  }

  private analyzeAirlines(flights: FlightResult[]): Array<{
    airline: string;
    count: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
  }> {
    const airlineMap = new Map<string, FlightResult[]>();
    
    flights.forEach(flight => {
      if (!airlineMap.has(flight.airline)) {
        airlineMap.set(flight.airline, []);
      }
      airlineMap.get(flight.airline)!.push(flight);
    });
    
    const airlineStats = Array.from(airlineMap.entries()).map(([airline, airlineFlights]) => {
      const prices = airlineFlights.map(f => f.price);
      return {
        airline,
        count: airlineFlights.length,
        avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices)
      };
    });
    
    return airlineStats.sort((a, b) => b.count - a.count);
  }

  private findBestValueFlight(flights: FlightResult[]): FlightResult | null {
    if (flights.length === 0) return null;
    
    // Calculate value score (lower is better): price + (stops * 50) + (duration penalty)
    const flightsWithScore = flights.map(flight => {
      const durationMinutes = this.parseDurationToMinutes(flight.duration);
      const durationPenalty = durationMinutes > 0 ? (durationMinutes - 120) * 0.5 : 0; // Penalty for flights over 2 hours
      const stopsPenalty = flight.stops * 50;
      const score = flight.price + stopsPenalty + Math.max(0, durationPenalty);
      
      return { flight, score };
    });
    
    return flightsWithScore.sort((a, b) => a.score - b.score)[0].flight;
  }

  private findCheapestFlight(flights: FlightResult[]): FlightResult | null {
    if (flights.length === 0) return null;
    return flights.sort((a, b) => a.price - b.price)[0];
  }

  private findFastestFlight(flights: FlightResult[]): FlightResult | null {
    if (flights.length === 0) return null;
    
    return flights.sort((a, b) => {
      const aDuration = this.parseDurationToMinutes(a.duration);
      const bDuration = this.parseDurationToMinutes(b.duration);
      return aDuration - bDuration;
    })[0];
  }

  private parseDurationToMinutes(duration: string): number {
    if (!duration) return 999999; // Default high value for unknown duration
    
    // Parse formats like "2h 30m", "1h", "45m", etc.
    const hoursMatch = duration.match(/(\d+)h/);
    const minutesMatch = duration.match(/(\d+)m/);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return hours * 60 + minutes;
  }
}