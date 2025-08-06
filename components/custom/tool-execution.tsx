//components/custom/tool-execution.tsx
import { motion } from "framer-motion";
import Image from "next/image";
import { VscTools } from "react-icons/vsc";

interface ToolExecutionProps {
  toolName: string;
  isExecuting?: boolean; // New prop to indicate if tool is currently executing
}

// Tool name to logo mapping
const getToolLogo = (toolName: string): { src: string; alt: string } | null => {
  const toolMap: Record<string, { src: string; alt: string }> = {
    web_search: { src: "/logo/web_search.svg", alt: "Web Search" },
    web_scrape: { src: "/logo/web_scrape.svg", alt: "Web Scrape" },
    alphavantage_tool: { src: "/logo/alphavantage.svg", alt: "Alpha Vantage" },
    generate_image: { src: "/logo/generate_image.svg", alt: "Image Generation" },
    flight_booking: { src: "/logo/flight.svg", alt: "Flight Booking" },
    file_manager: { src: "/logo/file.svg", alt: "File Manager" },
    api_tool: { src: "/logo/api.svg", alt: "API Tool" },
    get_weather: { src: "/logo/weather.svg", alt: "Weather" },
    code_execution: { src: "/logo/code.svg", alt: "Code Execution" },
    datetime_tool: { src: "/logo/datetime.svg", alt: "Date Time" },
    airtable_tool: { src: "/logo/airtable.svg", alt: "Airtable" },
    social_media: { src: "/logo/social-media.svg", alt: "Social Media" },
    calcom_scheduler: { src: "/logo/calendar.svg", alt: "Cal.com" },
    github_tool: { src: "/logo/github.svg", alt: "GitHub" },
    github_operations: { src: "/logo/github.svg", alt: "GitHub" },
    notion_tool: { src: "/logo/notion.svg", alt: "Notion" },
    notion_workspace: { src: "/logo/notion.svg", alt: "Notion" },
    stripe_tool: { src: "/logo/stripe.svg", alt: "Stripe" },
    stripe_management: { src: "/logo/stripe.svg", alt: "Stripe" },
    clickup_tool: { src: "/logo/clickup.svg", alt: "ClickUp" },
    slack_tool: { src: "/logo/slack.svg", alt: "Slack" },
    slack_action: { src: "/logo/slack.svg", alt: "Slack" },
    supabase_database: { src: "/logo/database.svg", alt: "Supabase" },
    asana_tool: { src: "/logo/asana.svg", alt: "Asana" },
    trello_tool: { src: "/logo/trello.svg", alt: "Trello" },
    linear_management: { src: "/logo/linear.svg", alt: "Linear" },
    // New Google tools
    google_drive_operations: { src: "/logo/google-drive.svg", alt: "Google Drive" },
    google_calendar_operations: { src: "/logo/google-calendar.svg", alt: "Google Calendar" },
    gmail_operations: { src: "/logo/gmail.svg", alt: "Gmail" },
  };
  
  return toolMap[toolName.toLowerCase()] || null;
};

export const ToolExecution = ({ toolName, isExecuting = false }: ToolExecutionProps) => {
  const toolLogo = getToolLogo(toolName);
  
  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm border rounded-md px-2 py-1.5 sm:px-3 sm:py-2 max-w-full overflow-hidden ${
        isExecuting 
          ? 'text-muted-foreground bg-muted/30 border-muted/50' 
          : 'text-foreground/80 bg-primary/10 border-primary/20'
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {toolLogo ? (
        <>
          <div className={`relative w-3 h-3 sm:w-4 sm:h-4 shrink-0 ${
            isExecuting ? 'animate-pulse' : ''
          }`}>
            <Image
              src={toolLogo.src}
              alt={toolLogo.alt}
              fill
              className="object-contain"
              sizes="16px"
            />
          </div>
          <span className="truncate text-xs sm:text-sm font-medium">
            {isExecuting ? (
              <>Using <span className="text-foreground/80">{toolLogo.alt}</span></>
            ) : (
              <>Used <span className="text-foreground/80">{toolLogo.alt}</span></>
            )}
          </span>
        </>
      ) : (
        <>
          <VscTools 
            className={`shrink-0 w-3 h-3 sm:w-4 sm:h-4 ${
              isExecuting ? 'animate-spin' : ''
            }`}
            style={isExecuting ? { animationDuration: '1s' } : {}}
          />
          <span className="truncate text-xs sm:text-sm font-medium">
            {isExecuting ? (
              <>Using <span className="text-foreground/80">{toolName}</span></>
            ) : (
              <>Used <span className="text-foreground/80">{toolName}</span></>
            )}
          </span>
        </>
      )}
    </motion.div>
  );
};