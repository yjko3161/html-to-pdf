import { Editor } from "./Editor";
import { Preview } from "./Preview";
import { useDebounce } from "@/hooks/useDebounce";

interface MainPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  darkMode: boolean;
}

export function MainPanel({ code, onCodeChange, darkMode }: MainPanelProps) {
  const debouncedCode = useDebounce(code, 300);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="w-1/2 border-r h-full">
        <Editor value={code} onChange={onCodeChange} darkMode={darkMode} />
      </div>
      <div className="w-1/2 h-full">
        <Preview html={debouncedCode} />
      </div>
    </div>
  );
}
