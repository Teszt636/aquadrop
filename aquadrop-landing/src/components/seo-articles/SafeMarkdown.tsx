import type { ReactNode } from 'react';

type SafeMarkdownProps = {
  markdown: string;
  className?: string;
};

function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|\/|#|mailto:)/i.test(href);
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const label = linkMatch?.[1] ?? token;
      const href = linkMatch?.[2]?.trim() ?? '';
      if (href && isSafeHref(href)) {
        const isExternal = /^https?:\/\//i.test(href);
        nodes.push(
          <a
            key={`${match.index}-link`}
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4 hover:text-cyan-950"
          >
            {label}
          </a>
        );
      } else {
        nodes.push(label);
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraph(lines: string[], key: string) {
  return (
    <p key={key} className="text-base leading-8 text-slate-700 md:text-lg">
      {renderInline(lines.join(' '))}
    </p>
  );
}

export function SafeMarkdown({ markdown, className }: SafeMarkdownProps) {
  const blocks: ReactNode[] = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let listItems: string[] = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    blocks.push(renderParagraph(paragraph, `p-${blocks.length}`));
    paragraph = [];
  }

  function flushList() {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-6 text-base leading-7 text-slate-700 md:text-lg">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="mt-8 text-xl font-semibold leading-tight text-slate-950">
          {renderInline(line.replace(/^###\s+/, ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="mt-10 text-2xl font-semibold leading-tight text-slate-950 md:text-3xl">
          {renderInline(line.replace(/^#{1,2}\s+/, ''))}
        </h2>
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return <div className={className}>{blocks}</div>;
}
