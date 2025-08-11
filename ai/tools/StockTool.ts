import { FunctionDeclaration, Type } from "@google/genai";

export class StockTool {
  constructor() {}

  getDefinition(): FunctionDeclaration {
    return {
      name: "get_stock_data",
      description: "Get real-time stock prices, historical data, and market information using free APIs. Supports major exchanges worldwide.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          symbol: {
            type: Type.STRING,
            description: "Stock symbol (e.g., 'TSLA', 'AAPL', 'MSFT'). Can include exchange suffix like 'TSLA' or 'LON:VOD'"
          },
          period: {
            type: Type.STRING,
            description: "Time period for historical data: '1D', '5D', '1M', '3M', '6M', '1Y', '2Y', '5Y', 'YTD', 'MAX' (default: 1D)"
          },
          interval: {
            type: Type.STRING,
            description: "Data interval: '1m', '2m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo' (default: auto-selected based on period)"
          },
          includeNews: {
            type: Type.BOOLEAN,
            description: "Include recent news articles for the stock (default: false)"
          },
          includeProfile: {
            type: Type.BOOLEAN,
            description: "Include company profile information (default: true)"
          }
        },
        required: ["symbol"]
      }
    };
  }

  private getInterval(period: string): string {
    const intervalMap: { [key: string]: string } = {
      '1D': '5m',
      '5D': '15m',
      '1M': '1h',
      '3M': '1d',
      '6M': '1d',
      '1Y': '1d',
      '2Y': '1wk',
      '5Y': '1mo',
      'YTD': '1d',
      'MAX': '1mo'
    };
    return intervalMap[period] || '1d';
  }

  private getPeriodRange(period: string): { period1: number; period2: number } {
    const now = Math.floor(Date.now() / 1000);
    const ranges: { [key: string]: number } = {
      '1D': 86400, // 1 day
      '5D': 432000, // 5 days
      '1M': 2592000, // 30 days
      '3M': 7776000, // 90 days
      '6M': 15552000, // 180 days
      '1Y': 31536000, // 365 days
      '2Y': 63072000, // 730 days
      '5Y': 157680000, // 1825 days
      'YTD': now - new Date(new Date().getFullYear(), 0, 1).getTime() / 1000,
      'MAX': 31536000 * 20 // 20 years
    };

    const range = ranges[period] || ranges['1D'];
    return {
      period1: now - range,
      period2: now
    };
  }

  private async fetchYahooFinanceData(symbol: string, period: string, interval: string): Promise<any> {
    try {
      const { period1, period2 } = this.getPeriodRange(period);
      
      // Yahoo Finance API endpoint (using a CORS proxy)
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=true&events=div%2Csplit`;
      
      console.log(`📈 Fetching data for ${symbol} (${period})`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      
      if (!data.chart?.result?.[0]) {
        throw new Error('Invalid symbol or no data available');
      }

      const result = data.chart.result[0];
      const meta = result.meta;
      const timestamps = Array.isArray(result.timestamp) ? result.timestamp : [];
      const quotes = result.indicators?.quote?.[0] || {};
      
      // Get current price and calculate change
      const closes: number[] = Array.isArray(quotes.close) ? quotes.close.filter((v: any) => typeof v === 'number') : [];
      const currentPrice = typeof meta.regularMarketPrice === 'number' ? meta.regularMarketPrice : (closes.length ? closes[closes.length - 1] : NaN);
      const previousClose = typeof meta.previousClose === 'number' ? meta.previousClose : (closes.length >= 2 ? closes[closes.length - 2] : NaN);
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      // Process historical data
      const historicalData = timestamps.map((timestamp: number, index: number) => ({
        timestamp,
        date: new Date(timestamp * 1000).toISOString(),
        open: Array.isArray(quotes.open) ? quotes.open[index] : null,
        high: Array.isArray(quotes.high) ? quotes.high[index] : null,
        low: Array.isArray(quotes.low) ? quotes.low[index] : null,
        close: Array.isArray(quotes.close) ? quotes.close[index] : null,
        volume: Array.isArray(quotes.volume) ? quotes.volume[index] : null
      })).filter((item: any) => typeof item.close === 'number');

      // Get intraday data for 1D period
      let intradayData = [];
      if (period === '1D' && historicalData.length > 0) {
        intradayData = historicalData.slice(-78); // Last ~6.5 hours of 5min data
      }

      return {
        symbol: meta.symbol,
        companyName: meta.longName || meta.shortName || symbol,
        currentPrice,
        change,
        changePercent,
        previousClose,
        dayHigh: meta.regularMarketDayHigh,
        dayLow: meta.regularMarketDayLow,
        volume: meta.regularMarketVolume,
        marketCap: meta.marketCap,
        currency: meta.currency,
        exchangeName: meta.exchangeName,
        timezone: meta.exchangeTimezoneName,
        marketState: meta.marketState,
        historicalData,
        intradayData,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Yahoo Finance API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async fetchYahooRange(symbol: string, range: string, interval: string): Promise<Array<{ timestamp: number; date: string; close: number }>> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&includePrePost=true&events=div%2Csplit`;
    const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return [];
    const timestamps: number[] = Array.isArray(result.timestamp) ? result.timestamp : [];
    const quotes = result.indicators?.quote?.[0] || {};
    const closes: number[] = Array.isArray(quotes.close) ? quotes.close : [];
    const series: Array<{ timestamp: number; date: string; close: number }> = [];
    for (let i = 0; i < Math.min(timestamps.length, closes.length); i++) {
      const ts = timestamps[i];
      const cl = closes[i];
      if (typeof ts === 'number' && typeof cl === 'number') {
        series.push({ timestamp: ts, date: new Date(ts * 1000).toISOString(), close: cl });
      }
    }
    return series;
  }

  private async fetchCompanyProfile(symbol: string): Promise<any> {
    try {
      // Use Alpha Vantage free tier (demo key)
      const apiKey = 'demo';
      const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.Symbol) {
        return {
          name: data.Name,
          description: data.Description,
          sector: data.Sector,
          industry: data.Industry,
          country: data.Country,
          marketCap: data.MarketCapitalization,
          peRatio: data.PERatio,
          eps: data.EPS,
          beta: data.Beta,
          dividendYield: data.DividendYield,
          week52High: data['52WeekHigh'],
          week52Low: data['52WeekLow']
        };
      }
    } catch (error) {
      console.warn('Company profile fetch failed:', error);
    }
    return null;
  }

  private async fetchStockNews(symbol: string): Promise<any[]> {
    try {
      // Use free news API (you might want to replace with a better source)
      const url = `https://api.rss2json.com/v1/api.json?rss_url=https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'ok' && data.items) {
        return data.items.slice(0, 5).map((item: any) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200) + '...'
        }));
      }
    } catch (error) {
      console.warn('News fetch failed:', error);
    }
    return [];
  }

  private formatMarketCap(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }

  private formatVolume(value: number): string {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value?.toString() || '0';
  }

  async execute(args: any): Promise<any> {
    try {
      const symbol = args.symbol.toUpperCase();
      const period = args.period?.toUpperCase() || '1D';
      const interval = args.interval || this.getInterval(period);
      
      console.log(`📊 Getting stock data for: ${symbol}`);
      
      // Fetch main stock data (for current price, meta)
      const stockData = await this.fetchYahooFinanceData(symbol, period, interval);
      
      // Live-like multi-period series using range endpoint
      const ranges: Record<string, string> = {
        '1D': '1d',
        '5D': '5d',
        '1M': '1mo',
        '3M': '3mo',
        '6M': '6mo',
        'YTD': 'ytd',
        '1Y': '1y',
        '2Y': '2y',
        '5Y': '5y',
        'MAX': 'max'
      };
      const intervalByRange: Record<string, string> = {
        '1d': '5m',
        '5d': '15m',
        '1mo': '1h',
        '3mo': '1d',
        '6mo': '1d',
        'ytd': '1d',
        '1y': '1d',
        '2y': '1wk',
        '5y': '1mo',
        'max': '1mo'
      };
      const periodsToFetch = ['1D','5D','1M','6M','YTD','1Y','5Y'];
      const seriesByPeriod: Record<string, any[]> = {};
      for (const p of periodsToFetch) {
        const r = ranges[p];
        const intv = intervalByRange[r];
        try {
          seriesByPeriod[p] = await this.fetchYahooRange(symbol, r, intv);
        } catch (_) {
          seriesByPeriod[p] = [];
        }
      }
      
      // Fetch additional data if requested
      const [profile, news] = await Promise.all([
        args.includeProfile !== false ? this.fetchCompanyProfile(symbol) : null,
        args.includeNews ? this.fetchStockNews(symbol) : []
      ]);

      // Calculate additional metrics
      const isPositive = stockData.change >= 0;
      const formattedPrice = stockData.currentPrice?.toFixed(2);
      const formattedChange = `${isPositive ? '+' : ''}${stockData.change?.toFixed(2)}`;
      const formattedChangePercent = `${isPositive ? '+' : ''}${stockData.changePercent?.toFixed(2)}%`;

      return {
        success: true,
        symbol: stockData.symbol,
        companyName: stockData.companyName,
        currentPrice: stockData.currentPrice,
        formattedPrice,
        change: stockData.change,
        changePercent: stockData.changePercent,
        formattedChange,
        formattedChangePercent,
        isPositive,
        previousClose: stockData.previousClose,
        dayHigh: stockData.dayHigh,
        dayLow: stockData.dayLow,
        volume: stockData.volume,
        formattedVolume: this.formatVolume(stockData.volume),
        marketCap: stockData.marketCap,
        formattedMarketCap: stockData.marketCap ? this.formatMarketCap(stockData.marketCap) : null,
        currency: stockData.currency,
        exchangeName: stockData.exchangeName,
        marketState: stockData.marketState,
        period,
        interval,
        historicalData: stockData.historicalData,
        intradayData: stockData.intradayData,
        seriesByPeriod,
        profile,
        news,
        lastUpdated: stockData.lastUpdated,
        timezone: stockData.timezone
      };

    } catch (error: unknown) {
      console.error("❌ Stock data request failed:", error);
      return {
        success: false,
        error: `Stock data request failed: ${error instanceof Error ? error.message : String(error)}`,
        symbol: args.symbol
      };
    }
  }
}