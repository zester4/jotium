//components/custom/markdown.tsx
import Image from "next/image";
import Link from "next/link";
import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group/copy inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600"
      aria-label={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 dark:text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 group-hover/copy:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

// Helper function to check if a link should be rendered inline with subtle styling
const isInlineLink = (href: string, children: any) => {
  const childText = typeof children === 'string' ? children : 
    (Array.isArray(children) ? children.join('') : '');
  
  // Check if it's a domain-only link or very short
  const isShortDomain = href && (
    href.includes('.org') || 
    href.includes('.com') || 
    href.includes('.net') || 
    href.includes('.edu') ||
    href.includes('.gov')
  ) && childText.length < 30;
  
  return isShortDomain;
};

// Helper function to get favicon URL
const getFaviconUrl = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

// Helper function to check if link should show favicon (standalone links)
const shouldShowFavicon = (href: string, children: any) => {
  const childText = typeof children === 'string' ? children : 
    (Array.isArray(children) ? children.join('') : '');
  
  // Show favicon for standalone links that aren't inline
  return !isInlineLink(href, children) && href && childText.length > 0;
};

// Helper function to check if URL is a video
const isVideoUrl = (url: string) => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const videoServices = ['youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv'];
  
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) ||
         videoServices.some(service => url.toLowerCase().includes(service));
};

// YouTube video embed component
const YouTubeEmbed = ({ url }: { url: string }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
        title="YouTube video"
      />
    </div>
  );
};

