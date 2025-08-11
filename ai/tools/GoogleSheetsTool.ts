//ai/tools/GoogleSheetsTool.ts
import { FunctionDeclaration, Type } from "@google/genai";
import { getDecryptedOAuthAccessToken } from "@/db/queries";

type HeadersLike = Record<string, string>;

interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties?: {
    rowCount: number;
    columnCount: number;
  };
}

interface SpreadsheetInfo {
  spreadsheetId: string;
  title: string;
  locale: string;
  timeZone: string;
  sheets: SheetInfo[];
}

export class GoogleSheetsTool {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  getDefinition(): FunctionDeclaration {
    return {
      name: "google_sheets_operations",
      description:
        "Work with Google Sheets using the same Gmail OAuth connection (unified Google service). Supports creating spreadsheets, adding sheets, reading/appending/clearing values, batch updating values, getting sheet metadata, formatting cells, and managing spreadsheet properties.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "The action to perform",
            enum: [
              "create_spreadsheet",
              "get_spreadsheet",
              "get_spreadsheet_info",
              "list_all_sheets",
              "add_sheet",
              "delete_sheet",
              "duplicate_sheet",
              "rename_sheet",
              "read_values",
              "append_values",
              "update_values",
              "clear_values",
              "batch_update_values",
              "format_cells",
              "resize_sheet",
              "protect_range",
              "unprotect_range",
              "copy_sheet_to_another_spreadsheet",
              "get_sheet_properties",
              "search_and_replace",
              "list_spreadsheets"
            ],
          },
          // Common identifiers
          spreadsheetId: { type: Type.STRING, description: "Target spreadsheet ID" },
          destinationSpreadsheetId: { type: Type.STRING, description: "Destination spreadsheet ID for copying" },
          sheetId: { type: Type.NUMBER, description: "Numeric sheet ID for delete/duplicate/rename" },
          sheetTitle: { type: Type.STRING, description: "Sheet title for add/duplicate/rename" },
          newTitle: { type: Type.STRING, description: "New title for rename operations" },
          
          // Create spreadsheet
          title: { type: Type.STRING, description: "Spreadsheet title (create_spreadsheet)" },
          
