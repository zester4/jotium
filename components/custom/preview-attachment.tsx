import { Attachment } from "ai";
import { Download, FileText, Eye, X, ZoomIn, ExternalLink } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { LoaderIcon } from "./icons";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  onRemove,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onRemove?: () => void;
}) => {
  const { name, url, contentType } = attachment;
  const [modalOpen, setModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = contentType?.startsWith("image");
  const isPDF = contentType === "application/pdf";

  return (
    <>
      <div className="flex flex-col gap-2 w-full max-w-32 sm:max-w-40 md:max-w-48 relative group">
        {/* Main preview container */}
        <div 
          className={`relative w-full rounded-lg overflow-hidden border transition-all duration-200 ${
            isImage 
              ? "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600" 
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
          style={{ aspectRatio: isImage ? '16/10' : '4/3' }}
        >
          {/* Remove button */}
          {onRemove && !isUploading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-full p-1 sm:p-1.5 shadow-sm border border-gray-200 dark:border-gray-600 transition-all duration-200 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Remove attachment"
            >
              <X size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          )}

          {/* Content based on file type */}
          {isImage && !imageError ? (
            <div className="relative w-full h-full">
              <Image
                src={url}
                alt={name ?? "Image attachment"}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                onError={() => setImageError(true)}
                unoptimized
              />
              
              {/* Hover overlay */}
              <div 
                className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
                  <ZoomIn size={16} className="sm:w-5 sm:h-5 text-gray-700 dark:text-gray-200" />
                </div>
              </div>
            </div>
          ) : isPDF ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center h-full p-2 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
            >
              <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-2 sm:p-3 mb-1 sm:mb-2">
                <FileText size={20} className="sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">PDF</span>
              <ExternalLink size={10} className="sm:w-3 sm:h-3 text-gray-400 mt-1" />
            </a>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 sm:p-3 mb-1 sm:mb-2">
                <FileText size={20} className="sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                {contentType?.split('/')[1]?.toUpperCase() || 'File'}
              </span>
            </div>
          )}

          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin text-blue-600">
                  <LoaderIcon />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Uploading...</span>
              </div>
            </div>
          )}
        </div>

        {/* File name and actions */}
        <div className="flex items-center justify-between gap-1 sm:gap-2 px-0.5 sm:px-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={name}>
              {name}
            </p>
            {contentType && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                {contentType}
              </p>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {isImage && (
              <button
                onClick={() => setModalOpen(true)}
                className="p-1 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                aria-label="Preview image"
              >
                <Eye size={12} />
              </button>
            )}
            <a
              href={url}
              download={name}
              className="p-1 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
              aria-label="Download file"
            >
              <Download size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Modal for images */}
      {modalOpen && isImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setModalOpen(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
            {/* Modal content */}
            <div
              className="relative max-w-[95vw] max-h-[95vh] animate-in zoom-in-95 duration-300"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Image
                  src={url}
                  alt={name ?? "Image preview"}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[85vh] sm:max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  unoptimized
                />
                
                {/* Modal controls */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col sm:flex-row gap-2">
                  <a
                    href={url}
                    download={name}
                    className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg min-w-[80px]"
                    onClick={e => e.stopPropagation()}
                  >
                    <Download size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white text-xs sm:text-sm font-medium transition-all duration-200 shadow-lg min-w-[80px]"
                  >
                    <X size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Close</span>
                  </button>
                </div>
              </div>
              
              {/* Image info */}
              {name && (
                <div className="mt-2 sm:mt-4 text-center">
                  <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm max-w-[90vw] truncate">
                    {name}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Close button (bottom center) - hidden on mobile, shown on desktop */}
          <button
            onClick={() => setModalOpen(false)}
            className="hidden sm:block absolute bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-medium transition-all duration-200 shadow-lg"
          >
            Press ESC or click outside to close
          </button>
          
          {/* Mobile close instruction */}
          <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-xs text-center">
            Tap outside to close
          </div>
        </div>
      )}
    </>
  );
};