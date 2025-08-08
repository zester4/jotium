import { FunctionDeclaration, Type } from "@google/genai";

type ChartType = "line" | "bar" | "area" | "pie" | "radar" | "scatter" | "composed";

function parseCsv(input: string): any[] {
  const lines = input.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const row: Record<string, any> = {};
    headers.forEach((h, i) => {
      const raw = (cols[i] ?? "").trim();
      const num = Number(raw);
      row[h] = isNaN(num) || raw === "" ? raw : num;
    });
    return row;
  });
}

function toArray(input: any): any[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === "string") {
    // try JSON first, fall back to CSV
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return parseCsv(input);
  }
  return [];
}

function aggregateData(data: any[], groupBy?: string, yKeys?: string[], agg: string = "sum"): any[] {
  if (!groupBy || !yKeys || yKeys.length === 0) return data;
  const groups = new Map<string, any[]>();
  for (const row of data) {
    const key = String(row[groupBy]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  const result: any[] = [];
  for (const [k, rows] of groups) {
    const out: any = { [groupBy]: k };
    for (const y of yKeys) {
      const values = rows.map((r) => Number(r[y])).filter((v) => !isNaN(v));
      let val: number = 0;
      if (values.length === 0) val = 0;
      else if (agg === "avg" || agg === "mean") val = values.reduce((a, b) => a + b, 0) / values.length;
      else if (agg === "min") val = Math.min(...values);
      else if (agg === "max") val = Math.max(...values);
      else if (agg === "count") val = values.length;
      else val = values.reduce((a, b) => a + b, 0);
      out[y] = Number(val.toFixed(4));
    }
    result.push(out);
  }
  return result;
}

export class DataVisualizationTool {
  getDefinition(): FunctionDeclaration {
    return {
      name: "data_visualization",
      description:
        "Generate beautiful, mobile-responsive charts from raw data (JSON or CSV). Returns a markdown code fence that renders to a chart in the chat.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          data: { type: Type.STRING, description: "Data as JSON array or CSV text. Prefer JSON array of objects." },
          chartType: {
            type: Type.STRING,
            description: "Chart type",
            enum: ["line", "bar", "area", "pie", "radar", "scatter", "composed"],
          },
          xKey: { type: Type.STRING, description: "Field for the X axis or category" },
          yKeys: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Numeric fields for Y axis" },
          groupBy: { type: Type.STRING, description: "Optional group-by field to aggregate data" },
          aggregate: {
            type: Type.STRING,
            description: "Aggregation: sum, avg, count, min, max",
          },
          stacked: { type: Type.BOOLEAN, description: "For bar charts: stack series" },
          series: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT },
            description: "For composed charts: [{ type: 'bar'|'line'|'area', key: 'uv' }]",
          },
          colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optional colors for series" },
          height: { type: Type.NUMBER, description: "Chart height in px (optional)" },
          title: { type: Type.STRING, description: "Optional chart title to show below the chart" },
        },
        required: ["data", "chartType"],
      },
    };
  }

  async execute(args: any): Promise<any> {
    try {
      const chartType = String(args.chartType || "line").toLowerCase() as ChartType;
      let rows = toArray(args.data);

      const xKey: string | undefined = args.xKey;
      const yKeys: string[] | undefined = args.yKeys;
      if (!xKey && (chartType !== "pie" && chartType !== "radar")) {
        // attempt to infer keys
        const sample = rows[0] || {};
        const keys = Object.keys(sample);
        if (keys.length >= 2) {
          args.xKey = keys[0];
          args.yKeys = [keys[1]];
        }
      }

      if (args.groupBy && args.yKeys) {
        rows = aggregateData(rows, args.groupBy, args.yKeys, args.aggregate);
        args.xKey = args.groupBy;
      }

      const spec: any = {
        type: chartType,
        title: args.title,
        data: rows,
        xKey: args.xKey,
        yKeys: args.yKeys,
        stacked: Boolean(args.stacked),
        series: args.series,
        colors: args.colors,
        height: args.height,
      };

      const lang = chartType === "line" ? "chart" : `chart-${chartType}`;
      const markdown = `\n\n\`\`\`${lang}\n${JSON.stringify(spec, null, 2)}\n\`\`\`\n\n`;

      return {
        success: true,
        message: "Chart spec generated",
        spec,
        markdown,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || String(error),
      };
    }
  }
}