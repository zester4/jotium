//components/custom/preview-attatchment.tsx
import { Attachment } from "ai";
import { Download } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

import { LoaderIcon } from "./icons";

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 max-w-32 w-full">
      <div className="relative w-full bg-muted rounded-md flex flex-col items-center justify-center" style={{ aspectRatio: '4/5', maxWidth: '100%' }}>
        {contentType ? (
          contentType.startsWith("image") ? (
            <>
              {/* Use Next.js Image for optimization and LCP improvement */}
              <Image
                key={url}
                src={url}
                alt={name ?? "An image attachment"}
                className="rounded-md object-cover w-full size-auto max-h-40 cursor-pointer"
                style={{ maxWidth: '100%', display: 'block' }}
                onClick={() => setModalOpen(true)}
                tabIndex={0}
                aria-label="Open image preview"
                width={320} // fallback width for preview
                height={400} // fallback height for preview
                unoptimized // Remove if you add a loader for remote images
              />
              {/* Modal for image preview and download */}
              {modalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                  onClick={() => setModalOpen(false)}
                  style={{ cursor: 'zoom-out' }}
                >
                  <div
                    className="relative max-w-full max-h-full flex flex-col items-center"
                    onClick={e => e.stopPropagation()}
                    style={{ cursor: 'default' }}
                  >
                    <Image
                      src={url}
                      alt={name ?? "Image preview"}
                      className="rounded-md max-w-full max-h-[80vh] size-auto shadow-lg"
                      style={{ background: 'white' }}
                      width={600} // fallback width for modal
                      height={800} // fallback height for modal
                      unoptimized // Remove if you add a loader for remote images
                    />
                    <a
                      href={url}
                      download={name}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-2 text-white hover:bg-black/90 focus:bg-black/90 transition-colors"
                      aria-label="Download image"
                      tabIndex={0}
                      onClick={e => e.stopPropagation()}
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              )}
            </>
          ) : contentType === "application/pdf" ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center size-full"
              title={name}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-8 text-red-600 mb-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs text-zinc-500 truncate w-full text-center">PDF</span>
            </a>
          ) : (
            <div className=""></div>
          )
        ) : (
          <div className=""></div>
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>

      <div className="text-xs text-zinc-500 max-w-16 truncate" title={name}>{name}</div>
    </div>
  );
};
