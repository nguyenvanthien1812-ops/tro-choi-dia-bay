import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
  text: string;
  className?: string;
}

export const MathRenderer: React.FC<Props> = ({ text, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Check if text contains any LaTeX delimiters: $$...$$ or $...$
    if (!text.includes('$')) {
      return <span>{text}</span>;
    }

    // Regex to match $$display math$$ or $inline math$
    const regex = /(\$\$[\s\S]*?\$\$|\$[^\$]+?\$)/g;
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="my-1.5 block text-center overflow-x-auto text-emerald-950 font-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <code key={index} className="text-red-500">{part}</code>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return (
            <span
              key={index}
              className="inline-block mx-0.5 align-middle text-emerald-900 font-medium"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (e) {
          return <code key={index} className="text-red-500">{part}</code>;
        }
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }, [text]);

  return <div className={`inline-block leading-relaxed ${className}`}>{renderedContent}</div>;
};
