import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  darkMode: boolean;
}

export function Editor({ value, onChange, darkMode }: EditorProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground border-b bg-muted/50">
        HTML 에디터
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={[html()]}
          theme={darkMode ? "dark" : "light"}
          height="100%"
          style={{ height: "100%" }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            autocompletion: true,
            bracketMatching: true,
            closeBrackets: true,
            highlightActiveLine: true,
          }}
        />
      </div>
    </div>
  );
}
