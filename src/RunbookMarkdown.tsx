import Markdown from "react-markdown";

export function RunbookMarkdown({ content }: { content: string }) {
  return (
    <div className="markdown">
      <Markdown
        skipHtml
        urlTransform={(url) => (/^#\/[a-z0-9/-]*$/.test(url) ? url : "")}
        components={{
          img: ({ alt }) => (
            <span className="muted">[Image omitted: {alt || "untitled"}]</span>
          ),
          a: ({ href, children }) =>
            href ? <a href={href}>{children}</a> : <span>{children}</span>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
