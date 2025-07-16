import Image from "next/image";
import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    h1: (props: any) => (
      <h2 className="text-2xl font-bold mt-6 mb-2" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="text-xl font-bold mt-5 mb-2" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />
    ),
    h4: (props: any) => (
      <h4 className="text-base font-semibold mt-3 mb-1" {...props} />
    ),
    h5: (props: any) => (
      <h5 className="text-base font-medium mt-2 mb-1" {...props} />
    ),
    h6: (props: any) => (
      <h6 className="text-sm font-medium mt-2 mb-1" {...props} />
    ),
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-2 text-sm"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className={
            "text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md " +
            (className || "")
          }
          {...props}
        >
          {children}
        </code>
      );
    },
    table: (props: any) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-zinc-200 dark:border-zinc-700 text-sm" {...props} />
      </div>
    ),
    th: (props: any) => (
      <th className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 font-semibold border border-zinc-200 dark:border-zinc-700" {...props} />
    ),
    td: (props: any) => (
      <td className="px-3 py-2 border border-zinc-200 dark:border-zinc-700" {...props} />
    ),
    ol: (props: any) => (
      <ol className="list-decimal list-outside ml-4" {...props} />
    ),
    ul: (props: any) => (
      <ul className="list-disc list-outside ml-4" {...props} />
    ),
    li: (props: any) => (
      <li className="py-1" {...props} />
    ),
    strong: (props: any) => (
      <span className="font-semibold" {...props} />
    ),
    a: ({ node, href, children, ...props }: any) => (
      <Link
        href={href || "#"}
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </Link>
    ),
    img: ({ node, ...props }: any) => (
      <Image
        {...props}
        width={500}
        height={300}
        className="max-w-full rounded-lg my-2 mx-auto shadow"
        alt={props.alt || "Image"}
        loading="lazy"
      />
    ),
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-blue-400 pl-4 italic text-zinc-600 dark:text-zinc-400 my-4" {...props} />
    ),
    del: (props: any) => (
      <del className="line-through text-zinc-400" {...props} />
    ),
    em: (props: any) => (
      <em className="italic" {...props} />
    ),
    p: (props: any) => (
      <p className="mb-2" {...props} />
    ),
    // Emoji and other GFM features are handled by remark-gfm
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath, [remarkEmoji, { accessible: true }]]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