// Vimeo video embed component
const VimeoEmbed = ({ url }: { url: string }) => {
  const getVimeoId = (url: string) => {
    const regExp = /vimeo.com\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = getVimeoId(url);
  if (!videoId) return null;

  return (
    <div className="relative w-full aspect-video rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?responsive=1&dnt=1`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
        loading="lazy"
        title="Vimeo video"
      />
    </div>
  );
};

// Video component for direct video files
const VideoPlayer = ({ src, ...props }: any) => {
  return (
    <div className="relative w-full rounded-md sm:rounded-lg md:rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md sm:shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-700">
      <video
        controls
        className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
        preload="metadata"
        playsInline
        {...props}
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    // Beautiful heading hierarchy with proper spacing
    h1: (props: any) => (
      <h1 className="scroll-m-20 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 sm:mt-8 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b border-zinc-200 dark:border-zinc-700 first:mt-0" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="scroll-m-20 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 sm:mt-8 mb-3 sm:mb-4 first:mt-0" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="scroll-m-20 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 sm:mt-6 mb-2 sm:mb-3" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="scroll-m-20 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 sm:mt-5 mb-2" {...props} />
    ),
    h5: (props: any) => (
      <h5 className="scroll-m-20 text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-3 sm:mt-4 mb-2" {...props} />
    ),
    h6: (props: any) => (
      <h6 className="scroll-m-20 text-xs sm:text-sm md:text-base lg:text-lg font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 mt-3 mb-2" {...props} />
    ),

    // Enhanced paragraphs with mobile-optimized typography and minimal spacing before code
    p: (props: any) => (
      <p className="leading-6 sm:leading-7 text-sm sm:text-base md:text-lg text-zinc-700 dark:text-zinc-300 mb-2 sm:mb-4 [&:not(:first-child)]:mt-2 sm:[&:not(:first-child)]:mt-4 [&:has(+div>div>div>pre)]:mb-1 sm:[&:has(+div>div>div>pre)]:mb-2" {...props} />
    ),

    // Beautiful code blocks without dark background - MOBILE OPTIMIZED
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");
      
      return !inline && match ? (
        <div className="my-2 sm:my-4 rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm w-full">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {match[1]}
              </span>
            </div>
            <CopyButton text={codeContent} />
          </div>
          <div className="overflow-x-auto w-full">
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="!m-0 !bg-transparent !text-xs sm:!text-sm md:!text-base w-full"
              customStyle={{
                padding: '1rem 1rem',
                margin: 0,
                background: 'transparent',
                fontSize: 'inherit',
                width: '100%',
                minWidth: '100%'
              }}
              codeTagProps={{
                style: {
                  background: 'transparent',
                  width: '100%',
                  display: 'block'
                }
              }}
              {...props}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        </div>
      ) : (
        <code
          className="relative rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 sm:px-2 py-0.5 sm:py-1 font-mono text-xs sm:text-sm font-medium text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-700/50"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Enhanced pre for fallback code blocks - MOBILE OPTIMIZED
    pre: (props: any) => (
      <pre className="p-3 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm md:text-base text-zinc-800 dark:text-zinc-200 bg-transparent w-full" {...props} />
    ),

    // Comprehensive table styling with mobile responsiveness - FULL WIDTH
    table: (props: any) => (
      <div className="my-4 sm:my-8 overflow-hidden rounded-lg sm:rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs sm:text-sm md:text-base min-w-full" {...props} />
        </div>
      </div>
    ),
    thead: (props: any) => (
      <thead className="bg-zinc-50 dark:bg-zinc-800/50" {...props} />
    ),
    th: (props: any) => (
      <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700" {...props} />
    ),
    td: (props: any) => (
      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-4 text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0" {...props} />
    ),
    tr: (props: any) => (
      <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors" {...props} />
    ),

    // Beautiful list styling - MOBILE OPTIMIZED
    ul: (props: any) => (
      <ul className="my-3 sm:my-6 ml-4 sm:ml-6 list-disc space-y-1 sm:space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-1 sm:[&>li]:mt-2" {...props} />
    ),
    ol: (props: any) => (
      <ol className="my-3 sm:my-6 ml-4 sm:ml-6 list-decimal space-y-1 sm:space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-1 sm:[&>li]:mt-2" {...props} />
    ),
    li: (props: any) => (
      <li className="leading-6 sm:leading-7 text-sm sm:text-base md:text-lg pl-1" {...props} />
    ),

    // Enhanced text formatting - MOBILE OPTIMIZED
    strong: (props: any) => (
      <strong className="font-bold text-zinc-900 dark:text-zinc-100" {...props} />
    ),
    em: (props: any) => (
      <em className="italic text-zinc-800 dark:text-zinc-200" {...props} />
    ),
    del: (props: any) => (
      <del className="line-through text-zinc-500 dark:text-zinc-500 decoration-red-500/70" {...props} />
    ),
    mark: (props: any) => (
      <mark className="bg-yellow-200 dark:bg-yellow-800/50 px-1 py-0.5 rounded text-zinc-900 dark:text-zinc-100" {...props} />
    ),

    // Stunning blockquotes - MOBILE OPTIMIZED
    blockquote: (props: any) => (
      <blockquote className="relative my-4 sm:my-8 pl-6 sm:pl-8 pr-4 sm:pr-6 py-4 sm:py-6 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg sm:rounded-r-xl shadow-sm" {...props}>
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 text-blue-500/30 dark:text-blue-400/30">
          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
        <div className="text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed italic font-medium [&>*]:!mb-1 sm:[&>*]:!mb-2 [&>*:last-child]:!mb-0">
          {props.children}
        </div>
      </blockquote>
    ),

    // Enhanced links with beautiful hover effects, intelligent inline styling, and favicons
    a: ({ node, href, children, ...props }: any) => {
      const isInline = isInlineLink(href, children);
      const showFavicon = shouldShowFavicon(href, children);
      const faviconUrl = showFavicon ? getFaviconUrl(href) : null;
      
      // Handle video URLs
      if (href && isVideoUrl(href)) {
        return (
          <figure className="my-3 sm:my-4 md:my-6 lg:my-8 w-full">
            <div className="w-full max-w-4xl mx-auto">
              {href.includes('youtube.com') || href.includes('youtu.be') ? (
                <YouTubeEmbed url={href} />
              ) : href.includes('vimeo.com') ? (
                <VimeoEmbed url={href} />
              ) : (
                <VideoPlayer src={href} />
              )}
            </div>
            {children && typeof children === 'string' && children !== href && (
              <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium text-center px-2">
                {children}
              </figcaption>
            )}
          </figure>
        );
      }
      
      if (isInline) {
        // Subtle inline link styling for short domain links
        return (
          <Link
            href={href || "#"}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-1 decoration-zinc-400 hover:decoration-zinc-600 underline-offset-2 transition-colors duration-200 font-medium"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </Link>
        );
      }
      
      // Beautiful prominent link styling with favicon for standalone links
      return (
        <Link
          href={href || "#"}
          className="group inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline decoration-2 decoration-blue-500/30 hover:decoration-blue-500 underline-offset-2 transition-all duration-200 py-1"
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm bg-white dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 flex-shrink-0"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          <span className="break-words">{children}</span>
          <svg 
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      );
    },

    // Stunning image display - MOBILE OPTIMIZED
    img: ({ node, src, alt, ...props }: any) => {
      // Handle video files in img tags
      if (src && isVideoUrl(src)) {
        return (
          <figure className="my-3 sm:my-4 md:my-6 lg:my-8 text-center w-full">
            <div className="w-full max-w-4xl mx-auto">
              <VideoPlayer src={src} {...props} />
            </div>
            {alt && (
              <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium px-2">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }

      return (
        <figure className="my-3 sm:my-4 md:my-6 lg:my-8 text-center w-full">
          <div className="group relative inline-block rounded-md sm:rounded-lg md:rounded-xl overflow-hidden shadow-md sm:shadow-lg bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700 w-full max-w-full">
            <Image
              src={src}
              alt={alt || "Image"}
              width={800}
              height={600}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] object-contain"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
              {...props}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {alt && (
            <figcaption className="mt-2 sm:mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 italic font-medium px-2">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },

    // Beautiful horizontal rule - MOBILE OPTIMIZED
    hr: (props: any) => (
      <div className="relative my-6 sm:my-12 flex items-center" {...props}>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
        <div className="flex-shrink-0 px-4">
          <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
        </div>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
      </div>
    ),

    // Task list items (GitHub Flavored Markdown) - MOBILE OPTIMIZED
    input: (props: any) => {
      if (props.type === 'checkbox') {
        return (
          <input
            {...props}
            className="mr-2 h-3 w-3 sm:h-4 sm:w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
          />
        );
      }
      return <input {...props} />;
    },

    // Enhanced details/summary for collapsible content - MOBILE OPTIMIZED
    details: (props: any) => (
      <details className="my-3 sm:my-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden w-full" {...props} />
    ),
    summary: (props: any) => (
      <summary className="px-3 sm:px-4 py-2 sm:py-3 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm sm:text-base" {...props} />
    ),

    // Keyboard key styling - MOBILE OPTIMIZED
    kbd: (props: any) => (
      <kbd className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm" {...props} />
    ),

    // Subscript and superscript - MOBILE OPTIMIZED
    sub: (props: any) => (
      <sub className="text-xs" {...props} />
    ),
    sup: (props: any) => (
      <sup className="text-xs" {...props} />
    ),

    // Video element support
    video: (props: any) => (
      <figure className="my-3 sm:my-4 md:my-6 lg:my-8 w-full">
        <div className="w-full max-w-4xl mx-auto">
          <VideoPlayer {...props} />
        </div>
      </figure>
    ),
  };

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none w-full [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0 overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, [remarkEmoji, { accessible: true }]]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);