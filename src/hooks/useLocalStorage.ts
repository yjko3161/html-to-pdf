import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { HtmlDocument } from "@/types";

const STORAGE_KEY = "html_to_pdf_documents";

function load(): HtmlDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(docs: HtmlDocument[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function useLocalStorage() {
  const [documents, setDocuments] = useState<HtmlDocument[]>(load);

  const save = useCallback((title: string, content: string) => {
    const now = new Date().toISOString();
    const doc: HtmlDocument = {
      id: uuidv4(),
      title,
      content,
      createdAt: now,
      updatedAt: now,
    };
    setDocuments((prev) => {
      const next = [doc, ...prev];
      persist(next);
      return next;
    });
    return doc;
  }, []);

  const remove = useCallback((id: string) => {
    setDocuments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { documents, save, remove };
}
