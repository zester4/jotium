import React, { useState, useRef, useEffect } from 'react';

import { Markdown } from './markdown'; 

interface ScrapeData {
  markdown?: string;
  html?: string;
  json?: any;
  metadata?: {
    title?: string;
    description?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    favicon?: string;
    statusCode?: number;
    url?: string;
    timestamp?: string;
  };
  links?: Array<{
    url: string;
    text: string;
  }>;
  images?: Array<{
    url: string;
    alt: string;
  }>;
  sourceURL?: string;
}

interface ScrapeConfig {
  action: 'scrape' | 'crawl' | 'extract' | 'search' | 'check_crawl_status';
  url?: string;
  query?: string;
  jobId?: string;
  formats: string[];
  limit?: number;
  onlyMainContent?: boolean;
  parsePDF?: boolean;
  maxAge?: number;
  extractionSchema?: any;
}

interface CrawlResult {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  total?: number;
  completed?: number;
  creditsUsed?: number;
  expiresAt?: string;
  data?: ScrapeData[];
}

interface SearchResult {
  results: Array<{
    url: string;
    title: string;
    description: string;
    data: ScrapeData;
  }>;
}

interface ScrapeViewerProps {
  success: boolean;
  action: string;
  url?: string;
  query?: string;
  jobId?: string;
  data?: ScrapeData | ScrapeData[] | CrawlResult | SearchResult;
  extractedData?: any;
  schema?: any;
  formats?: string[];
  limit?: number;
  timestamp: string;
  error?: string;
  showTypewriter?: boolean;
}

