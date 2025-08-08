import { Attachment } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, FileText, Music, Video, Archive, File, Download, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

interface MessageImageDisplayProps {
  attachment: Attachment;
  allAttachments?: Attachment[];
  currentIndex?: number;
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

const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

export function MessageImageDisplay({ 
  attachment, 
  allAttachments = [attachment], 
  currentIndex = 0 
}: MessageImageDisplayProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentModalIndex, setCurrentModalIndex] = useState(currentIndex);
  const isImage = attachment.contentType?.startsWith("image/");
  const IconComponent = getFileIcon(attachment.contentType || "");
  const fileTypeLabel = getFileTypeLabel(attachment.contentType || "");
  
  const imageAttachments = allAttachments.filter(att => att.contentType?.startsWith("image/"));
  const hasMultipleImages = imageAttachments.length > 1;

  const handlePrevious = () => {
    setCurrentModalIndex((prev) => 
      prev === 0 ? imageAttachments.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentModalIndex((prev) => 
      prev === imageAttachments.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setShowImageModal(false);
  };

  React.useEffect(() => {
    if (showImageModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageModal]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative inline-block w-full"
      >
        {isImage && attachment.url ? (
          // Image Display - Mobile Responsive
          <button
            onClick={() => {
              const imageIndex = imageAttachments.findIndex(att => att.url === attachment.url);
              setCurrentModalIndex(imageIndex >= 0 ? imageIndex : 0);
              setShowImageModal(true);
            }}
            className="group relative block w-full max-w-sm sm:max-w-md md:max-w-lg rounded-lg overflow-hidden bg-muted border hover:border-primary/50 transition-all duration-200"
          >
            <img
              src={attachment.url}
              alt={attachment.name || "Uploaded image"}
              className="w-full h-auto max-h-48 sm:max-h-56 md:max-h-64 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                <Eye size={16} className="sm:size-5 text-white" />
              </div>
            </div>
            
            {/* File type badge */}
            <div className="absolute top-2 left-2">
              <span className="inline-block text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                {fileTypeLabel}
              </span>
            </div>

            {/* Multiple images indicator */}
            {hasMultipleImages && (
              <div className="absolute top-2 right-2">
                <span className="inline-block text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                  {imageAttachments.findIndex(att => att.url === attachment.url) + 1} / {imageAttachments.length}
                </span>
              </div>
            )}

            {/* Download button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(attachment.url, attachment.name || 'image');
              }}
              className="absolute bottom-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 backdrop-blur-sm hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
            >
              <Download size={14} className="sm:size-4" />
            </button>
          </button>
        ) : (
          // Non-image file display - Mobile Responsive
          <div className="flex items-center gap-2 sm:gap-3 bg-muted/50 border rounded-lg p-2 sm:p-3 w-full max-w-sm sm:max-w-md">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background border flex items-center justify-center flex-shrink-0">
              <IconComponent size={16} className="sm:size-[18px] text-muted-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 sm:px-2 py-0.5 rounded-md">
                  {fileTypeLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                {attachment.name || "Unknown file"}
              </p>
            </div>

            {/* Download button for non-images */}
            {attachment.url && (
              <button
                onClick={() => downloadFile(attachment.url, attachment.name || 'file')}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center transition-colors duration-200 flex-shrink-0"
              >
                <Download size={14} className="sm:size-4" />
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Full Screen Image Modal - Mobile Responsive */}
      <AnimatePresence>
        {showImageModal && imageAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              {/* Navigation arrows for multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
                  >
                    <ChevronLeft size={20} className="sm:size-6" />
                  </button>
                  
                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10"
                  >
                    <ChevronRight size={20} className="sm:size-6" />
                  </button>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg z-20"
              >
                <X size={18} className="sm:size-5" />
              </button>
              
              {/* Current image */}
              <div className="relative">
                <img
                  src={imageAttachments[currentModalIndex]?.url}
                  alt={imageAttachments[currentModalIndex]?.name || "Image"}
                  className="max-w-[90vw] max-h-[85vh] sm:max-w-[95vw] sm:max-h-[90vh] object-contain rounded-lg shadow-2xl"
                />
                
                {/* Download button in modal */}
                <button
                  onClick={() => downloadFile(
                    imageAttachments[currentModalIndex].url, 
                    imageAttachments[currentModalIndex].name || 'image'
                  )}
                  className="absolute bottom-4 right-4 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <Download size={18} className="sm:size-5" />
                </button>
              </div>
              
              {/* Image info and counter */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                <div className="flex items-center gap-3">
                  {imageAttachments[currentModalIndex]?.name && (
                    <p className="text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {imageAttachments[currentModalIndex].name}
                    </p>
                  )}
                  {hasMultipleImages && (
                    <span className="text-xs sm:text-sm text-white/80 whitespace-nowrap">
                      {currentModalIndex + 1} / {imageAttachments.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Image thumbnails for navigation (mobile-friendly) */}
              {hasMultipleImages && imageAttachments.length > 1 && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 max-w-[90vw] overflow-x-auto">
                  {imageAttachments.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentModalIndex(index)}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                        index === currentModalIndex 
                          ? 'border-white' 
                          : 'border-transparent hover:border-white/50'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}