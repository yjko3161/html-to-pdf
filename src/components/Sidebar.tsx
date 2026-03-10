import { useState } from "react";
import type { HtmlDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Search } from "lucide-react";

interface SidebarProps {
  documents: HtmlDocument[];
  onSelect: (doc: HtmlDocument) => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  documents,
  onSelect,
  onDelete,
}: SidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="flex flex-col w-64 border-r bg-card h-full">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {documents.length === 0 ? "저장된 문서가 없습니다" : "검색 결과 없음"}
            </p>
          )}
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-muted"
              onClick={() => onSelect(doc)}
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">
                  {doc.title || "제목 없음"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.updatedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