          // Value operations
          range: { type: Type.STRING, description: "A1 notation range, e.g., Sheet1!A1:C10" },
          values: {
            type: Type.ARRAY,
            description: "2D array of values for write/append/batch",
            items: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          data: {
            type: Type.ARRAY,
            description: "Batch data: [{ range: string, values: string[][] }]",
            items: {
              type: Type.OBJECT,
              properties: {
                range: { type: Type.STRING },
                values: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
              },
            },
          },
          valueInputOption: {
            type: Type.STRING,
            description: "Value input option for writes",
            enum: ["RAW", "USER_ENTERED"],
          },
          includeGridData: { type: Type.BOOLEAN, description: "Include grid data in get_spreadsheet" },
          
          // Formatting options
          backgroundColor: { type: Type.STRING, description: "Background color (hex format, e.g., #FF0000)" },
          textColor: { type: Type.STRING, description: "Text color (hex format)" },
          bold: { type: Type.BOOLEAN, description: "Make text bold" },
          italic: { type: Type.BOOLEAN, description: "Make text italic" },
          fontSize: { type: Type.NUMBER, description: "Font size" },
          fontFamily: { type: Type.STRING, description: "Font family" },
          
          // Sheet dimensions
          rowCount: { type: Type.NUMBER, description: "Number of rows for resize" },
          columnCount: { type: Type.NUMBER, description: "Number of columns for resize" },
          
          // Protection
          protectedRangeId: { type: Type.NUMBER, description: "Protected range ID for unprotect" },
          description: { type: Type.STRING, description: "Description for protected range" },
          warningOnly: { type: Type.BOOLEAN, description: "Warning only protection (default: false)" },
          
          // Search and replace
          searchText: { type: Type.STRING, description: "Text to search for" },
          replacementText: { type: Type.STRING, description: "Replacement text" },
          matchCase: { type: Type.BOOLEAN, description: "Match case in search (default: false)" },
          matchEntireCell: { type: Type.BOOLEAN, description: "Match entire cell (default: false)" },
          includeFormulas: { type: Type.BOOLEAN, description: "Include formulas in search (default: false)" },
        },
        required: ["action"],
      },
    };
  }

  async execute(args: any): Promise<any> {
    try {
      // Reuse Gmail OAuth token (unified Google service)
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      switch (args.action) {
        case "create_spreadsheet":
          return await this.createSpreadsheet(args.title, headers);
        case "get_spreadsheet":
          return await this.getSpreadsheet(args.spreadsheetId, Boolean(args.includeGridData), headers);
        case "get_spreadsheet_info":
          return await this.getSpreadsheetInfo(args.spreadsheetId, headers);
        case "list_all_sheets":
          return await this.listAllSheets(args.spreadsheetId, headers);
        case "add_sheet":
          return await this.addSheet(args.spreadsheetId, args.sheetTitle, headers);
        case "delete_sheet":
          return await this.deleteSheet(args.spreadsheetId, args.sheetId, headers);
        case "duplicate_sheet":
          return await this.duplicateSheet(args.spreadsheetId, args.sheetId, args.sheetTitle, headers);
        case "rename_sheet":
          return await this.renameSheet(args.spreadsheetId, args.sheetId, args.newTitle, headers);
        case "read_values":
          return await this.readValues(args.spreadsheetId, args.range, headers);
        case "append_values":
          return await this.appendValues(
            args.spreadsheetId,
            args.range,
            args.values,
            args.valueInputOption || "USER_ENTERED",
            headers,
          );
        case "update_values":
          return await this.updateValues(
            args.spreadsheetId,
            args.range,
            args.values,
            args.valueInputOption || "USER_ENTERED",
            headers,
          );
        case "clear_values":
          return await this.clearValues(args.spreadsheetId, args.range, headers);
        case "batch_update_values":
          return await this.batchUpdateValues(
            args.spreadsheetId,
            args.data,
            args.valueInputOption || "USER_ENTERED",
            headers,
          );
        case "format_cells":
          return await this.formatCells(args.spreadsheetId, args.range, args, headers);
        case "resize_sheet":
          return await this.resizeSheet(args.spreadsheetId, args.sheetId, args.rowCount, args.columnCount, headers);
        case "protect_range":
          return await this.protectRange(
            args.spreadsheetId,
            args.range,
            args.description,
            args.warningOnly || false,
            headers
          );
        case "unprotect_range":
          return await this.unprotectRange(args.spreadsheetId, args.protectedRangeId, headers);
        case "copy_sheet_to_another_spreadsheet":
          return await this.copySheetToAnotherSpreadsheet(
            args.spreadsheetId,
            args.sheetId,
            args.destinationSpreadsheetId,
            headers
          );
        case "get_sheet_properties":
          return await this.getSheetProperties(args.spreadsheetId, args.sheetId, headers);
        case "search_and_replace":
          return await this.searchAndReplace(
            args.spreadsheetId,
            args.searchText,
            args.replacementText,
            args.sheetId,
            args.matchCase || false,
            args.matchEntireCell || false,
            args.includeFormulas || false,
            headers
          );
        case "list_spreadsheets":
          return await this.listSpreadsheets(headers);
        default:
          return { success: false, error: `Unknown action: ${args.action}` };
      }
    } catch (error: unknown) {
      return {
        success: false,
        error: `Google Sheets operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // ============ Enhanced metadata operations ============
  private async getSpreadsheetInfo(spreadsheetId: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId) return { success: false, error: "spreadsheetId is required" };
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, { headers });
    if (!res.ok) return { success: false, error: await res.text() };
    
    const data = await res.json();
    const info: SpreadsheetInfo = {
      spreadsheetId: data.spreadsheetId,
      title: data.properties.title,
      locale: data.properties.locale,
      timeZone: data.properties.timeZone,
      sheets: data.sheets.map((sheet: any) => ({
        sheetId: sheet.properties.sheetId,
        title: sheet.properties.title,
        index: sheet.properties.index,
        sheetType: sheet.properties.sheetType,
        gridProperties: sheet.properties.gridProperties,
      })),
    };
    
    return { success: true, info };
  }

  private async listAllSheets(spreadsheetId: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId) return { success: false, error: "spreadsheetId is required" };
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, { headers });
    if (!res.ok) return { success: false, error: await res.text() };
    
    const data = await res.json();
    const sheets = data.sheets.map((sheet: any) => ({
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      index: sheet.properties.index,
      rowCount: sheet.properties.gridProperties?.rowCount || 0,
      columnCount: sheet.properties.gridProperties?.columnCount || 0,
    }));
    
    return { success: true, sheets };
  }

  private async getSheetProperties(spreadsheetId: string, sheetId: number, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || sheetId === undefined) return { success: false, error: "spreadsheetId and sheetId are required" };
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, { headers });
    if (!res.ok) return { success: false, error: await res.text() };
    
    const data = await res.json();
    const sheet = data.sheets.find((s: any) => s.properties.sheetId === sheetId);
    
    if (!sheet) return { success: false, error: "Sheet not found" };
    
    return { success: true, properties: sheet.properties };
  }

  // ============ Spreadsheet discovery ============
  private async listSpreadsheets(headers: HeadersLike): Promise<any> {
    try {
      // Use Google Drive API to find Google Sheets files
      const url = new URL("https://www.googleapis.com/drive/v3/files");
      url.searchParams.set("q", "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
      url.searchParams.set("fields", "files(id,name,modifiedTime,createdTime,owners,webViewLink)");
      url.searchParams.set("orderBy", "modifiedTime desc");
      url.searchParams.set("pageSize", "50");
      
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) return { success: false, error: await res.text() };
      
      const data = await res.json();
      const spreadsheets = data.files.map((file: any) => ({
        spreadsheetId: file.id,
        title: file.name,
        modifiedTime: file.modifiedTime,
        createdTime: file.createdTime,
        webViewLink: file.webViewLink,
        owners: file.owners
      }));
      
      return { success: true, spreadsheets };
    } catch (error) {
      return { success: false, error: `Failed to list spreadsheets: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Get the most recently modified spreadsheets
   */
  async getRecentSpreadsheets(limit: number = 10): Promise<{ success: boolean; spreadsheets?: Array<{ spreadsheetId: string; title: string; modifiedTime: string }>, error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const result = await this.listSpreadsheets(headers);
      if (!result.success) return result;
      
      return {
        success: true,
        spreadsheets: result.spreadsheets.slice(0, limit)
      };
    } catch (error) {
      return { success: false, error: `Failed to get recent spreadsheets: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Search for spreadsheets by name
   */
  async searchSpreadsheetsByName(searchTerm: string): Promise<{ success: boolean; spreadsheets?: Array<{ spreadsheetId: string; title: string; modifiedTime: string }>, error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      // Use Google Drive API with name search
      const url = new URL("https://www.googleapis.com/drive/v3/files");
      url.searchParams.set("q", `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and name contains '${searchTerm}'`);
      url.searchParams.set("fields", "files(id,name,modifiedTime,createdTime,webViewLink)");
      url.searchParams.set("orderBy", "modifiedTime desc");
      
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) return { success: false, error: await res.text() };
      
      const data = await res.json();
      const spreadsheets = data.files.map((file: any) => ({
        spreadsheetId: file.id,
        title: file.name,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink
      }));
      
      return { success: true, spreadsheets };
    } catch (error) {
      return { success: false, error: `Failed to search spreadsheets: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // ============ Enhanced sheet operations ============
  private async renameSheet(spreadsheetId: string, sheetId: number, newTitle: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || sheetId === undefined || !newTitle) {
      return { success: false, error: "spreadsheetId, sheetId and newTitle are required" };
    }
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{
          updateSheetProperties: {
            properties: { sheetId, title: newTitle },
            fields: "title"
          }
        }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async resizeSheet(spreadsheetId: string, sheetId: number, rowCount?: number, columnCount?: number, headers?: HeadersLike): Promise<any> {
    if (!spreadsheetId || sheetId === undefined || (!rowCount && !columnCount)) {
      return { success: false, error: "spreadsheetId, sheetId and at least one of rowCount/columnCount are required" };
    }
    
    const gridProperties: any = {};
    if (rowCount) gridProperties.rowCount = rowCount;
    if (columnCount) gridProperties.columnCount = columnCount;
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{
          updateSheetProperties: {
            properties: { sheetId, gridProperties },
            fields: Object.keys(gridProperties).map(key => `gridProperties.${key}`).join(",")
          }
        }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async copySheetToAnotherSpreadsheet(
    sourceSpreadsheetId: string,
    sheetId: number,
    destinationSpreadsheetId: string,
    headers: HeadersLike
  ): Promise<any> {
    if (!sourceSpreadsheetId || sheetId === undefined || !destinationSpreadsheetId) {
      return { success: false, error: "sourceSpreadsheetId, sheetId and destinationSpreadsheetId are required" };
    }
    
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sourceSpreadsheetId}/sheets/${sheetId}:copyTo`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ destinationSpreadsheetId }),
      }
    );
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, copiedSheet: data };
  }

  // ============ Enhanced value operations ============
  private async updateValues(
    spreadsheetId: string,
    range: string,
    values: string[][],
    valueInputOption: string,
    headers: HeadersLike
  ): Promise<any> {
    if (!spreadsheetId || !range || !Array.isArray(values)) {
      return { success: false, error: "spreadsheetId, range, values are required" };
    }
    
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`);
    url.searchParams.set("valueInputOption", valueInputOption || "USER_ENTERED");
    
    const res = await fetch(url.toString(), {
      method: "PUT",
      headers,
      body: JSON.stringify({ values }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, updates: data };
  }

  // ============ Formatting operations ============
  private async formatCells(spreadsheetId: string, range: string, formatOptions: any, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !range) return { success: false, error: "spreadsheetId and range are required" };
    
    // Parse range to get sheet ID and cell coordinates
    const rangeInfo = await this.parseRange(spreadsheetId, range, headers);
    if (!rangeInfo.success) return rangeInfo;
    
    const userEnteredFormat: any = {};
    
    // Text formatting
    if (formatOptions.bold !== undefined || formatOptions.italic !== undefined || 
        formatOptions.fontSize !== undefined || formatOptions.fontFamily !== undefined) {
      userEnteredFormat.textFormat = {};
      if (formatOptions.bold !== undefined) userEnteredFormat.textFormat.bold = formatOptions.bold;
      if (formatOptions.italic !== undefined) userEnteredFormat.textFormat.italic = formatOptions.italic;
      if (formatOptions.fontSize !== undefined) userEnteredFormat.textFormat.fontSize = formatOptions.fontSize;
      if (formatOptions.fontFamily !== undefined) userEnteredFormat.textFormat.fontFamily = formatOptions.fontFamily;
      if (formatOptions.textColor) {
        userEnteredFormat.textFormat.foregroundColor = this.hexToRgb(formatOptions.textColor);
      }
    }
    
    // Background color
    if (formatOptions.backgroundColor) {
      userEnteredFormat.backgroundColor = this.hexToRgb(formatOptions.backgroundColor);
    }
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{
          repeatCell: {
            range: rangeInfo.gridRange,
            cell: { userEnteredFormat },
            fields: Object.keys(userEnteredFormat).map(key => `userEnteredFormat.${key}`).join(",")
          }
        }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  // ============ Protection operations ============
  private async protectRange(
    spreadsheetId: string,
    range: string,
    description?: string,
    warningOnly: boolean = false,
    headers?: HeadersLike
  ): Promise<any> {
    if (!spreadsheetId || !range) return { success: false, error: "spreadsheetId and range are required" };
    
    const rangeInfo = await this.parseRange(spreadsheetId, range, headers!);
    if (!rangeInfo.success) return rangeInfo;
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{
          addProtectedRange: {
            protectedRange: {
              range: rangeInfo.gridRange,
              description: description || `Protected range: ${range}`,
              warningOnly
            }
          }
        }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, protectedRange: data.replies[0].addProtectedRange.protectedRange };
  }

  private async unprotectRange(spreadsheetId: string, protectedRangeId: number, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || protectedRangeId === undefined) {
      return { success: false, error: "spreadsheetId and protectedRangeId are required" };
    }
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{ deleteProtectedRange: { protectedRangeId } }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  // ============ Search and replace ============
  private async searchAndReplace(
    spreadsheetId: string,
    searchText: string,
    replacementText: string,
    sheetId?: number,
    matchCase: boolean = false,
    matchEntireCell: boolean = false,
    includeFormulas: boolean = false,
    headers?: HeadersLike
  ): Promise<any> {
    if (!spreadsheetId || !searchText || replacementText === undefined) {
      return { success: false, error: "spreadsheetId, searchText and replacementText are required" };
    }
    
    const findReplaceRequest: any = {
      find: searchText,
      replacement: replacementText,
      matchCase,
      matchEntireCell,
      includeFormulas
    };
    
    if (sheetId !== undefined) {
      findReplaceRequest.sheetId = sheetId;
    }
    
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        requests: [{ findReplace: findReplaceRequest }]
      }),
    });
    
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { 
      success: true, 
      replacements: data.replies[0].findReplace.occurrencesChanged || 0,
      data 
    };
  }

  // ============ Original operations (preserved) ============
  private async createSpreadsheet(title: string, headers: HeadersLike): Promise<any> {
    if (!title) return { success: false, error: "title is required" };
    const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers,
      body: JSON.stringify({ properties: { title } }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, spreadsheetId: data.spreadsheetId, data };
  }

  private async getSpreadsheet(spreadsheetId: string, includeGridData: boolean, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId) return { success: false, error: "spreadsheetId is required" };
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);
    if (includeGridData) url.searchParams.set("includeGridData", "true");
    const res = await fetch(url.toString(), { headers });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async addSheet(spreadsheetId: string, title: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !title) return { success: false, error: "spreadsheetId and sheetTitle are required" };
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async deleteSheet(spreadsheetId: string, sheetId: number, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || sheetId === undefined) return { success: false, error: "spreadsheetId and sheetId are required" };
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ requests: [{ deleteSheet: { sheetId } }] }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async duplicateSheet(spreadsheetId: string, sheetId: number, newTitle: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || sheetId === undefined || !newTitle) return { success: false, error: "spreadsheetId, sheetId and sheetTitle are required" };
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ requests: [{ duplicateSheet: { sourceSheetId: sheetId, newSheetName: newTitle } }] }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async readValues(spreadsheetId: string, range: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !range) return { success: false, error: "spreadsheetId and range are required" };
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, range: data.range, values: data.values || [] };
  }

  private async appendValues(spreadsheetId: string, range: string, values: string[][], valueInputOption: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !range || !Array.isArray(values)) return { success: false, error: "spreadsheetId, range, values are required" };
    const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append`);
    url.searchParams.set("valueInputOption", valueInputOption || "USER_ENTERED");
    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify({ values }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, updates: data.updates };
  }

  private async clearValues(spreadsheetId: string, range: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !range) return { success: false, error: "spreadsheetId and range are required" };
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify({}) });
    if (!res.ok) return { success: false, error: await res.text() };
    const data = await res.json();
    return { success: true, data };
  }

  private async batchUpdateValues(spreadsheetId: string, data: Array<{ range: string; values: string[][] }>, valueInputOption: string, headers: HeadersLike): Promise<any> {
    if (!spreadsheetId || !Array.isArray(data)) return { success: false, error: "spreadsheetId and data are required" };
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ valueInputOption, data }),
    });
    if (!res.ok) return { success: false, error: await res.text() };
    const result = await res.json();
    return { success: true, totalUpdatedCells: result.totalUpdatedCells, data: result };
  }

  // ============ Utility methods ============
  private hexToRgb(hex: string): { red: number; green: number; blue: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      red: parseInt(result[1], 16) / 255,
      green: parseInt(result[2], 16) / 255,
      blue: parseInt(result[3], 16) / 255,
    } : { red: 0, green: 0, blue: 0 };
  }

  private async parseRange(spreadsheetId: string, range: string, headers: HeadersLike): Promise<any> {
    // Get sheet info to convert A1 notation to grid range
    const sheetInfo = await this.getSpreadsheetInfo(spreadsheetId, headers);
    if (!sheetInfo.success) return sheetInfo;
    
    // Parse range format: "Sheet1!A1:C3" or "A1:C3"
    const [sheetName, cellRange] = range.includes('!') ? range.split('!') : [null, range];
    
    let targetSheet;
    if (sheetName) {
      targetSheet = sheetInfo.info.sheets.find((s: any) => s.title === sheetName);
    } else {
      targetSheet = sheetInfo.info.sheets[0]; // Use first sheet if no sheet specified
    }
    
    if (!targetSheet) return { success: false, error: "Sheet not found" };
    
    // Convert A1 notation to row/column indices (simplified)
    const gridRange: any = { sheetId: targetSheet.sheetId };
    
    if (cellRange && cellRange !== '') {
      const [startCell, endCell] = cellRange.split(':');
      if (startCell) {
        const startCoords = this.a1ToRowCol(startCell);
        gridRange.startRowIndex = startCoords.row;
        gridRange.startColumnIndex = startCoords.col;
      }
      if (endCell) {
        const endCoords = this.a1ToRowCol(endCell);
        gridRange.endRowIndex = endCoords.row + 1;
        gridRange.endColumnIndex = endCoords.col + 1;
      }
    }
    
    return { success: true, gridRange };
  }

  private a1ToRowCol(cell: string): { row: number; col: number } {
    const match = cell.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) throw new Error(`Invalid cell reference: ${cell}`);
    
    const colStr = match[1];
    const rowStr = match[2];
    
    // Convert column letters to number (A=0, B=1, ..., Z=25, AA=26, etc.)
    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 65 + 1);
    }
    col -= 1; // Convert to 0-based index
    
    const row = parseInt(rowStr) - 1; // Convert to 0-based index
    
    return { row, col };
  }

  // ============ Advanced utility methods ============
  
  /**
   * Get all sheet IDs and titles for easy reference
   */
  async getAllSheetIds(spreadsheetId: string): Promise<{ success: boolean; sheets?: Array<{ id: number; title: string; index: number }>, error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const result = await this.listAllSheets(spreadsheetId, headers);
      if (!result.success) return result;
      
      return {
        success: true,
        sheets: result.sheets.map((sheet: any) => ({
          id: sheet.sheetId,
          title: sheet.title,
          index: sheet.index
        }))
      };
    } catch (error) {
      return { success: false, error: `Failed to get sheet IDs: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Get the dimensions of a specific sheet
   */
  async getSheetDimensions(spreadsheetId: string, sheetId: number): Promise<{ success: boolean; dimensions?: { rows: number; columns: number }, error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const result = await this.getSheetProperties(spreadsheetId, sheetId, headers);
      if (!result.success) return result;
      
      return {
        success: true,
        dimensions: {
          rows: result.properties.gridProperties?.rowCount || 0,
          columns: result.properties.gridProperties?.columnCount || 0
        }
      };
    } catch (error) {
      return { success: false, error: `Failed to get sheet dimensions: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Find a sheet ID by its title
   */
  async findSheetIdByTitle(spreadsheetId: string, sheetTitle: string): Promise<{ success: boolean; sheetId?: number, error?: string }> {
    try {
      const result = await this.getAllSheetIds(spreadsheetId);
      if (!result.success) return result;
      
      const sheet = result.sheets?.find(s => s.title === sheetTitle);
      if (!sheet) {
        return { success: false, error: `Sheet with title "${sheetTitle}" not found` };
      }
      
      return { success: true, sheetId: sheet.id };
    } catch (error) {
      return { success: false, error: `Failed to find sheet: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Get all data from a sheet (convenience method)
   */
  async getAllSheetData(spreadsheetId: string, sheetTitle: string): Promise<{ success: boolean; data?: string[][], headers?: string[], error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const result = await this.readValues(spreadsheetId, `${sheetTitle}!A:ZZ`, headers);
      if (!result.success) return result;
      
      const values = result.values || [];
      const headers_row = values.length > 0 ? values[0] : [];
      const data = values.slice(1);
      
      return {
        success: true,
        data,
        headers: headers_row
      };
    } catch (error) {
      return { success: false, error: `Failed to get all sheet data: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  /**
   * Batch create multiple sheets at once
   */
  async createMultipleSheets(spreadsheetId: string, sheetTitles: string[]): Promise<{ success: boolean; createdSheets?: Array<{ sheetId: number; title: string }>, error?: string }> {
    try {
      const accessToken = await getDecryptedOAuthAccessToken({ userId: this.userId, service: "gmail" });
      if (!accessToken) {
        return { success: false, error: "Google OAuth connection (gmail) not found. Connect Google first." };
      }

      const headers: HeadersLike = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      const requests = sheetTitles.map(title => ({
        addSheet: { properties: { title } }
      }));

      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ requests }),
      });

      if (!res.ok) return { success: false, error: await res.text() };
      const data = await res.json();
      
      const createdSheets = data.replies.map((reply: any, index: number) => ({
        sheetId: reply.addSheet.properties.sheetId,
        title: sheetTitles[index]
      }));

      return { success: true, createdSheets };
    } catch (error) {
      return { success: false, error: `Failed to create multiple sheets: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}