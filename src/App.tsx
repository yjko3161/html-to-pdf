import { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { downloadPdfFromHtml } from "./lib/pdf";
import type { HtmlDocument } from "./types";

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>HTML 코드를 입력하면 오른쪽에서 미리보기할 수 있습니다.</p>
</body>
</html>`;

function App() {
  const [code, setCode] = useState(DEFAULT_HTML);
  const [title, setTitle] = useState("새 문서");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { documents, save, remove } = useLocalStorage();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const handleSave = useCallback(() => {
    save(title, code);
  }, [title, code, save]);

  const handleSelect = useCallback((doc: HtmlDocument) => {
    setTitle(doc.title);
    setCode(doc.content);
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    await downloadPdfFromHtml(code, title);
  }, [code, title]);

  const handleNew = useCallback(() => {
    setTitle("새 문서");
    setCode(DEFAULT_HTML);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        title={title}
        onTitleChange={setTitle}
        onNew={handleNew}
        onSave={handleSave}
        onDownloadPdf={handleDownloadPdf}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            documents={documents}
            onSelect={handleSelect}
            onDelete={remove}
          />
        )}
        <MainPanel code={code} onCodeChange={setCode} darkMode={darkMode} />
      </div>
    </div>
  );
}

export default App;
