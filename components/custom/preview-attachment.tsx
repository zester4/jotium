import { Attachment } from "ai";
import { motion } from "framer-motion";
import { X, File, FileText, Music, Video, Archive } from "lucide-react";
import React from "react";

interface PreviewAttachmentProps {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}

const getFileIcon = (contentType: string) => {
  if (contentType.startsWith("video/")) return Video;
  if (contentType.startsWith("audio/")) return Music;
  if (contentType.includes("pdf") || contentType.includes("document")) return FileText;
  if (contentType.includes("zip") || contentType.includes("rar")) return Archive;
  return File;
};

const getFileTypeLabel = (contentType: string) => {
  if (contentType.startsWith("image/")) return "Image";
  if (contentType.startsWith("video/")) return "Video";
  if (contentType.startsWith("audio/")) return "Audio";
  if (contentType.includes("pdf")) return "PDF";
  if (contentType.includes("document")) return "Document";
  if (contentType.includes("zip") || contentType.includes("rar")) return "Archive";
  return "File";
};

export function PreviewAttachment({ 
  attachment, 
  isUploading = false,
  onRemove 
}: PreviewAttachmentProps) {
  const isImage = attachment.contentType?.startsWith("image/");
  const IconComponent = getFileIcon(attachment.contentType || "");
  const fileTypeLabel = getFileTypeLabel(attachment.contentType || "");
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative group"
    >
      {/* Main Preview Card */}
      <div className="relative bg-zinc-800/90 border border-zinc-700/60 rounded-xl p-3 hover:bg-zinc-800 transition-colors duration-200">
        
        {/* Close Button - Always visible and positioned like in your image */}
        {onRemove && !isUploading && (
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-600 hover:bg-zinc-500 text-white rounded-full flex items-center justify-center transition-all duration-200 border border-zinc-500 shadow-lg z-10"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
        
        <div className="flex items-center gap-3">
          {/* File Icon/Image */}
          <div className="relative flex-shrink-0">
            {isImage && attachment.url && !isUploading ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-700">
                <img 
                  src={attachment.url} 
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-700 border border-zinc-600 flex items-center justify-center">
                <IconComponent size={18} className="text-zinc-300" />
              </div>
            )}
            
            {/* Upload Progress Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-zinc-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* File Type Label Only - No filename */}
          <div className="flex-1">
            <span className="inline-block text-sm font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
              {fileTypeLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}