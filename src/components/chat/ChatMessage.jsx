import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const markdownComponents = useMemo(() => ({
    h1: ({ children }) => (
      <h1 className={twMerge("font-bold text-lg mb-3 mt-4", isUser ? "text-white" : "text-[var(--foreground)]")}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={twMerge("font-bold text-base mb-2 mt-3", isUser ? "text-white" : "text-[var(--foreground)]")}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={twMerge("font-semibold text-sm mb-2", isUser ? "text-indigo-200" : "text-indigo-400")}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className={twMerge("mb-2 last:mb-0 leading-relaxed", isUser ? "text-indigo-50" : "text-[var(--foreground)]/90")}>
        {children}
      </p>
    ),
    strong: ({ children }) => (
      <strong className={twMerge("font-bold", isUser ? "text-white" : "text-[var(--foreground)]")}>{children}</strong>
    ),
    em: ({ children }) => (
      <em className={twMerge("italic", isUser ? "text-indigo-200" : "text-indigo-500")}>{children}</em>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-3 ml-2 space-y-1">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-3 ml-2 space-y-1">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={twMerge(isUser ? "text-indigo-50" : "text-[var(--foreground)]/90")}>{children}</li>
    ),
    pre: ({ children }) => (
      <pre className="bg-black/20 p-4 rounded-xl overflow-x-auto my-4 border border-white/5 backdrop-blur-sm">
        {children}
      </pre>
    ),
    code: ({ inline, children }) => (
      <code className={twMerge(
        "font-mono text-xs px-1.5 py-0.5 rounded",
        inline 
          ? (isUser ? "bg-white/10 text-white" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20") 
          : "text-[var(--foreground)]/90"
      )}>
        {children}
      </code>
    ),
    blockquote: ({ children }) => (
      <blockquote className={twMerge(
        "border-l-4 pl-4 py-2 my-4 rounded-r bg-white/5",
        isUser ? "border-white/30 text-indigo-100" : "border-indigo-500 text-[var(--text-muted)]"
      )}>
        {children}
      </blockquote>
    ),
    a: ({ children, href }) => (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={twMerge(
          "underline decoration-2 underline-offset-4 transition-all font-bold",
          isUser ? "text-white hover:text-indigo-100" : "text-indigo-400 hover:text-indigo-500"
        )}
      >
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto rounded-xl border border-white/10 my-4 shadow-sm">
        <table className="w-full border-collapse text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={isUser ? "bg-white/10" : "bg-indigo-500/5"}>
        {children}
      </thead>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className={twMerge(
        "px-4 py-3 text-left font-bold text-xs uppercase tracking-wider",
        isUser ? "text-white" : "text-indigo-400"
      )}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={twMerge(
        "px-4 py-3",
        isUser ? "text-indigo-50" : "text-[var(--foreground)]/80"
      )}>
        {children}
      </td>
    ),
  }), [isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={twMerge(
        "flex gap-4 mb-8",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      <div className={twMerge(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all",
        isUser 
          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
          : "bg-[var(--surface)] border-[var(--border)] text-indigo-400"
      )}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className={twMerge(
        "max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm",
        isUser 
          ? "bg-indigo-600 text-white rounded-tr-none" 
          : "bg-[var(--surface)] text-[var(--foreground)] rounded-tl-none border border-[var(--border)]"
      )}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]}
          components={markdownComponents}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
