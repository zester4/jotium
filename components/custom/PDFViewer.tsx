import { jsPDF } from 'jspdf';
import React, { useState, useRef, useEffect } from 'react';

interface PDFContent {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'image' | 'pageBreak' | 'spacer';
  text?: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  headers?: string[];
  rows?: string[][];
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  style?: any;
}

interface PDFConfig {
  title: string;
  content: PDFContent[];
  metadata: {
    author: string;
    subject: string;
    creator: string;
    keywords: string;
    creationDate: string;
  };
  pageSettings: {
    size: string;
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  styling: {
    theme: 'light' | 'dark' | 'auto';
    fontFamily: string;
    primaryColor: string;
    accentColor: string;
  };
  header: {
    enabled: boolean;
    showTitle: boolean;
    showDate: boolean;
    customText: string;
  };
  footer: {
    enabled: boolean;
    showPageNumbers: boolean;
    customText: string;
  };
}

interface PDFViewerProps {
  config: PDFConfig;
  stats: {
    totalBlocks: number;
    headings: number;
    paragraphs: number;
    lists: number;
    tables: number;
    images: number;
    pageBreaks: number;
    estimatedPages: number;
    wordCount: number;
    characterCount: number;
  };
  previewId: string;
  showTypewriter?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  config, 
  stats, 
  previewId, 
  showTypewriter = true 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const getThemeColors = () => {
    const theme = config.styling.theme === 'auto' 
      ? (isDarkMode ? 'dark' : 'light') 
      : config.styling.theme;
    
    if (theme === 'dark') {
      return {
        background: '#18181b',
        text: '#f4f4f5',
        muted: '#71717a',
        border: '#27272a',
        accent: config.styling.accentColor,
        primary: config.styling.primaryColor
      };
    } else {
      return {
        background: '#ffffff',
        text: '#18181b',
        muted: '#71717a',
        border: '#e4e4e7',
        accent: config.styling.accentColor,
        primary: config.styling.primaryColor
      };
    }
  };

  const colors = getThemeColors();

  const downloadPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const doc = new jsPDF({
        orientation: config.pageSettings.orientation,
        unit: 'pt',
        format: config.pageSettings.size.toLowerCase()
      });

      // Set metadata
      doc.setProperties({
        title: config.title,
        subject: config.metadata.subject,
        author: config.metadata.author,
        creator: config.metadata.creator,
        keywords: config.metadata.keywords
      });

      // Set up styling
      const margins = config.pageSettings.margins;
      let currentY = margins.top;
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const contentWidth = pageWidth - margins.left - margins.right;
      let pageNumber = 1;

      // Helper function to add new page
      const addNewPage = () => {
        doc.addPage();
        pageNumber++;
        currentY = margins.top;
        if (config.header.enabled) {
          addHeader();
        }
      };

      // Header function
      const addHeader = () => {
        if (!config.header.enabled) return;
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        let headerY = margins.top - 20;
        
        if (config.header.showTitle && config.title) {
          doc.text(config.title, margins.left, headerY);
        }
        
        if (config.header.showDate) {
          const date = new Date().toLocaleDateString();
          const dateWidth = doc.getTextWidth(date);
          doc.text(date, pageWidth - margins.right - dateWidth, headerY);
        }
        
        if (config.header.customText) {
          const textWidth = doc.getTextWidth(config.header.customText);
          doc.text(config.header.customText, pageWidth / 2 - textWidth / 2, headerY);
        }
        
        // Header line
        doc.setDrawColor(200);
        doc.line(margins.left, margins.top - 10, pageWidth - margins.right, margins.top - 10);
      };

      // Footer function
      const addFooter = () => {
        if (!config.footer.enabled) return;
        
        doc.setFontSize(10);
        doc.setTextColor(150);
        const footerY = pageHeight - margins.bottom + 20;
        
        if (config.footer.showPageNumbers) {
          const pageText = `Page ${pageNumber}`;
          const textWidth = doc.getTextWidth(pageText);
          doc.text(pageText, pageWidth - margins.right - textWidth, footerY);
        }
        
        if (config.footer.customText) {
          doc.text(config.footer.customText, margins.left, footerY);
        }
        
        // Footer line
        doc.setDrawColor(200);
        doc.line(margins.left, pageHeight - margins.bottom + 10, pageWidth - margins.right, pageHeight - margins.bottom + 10);
      };

      // Check if content fits on current page
      const checkPageBreak = (requiredHeight: number) => {
        if (currentY + requiredHeight > pageHeight - margins.bottom - 40) {
          addFooter();
          addNewPage();
          return true;
        }
        return false;
      };

      // Add initial header
      if (config.header.enabled) {
        addHeader();
      }

