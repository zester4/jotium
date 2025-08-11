import { FunctionDeclaration, Type } from "@google/genai";

export class PDFTool {
  getDefinition(): FunctionDeclaration {
    return {
      name: "pdf_generator",
      description: "Generate, preview, and download PDF documents with custom styling. Supports headers, footers, page numbers, and various content types including text, tables, lists, and images.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'create' (generate new PDF), 'preview' (show live preview), 'download' (trigger download)"
          },
          title: {
            type: Type.STRING,
            description: "Document title (appears in header and metadata)"
          },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Content type: 'heading', 'paragraph', 'list', 'table', 'image', 'pageBreak', 'spacer'"
                },
                text: {
                  type: Type.STRING,
                  description: "Text content for headings and paragraphs"
                },
                level: {
                  type: Type.NUMBER,
                  description: "Heading level (1-6) or list indentation level"
                },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List items or table row data"
                },
                headers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Table headers"
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  description: "Table rows data"
                },
                src: {
                  type: Type.STRING,
                  description: "Image source URL"
                },
                alt: {
                  type: Type.STRING,
                  description: "Image alt text"
                },
                style: {
                  type: Type.OBJECT,
                  description: "Custom styling options (fontSize, color, alignment, etc.)"
                },
                height: {
                  type: Type.NUMBER,
                  description: "Height for spacers or images"
                }
              }
            },
            description: "Array of content blocks to include in the PDF"
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING, description: "Document author" },
              subject: { type: Type.STRING, description: "Document subject" },
              creator: { type: Type.STRING, description: "Document creator" },
              keywords: { type: Type.STRING, description: "Document keywords (comma-separated)" }
            },
            description: "PDF metadata"
          },
          pageSettings: {
            type: Type.OBJECT,
            properties: {
              size: {
                type: Type.STRING,
                description: "Page size: 'A4', 'A3', 'A5', 'Letter', 'Legal' (default: A4)"
              },
              orientation: {
                type: Type.STRING,
                description: "Page orientation: 'portrait' or 'landscape' (default: portrait)"
              },
              margins: {
                type: Type.OBJECT,
                properties: {
                  top: { type: Type.NUMBER },
                  right: { type: Type.NUMBER },
                  bottom: { type: Type.NUMBER },
                  left: { type: Type.NUMBER }
                },
                description: "Page margins in points (default: 40 for all sides)"
              }
            },
            description: "Page layout settings"
          },
          styling: {
            type: Type.OBJECT,
            properties: {
              theme: {
                type: Type.STRING,
                description: "Color theme: 'light', 'dark', 'auto' (default: auto - matches current theme)"
              },
              fontFamily: {
                type: Type.STRING,
                description: "Font family: 'Inter', 'Times', 'Helvetica', 'Courier' (default: Inter)"
              },
              primaryColor: {
                type: Type.STRING,
                description: "Primary color hex code (default: #3b82f6)"
              },
              accentColor: {
                type: Type.STRING,
                description: "Accent color hex code (default: #10b981)"
              }
            },
            description: "Document styling options"
          },
          header: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN, description: "Show header (default: true)" },
              showTitle: { type: Type.BOOLEAN, description: "Show document title in header" },
              showDate: { type: Type.BOOLEAN, description: "Show current date in header" },
              customText: { type: Type.STRING, description: "Custom header text" }
            },
            description: "Header configuration"
          },
          footer: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN, description: "Show footer (default: true)" },
              showPageNumbers: { type: Type.BOOLEAN, description: "Show page numbers (default: true)" },
              customText: { type: Type.STRING, description: "Custom footer text" }
            },
            description: "Footer configuration"
          }
        },
        required: ["action", "content"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📄 PDF Generator - ${args.action}:`, args.title || 'Untitled Document');

      const action = args.action || 'create';

      // Validate required fields
      if (!args.content || !Array.isArray(args.content)) {
        throw new Error("Content array is required");
      }

      // Process and validate content
      const processedContent = this.processContent(args.content);
      
      // Set up default configuration
      const config = {
        title: args.title || 'Untitled Document',
        content: processedContent,
        metadata: {
          author: args.metadata?.author || 'AI Agent',
          subject: args.metadata?.subject || args.title || 'Generated Document',
          creator: args.metadata?.creator || 'PDF Tool',
          keywords: args.metadata?.keywords || '',
          creationDate: new Date().toISOString(),
          ...args.metadata
        },
        pageSettings: {
          size: args.pageSettings?.size || 'A4',
          orientation: args.pageSettings?.orientation || 'portrait',
          margins: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
            ...args.pageSettings?.margins
          },
          ...args.pageSettings
        },
        styling: {
          theme: args.styling?.theme || 'auto',
          fontFamily: args.styling?.fontFamily || 'Inter',
          primaryColor: args.styling?.primaryColor || '#3b82f6',
          accentColor: args.styling?.accentColor || '#10b981',
          ...args.styling
        },
        header: {
          enabled: true,
          showTitle: true,
          showDate: true,
          customText: '',
          ...args.header
        },
        footer: {
          enabled: true,
          showPageNumbers: true,
          customText: '',
          ...args.footer
        }
      };

      // Calculate document stats
      const stats = this.calculateStats(processedContent);

      const result = {
        success: true,
        action: action,
        config: config,
        stats: stats,
        timestamp: new Date().toISOString(),
        previewId: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        downloadReady: action === 'create' || action === 'download'
      };

      return result;

    } catch (error: unknown) {
      console.error("❌ PDF generation failed:", error);
      return {
        success: false,
        error: `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action || 'create'
      };
    }
  }

  private processContent(content: any[]): any[] {
    return content.map((block, index) => {
      const processedBlock = {
        id: `block_${index}_${Date.now()}`,
        type: block.type || 'paragraph',
        ...block
      };

      // Validate and set defaults based on content type
      switch (processedBlock.type) {
        case 'heading':
          processedBlock.level = Math.min(Math.max(block.level || 1, 1), 6);
          processedBlock.text = block.text || 'Untitled Heading';
          break;
        
        case 'paragraph':
          processedBlock.text = block.text || '';
          break;
        
        case 'list':
          processedBlock.items = Array.isArray(block.items) ? block.items : [];
          processedBlock.ordered = block.ordered || false;
          processedBlock.level = Math.max(block.level || 0, 0);
          break;
        
        case 'table':
          processedBlock.headers = Array.isArray(block.headers) ? block.headers : [];
          processedBlock.rows = Array.isArray(block.rows) ? block.rows : [];
          break;
        
        case 'image':
          processedBlock.src = block.src || '';
          processedBlock.alt = block.alt || 'Image';
          processedBlock.width = block.width || 'auto';
          processedBlock.height = block.height || 'auto';
          break;
        
        case 'spacer':
          processedBlock.height = Math.max(block.height || 20, 5);
          break;
        
        case 'pageBreak':
          // No additional processing needed
          break;
        
        default:
          processedBlock.type = 'paragraph';
          processedBlock.text = block.text || '';
      }

      return processedBlock;
    });
  }

  private calculateStats(content: any[]): any {
    const stats = {
      totalBlocks: content.length,
      headings: 0,
      paragraphs: 0,
      lists: 0,
      tables: 0,
      images: 0,
      pageBreaks: 0,
      estimatedPages: 1,
      wordCount: 0,
      characterCount: 0
    };

    let estimatedHeight = 0;
    const pageHeight = 792; // A4 height in points minus margins
    const margins = 80; // top + bottom margins
    const usableHeight = pageHeight - margins;

    content.forEach(block => {
      switch (block.type) {
        case 'heading':
          stats.headings++;
          stats.wordCount += (block.text || '').split(/\s+/).length;
          stats.characterCount += (block.text || '').length;
          estimatedHeight += 30 + (block.level <= 2 ? 20 : 10); // heading height + spacing
          break;
        
        case 'paragraph':
          stats.paragraphs++;
          const words = (block.text || '').split(/\s+/).length;
          stats.wordCount += words;
          stats.characterCount += (block.text || '').length;
          estimatedHeight += Math.max(20, Math.ceil(words / 12) * 16) + 10; // estimated paragraph height
          break;
        
        case 'list':
          stats.lists++;
          if (Array.isArray(block.items)) {
            block.items.forEach((item: string) => {
              stats.wordCount += item.split(/\s+/).length;
              stats.characterCount += item.length;
              estimatedHeight += 18; // list item height
            });
          }
          estimatedHeight += 10; // list spacing
          break;
        
        case 'table':
          stats.tables++;
          if (Array.isArray(block.rows)) {
            block.rows.forEach((row: string[]) => {
              row.forEach(cell => {
                stats.wordCount += cell.split(/\s+/).length;
                stats.characterCount += cell.length;
              });
              estimatedHeight += 25; // table row height
            });
          }
          estimatedHeight += 40; // table header + spacing
          break;
        
        case 'image':
          stats.images++;
          estimatedHeight += block.height || 200; // estimated image height
          break;
        
        case 'pageBreak':
          stats.pageBreaks++;
          stats.estimatedPages++;
          estimatedHeight = 0; // reset height calculation
          break;
        
        case 'spacer':
          estimatedHeight += block.height || 20;
          break;
      }
    });

    // Calculate estimated pages based on content height
    stats.estimatedPages = Math.max(1, Math.ceil(estimatedHeight / usableHeight));

    return stats;
  }
}