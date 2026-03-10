import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  FileDown,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  FilePlus,
} from "lucide-react";

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onNew: () => void;
  onSave: () => void;
  onDownloadPdf: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  title,
  onTitleChange,
  onNew,
  onSave,
  onDownloadPdf,
  darkMode,
  onToggleDarkMode,
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b px-4 py-2 bg-card">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
        {sidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
      </Button>
      <h1 className="text-lg font-bold whitespace-nowrap">HTML to PDF</h1>
      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="문서 제목을 입력하세요"
        className="max-w-xs"
      />
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onNew}>
          <FilePlus className="h-4 w-4" />
          새 문서
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
          저장
        </Button>
        <Button variant="outline" size="sm" onClick={onDownloadPdf}>
          <FileDown className="h-4 w-4" />
          PDF
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
