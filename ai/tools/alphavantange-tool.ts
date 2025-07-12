import { FunctionDeclaration, Type } from "@google/genai";
import axios, { AxiosInstance } from 'axios';

interface Tool {
  getDefinition(): FunctionDeclaration;
  execute(args: any): Promise<any>;
}

export class AlphaVantageTool implements Tool {
  private apiClient: AxiosInstance;
  private baseUrl = 'https://www.alphavantage.co/query';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'User-Agent': 'AlphaVantage-Financial-Tool/1.0'
      }
    });
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "financial_data",
      description: "A comprehensive tool for retrieving financial market data, stock information, forex rates, cryptocurrencies, commodities, and economic indicators",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The financial data action to perform",
            enum: [
              // Stock data
              "get_stock_quote", "get_stock_intraday", "get_stock_daily", "get_stock_weekly", "get_stock_monthly",
              "get_stock_adjusted", "search_symbol", "get_earnings", "get_company_overview", "get_income_statement",
              "get_balance_sheet", "get_cash_flow", "get_listing_delisting", "get_ipo_calendar",
              // Technical indicators
              "get_sma", "get_ema", "get_macd", "get_rsi", "get_adx", "get_cci", "get_aroon", "get_bbands",
              "get_stoch", "get_willr", "get_mom", "get_roc", "get_atr", "get_natr", "get_ad", "get_obv",
              "get_ht_trendline", "get_ht_sine", "get_ht_trendmode", "get_ht_dcperiod", "get_ht_dcphase",
              "get_ht_phasor", "get_plus_di", "get_plus_dm", "get_minus_di", "get_minus_dm", "get_dx",
              "get_macdext", "get_stochf", "get_stochrsi", "get_trix", "get_ultosc", "get_dx", "get_midpoint",
              "get_midprice", "get_sar", "get_trange", "get_avgprice", "get_medprice", "get_typprice",
              "get_wclprice", "get_vwap", "get_t3", "get_tema", "get_trima", "get_kama", "get_mama",
              "get_vwma", "get_ad", "get_adosc", "get_bop", "get_cmo", "get_dema",
              // Forex data
              "get_fx_rate", "get_fx_intraday", "get_fx_daily", "get_fx_weekly", "get_fx_monthly",
              // Cryptocurrency data
              "get_crypto_rating", "get_crypto_intraday", "get_crypto_daily", "get_crypto_weekly", "get_crypto_monthly",
              // Commodities data
              "get_commodity_monthly", "get_wti", "get_brent", "get_natural_gas", "get_copper", "get_aluminum",
              "get_wheat", "get_corn", "get_cotton", "get_sugar", "get_coffee",
              // Economic indicators
              "get_real_gdp", "get_real_gdp_per_capita", "get_treasury_yield", "get_federal_funds_rate",
              "get_cpi", "get_inflation", "get_retail_sales", "get_durables", "get_unemployment", "get_nonfarm_payroll",
              // Market data
              "get_sector_performance", "get_market_status", "get_news_sentiment", "get_top_gainers_losers",
              "get_most_active", "get_insider_transactions", "get_analytics_sliding_window",
              // Portfolio optimization
              "get_portfolio_optimization", "get_asset_allocation"
            ]
          },
          symbol: {
            type: Type.STRING,
            description: "Stock symbol (e.g., AAPL, MSFT, GOOGL) or forex pair (e.g., EUR/USD) or crypto symbol (e.g., BTC)"
          },
          interval: {
            type: Type.STRING,
            description: "Time interval for intraday data",
            enum: ["1min", "5min", "15min", "30min", "60min"]
          },
          outputsize: {
            type: Type.STRING,
            description: "Data output size",
            enum: ["compact", "full"]
          },
          datatype: {
            type: Type.STRING,
            description: "Response data format",
            enum: ["json", "csv"]
          },
          month: {
            type: Type.STRING,
            description: "Month for historical data (YYYY-MM format)"
          },
          from_symbol: {
            type: Type.STRING,
            description: "Base currency symbol for forex (e.g., USD, EUR)"
          },
          to_symbol: {
            type: Type.STRING,
            description: "Quote currency symbol for forex (e.g., USD, EUR)"
          },
          market: {
            type: Type.STRING,
            description: "Cryptocurrency market (e.g., USD, EUR, CNY)"
          },
          // Technical indicator parameters
          time_period: {
            type: Type.NUMBER,
            description: "Time period for technical indicators"
          },
          series_type: {
            type: Type.STRING,
            description: "Price series type for technical indicators",
            enum: ["close", "open", "high", "low"]
          },
          fastperiod: {
            type: Type.NUMBER,
            description: "Fast period for MACD and other indicators"
          },
          slowperiod: {
            type: Type.NUMBER,
            description: "Slow period for MACD and other indicators"
          },
          signalperiod: {
            type: Type.NUMBER,
            description: "Signal period for MACD"
          },
          fastk_period: {
            type: Type.NUMBER,
            description: "Fast K period for Stochastic"
          },
          slowk_period: {
            type: Type.NUMBER,
            description: "Slow K period for Stochastic"
          },
          slowd_period: {
            type: Type.NUMBER,
            description: "Slow D period for Stochastic"
          },
          slowk_matype: {
            type: Type.NUMBER,
            description: "Slow K MA type for Stochastic"
          },
          slowd_matype: {
            type: Type.NUMBER,
            description: "Slow D MA type for Stochastic"
          },
          nbdevup: {
            type: Type.NUMBER,
            description: "Number of standard deviations above MA for Bollinger Bands"
          },
          nbdevdn: {
            type: Type.NUMBER,
            description: "Number of standard deviations below MA for Bollinger Bands"
          },
          matype: {
            type: Type.NUMBER,
            description: "Moving average type (0=SMA, 1=EMA, 2=WMA, 3=DEMA, 4=TEMA, 5=TRIMA, 6=KAMA, 7=MAMA, 8=T3)"
          },
          // News and sentiment parameters
          tickers: {
            type: Type.STRING,
            description: "Comma-separated list of tickers for news sentiment"
          },
          topics: {
            type: Type.STRING,
            description: "News topics filter"
          },
          time_from: {
            type: Type.STRING,
            description: "Start time for news data (YYYYMMDDTHHMM format)"
          },
          time_to: {
            type: Type.STRING,
            description: "End time for news data (YYYYMMDDTHHMM format)"
          },
          sort: {
            type: Type.STRING,
            description: "Sort order for news",
            enum: ["LATEST", "EARLIEST", "RELEVANCE"]
          },
          limit: {
            type: Type.NUMBER,
            description: "Limit number of results"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const startTime = Date.now();
      console.log(`📊 Executing Alpha Vantage action: ${args.action}`);

      let result: any;

      switch (args.action) {
        // Stock data actions
        case 'get_stock_quote':
          result = await this.getStockQuote(args.symbol);
          break;
        case 'get_stock_intraday':
          result = await this.getStockIntraday(args.symbol, args.interval, args.outputsize, args.datatype);
          break;
        case 'get_stock_daily':
          result = await this.getStockDaily(args.symbol, args.outputsize, args.datatype);
          break;
        case 'get_stock_weekly':
          result = await this.getStockWeekly(args.symbol, args.datatype);
          break;
        case 'get_stock_monthly':
          result = await this.getStockMonthly(args.symbol, args.datatype);
          break;
        case 'get_stock_adjusted':
          result = await this.getStockAdjusted(args.symbol, args.outputsize, args.datatype);
          break;
        case 'search_symbol':
          result = await this.searchSymbol(args.symbol);
          break;
        case 'get_earnings':
          result = await this.getEarnings(args.symbol);
          break;
        case 'get_company_overview':
          result = await this.getCompanyOverview(args.symbol);
          break;
        case 'get_income_statement':
          result = await this.getIncomeStatement(args.symbol);
          break;
        case 'get_balance_sheet':
          result = await this.getBalanceSheet(args.symbol);
          break;
        case 'get_cash_flow':
          result = await this.getCashFlow(args.symbol);
          break;
        case 'get_listing_delisting':
          result = await this.getListingDelisting(args.date);
          break;
        case 'get_ipo_calendar':
          result = await this.getIPOCalendar();
          break;

        // Technical indicators
        case 'get_sma':
          result = await this.getSMA(args.symbol, args.interval, args.time_period, args.series_type);
          break;
        case 'get_ema':
          result = await this.getEMA(args.symbol, args.interval, args.time_period, args.series_type);
          break;
        case 'get_macd':
          result = await this.getMACD(args.symbol, args.interval, args.series_type, args.fastperiod, args.slowperiod, args.signalperiod);
          break;
        case 'get_rsi':
          result = await this.getRSI(args.symbol, args.interval, args.time_period, args.series_type);
          break;
        case 'get_adx':
          result = await this.getADX(args.symbol, args.interval, args.time_period);
          break;
        case 'get_cci':
          result = await this.getCCI(args.symbol, args.interval, args.time_period);
          break;
        case 'get_aroon':
          result = await this.getAroon(args.symbol, args.interval, args.time_period);
          break;
        case 'get_bbands':
          result = await this.getBBands(args.symbol, args.interval, args.time_period, args.series_type, args.nbdevup, args.nbdevdn, args.matype);
          break;
        case 'get_stoch':
          result = await this.getStoch(args.symbol, args.interval, args.fastk_period, args.slowk_period, args.slowd_period, args.slowk_matype, args.slowd_matype);
          break;
        case 'get_willr':
          result = await this.getWillR(args.symbol, args.interval, args.time_period);
          break;
        case 'get_mom':
          result = await this.getMOM(args.symbol, args.interval, args.time_period, args.series_type);
          break;
        case 'get_roc':
          result = await this.getROC(args.symbol, args.interval, args.time_period, args.series_type);
          break;
        case 'get_atr':
          result = await this.getATR(args.symbol, args.interval, args.time_period);
          break;
        case 'get_natr':
          result = await this.getNATR(args.symbol, args.interval, args.time_period);
          break;
        case 'get_ad':
          result = await this.getAD(args.symbol, args.interval);
          break;
        case 'get_obv':
          result = await this.getOBV(args.symbol, args.interval);
          break;
        case 'get_vwap':
          result = await this.getVWAP(args.symbol, args.interval);
          break;

        // Forex data actions
        case 'get_fx_rate':
          result = await this.getFXRate(args.from_symbol, args.to_symbol);
          break;
        case 'get_fx_intraday':
          result = await this.getFXIntraday(args.from_symbol, args.to_symbol, args.interval, args.outputsize, args.datatype);
          break;
        case 'get_fx_daily':
          result = await this.getFXDaily(args.from_symbol, args.to_symbol, args.outputsize, args.datatype);
          break;
        case 'get_fx_weekly':
          result = await this.getFXWeekly(args.from_symbol, args.to_symbol, args.datatype);
          break;
        case 'get_fx_monthly':
          result = await this.getFXMonthly(args.from_symbol, args.to_symbol, args.datatype);
          break;

        // Cryptocurrency data actions
        case 'get_crypto_rating':
          result = await this.getCryptoRating(args.symbol);
          break;
        case 'get_crypto_intraday':
          result = await this.getCryptoIntraday(args.symbol, args.market, args.interval, args.outputsize);
          break;
        case 'get_crypto_daily':
          result = await this.getCryptoDaily(args.symbol, args.market, args.outputsize);
          break;
        case 'get_crypto_weekly':
          result = await this.getCryptoWeekly(args.symbol, args.market);
          break;
        case 'get_crypto_monthly':
          result = await this.getCryptoMonthly(args.symbol, args.market);
          break;

        // Commodities data actions
        case 'get_commodity_monthly':
          result = await this.getCommodityMonthly(args.symbol, args.interval);
          break;
        case 'get_wti':
          result = await this.getWTI(args.interval);
          break;
        case 'get_brent':
          result = await this.getBrent(args.interval);
          break;
        case 'get_natural_gas':
          result = await this.getNaturalGas(args.interval);
          break;
        case 'get_copper':
          result = await this.getCopper(args.interval);
          break;
        case 'get_aluminum':
          result = await this.getAluminum(args.interval);
          break;
        case 'get_wheat':
          result = await this.getWheat(args.interval);
          break;
        case 'get_corn':
          result = await this.getCorn(args.interval);
          break;
        case 'get_cotton':
          result = await this.getCotton(args.interval);
          break;
        case 'get_sugar':
          result = await this.getSugar(args.interval);
          break;
        case 'get_coffee':
          result = await this.getCoffee(args.interval);
          break;

        // Economic indicators
        case 'get_real_gdp':
          result = await this.getRealGDP(args.interval);
          break;
        case 'get_real_gdp_per_capita':
          result = await this.getRealGDPPerCapita(args.interval);
          break;
        case 'get_treasury_yield':
          result = await this.getTreasuryYield(args.interval, args.maturity);
          break;
        case 'get_federal_funds_rate':
          result = await this.getFederalFundsRate(args.interval);
          break;
        case 'get_cpi':
          result = await this.getCPI(args.interval);
          break;
        case 'get_inflation':
          result = await this.getInflation();
          break;
        case 'get_retail_sales':
          result = await this.getRetailSales();
          break;
        case 'get_durables':
          result = await this.getDurables();
          break;
        case 'get_unemployment':
          result = await this.getUnemployment();
          break;
        case 'get_nonfarm_payroll':
          result = await this.getNonfarmPayroll();
          break;

        // Market data actions
        case 'get_sector_performance':
          result = await this.getSectorPerformance();
          break;
        case 'get_market_status':
          result = await this.getMarketStatus();
          break;
        case 'get_news_sentiment':
          result = await this.getNewsSentiment(args.tickers, args.topics, args.time_from, args.time_to, args.sort, args.limit);
          break;
        case 'get_top_gainers_losers':
          result = await this.getTopGainersLosers();
          break;
        case 'get_most_active':
          result = await this.getMostActive();
          break;
        case 'get_insider_transactions':
          result = await this.getInsiderTransactions(args.symbol);
          break;
        case 'get_analytics_sliding_window':
          result = await this.getAnalyticsSlidingWindow(args.symbols, args.range, args.interval, args.ohlc, args.calculations);
          break;

        // Portfolio optimization
        case 'get_portfolio_optimization':
          result = await this.getPortfolioOptimization(args.symbols, args.range, args.interval);
          break;
        case 'get_asset_allocation':
          result = await this.getAssetAllocation(args.symbols, args.range, args.interval);
          break;

        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`,
            availableActions: [
              'Stock Data: get_stock_quote, get_stock_intraday, get_stock_daily, get_stock_weekly, get_stock_monthly',
              'Technical Indicators: get_sma, get_ema, get_macd, get_rsi, get_adx, get_cci, get_aroon, get_bbands',
              'Forex Data: get_fx_rate, get_fx_intraday, get_fx_daily, get_fx_weekly, get_fx_monthly',
              'Cryptocurrency: get_crypto_rating, get_crypto_intraday, get_crypto_daily, get_crypto_weekly',
              'Commodities: get_wti, get_brent, get_natural_gas, get_copper, get_aluminum, get_wheat',
              'Economic Indicators: get_real_gdp, get_treasury_yield, get_federal_funds_rate, get_cpi',
              'Market Data: get_sector_performance, get_market_status, get_news_sentiment, get_top_gainers_losers'
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
      console.error("❌ Alpha Vantage operation failed:", error);
      return {
        success: false,
        error: `Alpha Vantage operation failed: ${error.response?.data?.['Error Message'] || error.message}`,
        action: args.action,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Stock data methods
  private async getStockQuote(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getStockIntraday(symbol: string, interval: string = '5min', outputsize: string = 'compact', datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: interval,
        outputsize: outputsize,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getStockDaily(symbol: string, outputsize: string = 'compact', datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: outputsize,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getStockWeekly(symbol: string, datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TIME_SERIES_WEEKLY',
        symbol: symbol,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getStockMonthly(symbol: string, datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TIME_SERIES_MONTHLY',
        symbol: symbol,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getStockAdjusted(symbol: string, outputsize: string = 'compact', datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TIME_SERIES_DAILY_ADJUSTED',
        symbol: symbol,
        outputsize: outputsize,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async searchSymbol(keywords: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getEarnings(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'EARNINGS',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCompanyOverview(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getIncomeStatement(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'INCOME_STATEMENT',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getBalanceSheet(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'BALANCE_SHEET',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCashFlow(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CASH_FLOW',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getListingDelisting(date?: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'LISTING_STATUS',
        date: date,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getIPOCalendar(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'IPO_CALENDAR',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Technical indicators methods
  private async getSMA(symbol: string, interval: string, time_period: number, series_type: string = 'close'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'SMA',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        series_type: series_type,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getEMA(symbol: string, interval: string, time_period: number, series_type: string = 'close'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'EMA',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        series_type: series_type,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getMACD(symbol: string, interval: string, series_type: string = 'close', fastperiod?: number, slowperiod?: number, signalperiod?: number): Promise<any> {
    const params: any = {
      function: 'MACD',
      symbol: symbol,
      interval: interval,
      series_type: series_type,
      apikey: this.apiKey
    };

    if (fastperiod) params.fastperiod = fastperiod;
    if (slowperiod) params.slowperiod = slowperiod;
    if (signalperiod) params.signalperiod = signalperiod;

    const response = await this.apiClient.get('', { params });
    return response.data;
  }

  private async getRSI(symbol: string, interval: string, time_period: number, series_type: string = 'close'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'RSI',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        series_type: series_type,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getADX(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ADX',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCCI(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CCI',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getAroon(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'AROON',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getBBands(symbol: string, interval: string, time_period: number, series_type: string = 'close', nbdevup?: number, nbdevdn?: number, matype?: number): Promise<any> {
    const params: any = {
      function: 'BBANDS',
      symbol: symbol,
      interval: interval,
      time_period: time_period,
      series_type: series_type,
      apikey: this.apiKey
    };

    if (nbdevup) params.nbdevup = nbdevup;
    if (nbdevdn) params.nbdevdn = nbdevdn;
    if (matype) params.matype = matype;

    const response = await this.apiClient.get('', { params });
    return response.data;
  }

  private async getStoch(symbol: string, interval: string, fastk_period?: number, slowk_period?: number, slowd_period?: number, slowk_matype?: number, slowd_matype?: number): Promise<any> {
    const params: any = {
      function: 'STOCH',
      symbol: symbol,
      interval: interval,
      apikey: this.apiKey
    };

    if (fastk_period) params.fastk_period = fastk_period;
    if (slowk_period) params.slowk_period = slowk_period;
    if (slowd_period) params.slowd_period = slowd_period;
    if (slowk_matype) params.slowk_matype = slowk_matype;
    if (slowd_matype) params.slowd_matype = slowd_matype;

    const response = await this.apiClient.get('', { params });
    return response.data;
  }

  private async getWillR(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'WILLR',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getMOM(symbol: string, interval: string, time_period: number, series_type: string = 'close'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'MOM',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        series_type: series_type,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getROC(symbol: string, interval: string, time_period: number, series_type: string = 'close'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ROC',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        series_type: series_type,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getATR(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ATR',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getNATR(symbol: string, interval: string, time_period: number): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'NATR',
        symbol: symbol,
        interval: interval,
        time_period: time_period,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getAD(symbol: string, interval: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'AD',
        symbol: symbol,
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getOBV(symbol: string, interval: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'OBV',
        symbol: symbol,
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getVWAP(symbol: string, interval: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'VWAP',
        symbol: symbol,
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Forex data methods
  private async getFXRate(from_symbol: string, to_symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CURRENCY_EXCHANGE_RATE',
        from_currency: from_symbol,
        to_currency: to_symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getFXIntraday(from_symbol: string, to_symbol: string, interval: string = '5min', outputsize: string = 'compact', datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'FX_INTRADAY',
        from_symbol: from_symbol,
        to_symbol: to_symbol,
        interval: interval,
        outputsize: outputsize,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getFXDaily(from_symbol: string, to_symbol: string, outputsize: string = 'compact', datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'FX_DAILY',
        from_symbol: from_symbol,
        to_symbol: to_symbol,
        outputsize: outputsize,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getFXWeekly(from_symbol: string, to_symbol: string, datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'FX_WEEKLY',
        from_symbol: from_symbol,
        to_symbol: to_symbol,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getFXMonthly(from_symbol: string, to_symbol: string, datatype: string = 'json'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'FX_MONTHLY',
        from_symbol: from_symbol,
        to_symbol: to_symbol,
        datatype: datatype,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Cryptocurrency data methods
  private async getCryptoRating(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CRYPTO_RATING',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCryptoIntraday(symbol: string, market: string = 'USD', interval: string = '5min', outputsize: string = 'compact'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CRYPTO_INTRADAY',
        symbol: symbol,
        market: market,
        interval: interval,
        outputsize: outputsize,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCryptoDaily(symbol: string, market: string = 'USD', outputsize: string = 'compact'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'DIGITAL_CURRENCY_DAILY',
        symbol: symbol,
        market: market,
        outputsize: outputsize,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCryptoWeekly(symbol: string, market: string = 'USD'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'DIGITAL_CURRENCY_WEEKLY',
        symbol: symbol,
        market: market,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCryptoMonthly(symbol: string, market: string = 'USD'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'DIGITAL_CURRENCY_MONTHLY',
        symbol: symbol,
        market: market,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Commodities data methods
  private async getCommodityMonthly(symbol: string, interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: symbol,
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getWTI(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'WTI',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getBrent(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'BRENT',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getNaturalGas(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'NATURAL_GAS',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCopper(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'COPPER',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getAluminum(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ALUMINUM',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getWheat(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'WHEAT',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCorn(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CORN',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCotton(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'COTTON',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getSugar(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'SUGAR',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCoffee(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'COFFEE',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Economic indicators methods
  private async getRealGDP(interval: string = 'quarterly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'REAL_GDP',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getRealGDPPerCapita(interval: string = 'quarterly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'REAL_GDP_PER_CAPITA',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getTreasuryYield(interval: string = 'monthly', maturity: string = '10year'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TREASURY_YIELD',
        interval: interval,
        maturity: maturity,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getFederalFundsRate(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'FEDERAL_FUNDS_RATE',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getCPI(interval: string = 'monthly'): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'CPI',
        interval: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getInflation(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'INFLATION',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getRetailSales(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'RETAIL_SALES',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getDurables(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'DURABLES',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getUnemployment(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'UNEMPLOYMENT',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getNonfarmPayroll(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'NONFARM_PAYROLL',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Market data methods
  private async getSectorPerformance(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'SECTOR',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getMarketStatus(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'MARKET_STATUS',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getNewsSentiment(tickers?: string, topics?: string, time_from?: string, time_to?: string, sort?: string, limit?: number): Promise<any> {
    const params: any = {
      function: 'NEWS_SENTIMENT',
      apikey: this.apiKey
    };

    if (tickers) params.tickers = tickers;
    if (topics) params.topics = topics;
    if (time_from) params.time_from = time_from;
    if (time_to) params.time_to = time_to;
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;

    const response = await this.apiClient.get('', { params });
    return response.data;
  }

  private async getTopGainersLosers(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getMostActive(): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getInsiderTransactions(symbol: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'INSIDER_TRANSACTIONS',
        symbol: symbol,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getAnalyticsSlidingWindow(symbols: string[], range: string, interval: string, ohlc: string, calculations: string[]): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ANALYTICS_SLIDING_WINDOW',
        SYMBOLS: symbols.join(','),
        RANGE: range,
        INTERVAL: interval,
        OHLC: ohlc,
        CALCULATIONS: calculations.join(','),
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  // Portfolio optimization methods
  private async getPortfolioOptimization(symbols: string[], range: string, interval: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'PORTFOLIO_OPTIMIZATION',
        SYMBOLS: symbols.join(','),
        RANGE: range,
        INTERVAL: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }

  private async getAssetAllocation(symbols: string[], range: string, interval: string): Promise<any> {
    const response = await this.apiClient.get('', {
      params: {
        function: 'ASSET_ALLOCATION',
        SYMBOLS: symbols.join(','),
        RANGE: range,
        INTERVAL: interval,
        apikey: this.apiKey
      }
    });
    return response.data;
  }
}

// Usage Examples:
/*
// Initialize the tool
const alphaVantage = new AlphaVantageFinancialTool("your-alpha-vantage-api-key");

// Get real-time stock quote
const quoteResult = await alphaVantage.execute({
    action: "get_stock_quote",
    symbol: "AAPL"
});

// Get intraday stock data with 5-minute intervals
const intradayResult = await alphaVantage.execute({
    action: "get_stock_intraday",
    symbol: "MSFT",
    interval: "5min",
    outputsize: "compact"
});

// Get daily stock data
const dailyResult = await alphaVantage.execute({
    action: "get_stock_daily",
    symbol: "GOOGL",
    outputsize: "full"
});

// Get company overview and fundamentals
const overviewResult = await alphaVantage.execute({
    action: "get_company_overview",
    symbol: "TSLA"
});

// Get technical indicators - RSI
const rsiResult = await alphaVantage.execute({
    action: "get_rsi",
    symbol: "AAPL",
    interval: "daily",
    time_period: 14,
    series_type: "close"
});

// Get MACD indicator
const macdResult = await alphaVantage.execute({
    action: "get_macd",
    symbol: "MSFT",
    interval: "daily",
    series_type: "close",
    fastperiod: 12,
    slowperiod: 26,
    signalperiod: 9
});

// Get Bollinger Bands
const bbandsResult = await alphaVantage.execute({
    action: "get_bbands",
    symbol: "GOOGL",
    interval: "daily",
    time_period: 20,
    series_type: "close",
    nbdevup: 2,
    nbdevdn: 2
});

// Get forex exchange rate
const fxResult = await alphaVantage.execute({
    action: "get_fx_rate",
    from_symbol: "USD",
    to_symbol: "EUR"
});

// Get forex daily data
const fxDailyResult = await alphaVantage.execute({
    action: "get_fx_daily",
    from_symbol: "EUR",
    to_symbol: "USD",
    outputsize: "compact"
});

// Get cryptocurrency data
const cryptoResult = await alphaVantage.execute({
    action: "get_crypto_daily",
    symbol: "BTC",
    market: "USD"
});

// Get cryptocurrency rating
const cryptoRatingResult = await alphaVantage.execute({
    action: "get_crypto_rating",
    symbol: "BTC"
});

// Get commodity prices - WTI Oil
const wtiResult = await alphaVantage.execute({
    action: "get_wti",
    interval: "monthly"
});

// Get economic indicators - GDP
const gdpResult = await alphaVantage.execute({
    action: "get_real_gdp",
    interval: "quarterly"
});

// Get treasury yield
const treasuryResult = await alphaVantage.execute({
    action: "get_treasury_yield",
    interval: "monthly",
    maturity: "10year"
});

// Get CPI (Consumer Price Index)
const cpiResult = await alphaVantage.execute({
    action: "get_cpi",
    interval: "monthly"
});

// Get sector performance
const sectorResult = await alphaVantage.execute({
    action: "get_sector_performance"
});

// Get market status
const marketStatusResult = await alphaVantage.execute({
    action: "get_market_status"
});

// Get news sentiment
const newsResult = await alphaVantage.execute({
    action: "get_news_sentiment",
    tickers: "AAPL,MSFT,GOOGL",
    topics: "technology,earnings",
    time_from: "20240101T0000",
    time_to: "20240131T2359",
    sort: "LATEST",
    limit: 50
});

// Get top gainers and losers
const topGainersResult = await alphaVantage.execute({
    action: "get_top_gainers_losers"
});

// Get earnings data
const earningsResult = await alphaVantage.execute({
    action: "get_earnings",
    symbol: "AAPL"
});

// Get income statement
const incomeResult = await alphaVantage.execute({
    action: "get_income_statement",
    symbol: "MSFT"
});

// Get balance sheet
const balanceResult = await alphaVantage.execute({
    action: "get_balance_sheet",
    symbol: "GOOGL"
});

// Get cash flow statement
const cashFlowResult = await alphaVantage.execute({
    action: "get_cash_flow",
    symbol: "TSLA"
});

// Search for symbols
const searchResult = await alphaVantage.execute({
    action: "search_symbol",
    symbol: "Apple"
});

// Get portfolio optimization
const portfolioResult = await alphaVantage.execute({
    action: "get_portfolio_optimization",
    symbols: ["AAPL", "MSFT", "GOOGL", "TSLA"],
    range: "1year",
    interval: "daily"
});

// Get multiple technical indicators for comprehensive analysis
const technicalAnalysis = await Promise.all([
    alphaVantage.execute({
        action: "get_sma",
        symbol: "AAPL",
        interval: "daily",
        time_period: 20,
        series_type: "close"
    }),
    alphaVantage.execute({
        action: "get_ema",
        symbol: "AAPL",
        interval: "daily",
        time_period: 20,
        series_type: "close"
    }),
    alphaVantage.execute({
        action: "get_rsi",
        symbol: "AAPL",
        interval: "daily",
        time_period: 14,
        series_type: "close"
    })
]);

// Get comprehensive market data
const marketData = await Promise.all([
    alphaVantage.execute({ action: "get_sector_performance" }),
    alphaVantage.execute({ action: "get_top_gainers_losers" }),
    alphaVantage.execute({ action: "get_market_status" })
]);
*/
