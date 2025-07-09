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

interface BookingParams {
  offerId: string;
  passengers: Array<{
    type: 'adult' | 'child' | 'infant';
    title: string;
    given_name: string;
    family_name: string;
    email?: string;
    phone_number?: string;
    born_on?: string;
    gender?: 'M' | 'F';
    passport?: {
      number: string;
      issuing_country_code: string;
      expires_on: string;
    };
  }>;
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
      'Duffel-Version': config.version || 'v2' // Updated to v2 as default
    };
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "flight_booking",
      description: "A tool for searching and booking flights using Duffel API v2",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform: search_flights, book_flight, pay_for_flight, get_order_status, cancel_flight",
            enum: ["search_flights", "book_flight", "pay_for_flight", "get_order_status", "cancel_flight"]
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
          passengers: {
            type: Type.OBJECT,
            description: "Passenger information",
            properties: {
              adults: { type: Type.NUMBER },
              children: { type: Type.NUMBER },
              infants: { type: Type.NUMBER }
            }
          }
        },
        required: ["action"]
      }
    };
  }

  private getSearchDefinition(): FunctionDeclaration {
    return {
      name: "search_flights",
      description: "Search for flights using Duffel API v2. Returns available flight offers with pricing, schedules, and airline information.",
      parameters: {
        type: Type.OBJECT,
        properties: {
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
            description: "Return date in YYYY-MM-DD format (optional for one-way trips)"
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
          }
        },
        required: ["origin", "destination", "departureDate", "adults"]
      }
    };
  }

  getBookingDefinition(): FunctionDeclaration {
    return {
      name: "book_flight",
      description: "Book a flight using a Duffel offer ID. Creates an order that can be paid for.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          offerId: {
            type: Type.STRING,
            description: "The offer ID from flight search results"
          },
          passengers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Passenger type: adult, child, or infant"
                },
                title: {
                  type: Type.STRING,
                  description: "Passenger title (Mr, Ms, Mrs, Dr, etc.)"
                },
                given_name: {
                  type: Type.STRING,
                  description: "First name"
                },
                family_name: {
                  type: Type.STRING,
                  description: "Last name"
                },
                email: {
                  type: Type.STRING,
                  description: "Email address"
                },
                phone_number: {
                  type: Type.STRING,
                  description: "Phone number with country code (e.g., +1234567890)"
                },
                born_on: {
                  type: Type.STRING,
                  description: "Date of birth in YYYY-MM-DD format"
                },
                gender: {
                  type: Type.STRING,
                  description: "Gender: M or F"
                },
                passport: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.STRING },
                    issuing_country_code: { type: Type.STRING },
                    expires_on: { type: Type.STRING }
                  }
                }
              },
              required: ["type", "given_name", "family_name"]
            },
            description: "Array of passenger information"
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
          }
        },
        required: ["offerId", "passengers", "contactEmail", "contactPhone"]
      }
    };
  }

  getPaymentDefinition(): FunctionDeclaration {
    return {
      name: "pay_for_flight",
      description: "Process payment for a booked flight order using Duffel Payments API.",
      parameters: {
        type: Type.OBJECT,
        properties: {
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
            required: ["line_1", "city", "region", "postal_code", "country_code"],
            description: "Billing address information"
          },
          amount: {
            type: Type.STRING,
            description: "Payment amount as string (e.g., '299.99')"
          },
          currency: {
            type: Type.STRING,
            description: "Currency code (e.g., 'USD', 'EUR')"
          }
        },
        required: ["orderNumber", "paymentMethod", "amount", "currency"]
      }
    };
  }

  getOrderStatusDefinition(): FunctionDeclaration {
    return {
      name: "get_order_status",
      description: "Get the current status and details of a flight order.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          orderNumber: {
            type: Type.STRING,
            description: "The order number to check status for"
          }
        },
        required: ["orderNumber"]
      }
    };
  }

  getCancellationDefinition(): FunctionDeclaration {
    return {
      name: "cancel_flight",
      description: "Cancel a flight booking and get refund information.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          orderNumber: {
            type: Type.STRING,
            description: "The order number to cancel"
          },
          reason: {
            type: Type.STRING,
            description: "Reason for cancellation (optional)"
          }
        },
        required: ["orderNumber"]
      }
    };
  }

  async searchFlights(params: any): Promise<any> {
    try {
      console.log(`✈️  Searching flights: ${params.origin} → ${params.destination}`);
      
      const searchPayload = {
        data: {
          slices: [
            {
              origin: params.origin,
              destination: params.destination,
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
          origin: params.destination,
          destination: params.origin,
          departure_date: params.returnDate
        });
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
      console.log(`📝 Booking flight with offer ID: ${params.offerId}`);

      const bookingPayload = {
        data: {
          selected_offers: [params.offerId],
          passengers: params.passengers,
          type: 'instant',
          metadata: {
            booking_reference: `BK-${Date.now()}`
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/air/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json() as { 
        data: { 
          id: string;
          booking_reference: string;
          status: string;
          total_amount: string;
          total_currency: string;
          passengers: any[];
          slices: any[];
          created_at: string;
          expires_at: string;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Booking API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        order: {
          id: data.data.id,
          reference: data.data.booking_reference,
          status: data.data.status,
          total_amount: data.data.total_amount,
          total_currency: data.data.total_currency,
          passengers: data.data.passengers,
          slices: data.data.slices,
          created_at: data.data.created_at,
          expires_at: data.data.expires_at
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
        data: {
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
          id: data.data.id,
          status: data.data.status,
          amount: data.data.amount,
          currency: data.data.currency,
          confirmation_number: data.data.confirmation_number,
          client_secret: data.data.client_secret
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
      console.log(`🔍 Checking order status: ${params.orderNumber}`);

      const response = await fetch(`${this.baseUrl}/air/orders/${params.orderNumber}`, {
        method: 'GET',
        headers: this.headers
      });

      const data = await response.json() as {
        data: {
          id: string;
          booking_reference: string;
          status: string;
          total_amount: string;
          total_currency: string;
          passengers: any[];
          documents: any[];
          created_at: string;
          updated_at: string;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Order Status API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        order: {
          id: data.data.id,
          reference: data.data.booking_reference,
          status: data.data.status,
          total_amount: data.data.total_amount,
          total_currency: data.data.total_currency,
          passengers: data.data.passengers,
          documents: data.data.documents,
          created_at: data.data.created_at,
          updated_at: data.data.updated_at
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
        data: {
          id: string;
          status: string;
          refund_amount: string;
          refund_currency: string;
          penalty_amount: string;
          expires_at: string;
        };
        errors?: Array<{ message: string, code?: string }>;
      };

      if (!response.ok) {
        throw new Error(`Cancellation API Error: ${data.errors?.[0]?.message || response.statusText}`);
      }

      return {
        success: true,
        cancellation: {
          id: data.data.id,
          status: data.data.status,
          refund_amount: data.data.refund_amount,
          refund_currency: data.data.refund_currency,
          penalty_amount: data.data.penalty_amount,
          expires_at: data.data.expires_at
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

  // Utility method to get all function definitions
  getAllDefinitions(): FunctionDeclaration[] {
    return [
      this.getSearchDefinition(),
      this.getBookingDefinition(),
      this.getPaymentDefinition(),
      this.getOrderStatusDefinition(),
      this.getCancellationDefinition()
    ];
  }

  async execute(args: any): Promise<any> {
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
      default:
        throw new Error(`Unknown action: ${args.action}`);
    }
  }
}

// Usage example:
/*
const duffelTool = new DuffelFlightTool({
  apiKey: 'your_duffel_api_key_here',
  version: 'v2' // Now using v2 by default
});

// Search for flights
const searchResult = await duffelTool.execute({
  action: 'search_flights',
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2025-07-15',
  returnDate: '2025-07-22',
  adults: 1,
  cabinClass: 'economy',
  currency: 'USD'
});

// Book a flight
const bookingResult = await duffelTool.execute({
  action: 'book_flight',
  offerId: 'offer_12345',
  passengers: [{
    type: 'adult',
    title: 'Mr',
    given_name: 'John',
    family_name: 'Doe',
    email: 'john.doe@example.com',
    phone_number: '+1234567890',
    born_on: '1990-01-01',
    gender: 'M'
  }],
  contactEmail: 'john.doe@example.com',
  contactPhone: '+1234567890'
});

// Process payment
const paymentResult = await duffelTool.execute({
  action: 'pay_for_flight',
  orderNumber: 'order_67890',
  paymentMethod: 'card',
  cardNumber: '4111 1111 1111 1111',
  expiryMonth: 12,
  expiryYear: 2025,
  cvc: '123',
  cardholderName: 'John Doe',
  billingAddress: {
    line_1: '123 Main St',
    city: 'New York',
    region: 'NY',
    postal_code: '10001',
    country_code: 'US'
  },
  amount: '299.99',
  currency: 'USD'
});
*/
