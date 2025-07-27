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

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    // Beautiful heading hierarchy with proper spacing
    h1: (props: any) => (
      <h1 className="scroll-m-20 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-700 first:mt-0" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="scroll-m-20 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-8 mb-4 first:mt-0" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="scroll-m-20 text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-6 mb-3" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="scroll-m-20 text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-5 mb-2" {...props} />
    ),
    h5: (props: any) => (
      <h5 className="scroll-m-20 text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 mt-4 mb-2" {...props} />
    ),
    h6: (props: any) => (
      <h6 className="scroll-m-20 text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 mt-3 mb-2" {...props} />
    ),

    // Enhanced paragraphs with perfect typography
    p: (props: any) => (
      <p className="leading-7 text-base sm:text-lg text-zinc-700 dark:text-zinc-300 mb-4 [&:not(:first-child)]:mt-4" {...props} />
    ),

    // Beautiful code blocks without dark background
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");
      
      return !inline && match ? (
        <div className="my-6 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/80 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                {match[1]}
              </span>
            </div>
            <CopyButton text={codeContent} />
          </div>
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              className="!m-0 !bg-transparent !text-sm sm:!text-base"
              customStyle={{
                padding: '1.5rem',
                margin: 0,
                background: 'transparent',
                fontSize: 'inherit'
              }}
              codeTagProps={{
                style: {
                  background: 'transparent'
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
          className="relative rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 font-mono text-sm font-medium text-rose-600 dark:text-rose-400 border border-zinc-200 dark:border-zinc-700/50"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Enhanced pre for fallback code blocks
    pre: (props: any) => (
      <pre className="p-6 overflow-x-auto font-mono text-sm sm:text-base text-zinc-800 dark:text-zinc-200 bg-transparent" {...props} />
    ),

    // Comprehensive table styling with mobile responsiveness
    table: (props: any) => (
      <div className="my-8 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base" {...props} />
        </div>
      </div>
    ),
    thead: (props: any) => (
      <thead className="bg-zinc-50 dark:bg-zinc-800/50" {...props} />
    ),
    th: (props: any) => (
      <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-700" {...props} />
    ),
    td: (props: any) => (
      <td className="px-4 sm:px-6 py-4 text-zinc-700 dark:text-zinc-300 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0" {...props} />
    ),
    tr: (props: any) => (
      <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors" {...props} />
    ),

    // Beautiful list styling
    ul: (props: any) => (
      <ul className="my-6 ml-6 list-disc space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-2" {...props} />
    ),
    ol: (props: any) => (
      <ol className="my-6 ml-6 list-decimal space-y-2 text-zinc-700 dark:text-zinc-300 [&>li]:mt-2" {...props} />
    ),
    li: (props: any) => (
      <li className="leading-7 text-base sm:text-lg pl-1" {...props} />
    ),

    // Enhanced text formatting
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

    // Stunning blockquotes
    blockquote: (props: any) => (
      <blockquote className="relative my-8 pl-8 pr-6 py-6 bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl shadow-sm" {...props}>
        <div className="absolute top-3 left-3 text-blue-500/30 dark:text-blue-400/30">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
        <div className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed italic font-medium [&>*]:!mb-2 [&>*:last-child]:!mb-0">
          {props.children}
        </div>
      </blockquote>
    ),

    // Enhanced links with beautiful hover effects
    a: ({ node, href, children, ...props }: any) => (
      <Link
        href={href || "#"}
        className="group inline-flex items-baseline gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline decoration-2 decoration-blue-500/30 hover:decoration-blue-500 underline-offset-2 transition-all duration-200"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        <span>{children}</span>
        <svg 
          className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
    ),

    // Stunning image display
    img: ({ node, ...props }: any) => (
      <figure className="my-8 text-center">
        <div className="group relative inline-block rounded-xl overflow-hidden shadow-lg bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <Image
            {...props}
            width={800}
            height={600}
            className="max-w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            alt={props.alt || "Image"}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 80vw, 70vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {props.alt && (
          <figcaption className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 italic font-medium">
            {props.alt}
          </figcaption>
        )}
      </figure>
    ),

    // Beautiful horizontal rule
    hr: (props: any) => (
      <div className="relative my-12 flex items-center" {...props}>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
        <div className="flex-shrink-0 px-4">
          <div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full"></div>
        </div>
        <div className="flex-grow border-t border-zinc-200 dark:border-zinc-700"></div>
      </div>
    ),

    // Task list items (GitHub Flavored Markdown)
    input: (props: any) => {
      if (props.type === 'checkbox') {
        return (
          <input
            {...props}
            className="mr-2 h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-2"
          />
        );
      }
      return <input {...props} />;
    },

    // Enhanced details/summary for collapsible content
    details: (props: any) => (
      <details className="my-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-hidden" {...props} />
    ),
    summary: (props: any) => (
      <summary className="px-4 py-3 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" {...props} />
    ),

    // Keyboard key styling
    kbd: (props: any) => (
      <kbd className="inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded shadow-sm" {...props} />
    ),

    // Subscript and superscript
    sub: (props: any) => (
      <sub className="text-xs" {...props} />
    ),
    sup: (props: any) => (
      <sup className="text-xs" {...props} />
    ),
  };

  return (
    <div className="prose prose-zinc dark:prose-invert max-w-none w-full [&>*:first-child]:!mt-0 [&>*:last-child]:!mb-0">
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