      // Process content
      for (const block of config.content) {
        switch (block.type) {
          case 'heading':
            const headingSize = Math.max(24 - (block.level || 1) * 3, 12);
            doc.setFontSize(headingSize);
            doc.setFont(config.styling.fontFamily.toLowerCase(), 'bold');
            doc.setTextColor(0);
            
            checkPageBreak(headingSize + 20);
            
            currentY += 20;
            doc.text(block.text || '', margins.left, currentY);
            currentY += headingSize + 10;
            
            // Add underline for h1 and h2
            if ((block.level || 1) <= 2) {
              doc.setDrawColor(100);
              doc.line(margins.left, currentY, margins.left + contentWidth * 0.3, currentY);
              currentY += 10;
            }
            break;

          case 'paragraph':
            doc.setFontSize(11);
            doc.setFont(config.styling.fontFamily.toLowerCase(), 'normal');
            doc.setTextColor(0);
            
            if (block.text) {
              const lines = doc.splitTextToSize(block.text, contentWidth);
              const textHeight = lines.length * 14;
              
              checkPageBreak(textHeight + 20);
              
              currentY += 10;
              doc.text(lines, margins.left, currentY);
              currentY += textHeight + 10;
            }
            break;

          case 'list':
            doc.setFontSize(11);
            doc.setFont(config.styling.fontFamily.toLowerCase(), 'normal');
            doc.setTextColor(0);
            
            if (block.items) {
              for (let i = 0; i < block.items.length; i++) {
                const item = block.items[i];
                const bullet = block.ordered ? `${i + 1}.` : '•';
                const indent = (block.level || 0) * 20;
                
                checkPageBreak(20);
                
                currentY += 15;
                doc.text(bullet, margins.left + indent, currentY);
                
                const itemText = doc.splitTextToSize(item, contentWidth - indent - 20);
                doc.text(itemText, margins.left + indent + 15, currentY);
                currentY += (itemText.length - 1) * 14;
              }
              currentY += 10;
            }
            break;

          case 'table':
            if (block.headers && block.rows) {
              const cellHeight = 25;
              const tableHeight = (block.rows.length + 1) * cellHeight + 20;
              
              checkPageBreak(tableHeight);
              
              currentY += 20;
              
              // Table headers
              const colWidth = contentWidth / block.headers.length;
              doc.setFontSize(10);
              doc.setFont(config.styling.fontFamily.toLowerCase(), 'bold');
              
              for (let i = 0; i < block.headers.length; i++) {
                const x = margins.left + i * colWidth;
                doc.rect(x, currentY, colWidth, cellHeight);
                doc.text(block.headers[i], x + 5, currentY + 15);
              }
              currentY += cellHeight;
              
              // Table rows
              doc.setFont(config.styling.fontFamily.toLowerCase(), 'normal');
              for (const row of block.rows) {
                for (let i = 0; i < row.length && i < block.headers.length; i++) {
                  const x = margins.left + i * colWidth;
                  doc.rect(x, currentY, colWidth, cellHeight);
                  doc.text(row[i] || '', x + 5, currentY + 15);
                }
                currentY += cellHeight;
              }
              currentY += 10;
            }
            break;

          case 'spacer':
            currentY += typeof block.height === 'number' ? block.height : 20;
            break;

          case 'pageBreak':
            addFooter();
            addNewPage();
            break;
        }
      }

      // Add final footer
      addFooter();

