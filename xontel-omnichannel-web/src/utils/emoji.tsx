// EmojiText.tsx
import twemoji from "twemoji";
import React from "react";

type Props = {
  text: string;
};

export function EmojiText({ text }: Props) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: twemoji.parse(text, {
          folder: "svg",
          ext: ".svg",
        }),
      }}
    />
  );
}

type EmojiRendererProps = {
  children: React.ReactNode;
};

export function EmojiRenderer({ children }: EmojiRendererProps) {
  const processNode = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      // For string nodes, parse with twemoji
      const parsedHtml = twemoji.parse(node, {
        folder: "svg",
        ext: ".svg",
      });
      return (
        <span
          key={Math.random()}
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      );
    } else if (React.isValidElement(node)) {
      // For React elements, process children recursively
      const processedChildren = React.Children.map(node.props.children, processNode);
      return React.cloneElement(node, { key: Math.random() }, processedChildren);
    } else if (Array.isArray(node)) {
      // For arrays, process each item
      return node.map(processNode);
    }
    return node;
  };

  return <>{processNode(children)}</>;
}
