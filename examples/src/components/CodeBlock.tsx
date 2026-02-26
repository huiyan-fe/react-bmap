import React, { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ position: 'relative', marginTop: 8 }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          right: 8,
          top: 8,
          padding: '4px 10px',
          fontSize: 12,
          border: '1px solid #ddd',
          borderRadius: 4,
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {copied ? '已复制' : '复制'}
      </button>
      <Highlight theme={themes.github} code={code} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={{
              ...style,
              padding: 16,
              borderRadius: 6,
              overflow: 'auto',
              fontSize: 13,
            }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
