import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class StripeManagementTool implements Tool {
  private apiClient: AxiosInstance;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(apiKey: string) {
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "stripe_management",
      description: "A comprehensive tool for managing Stripe payments, products, customers, subscriptions, and more",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_customer", "get_customer", "update_customer", "delete_customer", "list_customers",
              "create_product", "get_product", "update_product", "delete_product", "list_products",
              "create_price", "get_price", "update_price", "list_prices",
              "create_payment_intent", "confirm_payment_intent", "capture_payment_intent", "cancel_payment_intent",
              "create_subscription", "get_subscription", "update_subscription", "cancel_subscription", "list_subscriptions",
              "create_invoice", "get_invoice", "pay_invoice", "void_invoice", "finalize_invoice", "list_invoices",
              "create_webhook", "get_webhook", "update_webhook", "delete_webhook", "list_webhooks",
              "create_coupon", "get_coupon", "update_coupon", "delete_coupon", "list_coupons",
              "create_refund", "get_refund", "update_refund", "list_refunds",
              "create_transfer", "get_transfer", "update_transfer", "list_transfers",
              "create_payout", "get_payout", "update_payout", "list_payouts",
              "get_balance", "get_balance_transactions", "create_charge", "get_charge", "list_charges",
              "create_payment_method", "get_payment_method", "attach_payment_method", "detach_payment_method",
              "get_account", "update_account", "create_account_link", "get_tax_rates", "create_tax_rate"
            ]
          },
          // Customer fields
          customerId: {
            type: Type.STRING,
            description: "Customer ID for customer-related operations"
          },
          email: {
            type: Type.STRING,
            description: "Customer email address"
          },
          name: {
            type: Type.STRING,
            description: "Customer or product name"
          },
          phone: {
            type: Type.STRING,
            description: "Customer phone number"
          },
          // Product fields
          productId: {
            type: Type.STRING,
            description: "Product ID for product-related operations"
          },
          description: {
            type: Type.STRING,
            description: "Description for products, invoices, etc."
          },
          // Price fields
          priceId: {
            type: Type.STRING,
            description: "Price ID for price-related operations"
          },
          amount: {
            type: Type.NUMBER,
            description: "Amount in cents"
          },
          currency: {
            type: Type.STRING,
            description: "Currency code (e.g., 'usd', 'eur')"
          },
          // Payment fields
          paymentIntentId: {
            type: Type.STRING,
            description: "Payment Intent ID"
          },
          paymentMethodId: {
            type: Type.STRING,
            description: "Payment Method ID"
          },
          // Subscription fields
          subscriptionId: {
            type: Type.STRING,
            description: "Subscription ID"
          },
          // Invoice fields
          invoiceId: {
            type: Type.STRING,
            description: "Invoice ID"
          },
          // Webhook fields
          webhookId: {
            type: Type.STRING,
            description: "Webhook endpoint ID"
          },
          url: {
            type: Type.STRING,
            description: "Webhook URL or other URLs"
          },
          // Other fields
          metadata: {
            type: Type.OBJECT,
            description: "Metadata object for various operations"
          },
          limit: {
            type: Type.NUMBER,
            description: "Limit for list operations"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const startTime = Date.now();
      console.log(`🚀 Executing Stripe action: ${args.action}`);

      let result: any;

      switch (args.action) {
        // Customer operations
        case 'create_customer':
          result = await this.createCustomer(args);
          break;
        case 'get_customer':
          result = await this.getCustomer(args.customerId);
          break;
        case 'update_customer':
          result = await this.updateCustomer(args);
          break;
        case 'delete_customer':
          result = await this.deleteCustomer(args.customerId);
          break;
        case 'list_customers':
          result = await this.listCustomers(args);
          break;

        // Product operations
        case 'create_product':
          result = await this.createProduct(args);
          break;
        case 'get_product':
          result = await this.getProduct(args.productId);
          break;
        case 'update_product':
          result = await this.updateProduct(args);
          break;
        case 'delete_product':
          result = await this.deleteProduct(args.productId);
          break;
        case 'list_products':
          result = await this.listProducts(args);
          break;

        // Price operations
        case 'create_price':
          result = await this.createPrice(args);
          break;
        case 'get_price':
          result = await this.getPrice(args.priceId);
          break;
        case 'update_price':
          result = await this.updatePrice(args);
          break;
        case 'list_prices':
          result = await this.listPrices(args);
          break;

        // Payment Intent operations
        case 'create_payment_intent':
          result = await this.createPaymentIntent(args);
          break;
        case 'confirm_payment_intent':
          result = await this.confirmPaymentIntent(args);
          break;
        case 'capture_payment_intent':
          result = await this.capturePaymentIntent(args);
          break;
        case 'cancel_payment_intent':
          result = await this.cancelPaymentIntent(args);
          break;

        // Subscription operations
        case 'create_subscription':
          result = await this.createSubscription(args);
          break;
        case 'get_subscription':
          result = await this.getSubscription(args.subscriptionId);
          break;
        case 'update_subscription':
          result = await this.updateSubscription(args);
          break;
        case 'cancel_subscription':
          result = await this.cancelSubscription(args);
          break;
        case 'list_subscriptions':
          result = await this.listSubscriptions(args);
          break;

        // Invoice operations
        case 'create_invoice':
          result = await this.createInvoice(args);
          break;
        case 'get_invoice':
          result = await this.getInvoice(args.invoiceId);
          break;
        case 'pay_invoice':
          result = await this.payInvoice(args.invoiceId);
          break;
        case 'void_invoice':
          result = await this.voidInvoice(args.invoiceId);
          break;
        case 'finalize_invoice':
          result = await this.finalizeInvoice(args.invoiceId);
          break;
        case 'list_invoices':
          result = await this.listInvoices(args);
          break;

        // Webhook operations
        case 'create_webhook':
          result = await this.createWebhook(args);
          break;
        case 'get_webhook':
          result = await this.getWebhook(args.webhookId);
          break;
        case 'update_webhook':
          result = await this.updateWebhook(args);
          break;
        case 'delete_webhook':
          result = await this.deleteWebhook(args.webhookId);
          break;
        case 'list_webhooks':
          result = await this.listWebhooks(args);
          break;

        // Coupon operations
        case 'create_coupon':
          result = await this.createCoupon(args);
          break;
        case 'get_coupon':
          result = await this.getCoupon(args.couponId);
          break;
        case 'update_coupon':
          result = await this.updateCoupon(args);
          break;
        case 'delete_coupon':
          result = await this.deleteCoupon(args.couponId);
          break;
        case 'list_coupons':
          result = await this.listCoupons(args);
          break;

        // Refund operations
        case 'create_refund':
          result = await this.createRefund(args);
          break;
        case 'get_refund':
          result = await this.getRefund(args.refundId);
          break;
        case 'update_refund':
          result = await this.updateRefund(args);
          break;
        case 'list_refunds':
          result = await this.listRefunds(args);
          break;

        // Transfer operations
        case 'create_transfer':
          result = await this.createTransfer(args);
          break;
        case 'get_transfer':
          result = await this.getTransfer(args.transferId);
          break;
        case 'update_transfer':
          result = await this.updateTransfer(args);
          break;
        case 'list_transfers':
          result = await this.listTransfers(args);
          break;

        // Payout operations
        case 'create_payout':
          result = await this.createPayout(args);
          break;
        case 'get_payout':
          result = await this.getPayout(args.payoutId);
          break;
        case 'update_payout':
          result = await this.updatePayout(args);
          break;
        case 'list_payouts':
          result = await this.listPayouts(args);
          break;

        // Balance and charges
        case 'get_balance':
          result = await this.getBalance();
          break;
        case 'get_balance_transactions':
          result = await this.getBalanceTransactions(args);
          break;
        case 'create_charge':
          result = await this.createCharge(args);
          break;
        case 'get_charge':
          result = await this.getCharge(args.chargeId);
          break;
        case 'list_charges':
          result = await this.listCharges(args);
          break;

        // Payment Method operations
        case 'create_payment_method':
          result = await this.createPaymentMethod(args);
          break;
        case 'get_payment_method':
          result = await this.getPaymentMethod(args.paymentMethodId);
          break;
        case 'attach_payment_method':
          result = await this.attachPaymentMethod(args);
          break;
        case 'detach_payment_method':
          result = await this.detachPaymentMethod(args);
          break;

        // Account operations
        case 'get_account':
          result = await this.getAccount(args.accountId);
          break;
        case 'update_account':
          result = await this.updateAccount(args);
          break;
        case 'create_account_link':
          result = await this.createAccountLink(args);
          break;

        // Tax operations
        case 'get_tax_rates':
          result = await this.getTaxRates(args);
          break;
        case 'create_tax_rate':
          result = await this.createTaxRate(args);
          break;

        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`,
            availableActions: [
              'create_customer', 'get_customer', 'update_customer', 'delete_customer', 'list_customers',
              'create_product', 'get_product', 'update_product', 'delete_product', 'list_products',
              'create_price', 'get_price', 'update_price', 'list_prices',
              'create_payment_intent', 'confirm_payment_intent', 'capture_payment_intent', 'cancel_payment_intent',
              'create_subscription', 'get_subscription', 'update_subscription', 'cancel_subscription', 'list_subscriptions',
              'create_invoice', 'get_invoice', 'pay_invoice', 'void_invoice', 'finalize_invoice', 'list_invoices',
              'create_webhook', 'get_webhook', 'update_webhook', 'delete_webhook', 'list_webhooks',
              'create_coupon', 'get_coupon', 'update_coupon', 'delete_coupon', 'list_coupons',
              'create_refund', 'get_refund', 'update_refund', 'list_refunds',
              'create_transfer', 'get_transfer', 'update_transfer', 'list_transfers',
              'create_payout', 'get_payout', 'update_payout', 'list_payouts',
              'get_balance', 'get_balance_transactions', 'create_charge', 'get_charge', 'list_charges',
              'create_payment_method', 'get_payment_method', 'attach_payment_method', 'detach_payment_method',
              'get_account', 'update_account', 'create_account_link', 'get_tax_rates', 'create_tax_rate'
            ]
          };
      }

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        action: args.action,
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        data: result
      };

    } catch (error: any) {
      console.error("❌ Stripe operation failed:", error);
      return {
        success: false,
        error: `Stripe operation failed: ${error.response?.data?.error?.message || error.message}`,
        action: args.action,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString(),
        errorCode: error.response?.data?.error?.code,
        errorType: error.response?.data?.error?.type
      };
    }
  }

  // Helper method to convert object to URL-encoded form data
  private toFormData(obj: any): string {
    const formData = new URLSearchParams();
    
    const addToFormData = (key: string, value: any) => {
      if (value === null || value === undefined) return;
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        Object.keys(value).forEach(subKey => {
          addToFormData(`${key}[${subKey}]`, value[subKey]);
        });
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          addToFormData(`${key}[${index}]`, item);
        });
      } else {
        formData.append(key, value.toString());
      }
    };

    Object.keys(obj).forEach(key => {
      addToFormData(key, obj[key]);
    });

    return formData.toString();
  }

  // Customer operations
  private async createCustomer(args: any): Promise<any> {
    const data: any = {};
    if (args.email) data.email = args.email;
    if (args.name) data.name = args.name;
    if (args.phone) data.phone = args.phone;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/customers', this.toFormData(data));
    return response.data;
  }

  private async getCustomer(customerId: string): Promise<any> {
    const response = await this.apiClient.get(`/customers/${customerId}`);
    return response.data;
  }

  private async updateCustomer(args: any): Promise<any> {
    const data: any = {};
    if (args.email) data.email = args.email;
    if (args.name) data.name = args.name;
    if (args.phone) data.phone = args.phone;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/customers/${args.customerId}`, this.toFormData(data));
    return response.data;
  }

  private async deleteCustomer(customerId: string): Promise<any> {
    const response = await this.apiClient.delete(`/customers/${customerId}`);
    return response.data;
  }

  private async listCustomers(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.email) params.email = args.email;

    const response = await this.apiClient.get('/customers', { params });
    return response.data;
  }

  // Product operations
  private async createProduct(args: any): Promise<any> {
    const data: any = {
      name: args.name
    };
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/products', this.toFormData(data));
    return response.data;
  }

  private async getProduct(productId: string): Promise<any> {
    const response = await this.apiClient.get(`/products/${productId}`);
    return response.data;
  }

  private async updateProduct(args: any): Promise<any> {
    const data: any = {};
    if (args.name) data.name = args.name;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/products/${args.productId}`, this.toFormData(data));
    return response.data;
  }

  private async deleteProduct(productId: string): Promise<any> {
    const response = await this.apiClient.delete(`/products/${productId}`);
    return response.data;
  }

  private async listProducts(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;

    const response = await this.apiClient.get('/products', { params });
    return response.data;
  }

  // Price operations
  private async createPrice(args: any): Promise<any> {
    const data: any = {
      unit_amount: args.amount,
      currency: args.currency || 'usd',
      product: args.productId
    };
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/prices', this.toFormData(data));
    return response.data;
  }

  private async getPrice(priceId: string): Promise<any> {
    const response = await this.apiClient.get(`/prices/${priceId}`);
    return response.data;
  }

  private async updatePrice(args: any): Promise<any> {
    const data: any = {};
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/prices/${args.priceId}`, this.toFormData(data));
    return response.data;
  }

  private async listPrices(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.productId) params.product = args.productId;

    const response = await this.apiClient.get('/prices', { params });
    return response.data;
  }

  // Payment Intent operations
  private async createPaymentIntent(args: any): Promise<any> {
    const data: any = {
      amount: args.amount,
      currency: args.currency || 'usd'
    };
    if (args.customerId) data.customer = args.customerId;
    if (args.paymentMethodId) data.payment_method = args.paymentMethodId;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/payment_intents', this.toFormData(data));
    return response.data;
  }

  private async confirmPaymentIntent(args: any): Promise<any> {
    const data: any = {};
    if (args.paymentMethodId) data.payment_method = args.paymentMethodId;

    const response = await this.apiClient.post(`/payment_intents/${args.paymentIntentId}/confirm`, this.toFormData(data));
    return response.data;
  }

  private async capturePaymentIntent(args: any): Promise<any> {
    const data: any = {};
    if (args.amount) data.amount_to_capture = args.amount;

    const response = await this.apiClient.post(`/payment_intents/${args.paymentIntentId}/capture`, this.toFormData(data));
    return response.data;
  }

  private async cancelPaymentIntent(args: any): Promise<any> {
    const response = await this.apiClient.post(`/payment_intents/${args.paymentIntentId}/cancel`, '');
    return response.data;
  }

  // Subscription operations
  private async createSubscription(args: any): Promise<any> {
    const data: any = {
      customer: args.customerId
    };
    if (args.priceId) data.items = [{ price: args.priceId }];
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/subscriptions', this.toFormData(data));
    return response.data;
  }

  private async getSubscription(subscriptionId: string): Promise<any> {
    const response = await this.apiClient.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  }

  private async updateSubscription(args: any): Promise<any> {
    const data: any = {};
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/subscriptions/${args.subscriptionId}`, this.toFormData(data));
    return response.data;
  }

  private async cancelSubscription(args: any): Promise<any> {
    const response = await this.apiClient.delete(`/subscriptions/${args.subscriptionId}`);
    return response.data;
  }

  private async listSubscriptions(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.customerId) params.customer = args.customerId;

    const response = await this.apiClient.get('/subscriptions', { params });
    return response.data;
  }

  // Invoice operations
  private async createInvoice(args: any): Promise<any> {
    const data: any = {
      customer: args.customerId
    };
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/invoices', this.toFormData(data));
    return response.data;
  }

  private async getInvoice(invoiceId: string): Promise<any> {
    const response = await this.apiClient.get(`/invoices/${invoiceId}`);
    return response.data;
  }

  private async payInvoice(invoiceId: string): Promise<any> {
    const response = await this.apiClient.post(`/invoices/${invoiceId}/pay`, '');
    return response.data;
  }

  private async voidInvoice(invoiceId: string): Promise<any> {
    const response = await this.apiClient.post(`/invoices/${invoiceId}/void`, '');
    return response.data;
  }

  private async finalizeInvoice(invoiceId: string): Promise<any> {
    const response = await this.apiClient.post(`/invoices/${invoiceId}/finalize`, '');
    return response.data;
  }

  private async listInvoices(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.customerId) params.customer = args.customerId;

    const response = await this.apiClient.get('/invoices', { params });
    return response.data;
  }

  // Webhook operations
  private async createWebhook(args: any): Promise<any> {
    const data: any = {
      url: args.url,
      enabled_events: args.events || ['*']
    };
    if (args.description) data.description = args.description;

    const response = await this.apiClient.post('/webhook_endpoints', this.toFormData(data));
    return response.data;
  }

  private async getWebhook(webhookId: string): Promise<any> {
    const response = await this.apiClient.get(`/webhook_endpoints/${webhookId}`);
    return response.data;
  }

  private async updateWebhook(args: any): Promise<any> {
    const data: any = {};
    if (args.url) data.url = args.url;
    if (args.events) data.enabled_events = args.events;
    if (args.description) data.description = args.description;

    const response = await this.apiClient.post(`/webhook_endpoints/${args.webhookId}`, this.toFormData(data));
    return response.data;
  }

  private async deleteWebhook(webhookId: string): Promise<any> {
    const response = await this.apiClient.delete(`/webhook_endpoints/${webhookId}`);
    return response.data;
  }

  private async listWebhooks(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;

    const response = await this.apiClient.get('/webhook_endpoints', { params });
    return response.data;
  }

  // Coupon operations
  private async createCoupon(args: any): Promise<any> {
    const data: any = {
      id: args.couponId || `coupon_${Date.now()}`
    };
    if (args.percentOff) data.percent_off = args.percentOff;
    if (args.amountOff) data.amount_off = args.amountOff;
    if (args.currency) data.currency = args.currency;
    if (args.duration) data.duration = args.duration;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/coupons', this.toFormData(data));
    return response.data;
  }

  private async getCoupon(couponId: string): Promise<any> {
    const response = await this.apiClient.get(`/coupons/${couponId}`);
    return response.data;
  }

  private async updateCoupon(args: any): Promise<any> {
    const data: any = {};
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/coupons/${args.couponId}`, this.toFormData(data));
    return response.data;
  }

  private async deleteCoupon(couponId: string): Promise<any> {
    const response = await this.apiClient.delete(`/coupons/${couponId}`);
    return response.data;
  }

  private async listCoupons(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;

    const response = await this.apiClient.get('/coupons', { params });
    return response.data;
  }

  // Refund operations
  private async createRefund(args: any): Promise<any> {
    const data: any = {};
    if (args.chargeId) data.charge = args.chargeId;
    if (args.paymentIntentId) data.payment_intent = args.paymentIntentId;
    if (args.amount) data.amount = args.amount;
    if (args.reason) data.reason = args.reason;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/refunds', this.toFormData(data));
    return response.data;
  }

  private async getRefund(refundId: string): Promise<any> {
    const response = await this.apiClient.get(`/refunds/${refundId}`);
    return response.data;
  }

  private async updateRefund(args: any): Promise<any> {
    const data: any = {};
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/refunds/${args.refundId}`, this.toFormData(data));
    return response.data;
  }

  private async listRefunds(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.chargeId) params.charge = args.chargeId;

    const response = await this.apiClient.get('/refunds', { params });
    return response.data;
  }

  // Transfer operations
  private async createTransfer(args: any): Promise<any> {
    const data: any = {
      amount: args.amount,
      currency: args.currency || 'usd',
      destination: args.destination
    };
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/transfers', this.toFormData(data));
    return response.data;
  }

  private async getTransfer(transferId: string): Promise<any> {
    const response = await this.apiClient.get(`/transfers/${transferId}`);
    return response.data;
  }

  private async updateTransfer(args: any): Promise<any> {
    const data: any = {};
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/transfers/${args.transferId}`, this.toFormData(data));
    return response.data;
  }

  private async listTransfers(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.destination) params.destination = args.destination;

    const response = await this.apiClient.get('/transfers', { params });
    return response.data;
  }

  // Payout operations
  private async createPayout(args: any): Promise<any> {
    const data: any = {
      amount: args.amount,
      currency: args.currency || 'usd'
    };
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/payouts', this.toFormData(data));
    return response.data;
  }

  private async getPayout(payoutId: string): Promise<any> {
    const response = await this.apiClient.get(`/payouts/${payoutId}`);
    return response.data;
  }

  private async updatePayout(args: any): Promise<any> {
    const data: any = {};
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post(`/payouts/${args.payoutId}`, this.toFormData(data));
    return response.data;
  }

  private async listPayouts(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;

    const response = await this.apiClient.get('/payouts', { params });
    return response.data;
  }

  // Balance operations
  private async getBalance(): Promise<any> {
    const response = await this.apiClient.get('/balance');
    return response.data;
  }

  private async getBalanceTransactions(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;

    const response = await this.apiClient.get('/balance_transactions', { params });
    return response.data;
  }

  // Charge operations
  private async createCharge(args: any): Promise<any> {
    const data: any = {
      amount: args.amount,
      currency: args.currency || 'usd'
    };
    if (args.customerId) data.customer = args.customerId;
    if (args.source) data.source = args.source;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/charges', this.toFormData(data));
    return response.data;
  }

  private async getCharge(chargeId: string): Promise<any> {
    const response = await this.apiClient.get(`/charges/${chargeId}`);
    return response.data;
  }

  private async listCharges(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.customerId) params.customer = args.customerId;

    const response = await this.apiClient.get('/charges', { params });
    return response.data;
  }

  // Payment Method operations
  private async createPaymentMethod(args: any): Promise<any> {
    const data: any = {
      type: args.type || 'card'
    };
    if (args.card) data.card = args.card;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/payment_methods', this.toFormData(data));
    return response.data;
  }

  private async getPaymentMethod(paymentMethodId: string): Promise<any> {
    const response = await this.apiClient.get(`/payment_methods/${paymentMethodId}`);
    return response.data;
  }

  private async attachPaymentMethod(args: any): Promise<any> {
    const data: any = {
      customer: args.customerId
    };

    const response = await this.apiClient.post(`/payment_methods/${args.paymentMethodId}/attach`, this.toFormData(data));
    return response.data;
  }

  private async detachPaymentMethod(args: any): Promise<any> {
    const response = await this.apiClient.post(`/payment_methods/${args.paymentMethodId}/detach`, '');
    return response.data;
  }

  // Account operations
  private async getAccount(accountId?: string): Promise<any> {
    const endpoint = accountId ? `/accounts/${accountId}` : '/account';
    const response = await this.apiClient.get(endpoint);
    return response.data;
  }

  private async updateAccount(args: any): Promise<any> {
    const data: any = {};
    if (args.businessProfile) data.business_profile = args.businessProfile;
    if (args.metadata) data.metadata = args.metadata;

    const endpoint = args.accountId ? `/accounts/${args.accountId}` : '/account';
    const response = await this.apiClient.post(endpoint, this.toFormData(data));
    return response.data;
  }

  private async createAccountLink(args: any): Promise<any> {
    const data: any = {
      account: args.accountId,
      refresh_url: args.refreshUrl,
      return_url: args.returnUrl,
      type: args.type || 'account_onboarding'
    };

    const response = await this.apiClient.post('/account_links', this.toFormData(data));
    return response.data;
  }

  // Tax operations
  private async getTaxRates(args: any): Promise<any> {
    const params: any = {};
    if (args.limit) params.limit = args.limit;
    if (args.active) params.active = args.active;

    const response = await this.apiClient.get('/tax_rates', { params });
    return response.data;
  }

  private async createTaxRate(args: any): Promise<any> {
    const data: any = {
      display_name: args.displayName,
      percentage: args.percentage,
      inclusive: args.inclusive || false
    };
    if (args.jurisdiction) data.jurisdiction = args.jurisdiction;
    if (args.description) data.description = args.description;
    if (args.metadata) data.metadata = args.metadata;

    const response = await this.apiClient.post('/tax_rates', this.toFormData(data));
    return response.data;
  }
}