      // Generate PDF
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Auto download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      console.error('PDF generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = async () => {
    const textContent = config.content
      .map(block => {
        switch (block.type) {
          case 'heading':
            return `${'#'.repeat(block.level || 1)} ${block.text}\n`;
          case 'paragraph':
            return `${block.text}\n`;
          case 'list':
            return block.items?.map((item, i) => 
              block.ordered ? `${i + 1}. ${item}` : `• ${item}`
            ).join('\n') + '\n';
          case 'table':
            const headers = block.headers?.join(' | ') || '';
            const separator = block.headers?.map(() => '---').join(' | ') || '';
            const rows = block.rows?.map(row => row.join(' | ')).join('\n') || '';
            return headers ? `${headers}\n${separator}\n${rows}\n` : '';
          default:
            return '';
        }
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(textContent);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  return (
    <figure className="my-6 w-full">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {config.title}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span>{stats.wordCount} words</span>
                <span>{stats.estimatedPages} pages</span>
                <span>{stats.totalBlocks} blocks</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={copyContent}
                className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m-3 3V4" />
                  </svg>
                )}
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
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

        {/* Live Preview */}
        <div 
          ref={previewRef}
          className="max-h-[600px] overflow-y-auto"
          style={{ 
            backgroundColor: colors.background,
            color: colors.text
          }}
        >
          {/* Document Preview */}
          <div className="p-8 max-w-none" style={{ 
            fontFamily: config.styling.fontFamily,
            backgroundColor: colors.background,
            color: colors.text
          }}>
            {/* Document Title */}
            <div className="mb-8 pb-4 border-b-2" style={{ borderColor: colors.primary }}>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                {config.title}
              </h1>
              {config.metadata.author && (
                <p className="text-sm" style={{ color: colors.muted }}>
                  By {config.metadata.author} • {new Date(config.metadata.creationDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Content Blocks */}
            {config.content.map((block, index) => (
              <div key={block.id || index} className="mb-4">
                {block.type === 'heading' && (
                  <div className="mb-4">
                    {block.level === 1 && (
                      <h1 className="text-2xl font-bold mb-3 pb-2 border-b" style={{ 
                        color: colors.text,
                        borderColor: colors.border 
                      }}>
                        {block.text}
                      </h1>
                    )}
                    {block.level === 2 && (
                      <h2 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
                        {block.text}
                      </h2>
                    )}
                    {block.level === 3 && (
                      <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
                        {block.text}
                      </h3>
                    )}
                    {block.level === 4 && (
                      <h4 className="text-base font-semibold mb-2" style={{ color: colors.text }}>
                        {block.text}
                      </h4>
                    )}
                    {block.level === 5 && (
                      <h5 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        {block.text}
                      </h5>
                    )}
                    {block.level === 6 && (
                      <h6 className="text-xs font-semibold mb-2" style={{ color: colors.muted }}>
                        {block.text}
                      </h6>
                    )}
                  </div>
                )}

                {block.type === 'paragraph' && (
                  <p className="mb-4 leading-relaxed text-sm" style={{ color: colors.text }}>
                    {block.text}
                  </p>
                )}

                {block.type === 'list' && block.items && (
                  <div className="mb-4" style={{ marginLeft: `${(block.level || 0) * 1.5}rem` }}>
                    {block.ordered ? (
                      <ol className="list-decimal list-inside space-y-1">
                        {block.items.map((item, i) => (
                          <li key={i} className="text-sm" style={{ color: colors.text }}>
                            {item}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul className="list-disc list-inside space-y-1">
                        {block.items.map((item, i) => (
                          <li key={i} className="text-sm" style={{ color: colors.text }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {block.type === 'table' && block.headers && block.rows && (
                  <div className="mb-6 overflow-x-auto">
                    <table className="w-full text-sm border-collapse rounded-lg overflow-hidden" 
                           style={{ borderColor: colors.border }}>
                      <thead>
                        <tr style={{ backgroundColor: colors.primary + '20' }}>
                          {block.headers.map((header, i) => (
                            <th key={i} 
                                className="px-4 py-3 text-left font-semibold border"
                                style={{ 
                                  color: colors.text,
                                  borderColor: colors.border,
                                  backgroundColor: colors.primary + '10'
                                }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-opacity-50" 
                              style={{ 
                                backgroundColor: i % 2 === 0 ? 'transparent' : colors.border + '20' 
                              }}>
                            {row.map((cell, j) => (
                              <td key={j} 
                                  className="px-4 py-3 border"
                                  style={{ 
                                    color: colors.text,
                                    borderColor: colors.border 
                                  }}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {block.type === 'image' && block.src && (
                  <div className="mb-6 text-center">
                    <img 
                      src={block.src} 
                      alt={block.alt || 'Image'}
                      className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
                      style={{ 
                        maxHeight: block.height || '400px',
                        width: block.width || 'auto'
                      }}
                    />
                    {block.alt && (
                      <figcaption className="mt-2 text-xs italic" style={{ color: colors.muted }}>
                        {block.alt}
                      </figcaption>
                    )}
                  </div>
                )}

                {block.type === 'spacer' && (
                  <div style={{ height: `${block.height || 20}px` }} />
                )}

                {block.type === 'pageBreak' && (
                  <div className="my-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
                         style={{ 
                           backgroundColor: colors.border,
                           color: colors.muted 
                         }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                      Page Break
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-4">
              <span>📄 {stats.estimatedPages} pages</span>
              <span>📝 {stats.wordCount} words</span>
              <span>🔢 {stats.characterCount} characters</span>
            </div>
            <div className="flex items-center gap-4">
              <span>📋 {stats.totalBlocks} blocks</span>
              <span>#{stats.headings} headings</span>
              <span>📊 {stats.tables} tables</span>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Iframe Preview */}
      {pdfUrl && (
        <div className="mt-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Generated PDF Preview
                </span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Open in new tab
                </a>
              </div>
            </div>
            <iframe
              src={pdfUrl}
              className="w-full h-96 border-0"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </figure>
  );
};

export default PDFViewer;