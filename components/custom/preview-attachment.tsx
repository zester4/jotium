//components/custom/preview-attatchment.tsx
import { Attachment } from "ai";
import { Download, FileText, Eye, X } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-3 max-w-32 w-full relative">
      <div 
        className={`relative w-full rounded-xl overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${
          contentType?.startsWith("image") 
            ? "bg-transparent shadow-sm hover:shadow-md" 
            : "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700"
        }`}
        style={{ aspectRatio: '4/5', maxWidth: '100%' }}
      >
        {contentType ? (
          contentType.startsWith("image") ? (
            <>
              {/* Modern image preview with subtle effects */}
              <div className="relative w-full h-full">
                <Image
                  key={url}
                  src={url}
                  alt={name ?? "An image attachment"}
                  className="rounded-xl object-cover w-full h-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => setModalOpen(true)}
                  tabIndex={0}
                  aria-label="Open image preview"
                  width={320}
                  height={400}
                  unoptimized
                />
                
                {/* Small close button for removing attachment */}
                {onRemove && !isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:scale-110 z-20 backdrop-blur-sm border border-white/20"
                    aria-label="Remove attachment"
                    tabIndex={0}
                  >
                    <X size={12} />
                  </button>
                )}
                
                {/* Hover overlay with preview icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-2">
                    <Eye size={16} className="text-gray-700 dark:text-gray-200" />
                  </div>
                </div>
              </div>

              {/* Modern modal with improved UX */}
              {modalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                  onClick={() => setModalOpen(false)}
                >
                  <div
                    className="relative max-w-full max-h-full flex flex-col items-center animate-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="relative">
                      <Image
                        src={url}
                        alt={name ?? "Image preview"}
                        className="rounded-2xl max-w-full max-h-[85vh] w-auto h-auto shadow-2xl"
                        width={800}
                        height={1000}
                        unoptimized
                      />
                      
                      {/* Modern control buttons */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <a
                          href={url}
                          download={name}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 text-white hover:bg-white/20 focus:bg-white/20 transition-all duration-200 shadow-lg"
                          aria-label="Download image"
                          tabIndex={0}
                          onClick={e => e.stopPropagation()}
                        >
                          <Download size={18} />
                        </a>
                        <button
                          onClick={() => setModalOpen(false)}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-3 text-white hover:bg-white/20 focus:bg-white/20 transition-all duration-200 shadow-lg"
                          aria-label="Close preview"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    
                    {/* File name in modal */}
                    {name && (
                      <div className="mt-4 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm max-w-md truncate">
                        {name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : contentType === "application/pdf" ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center size-full group-hover:scale-105 transition-transform duration-300"
                title={name}
              >
                <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 mb-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200">
                  <FileText size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">PDF</span>
              </a>
              
              {/* Close button for PDF */}
              {onRemove && !isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:scale-110 z-20 backdrop-blur-sm border border-white/20"
                  aria-label="Remove attachment"
                  tabIndex={0}
                >
                  <X size={12} />
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center size-full">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-3">
                  <FileText size={20} className="text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              {/* Close button for other file types */}
              {onRemove && !isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:scale-110 z-20 backdrop-blur-sm border border-white/20"
                  aria-label="Remove attachment"
                  tabIndex={0}
                >
                  <X size={12} />
                </button>
              )}
            </>
          )
        ) : (
          <>
            <div className="flex items-center justify-center size-full">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-3">
                <FileText size={20} className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
            
            {/* Close button for unknown file types */}
            {onRemove && !isUploading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110 focus:scale-110 z-20 backdrop-blur-sm border border-white/20"
                aria-label="Remove attachment"
                tabIndex={0}
              >
                <X size={12} />
              </button>
            )}
          </>
        )}

        {/* Modern loading state */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <div className="animate-spin text-gray-600 dark:text-gray-400">
              <LoaderIcon />
            </div>
          </div>
        )}
      </div>

      {/* Modern file name display */}
      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 max-w-full truncate text-center" title={name}>
        {name}
      </div>
    </div>
  );
};