const ScrapeViewer: React.FC<ScrapeViewerProps> = ({
  success,
  action,
  url,
  query,
  jobId,
  data,
  extractedData,
  schema,
  formats = ['markdown'],
  limit,
  timestamp,
  error,
  showTypewriter = true
}) => {
  const [activeTab, setActiveTab] = useState<string>('preview');
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Auto-select best tab based on available data
  useEffect(() => {
    if (success && data) {
      if (action === 'extract' && extractedData) {
        setActiveTab('extracted');
      } else if (Array.isArray(data)) {
        setActiveTab('results');
      } else if ('markdown' in data && data.markdown) {
        setActiveTab('preview');
      } else if ('html' in data && data.html) {
        setActiveTab('html');
      } else {
        setActiveTab('raw');
      }
    }
  }, [success, data, action, extractedData]);

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'scrape':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'crawl':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        );
      case 'search':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'extract':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  const getStatusColor = () => {
    if (!success) return 'text-red-500';
    if (action === 'crawl' && data && 'status' in data) {
      switch (data.status) {
        case 'completed': return 'text-green-500';
        case 'processing': return 'text-yellow-500';
        case 'failed': return 'text-red-500';
        default: return 'text-blue-500';
      }
    }
    return 'text-green-500';
  };

  const renderMetadata = (metadata: ScrapeData['metadata']) => {
    if (!metadata) return null;

    return (
      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-sm mb-3 text-zinc-900 dark:text-zinc-100">Page Metadata</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {metadata.title && (
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Title:</span>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{metadata.title}</p>
            </div>
          )}
          {metadata.description && (
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Description:</span>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">{metadata.description}</p>
            </div>
          )}
          {metadata.statusCode && (
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Status:</span>
              <p className={`mt-1 font-mono ${metadata.statusCode === 200 ? 'text-green-600' : 'text-red-600'}`}>
                {metadata.statusCode}
              </p>
            </div>
          )}
          {metadata.timestamp && (
            <div>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Scraped:</span>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                {new Date(metadata.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        {metadata.ogImage && (
          <div className="mt-3">
            <img 
              src={metadata.ogImage} 
              alt="Page preview" 
              className="w-full max-w-sm h-auto rounded border border-zinc-200 dark:border-zinc-700"
            />
          </div>
        )}
      </div>
    );
  };

  const renderCrawlStatus = (crawlData: CrawlResult) => {
    const progress = crawlData.total ? (crawlData.completed || 0) / crawlData.total * 100 : 0;

    return (
      <div className="space-y-4">
        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Crawl Status</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              crawlData.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              crawlData.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {crawlData.status}
            </span>
          </div>
          
          {crawlData.total && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>Progress</span>
                <span>{crawlData.completed || 0} / {crawlData.total}</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
            {crawlData.creditsUsed && (
              <div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Credits Used:</span>
                <p className="text-zinc-600 dark:text-zinc-400">{crawlData.creditsUsed}</p>
              </div>
            )}
            {crawlData.expiresAt && (
              <div>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Expires:</span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {new Date(crawlData.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {crawlData.data && crawlData.data.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Scraped Pages</h4>
            {crawlData.data.map((item, index) => (
              <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedItems);
                    if (newExpanded.has(index)) {
                      newExpanded.delete(index);
                    } else {
                      newExpanded.add(index);
                    }
                    setExpandedItems(newExpanded);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                        {item.metadata?.title || item.sourceURL || `Page ${index + 1}`}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {item.sourceURL}
                      </p>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-zinc-400 transition-transform ${
                        expandedItems.has(index) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                
                {expandedItems.has(index) && (
                  <div className="border-t border-zinc-200 dark:border-zinc-700 p-4 bg-white dark:bg-zinc-900">
                    {item.metadata && renderMetadata(item.metadata)}
                    {item.markdown && (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Markdown showTypewriter={false}>
                          {item.markdown.slice(0, 500) + (item.markdown.length > 500 ? '...' : '')}
                        </Markdown>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSearchResults = (searchData: SearchResult) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Search Results ({searchData.results.length})
          </h4>
        </div>
        
        {searchData.results.map((result, index) => (
          <div key={index} className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                    {result.title}
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    {result.url}
                  </p>
                  {result.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-3">
                      {result.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedItems);
                    if (newExpanded.has(index)) {
                      newExpanded.delete(index);
                    } else {
                      newExpanded.add(index);
                    }
                    setExpandedItems(newExpanded);
                  }}
                  className="ml-3 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                >
                  <svg 
                    className={`w-4 h-4 text-zinc-400 transition-transform ${
                      expandedItems.has(index) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {expandedItems.has(index) && result.data.markdown && (
                <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown showTypewriter={false}>
                      {result.data.markdown.slice(0, 800) + (result.data.markdown.length > 800 ? '...' : '')}
                    </Markdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const availableTabs = [];
  if (success && data) {
    if (action === 'extract' && extractedData) {
      availableTabs.push('extracted');
    }
    if (Array.isArray(data)) {
      availableTabs.push('results');
    }
    if (!Array.isArray(data) && data && 'markdown' in data && data.markdown) {
      availableTabs.push('preview');
    }
    if (!Array.isArray(data) && data && 'html' in data && data.html) {
      availableTabs.push('html');
    }
    availableTabs.push('raw');
  }

  return (
    <figure className="my-6 w-full">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={getStatusColor()}>
                  {getActionIcon()}
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">
                  {action}
                  {action === 'crawl' && jobId && ` (${jobId.slice(0, 8)}...)`}
                </span>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 text-xs">
                {url && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                    {new URL(url).hostname}
                  </span>
                )}
                {query && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                    Query: {query}
                  </span>
                )}
                {formats?.map(format => (
                  <span key={format} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                    {format}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && availableTabs.length > 0 && (
          <>
            {/* Tabs */}
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/30">
              {availableTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab === 'extracted' && '🎯 Extracted'}
                  {tab === 'results' && '📊 Results'}
                  {tab === 'preview' && '👁️ Preview'}
                  {tab === 'html' && '🌐 HTML'}
                  {tab === 'raw' && '📋 Raw Data'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="max-h-[600px] overflow-y-auto">
              {/* Extracted Data Tab */}
              {activeTab === 'extracted' && extractedData && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Extracted Data</h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(extractedData, null, 2), 'extracted')}
                      className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied === 'extracted' ? '✅ Copied!' : '📋 Copy JSON'}
                    </button>
                  </div>
                  
                  {schema && (
                    <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                      <h5 className="font-medium text-sm text-zinc-700 dark:text-zinc-300 mb-2">Schema Used:</h5>
                      <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                        {JSON.stringify(schema, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg p-4">
                    <pre className="text-sm text-green-400 overflow-x-auto">
                      {JSON.stringify(extractedData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Results Tab (for crawl status or search results) */}
              {activeTab === 'results' && data && (
                <div className="p-4">
                  {'status' in data && renderCrawlStatus(data as CrawlResult)}
                  {'results' in data && renderSearchResults(data as SearchResult)}
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && data && !Array.isArray(data) && 'markdown' in data && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Content Preview</h4>
                    <button
                      onClick={() => copyToClipboard(data.markdown || '', 'markdown')}
                      className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied === 'markdown' ? '✅ Copied!' : '📋 Copy Markdown'}
                    </button>
                  </div>
                  
                  {data.metadata && renderMetadata(data.metadata)}
                  
                  {data.markdown && (
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                      <Markdown showTypewriter={showTypewriter}>
                        {data.markdown}
                      </Markdown>
                    </div>
                  )}
                </div>
              )}

              {/* HTML Tab */}
              {activeTab === 'html' && data && !Array.isArray(data) && 'html' in data && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">HTML Source</h4>
                    <button
                      onClick={() => copyToClipboard(data.html || '', 'html')}
                      className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied === 'html' ? '✅ Copied!' : '📋 Copy HTML'}
                    </button>
                  </div>
                  
                  <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                      <code dangerouslySetInnerHTML={{ 
                        __html: data.html?.replace(/</g, '&lt;').replace(/>/g, '&gt;') || ''
                      }} />
                    </pre>
                  </div>
                </div>
              )}

              {/* Raw Data Tab */}
              {activeTab === 'raw' && (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Raw Response Data</h4>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'raw')}
                      className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      {copied === 'raw' ? '✅ Copied!' : '📋 Copy JSON'}
                    </button>
                  </div>
                  
                  <div className="bg-zinc-900 dark:bg-zinc-800 rounded-lg p-4">
                    <pre className="text-sm text-green-400 overflow-x-auto">
                      {JSON.stringify({ 
                        success, action, url, query, jobId, data, extractedData, 
                        formats, limit, timestamp 
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </figure>
  );
};

export default ScrapeViewer;