// Usage Examples:
/*
// Initialize the tool
const stripe = new StripeManagementTool("sk_test_your_stripe_secret_key");

// Create a customer
const customerResult = await stripe.execute({
    action: "create_customer",
    email: "john.doe@example.com",
    name: "John Doe",
    phone: "+1234567890",
    metadata: {
        user_id: "12345",
        source: "website"
    }
});

// Create a product
const productResult = await stripe.execute({
    action: "create_product",
    name: "Premium Subscription",
    description: "Monthly premium subscription with advanced features",
    metadata: {
        category: "subscription",
        tier: "premium"
    }
});

// Create a price for the product
const priceResult = await stripe.execute({
    action: "create_price",
    productId: "prod_1234567890",
    amount: 2999, // $29.99
    currency: "usd",
    metadata: {
        billing_period: "monthly"
    }
});

// Create a payment intent
const paymentResult = await stripe.execute({
    action: "create_payment_intent",
    amount: 2999,
    currency: "usd",
    customerId: "cus_1234567890",
    description: "Premium subscription payment",
    metadata: {
        order_id: "order_12345"
    }
});

// Create a subscription
const subscriptionResult = await stripe.execute({
    action: "create_subscription",
    customerId: "cus_1234567890",
    priceId: "price_1234567890",
    metadata: {
        plan: "premium",
        start_date: "2024-01-01"
    }
});

// Create a webhook endpoint
const webhookResult = await stripe.execute({
    action: "create_webhook",
    url: "https://myapp.com/webhook",
    events: ["payment_intent.succeeded", "customer.subscription.created", "invoice.payment_failed"],
    description: "Main webhook endpoint for payment processing"
});

// Create a coupon
const couponResult = await stripe.execute({
    action: "create_coupon",
    couponId: "SAVE20",
    percentOff: 20,
    duration: "once",
    metadata: {
        campaign: "spring_sale_2024"
    }
});

// Create a refund
const refundResult = await stripe.execute({
    action: "create_refund",
    paymentIntentId: "pi_1234567890",
    amount: 1000, // Partial refund of $10.00
    reason: "requested_by_customer",
    metadata: {
        refund_reason: "customer_request",
        processed_by: "support_agent_123"
    }
});

// Get account balance
const balanceResult = await stripe.execute({
    action: "get_balance"
});

// Create a transfer to connected account
const transferResult = await stripe.execute({
    action: "create_transfer",
    amount: 1000,
    currency: "usd",
    destination: "acct_1234567890",
    description: "Commission payment",
    metadata: {
        transaction_type: "commission",
        period: "2024-01"
    }
});

// Create a payout
const payoutResult = await stripe.execute({
    action: "create_payout",
    amount: 5000,
    currency: "usd",
    description: "Weekly payout",
    metadata: {
        payout_period: "week_4_2024"
    }
});

// Get analytics data
const analyticsResult = await stripe.execute({
    action: "list_charges",
    limit: 100,
    customerId: "cus_1234567890"
});

// Create tax rate
const taxRateResult = await stripe.execute({
    action: "create_tax_rate",
    displayName: "VAT",
    percentage: 20.0,
    inclusive: false,
    jurisdiction: "EU",
    description: "EU VAT rate"
});

// Create account link for onboarding
const accountLinkResult = await stripe.execute({
    action: "create_account_link",
    accountId: "acct_1234567890",
    refreshUrl: "https://myapp.com/onboard/refresh",
    returnUrl: "https://myapp.com/onboard/return",
    type: "account_onboarding"
});

// Attach payment method to customer
const attachResult = await stripe.execute({
    action: "attach_payment_method",
    paymentMethodId: "pm_1234567890",
    customerId: "cus_1234567890"
});

// List all webhooks
const webhooksResult = await stripe.execute({
    action: "list_webhooks",
    limit: 50
});

// Get comprehensive invoice data
const invoiceResult = await stripe.execute({
    action: "list_invoices",
    customerId: "cus_1234567890",
    limit: 25
});
*/