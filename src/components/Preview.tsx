import { useRef, useEffect } from "react";

interface PreviewProps {
  html: string;
}

export function Preview({ html }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/50">
        미리보기
      </div>
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          title="미리보기"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
