import { FunctionDeclaration, Type } from "@google/genai";

interface DuffelConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
}

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  currency?: string;
  maxConnections?: number;
  maxDuration?: string;
  airlines?: string[];
  excludeAirlines?: string[];
}

interface PassengerInfo {
  type: 'adult' | 'child' | 'infant';
  title: string;
  given_name: string;
  family_name: string;
  email?: string;
  phone_number?: string;
  born_on?: string;
  gender?: 'f' | 'm';
  id?: string;
  identity_documents?: Array<{
    type: 'passport' | 'drivers_license' | 'identity_card';
    unique_identifier: string;
    issuing_country_code: string;
    expires_on?: string;
  }>;
}

interface BookingParams {
  offerId: string;
  passengers: PassengerInfo[];
  contactDetails: {
    email: string;
    phone_number: string;
  };
  seatSelections?: Array<{
    passenger_id: string;
    seat_id: string;
  }>;
  services?: string[];
}

interface PaymentParams {
  orderNumber: string;
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'paypal';
    card?: {
      number: string;
      expiry_month: number;
      expiry_year: number;
      cvc: string;
      cardholder_name: string;
    };
    billing_address: {
      line_1: string;
      line_2?: string;
      city: string;
      region: string;
      postal_code: string;
      country_code: string;
    };
  };
  amount: {
    amount: string;
    currency: string;
  };
}

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class DuffelFlightTool implements Tool {
  private config: DuffelConfig;
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(config: DuffelConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.duffel.com';
    this.headers = {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Duffel-Version': config.version || 'v2'
    };
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "flight_booking",
      description: "A comprehensive tool for searching, booking, and managing flights using Duffel API v2. Supports multi-passenger bookings, seat selection, baggage, and payment processing.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform: search_flights, book_flight, pay_for_flight, get_order_status, cancel_flight, get_seat_map, add_baggage, get_airport_info",
            enum: ["search_flights", "book_flight", "pay_for_flight", "get_order_status", "cancel_flight", "get_seat_map", "add_baggage", "get_airport_info"]
          },
          origin: {
            type: Type.STRING,
            description: "Origin airport IATA code (e.g., 'JFK', 'LHR')"
          },
          destination: {
            type: Type.STRING,
            description: "Destination airport IATA code (e.g., 'LAX', 'CDG')"
          },
          departureDate: {
            type: Type.STRING,
            description: "Departure date in YYYY-MM-DD format"
          },
          returnDate: {
            type: Type.STRING,
            description: "Return date in YYYY-MM-DD format (optional)"
          },
          adults: {
            type: Type.NUMBER,
            description: "Number of adult passengers (required, minimum 1)"
          },
          children: {
            type: Type.NUMBER,
            description: "Number of child passengers (optional)"
          },
          infants: {
            type: Type.NUMBER,
            description: "Number of infant passengers (optional)"
          },
          cabinClass: {
            type: Type.STRING,
            description: "Preferred cabin class: economy, premium_economy, business, or first"
          },
          currency: {
            type: Type.STRING,
            description: "Currency code for pricing (e.g., 'USD', 'EUR', 'GBP')"
          },
          maxConnections: {
            type: Type.NUMBER,
            description: "Maximum number of connections (0 for direct flights only)"
          },
          maxDuration: {
            type: Type.STRING,
            description: "Maximum flight duration in ISO 8601 format (e.g., 'PT10H30M')"
          },
          airlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Preferred airline codes to include (e.g., ['AA', 'BA', 'LH'])"
          },
          excludeAirlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Airline codes to exclude from results"
          },
          offerId: {
            type: Type.STRING,
            description: "The offer ID from flight search results (required for booking)"
          },
          passengers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Passenger type: adult, child, or infant" },
                title: { type: Type.STRING, description: "Passenger title (mr, ms, mrs, dr, etc.)" },
                given_name: { type: Type.STRING, description: "First name" },
                family_name: { type: Type.STRING, description: "Last name" },
                email: { type: Type.STRING, description: "Email address" },
                phone_number: { type: Type.STRING, description: "Phone number with country code" },
                born_on: { type: Type.STRING, description: "Date of birth in YYYY-MM-DD format" },
                gender: { type: Type.STRING, description: "Gender: f or m (lowercase)" },
                id: { type: Type.STRING, description: "Unique passenger ID (auto-generated if not provided)" },
                identity_documents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, description: "Document type: passport, drivers_license, identity_card" },
                      unique_identifier: { type: Type.STRING, description: "Document number" },
                      issuing_country_code: { type: Type.STRING, description: "Two-letter country code" },
                      expires_on: { type: Type.STRING, description: "Expiration date YYYY-MM-DD" }
                    }
                  }
                }
              },
              required: ["type", "given_name", "family_name"]
            },
            description: "Array of passenger information (required for booking)"
          },
          contactEmail: {
            type: Type.STRING,
            description: "Primary contact email for the booking"
          },
          contactPhone: {
            type: Type.STRING,
            description: "Primary contact phone number"
          },
          seatSelections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                passenger_id: { type: Type.STRING },
                seat_id: { type: Type.STRING }
              }
            },
            description: "Optional seat selections for passengers"
          },
          services: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Additional services to add (baggage, meals, etc.)"
          },
          orderNumber: {
            type: Type.STRING,
            description: "The order number from booking confirmation"
          },
          paymentMethod: {
            type: Type.STRING,
            description: "Payment method type: card, bank_transfer, or paypal"
          },
          cardNumber: {
            type: Type.STRING,
            description: "Credit card number (required for card payments)"
          },
          expiryMonth: {
            type: Type.NUMBER,
            description: "Card expiry month (1-12)"
          },
          expiryYear: {
            type: Type.NUMBER,
            description: "Card expiry year (YYYY)"
          },
          cvc: {
            type: Type.STRING,
            description: "Card CVC/CVV code"
          },
          cardholderName: {
            type: Type.STRING,
            description: "Name on the card"
          },
          billingAddress: {
            type: Type.OBJECT,
            properties: {
              line_1: { type: Type.STRING },
              line_2: { type: Type.STRING },
              city: { type: Type.STRING },
              region: { type: Type.STRING },
              postal_code: { type: Type.STRING },
              country_code: { type: Type.STRING }
            },
            description: "Billing address information"
          },
          amount: {
            type: Type.STRING,
            description: "Payment amount as string (e.g., '299.99')"
          },
          reason: {
            type: Type.STRING,
            description: "Reason for cancellation (optional)"
          },
          airportCode: {
            type: Type.STRING,
            description: "Airport IATA code for information lookup"
          }
        },
        required: ["action"]
      }
    };
  }

  private validateSearchParams(params: any): void {
    if (!params.origin || !params.destination || !params.departureDate) {
      throw new Error("Missing required search parameters: origin, destination, and departureDate are required");
    }
    
    if (!params.adults || params.adults < 1) {
      throw new Error("At least one adult passenger is required");
    }
    
    if (params.children && params.children < 0) {
      throw new Error("Number of children cannot be negative");
    }
    
    if (params.infants && params.infants < 0) {
      throw new Error("Number of infants cannot be negative");
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(params.departureDate)) {
      throw new Error("Invalid departure date format. Use YYYY-MM-DD");
    }
    
    if (params.returnDate && !dateRegex.test(params.returnDate)) {
      throw new Error("Invalid return date format. Use YYYY-MM-DD");
    }
    
    // Check if return date is after departure date
    if (params.returnDate && new Date(params.returnDate) <= new Date(params.departureDate)) {
      throw new Error("Return date must be after departure date");
    }
  }

  private validateBookingParams(params: any): void {
    if (!params.offerId) {
      throw new Error("Offer ID is required for booking");
    }
    
    if (!params.passengers || !Array.isArray(params.passengers) || params.passengers.length === 0) {
      throw new Error("Passengers array is required and must contain at least one passenger");
    }
    
    // Validate each passenger
    params.passengers.forEach((passenger: any, index: number) => {
      if (!passenger.type || !['adult', 'child', 'infant'].includes(passenger.type)) {
        throw new Error(`Invalid passenger type for passenger ${index + 1}. Must be 'adult', 'child', or 'infant'`);
      }
      
      if (!passenger.given_name || !passenger.family_name) {
        throw new Error(`Missing name for passenger ${index + 1}. Both given_name and family_name are required`);
      }
      
      // Ensure gender is lowercase if provided
      if (passenger.gender && !['f', 'm'].includes(passenger.gender.toLowerCase())) {
        throw new Error(`Invalid gender for passenger ${index + 1}. Must be 'f' or 'm' (lowercase)`);
      }
      
      // Ensure title is lowercase if provided
      if (passenger.title) {
        passenger.title = passenger.title.toLowerCase();
      }
      
      // Generate ID if not provided
      if (!passenger.id) {
        passenger.id = `pas_${Date.now()}_${index}`;
      }
      
      if (passenger.born_on) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(passenger.born_on)) {
          throw new Error(`Invalid birth date format for passenger ${index + 1}. Use YYYY-MM-DD`);
        }
      }
    });
    
    if (!params.contactEmail || !params.contactPhone) {
      throw new Error("Contact email and phone are required for booking");
    }
  }

  async searchFlights(params: any): Promise<any> {
    try {
      this.validateSearchParams(params);
      
      console.log(`✈️  Searching flights: ${params.origin} → ${params.destination}`);
      
      const searchPayload: any = {
        data: {
          slices: [
            {
              origin: params.origin.toUpperCase(),
              destination: params.destination.toUpperCase(),
              departure_date: params.departureDate
            }
          ],
          passengers: [
            ...Array(params.adults || 1).fill({ type: 'adult' }),
            ...Array(params.children || 0).fill({ type: 'child' }),
            ...Array(params.infants || 0).fill({ type: 'infant' })
          ],
          cabin_class: params.cabinClass || 'economy'
        }
      };

      // Add return slice if return date provided
      if (params.returnDate) {
        searchPayload.data.slices.push({
          origin: params.destination.toUpperCase(),
          destination: params.origin.toUpperCase(),
          departure_date: params.returnDate
        });
      }

      // Add additional search parameters
      if (params.maxConnections !== undefined) {
        searchPayload.data.max_connections = params.maxConnections;
      }
      
      if (params.maxDuration) {
        searchPayload.data.max_duration = params.maxDuration;
      }
      
      if (params.airlines && params.airlines.length > 0) {
        searchPayload.data.preferred_airlines = params.airlines.map((code: string) => code.toUpperCase());
      }
      
      if (params.excludeAirlines && params.excludeAirlines.length > 0) {
        searchPayload.data.excluded_airlines = params.excludeAirlines.map((code: string) => code.toUpperCase());
      }

      const response = await fetch(`${this.baseUrl}/air/offer_requests`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(searchPayload)
      });

      const data = await response.json() as { 
        data?: { id: string },
        errors?: Array<{ message: string, code?: string }> 
      };

      if (!response.ok) {
        throw new Error(`API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      const requestId = data.data?.id;
      
      // Get offers from the request
      const offersResponse = await fetch(`${this.baseUrl}/air/offers?offer_request_id=${requestId}`, {
        method: 'GET',
        headers: this.headers
      });

      const offersData = await offersResponse.json() as { 
        errors?: Array<{ message: string, code?: string }>,
        data?: any[]
      };

      if (!offersResponse.ok) {
        throw new Error(`Offers API Error: ${offersData.errors?.[0]?.message || offersResponse.statusText}`);
      }

      const processedOffers = offersData.data?.map((offer: any) => ({
        id: offer.id,
        total_amount: offer.total_amount,
        total_currency: offer.total_currency,
        tax_amount: offer.tax_amount,
        base_amount: offer.base_amount,
        expires_at: offer.expires_at,
        owner: offer.owner,
        slices: offer.slices?.map((slice: any) => ({
          id: slice.id,
          origin: slice.origin,
          destination: slice.destination,
          departure_datetime: slice.departure_datetime,
          arrival_datetime: slice.arrival_datetime,
          duration: slice.duration,
          segments: slice.segments?.map((segment: any) => ({
            id: segment.id,
            aircraft: segment.aircraft,
            airline: segment.marketing_carrier,
            flight_number: segment.marketing_carrier_flight_number,
            origin: segment.origin,
            destination: segment.destination,
            departure_datetime: segment.departure_datetime,
            arrival_datetime: segment.arrival_datetime,
            duration: segment.duration
          }))
        })),
        passenger_breakdown: offer.passengers
      })) || [];

      return {
        success: true,
        search_query: {
          origin: params.origin,
          destination: params.destination,
          departure_date: params.departureDate,
          return_date: params.returnDate,
          passengers: params.adults + (params.children || 0) + (params.infants || 0)
        },
        offers: processedOffers,
        offers_count: processedOffers.length,
        search_time: new Date().toISOString(),
        currency: params.currency || 'USD',
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Flight search failed:", error);
      return {
        success: false,
        error: `Flight search failed: ${error instanceof Error ? error.message : String(error)}`,
        search_query: params,
        api_version: 'v2'
      };
    }
  }

  async bookFlight(params: any): Promise<any> {
    try {
      this.validateBookingParams(params);
      
      console.log(`📝 Booking flight with offer ID: ${params.offerId}`);

      // Ensure passengers is properly structured with all required fields
      const passengers = Array.isArray(params.passengers) ? params.passengers.map((passenger: any, index: number) => {
        // Clean and format passenger data according to Duffel API requirements
        const cleanPassenger: any = {
          type: passenger.type,
          title: (passenger.title || '').toLowerCase(), // Duffel expects lowercase titles
          given_name: passenger.given_name,
          family_name: passenger.family_name,
          id: passenger.id || `pas_${Date.now()}_${index}` // Generate ID if not provided
        };

        // Add optional fields only if they exist and are valid
        if (passenger.born_on) {
          cleanPassenger.born_on = passenger.born_on;
        }
        
        if (passenger.gender) {
          cleanPassenger.gender = passenger.gender.toLowerCase(); // Duffel expects lowercase 'f' or 'm'
        }
        
        if (passenger.email) {
          cleanPassenger.email = passenger.email;
        }
        
        if (passenger.phone_number) {
          cleanPassenger.phone_number = passenger.phone_number;
        }

        // Add identity documents if provided
        if (passenger.identity_documents && Array.isArray(passenger.identity_documents)) {
          cleanPassenger.identity_documents = passenger.identity_documents;
        }

        return cleanPassenger;
      }) : [];
      
      if (passengers.length === 0) {
        throw new Error("At least one passenger is required for booking");
      }

      const bookingPayload: any = {
        data: {
          selected_offers: [params.offerId],
          passengers: passengers,
          type: 'instant'
        }
      };

      // Add metadata if contact details provided
      if (params.contactEmail || params.contactPhone) {
        bookingPayload.data.metadata = {
          booking_reference: `BK-${Date.now()}`,
          ...(params.contactEmail && { contact_email: params.contactEmail }),
          ...(params.contactPhone && { contact_phone: params.contactPhone })
        };
      }

      // Add seat selections if provided
      if (params.seatSelections && Array.isArray(params.seatSelections)) {
        bookingPayload.data.seat_selections = params.seatSelections;
      }

      // Add services if provided
      if (params.services && Array.isArray(params.services)) {
        bookingPayload.data.services = params.services.map((serviceId: string) => ({
          id: serviceId,
          quantity: 1
        }));
      }

      const response = await fetch(`${this.baseUrl}/air/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json() as { 
        data?: { 
          id: string;
          booking_reference: string;
          type: string;
          total_amount: string;
          total_currency: string;
          passengers: any[];
          slices: any[];
          created_at: string;
          payment_status?: any;
        };
        errors?: Array<{ message: string, code?: string, details?: any }>;
      };

      if (!response.ok) {
        const errorMessage = data.errors?.[0]?.message || response.statusText;
        const errorDetails = data.errors?.[0]?.details || {};
        throw new Error(`Booking API Error: ${errorMessage}${errorDetails ? ` - Details: ${JSON.stringify(errorDetails)}` : ''}`);
      }

      return {
        success: true,
        order: {
          id: data.data?.id,
          reference: data.data?.booking_reference,
          type: data.data?.type,
          total_amount: data.data?.total_amount,
          total_currency: data.data?.total_currency,
          passengers: data.data?.passengers,
          slices: data.data?.slices,
          created_at: data.data?.created_at,
          payment_status: data.data?.payment_status
        },
        booking_time: new Date().toISOString(),
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Flight booking failed:", error);
      return {
        success: false,
        error: `Flight booking failed: ${error instanceof Error ? error.message : String(error)}`,
        offer_id: params.offerId,
        api_version: 'v2'
      };
    }
  }

  async processPayment(params: any): Promise<any> {
    try {
      if (!params.orderNumber) {
        throw new Error("Order number is required for payment");
      }
      
      if (!params.paymentMethod) {
        throw new Error("Payment method is required");
      }
      
      if (!params.amount || !params.currency) {
        throw new Error("Payment amount and currency are required");
      }

      console.log(`💳 Processing payment for order: ${params.orderNumber}`);

      const paymentPayload = {
        data: {
          amount: {
            amount: params.amount,
            currency: params.currency
          },
          payment_method: {
            type: params.paymentMethod,
            ...(params.paymentMethod === 'card' && {
              card: {
                number: params.cardNumber,
                expiry_month: params.expiryMonth,
                expiry_year: params.expiryYear,
                cvc: params.cvc,
                cardholder_name: params.cardholderName
              }
            }),
            billing_address: params.billingAddress
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/payments/payment_intents`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(paymentPayload)
      });

      const data = await response.json() as {
        data?: {
          id: string;
          status: string;
          amount: string;
          currency: string;
          confirmation_number: string;
          client_secret: string;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Payment API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        payment: {
          id: data.data?.id,
          status: data.data?.status,
          amount: data.data?.amount,
          currency: data.data?.currency,
          confirmation_number: data.data?.confirmation_number,
          client_secret: data.data?.client_secret
        },
        payment_time: new Date().toISOString(),
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Payment processing failed:", error);
      return {
        success: false,
        error: `Payment processing failed: ${error instanceof Error ? error.message : String(error)}`,
        order_number: params.orderNumber,
        api_version: 'v2'
      };
    }
  }

  async getOrderStatus(params: any): Promise<any> {
    try {
      if (!params.orderNumber) {
        throw new Error("Order number is required");
      }

      console.log(`🔍 Checking order status: ${params.orderNumber}`);

      const response = await fetch(`${this.baseUrl}/air/orders/${params.orderNumber}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json() as {
        data?: {
          id: string;
          booking_reference: string;
          type: string;
          total_amount: string;
          total_currency: string;
          passengers: any[];
          documents: any[];
          created_at: string;
          synced_at: string;
          payment_status?: any;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Order Status API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        order: {
          id: data.data?.id,
          reference: data.data?.booking_reference,
          type: data.data?.type,
          total_amount: data.data?.total_amount,
          total_currency: data.data?.total_currency,
          passengers: data.data?.passengers,
          documents: data.data?.documents,
          created_at: data.data?.created_at,
          synced_at: data.data?.synced_at,
          payment_status: data.data?.payment_status
        },
        check_time: new Date().toISOString(),
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Order status check failed:", error);
      return {
        success: false,
        error: `Order status check failed: ${error instanceof Error ? error.message : String(error)}`,
        order_number: params.orderNumber,
        api_version: 'v2'
      };
    }
  }

  async cancelFlight(params: any): Promise<any> {
    try {
      if (!params.orderNumber) {
        throw new Error("Order number is required for cancellation");
      }

      console.log(`❌ Cancelling flight order: ${params.orderNumber}`);

      const cancelPayload = {
        data: {
          reason: params.reason || 'Customer requested cancellation'
        }
      };

      const response = await fetch(`${this.baseUrl}/air/orders/${params.orderNumber}/actions/cancel`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(cancelPayload)
      });

      const data = await response.json() as {
        data?: {
          id: string;
          order_id: string;
          refund_amount: string;
          refund_currency: string;
          expires_at: string;
          created_at: string;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Cancellation API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        cancellation: {
          id: data.data?.id,
          order_id: data.data?.order_id,
          refund_amount: data.data?.refund_amount,
          refund_currency: data.data?.refund_currency,
          expires_at: data.data?.expires_at,
          created_at: data.data?.created_at
        },
        cancellation_time: new Date().toISOString(),
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Flight cancellation failed:", error);
      return {
        success: false,
        error: `Flight cancellation failed: ${error instanceof Error ? error.message : String(error)}`,
        order_number: params.orderNumber,
        api_version: 'v2'
      };
    }
  }

  async getSeatMap(params: any): Promise<any> {
    try {
      if (!params.offerId) {
        throw new Error("Offer ID is required for seat map");
      }

      console.log(`🪑 Getting seat map for offer: ${params.offerId}`);

      // Correct endpoint for getting seat maps from offers
      const response = await fetch(`${this.baseUrl}/air/seat_maps?offer_id=${params.offerId}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json() as {
        data?: any[];
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Seat Map API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        seat_maps: data.data || [],
        offer_id: params.offerId,
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Seat map retrieval failed:", error);
      return {
        success: false,
        error: `Seat map retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        offer_id: params.offerId,
        api_version: 'v2'
      };
    }
  }

  async addBaggage(params: any): Promise<any> {
    try {
      if (!params.orderNumber) {
        throw new Error("Order number is required for baggage addition");
      }

      console.log(`🧳 Adding baggage to order: ${params.orderNumber}`);

      // First get available services for the order
      const servicesResponse = await fetch(`${this.baseUrl}/air/orders/${params.orderNumber}/available_services`, {
        method: 'GET',
        headers: this.headers
      });

      const servicesData = await servicesResponse.json() as {
        data?: any[];
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!servicesResponse.ok) {
        throw new Error(`Available Services API Error: ${servicesData.errors?.[0]?.message || servicesResponse.statusText}`);
      }

      // Find baggage services
      const baggageServices = servicesData.data?.filter((service: any) => service.type === 'baggage') || [];

      if (baggageServices.length === 0) {
        return {
          success: false,
          error: 'No baggage services available for this order',
          order_number: params.orderNumber,
          api_version: 'v2'
        };
      }

      // Add the first available baggage service (you might want to make this configurable)
      const selectedService = baggageServices[0];
      const servicePayload = {
        data: {
          services: [{
            id: selectedService.id,
            quantity: params.quantity || 1
          }]
        }
      };

      const response = await fetch(`${this.baseUrl}/air/orders/${params.orderNumber}/services`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(servicePayload)
      });

      const data = await response.json() as {
        data?: any;
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Baggage API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        service: data.data,
        available_services: baggageServices,
        order_number: params.orderNumber,
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Baggage addition failed:", error);
      return {
        success: false,
        error: `Baggage addition failed: ${error instanceof Error ? error.message : String(error)}`,
        order_number: params.orderNumber,
        api_version: 'v2'
      };
    }
  }

  async getAirportInfo(params: any): Promise<any> {
    try {
      if (!params.airportCode) {
        throw new Error("Airport code is required");
      }

      console.log(`🏢 Getting airport info for: ${params.airportCode}`);

      const response = await fetch(`${this.baseUrl}/air/airports?iata_code=${params.airportCode.toUpperCase()}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json() as {
        data?: any[];
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Airport API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      const airport = data.data?.find((apt: any) => apt.iata_code === params.airportCode.toUpperCase());

      return {
        success: true,
        airport: airport || null,
        airport_code: params.airportCode.toUpperCase(),
        api_version: 'v2'
      };

    } catch (error: unknown) {
      console.error("❌ Airport info retrieval failed:", error);
      return {
        success: false,
        error: `Airport info retrieval failed: ${error instanceof Error ? error.message : String(error)}`,
        airport_code: params.airportCode,
        api_version: 'v2'
      };
    }
  }

  async execute(args: any): Promise<any> {
    try {
      switch (args.action) {
        case 'search_flights':
          return await this.searchFlights(args);
        case 'book_flight':
          return await this.bookFlight(args);
        case 'pay_for_flight':
          return await this.processPayment(args);
        case 'get_order_status':
          return await this.getOrderStatus(args);
        case 'cancel_flight':
          return await this.cancelFlight(args);
        case 'get_seat_map':
          return await this.getSeatMap(args);
        case 'add_baggage':
          return await this.addBaggage(args);
        case 'get_airport_info':
          return await this.getAirportInfo(args);
        default:
          throw new Error(`Unknown action: ${args.action}`);
      }
    } catch (error: unknown) {
      console.error(`❌ Action ${args.action} failed:`, error);
      return {
        success: false,
        error: `Action ${args.action} failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action,
        api_version: 'v2'
      };
    }
  }
}