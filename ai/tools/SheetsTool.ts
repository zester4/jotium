//ai/tools/SheetsTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getDecryptedOAuthAccessToken } from "@/db/queries";

export class SheetsTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "sheets_operations",
      description: "Interact with Google Sheets to create, read, update spreadsheets, manage sheets, format cells, and perform calculations. Requires Google Sheets OAuth connection.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_spreadsheet", "get_spreadsheet", "update_values", "get_values", 
              "append_values", "clear_values", "batch_update", "add_sheet", "delete_sheet",
              "duplicate_sheet", "copy_to", "format_cells", "create_chart", "sort_range",
              "filter_data", "add_conditional_formatting", "protect_range", "create_pivot_table",
              "insert_rows", "insert_columns", "delete_rows", "delete_columns", "merge_cells",
              "unmerge_cells", "set_data_validation", "find_replace", "auto_resize_columns"
            ]
          },
          // Spreadsheet identification
          spreadsheetId: {
            type: Type.STRING,
            description: "The ID of the spreadsheet (required for most operations)"
          },
          // Sheet operations
          sheetId: {
            type: Type.NUMBER,
            description: "The ID of the sheet within the spreadsheet"
          },
          sheetName: {
            type: Type.STRING,
            description: "The name of the sheet (alternative to sheetId)"
          },
          // Create spreadsheet
          title: {
            type: Type.STRING,
            description: "Title for new spreadsheet (required for create_spreadsheet)"
          },
          // Range and data operations
          range: {
            type: Type.STRING,
            description: "A1 notation range (e.g., 'A1:D10', 'Sheet1!A1:B5')"
          },
          values: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: "2D array of values for update/append operations"
          },
          majorDimension: {
            type: Type.STRING,
            description: "How values should be interpreted",
            enum: ["ROWS", "COLUMNS"]
          },
          valueInputOption: {
            type: Type.STRING,
            description: "How input data should be interpreted",
            enum: ["RAW", "USER_ENTERED"]
          },
          // Insert/Delete operations
          startIndex: {
            type: Type.NUMBER,
            description: "Starting index for insert/delete operations (0-based)"
          },
          endIndex: {
            type: Type.NUMBER,
            description: "Ending index for insert/delete operations (0-based, exclusive)"
          },
          inheritFromBefore: {
            type: Type.BOOLEAN,
            description: "Whether to inherit formatting from before the insertion point"
          },
          // Formatting
          format: {
            type: Type.OBJECT,
            description: "Formatting options for cells",
            properties: {
              backgroundColor: { type: Type.STRING, description: "Background color (hex or named)" },
              textColor: { type: Type.STRING, description: "Text color (hex or named)" },
              fontSize: { type: Type.NUMBER, description: "Font size in points" },
              fontFamily: { type: Type.STRING, description: "Font family name" },
              bold: { type: Type.BOOLEAN, description: "Bold text" },
              italic: { type: Type.BOOLEAN, description: "Italic text" },
              underline: { type: Type.BOOLEAN, description: "Underlined text" },
              strikethrough: { type: Type.BOOLEAN, description: "Strikethrough text" },
              horizontalAlignment: { 
                type: Type.STRING, 
                enum: ["LEFT", "CENTER", "RIGHT"],
                description: "Horizontal text alignment" 
              },
              verticalAlignment: { 
                type: Type.STRING, 
                enum: ["TOP", "MIDDLE", "BOTTOM"],
                description: "Vertical text alignment" 
              },
              wrapStrategy: {
                type: Type.STRING,
                enum: ["OVERFLOW_CELL", "LEGACY_WRAP", "CLIP"],
                description: "Text wrapping strategy"
              },
              numberFormat: {
                type: Type.STRING,
                description: "Number format pattern (e.g., '0.00', '$#,##0.00')"
              }
            }
          },
          // Sorting
          sortSpecs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dimensionIndex: { type: Type.NUMBER, description: "Column index to sort by (0-based)" },
                sortOrder: { 
                  type: Type.STRING, 
                  enum: ["ASCENDING", "DESCENDING"],
                  description: "Sort order"
                }
              }
            },
            description: "Sort specifications"
          },
          // Chart creation
          chartType: {
            type: Type.STRING,
            description: "Type of chart to create",
            enum: ["COLUMN", "LINE", "PIE", "BAR", "AREA", "SCATTER", "HISTOGRAM"]
          },
          chartTitle: {
            type: Type.STRING,
            description: "Title for the chart"
          },
          sourceRange: {
            type: Type.STRING,
            description: "Data range for chart source"
          },
          // Data validation
          validationType: {
            type: Type.STRING,
            description: "Type of data validation",
            enum: ["NUMBER_GREATER", "NUMBER_LESS", "NUMBER_BETWEEN", "DATE_BETWEEN", "LIST_OF_ITEMS", "CHECKBOX"]
          },
          validationValues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Values for validation (e.g., list items, min/max values)"
          },
          // Find and replace
          find: {
            type: Type.STRING,
            description: "Text to find"
          },
          replacement: {
            type: Type.STRING,
            description: "Replacement text"
          },
          matchCase: {
            type: Type.BOOLEAN,
            description: "Whether to match case in find/replace"
          },
          matchEntireCell: {
            type: Type.BOOLEAN,
            description: "Whether to match entire cell content"
          },
          searchByRegex: {
            type: Type.BOOLEAN,
            description: "Whether to use regex for search"
          },
          // Protection
          warningOnly: {
            type: Type.BOOLEAN,
            description: "Whether protection is warning-only"
          },
          description: {
            type: Type.STRING,
            description: "Description for protected range"
          },
          // Copy operations
          destinationSpreadsheetId: {
            type: Type.STRING,
            description: "Destination spreadsheet ID for copy operations"
          }
        },
        required: ["action"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ 
        userId: this.userId, 
        service: "sheets" 
      });

      if (!accessToken) {
        return {
          success: false,
          error: "Google Sheets OAuth connection not found. Please connect your Google account first."
        };
      }

      const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      };

      switch (args.action) {
        case "create_spreadsheet":
          return await this.createSpreadsheet(args, headers);
        case "get_spreadsheet":
          return await this.getSpreadsheet(args, headers);
        case "update_values":
          return await this.updateValues(args, headers);
        case "get_values":
          return await this.getValues(args, headers);
        case "append_values":
          return await this.appendValues(args, headers);
        case "clear_values":
          return await this.clearValues(args, headers);
        case "batch_update":
          return await this.batchUpdate(args, headers);
        case "add_sheet":
          return await this.addSheet(args, headers);
        case "delete_sheet":
          return await this.deleteSheet(args, headers);
        case "duplicate_sheet":
          return await this.duplicateSheet(args, headers);
        case "copy_to":
          return await this.copyTo(args, headers);
        case "format_cells":
          return await this.formatCells(args, headers);
        case "create_chart":
          return await this.createChart(args, headers);
        case "sort_range":
          return await this.sortRange(args, headers);
        case "filter_data":
          return await this.filterData(args, headers);
        case "add_conditional_formatting":
          return await this.addConditionalFormatting(args, headers);
        case "protect_range":
          return await this.protectRange(args, headers);
        case "create_pivot_table":
          return await this.createPivotTable(args, headers);
        case "insert_rows":
          return await this.insertRows(args, headers);
        case "insert_columns":
          return await this.insertColumns(args, headers);
        case "delete_rows":
          return await this.deleteRows(args, headers);
        case "delete_columns":
          return await this.deleteColumns(args, headers);
        case "merge_cells":
          return await this.mergeCells(args, headers);
        case "unmerge_cells":
          return await this.unmergeCells(args, headers);
        case "set_data_validation":
          return await this.setDataValidation(args, headers);
        case "find_replace":
          return await this.findReplace(args, headers);
        case "auto_resize_columns":
          return await this.autoResizeColumns(args, headers);
        default:
          return {
            success: false,
            error: `Unknown action: ${args.action}`
          };
      }
    } catch (error: unknown) {
      console.error("❌ Sheets operation failed:", error);
      return {
        success: false,
        error: `Sheets operation failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private async createSpreadsheet(args: any, headers: any): Promise<any> {
    if (!args.title) {
      return { success: false, error: "Title is required for creating spreadsheet" };
    }

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        properties: {
          title: args.title
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to create spreadsheet: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      spreadsheet: {
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
        properties: result.properties
      }
    };
  }

  private async getSpreadsheet(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId) {
      return { success: false, error: "Spreadsheet ID is required" };
    }

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get spreadsheet: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      spreadsheet: result
    };
  }

  private async updateValues(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range || !args.values) {
      return { success: false, error: "Spreadsheet ID, range, and values are required" };
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/${encodeURIComponent(args.range)}?valueInputOption=${args.valueInputOption || 'USER_ENTERED'}`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          range: args.range,
          majorDimension: args.majorDimension || 'ROWS',
          values: args.values
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to update values: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      updatedRange: result.updatedRange,
      updatedRows: result.updatedRows,
      updatedColumns: result.updatedColumns,
      updatedCells: result.updatedCells
    };
  }

  private async getValues(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/${encodeURIComponent(args.range)}`,
      { headers }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to get values: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      range: result.range,
      majorDimension: result.majorDimension,
      values: result.values || []
    };
  }

  private async appendValues(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range || !args.values) {
      return { success: false, error: "Spreadsheet ID, range, and values are required" };
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/${encodeURIComponent(args.range)}:append?valueInputOption=${args.valueInputOption || 'USER_ENTERED'}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          range: args.range,
          majorDimension: args.majorDimension || 'ROWS',
          values: args.values
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to append values: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      spreadsheetId: result.spreadsheetId,
      updatedRange: result.updates.updatedRange,
      updatedRows: result.updates.updatedRows,
      updatedColumns: result.updates.updatedColumns,
      updatedCells: result.updates.updatedCells
    };
  }

  private async clearValues(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/values/${encodeURIComponent(args.range)}:clear`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to clear values: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      spreadsheetId: result.spreadsheetId,
      clearedRange: result.clearedRange
    };
  }

  private async batchUpdate(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId) {
      return { success: false, error: "Spreadsheet ID is required" };
    }

    // This is a flexible method that can handle various batch operations
    const requests = args.requests || [];
    
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requests: requests
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to batch update: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      spreadsheetId: result.spreadsheetId,
      replies: result.replies
    };
  }

  private async addSheet(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId) {
      return { success: false, error: "Spreadsheet ID is required" };
    }

    const request = {
      addSheet: {
        properties: {
          title: args.sheetName || `Sheet${Date.now()}`
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async mergeCells(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const request = {
      mergeCells: {
        range: this.parseRange(args.range, args.sheetId, args.sheetName),
        mergeType: 'MERGE_ALL'
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async unmergeCells(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const request = {
      unmergeCells: {
        range: this.parseRange(args.range, args.sheetId, args.sheetName)
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async setDataValidation(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range || !args.validationType) {
      return { success: false, error: "Spreadsheet ID, range, and validation type are required" };
    }

    const condition = this.buildValidationCondition(args.validationType, args.validationValues);
    
    const request = {
      setDataValidation: {
        range: this.parseRange(args.range, args.sheetId, args.sheetName),
        rule: {
          condition: condition,
          showCustomUi: true,
          strict: true
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async findReplace(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.find || args.replacement === undefined) {
      return { success: false, error: "Spreadsheet ID, find text, and replacement text are required" };
    }

    const request = {
      findReplace: {
        find: args.find,
        replacement: args.replacement,
        matchCase: args.matchCase || false,
        matchEntireCell: args.matchEntireCell || false,
        searchByRegex: args.searchByRegex || false,
        includeFormulas: true,
        range: args.range ? this.parseRange(args.range, args.sheetId, args.sheetName) : undefined
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async autoResizeColumns(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId) {
      return { success: false, error: "Spreadsheet ID is required" };
    }

    const request = {
      autoResizeDimensions: {
        dimensions: {
          sheetId: args.sheetId || 0,
          dimension: 'COLUMNS',
          startIndex: args.startIndex || 0,
          endIndex: args.endIndex || 26 // Default to first 26 columns (A-Z)
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  // Helper methods
  private parseRange(range: string, sheetId?: number, sheetName?: string): any {
    // Convert A1 notation to GridRange format
    if (!range) return null;

    // If range already includes sheet name, use as is
    if (range.includes('!')) {
      const [sheet, cellRange] = range.split('!');
      return this.a1ToGridRange(cellRange, sheet);
    }

    // Use provided sheet info
    const sheet = sheetName || (sheetId !== undefined ? `Sheet${sheetId}` : 'Sheet1');
    return this.a1ToGridRange(range, sheet, sheetId);
  }

  private a1ToGridRange(a1Range: string, sheetName?: string, sheetId?: number): any {
    const match = a1Range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
    
    if (!match) {
      // Single cell or invalid format
      const cellMatch = a1Range.match(/^([A-Z]+)(\d+)$/);
      if (cellMatch) {
        const col = this.columnToIndex(cellMatch[1]);
        const row = parseInt(cellMatch[2]) - 1;
        return {
          sheetId: sheetId || 0,
          startRowIndex: row,
          endRowIndex: row + 1,
          startColumnIndex: col,
          endColumnIndex: col + 1
        };
      }
      return null;
    }

    const [, startCol, startRow, endCol, endRow] = match;
    
    return {
      sheetId: sheetId || 0,
      startRowIndex: parseInt(startRow) - 1,
      endRowIndex: parseInt(endRow),
      startColumnIndex: this.columnToIndex(startCol),
      endColumnIndex: this.columnToIndex(endCol) + 1
    };
  }

  private columnToIndex(column: string): number {
    let result = 0;
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
    }
    return result - 1;
  }

  private buildCellFormat(format: any): any {
    const cellFormat: any = {};

    if (format.backgroundColor) {
      cellFormat.backgroundColor = this.parseColor(format.backgroundColor);
    }
    
    if (format.textColor || format.fontSize || format.fontFamily || 
        format.bold !== undefined || format.italic !== undefined || 
        format.underline !== undefined || format.strikethrough !== undefined) {
      cellFormat.textFormat = {};
      
      if (format.textColor) {
        cellFormat.textFormat.foregroundColor = this.parseColor(format.textColor);
      }
      if (format.fontSize) {
        cellFormat.textFormat.fontSize = format.fontSize;
      }
      if (format.fontFamily) {
        cellFormat.textFormat.fontFamily = format.fontFamily;
      }
      if (format.bold !== undefined) {
        cellFormat.textFormat.bold = format.bold;
      }
      if (format.italic !== undefined) {
        cellFormat.textFormat.italic = format.italic;
      }
      if (format.underline !== undefined) {
        cellFormat.textFormat.underline = format.underline;
      }
      if (format.strikethrough !== undefined) {
        cellFormat.textFormat.strikethrough = format.strikethrough;
      }
    }

    if (format.horizontalAlignment || format.verticalAlignment || format.wrapStrategy) {
      cellFormat.horizontalAlignment = format.horizontalAlignment;
      cellFormat.verticalAlignment = format.verticalAlignment;
      cellFormat.wrapStrategy = format.wrapStrategy;
    }

    if (format.numberFormat) {
      cellFormat.numberFormat = {
        type: 'NUMBER',
        pattern: format.numberFormat
      };
    }

    return cellFormat;
  }

  private parseColor(color: string): any {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return { red: r, green: g, blue: b };
    }

    // Handle named colors (basic set)
    const namedColors: { [key: string]: { red: number, green: number, blue: number } } = {
      'red': { red: 1, green: 0, blue: 0 },
      'green': { red: 0, green: 1, blue: 0 },
      'blue': { red: 0, green: 0, blue: 1 },
      'yellow': { red: 1, green: 1, blue: 0 },
      'orange': { red: 1, green: 0.65, blue: 0 },
      'purple': { red: 0.5, green: 0, blue: 0.5 },
      'pink': { red: 1, green: 0.75, blue: 0.8 },
      'white': { red: 1, green: 1, blue: 1 },
      'black': { red: 0, green: 0, blue: 0 },
      'gray': { red: 0.5, green: 0.5, blue: 0.5 },
      'grey': { red: 0.5, green: 0.5, blue: 0.5 }
    };

    return namedColors[color.toLowerCase()] || { red: 0, green: 0, blue: 0 };
  }

  private getFormatFields(format: any): string {
    const fields = [];
    
    if (format.backgroundColor) fields.push('userEnteredFormat.backgroundColor');
    if (format.textColor || format.fontSize || format.fontFamily || 
        format.bold !== undefined || format.italic !== undefined || 
        format.underline !== undefined || format.strikethrough !== undefined) {
      fields.push('userEnteredFormat.textFormat');
    }
    if (format.horizontalAlignment) fields.push('userEnteredFormat.horizontalAlignment');
    if (format.verticalAlignment) fields.push('userEnteredFormat.verticalAlignment');
    if (format.wrapStrategy) fields.push('userEnteredFormat.wrapStrategy');
    if (format.numberFormat) fields.push('userEnteredFormat.numberFormat');

    return fields.join(',') || 'userEnteredFormat';
  }

  private buildValidationCondition(type: string, values?: string[]): any {
    const condition: any = { type };

    switch (type) {
      case 'NUMBER_GREATER':
      case 'NUMBER_LESS':
        if (values && values.length > 0) {
          condition.values = [{ userEnteredValue: values[0] }];
        }
        break;
      case 'NUMBER_BETWEEN':
      case 'DATE_BETWEEN':
        if (values && values.length >= 2) {
          condition.values = [
            { userEnteredValue: values[0] },
            { userEnteredValue: values[1] }
          ];
        }
        break;
      case 'LIST_OF_ITEMS':
        if (values && values.length > 0) {
          condition.values = values.map(value => ({ userEnteredValue: value }));
        }
        break;
      case 'CHECKBOX':
        condition.values = [
          { userEnteredValue: 'TRUE' },
          { userEnteredValue: 'FALSE' }
        ];
        break;
    }

    return condition;
  }

  private async deleteSheet(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || (!args.sheetId && !args.sheetName)) {
      return { success: false, error: "Spreadsheet ID and either sheet ID or sheet name are required" };
    }

    let sheetId = args.sheetId;
    if (!sheetId && args.sheetName) {
      const spreadsheet = await this.getSpreadsheet(args, headers);
      if (!spreadsheet.success) return spreadsheet;
      
      const sheet = spreadsheet.spreadsheet.sheets?.find((s: any) => s.properties.title === args.sheetName);
      if (!sheet) {
        return { success: false, error: `Sheet '${args.sheetName}' not found` };
      }
      sheetId = sheet.properties.sheetId;
    }

    const request = {
      deleteSheet: {
        sheetId: sheetId
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async duplicateSheet(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || (!args.sheetId && !args.sheetName)) {
      return { success: false, error: "Spreadsheet ID and either sheet ID or sheet name are required" };
    }

    let sheetId = args.sheetId;
    if (!sheetId && args.sheetName) {
      const spreadsheet = await this.getSpreadsheet(args, headers);
      if (!spreadsheet.success) return spreadsheet;
      
      const sheet = spreadsheet.spreadsheet.sheets?.find((s: any) => s.properties.title === args.sheetName);
      if (!sheet) {
        return { success: false, error: `Sheet '${args.sheetName}' not found` };
      }
      sheetId = sheet.properties.sheetId;
    }

    const request = {
      duplicateSheet: {
        sourceSheetId: sheetId,
        newSheetName: args.newSheetName || `Copy of ${args.sheetName || 'Sheet'}`
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async copyTo(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.destinationSpreadsheetId || (!args.sheetId && !args.sheetName)) {
      return { success: false, error: "Source spreadsheet ID, destination spreadsheet ID, and either sheet ID or sheet name are required" };
    }

    let sheetId = args.sheetId;
    if (!sheetId && args.sheetName) {
      const spreadsheet = await this.getSpreadsheet(args, headers);
      if (!spreadsheet.success) return spreadsheet;
      
      const sheet = spreadsheet.spreadsheet.sheets?.find((s: any) => s.properties.title === args.sheetName);
      if (!sheet) {
        return { success: false, error: `Sheet '${args.sheetName}' not found` };
      }
      sheetId = sheet.properties.sheetId;
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheetId}/sheets/${sheetId}:copyTo`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          destinationSpreadsheetId: args.destinationSpreadsheetId
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Failed to copy sheet: ${error}` };
    }

    const result = await response.json();
    return {
      success: true,
      sheetProperties: result
    };
  }

  private async formatCells(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range || !args.format) {
      return { success: false, error: "Spreadsheet ID, range, and format are required" };
    }

    const request = {
      repeatCell: {
        range: this.parseRange(args.range, args.sheetId, args.sheetName),
        cell: {
          userEnteredFormat: this.buildCellFormat(args.format)
        },
        fields: this.getFormatFields(args.format)
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async createChart(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.sourceRange || !args.chartType) {
      return { success: false, error: "Spreadsheet ID, source range, and chart type are required" };
    }

    const sourceGridRange = this.parseRange(args.sourceRange, args.sheetId, args.sheetName);

    const request = {
      addChart: {
        chart: {
          spec: {
            title: args.chartTitle || 'Chart',
            basicChart: {
              chartType: args.chartType,
              legendPosition: 'BOTTOM_LEGEND',
              axis: [
                {
                  position: 'BOTTOM_AXIS',
                  title: 'Category'
                },
                {
                  position: 'LEFT_AXIS',
                  title: 'Value'
                }
              ],
              domains: [
                {
                  domain: { sourceRange: { sources: [sourceGridRange] } }
                }
              ],
              series: [
                {
                  series: { sourceRange: { sources: [sourceGridRange] } }
                }
              ]
            }
          },
          position: {
            overlayPosition: {
              anchorCell: {
                sheetId: args.sheetId || 0,
                rowIndex: 0,
                columnIndex: 0
              },
              offsetXPixels: 10,
              offsetYPixels: 10,
              widthPixels: 600,
              heightPixels: 371
            }
          }
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async sortRange(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range || !args.sortSpecs) {
      return { success: false, error: "Spreadsheet ID, range, and sort specifications are required" };
    }

    const request = {
      sortRange: {
        range: this.parseRange(args.range, args.sheetId, args.sheetName),
        sortSpecs: args.sortSpecs
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async filterData(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const request = {
      setBasicFilter: {
        filter: {
          range: this.parseRange(args.range, args.sheetId, args.sheetName)
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async addConditionalFormatting(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    // Basic conditional formatting example
    const request = {
      addConditionalFormatRule: {
        rule: {
          ranges: [this.parseRange(args.range, args.sheetId, args.sheetName)],
          booleanRule: {
            condition: {
              type: 'NUMBER_GREATER',
              values: [{ userEnteredValue: '0' }]
            },
            format: {
              backgroundColor: { red: 0.8, green: 1.0, blue: 0.8 }
            }
          }
        },
        index: 0
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async protectRange(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.range) {
      return { success: false, error: "Spreadsheet ID and range are required" };
    }

    const request = {
      addProtectedRange: {
        protectedRange: {
          range: this.parseRange(args.range, args.sheetId, args.sheetName),
          description: args.description || 'Protected Range',
          warningOnly: args.warningOnly || false
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async createPivotTable(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || !args.sourceRange) {
      return { success: false, error: "Spreadsheet ID and source range are required" };
    }

    const request = {
      updateCells: {
        range: this.parseRange('A1', args.sheetId, args.sheetName),
        rows: [
          {
            values: [
              {
                pivotTable: {
                  source: this.parseRange(args.sourceRange, args.sheetId, args.sheetName),
                  rows: [],
                  columns: [],
                  values: []
                }
              }
            ]
          }
        ],
        fields: 'pivotTable'
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async insertRows(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || args.startIndex === undefined) {
      return { success: false, error: "Spreadsheet ID and start index are required" };
    }

    const request = {
      insertDimension: {
        range: {
          sheetId: args.sheetId || 0,
          dimension: 'ROWS',
          startIndex: args.startIndex,
          endIndex: args.endIndex || args.startIndex + 1
        },
        inheritFromBefore: args.inheritFromBefore || false
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async insertColumns(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || args.startIndex === undefined) {
      return { success: false, error: "Spreadsheet ID and start index are required" };
    }

    const request = {
      insertDimension: {
        range: {
          sheetId: args.sheetId || 0,
          dimension: 'COLUMNS',
          startIndex: args.startIndex,
          endIndex: args.endIndex || args.startIndex + 1
        },
        inheritFromBefore: args.inheritFromBefore || false
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async deleteRows(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || args.startIndex === undefined) {
      return { success: false, error: "Spreadsheet ID and start index are required" };
    }

    const request = {
      deleteDimension: {
        range: {
          sheetId: args.sheetId || 0,
          dimension: 'ROWS',
          startIndex: args.startIndex,
          endIndex: args.endIndex || args.startIndex + 1
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId, 
      requests: [request] 
    }, headers);
  }

  private async deleteColumns(args: any, headers: any): Promise<any> {
    if (!args.spreadsheetId || args.startIndex === undefined) {
      return { success: false, error: "Spreadsheet ID and start index are required" };
    }

    const request = {
      deleteDimension: {
        range: {
          sheetId: args.sheetId || 0,
          dimension: 'COLUMNS',
          startIndex: args.startIndex,
          endIndex: args.endIndex || args.startIndex + 1
        }
      }
    };

    return await this.batchUpdate({ 
      spreadsheetId: args.spreadsheetId,
      requests: [request]
    }, headers);
  }
}
