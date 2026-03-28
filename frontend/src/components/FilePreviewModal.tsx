"use client";

import { useState, useEffect } from "react";
import {
  X, Download, FileText, Image as ImageIcon, File, Loader2, Maximize2, Minimize2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FilePreviewModalProps {
  file: {
    name: string;
    url: string;
    type: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  useEffect(() => {
    if (isOpen && file && file.type.startsWith("text/")) {
      setLoading(true);
      fetch(file.url)
        .then((res) => res.text())
        .then((text) => {
          setTextContent(text);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch text content", err);
          setTextContent("Error loading file content.");
          setLoading(false);
        });
    } else {
      setTextContent(null);
    }
  }, [isOpen, file]);

  if (!file) return null;

  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  const isText = file.type.startsWith("text/");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${fullScreen ? "max-w-[98vw] h-[95vh]" : "h-[80vh]"}`}>
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              {isImage ? <ImageIcon className="w-4 h-4 text-blue-500" /> : 
               isPdf ? <FileText className="w-4 h-4 text-blue-500" /> : 
               <File className="w-4 h-4 text-blue-500" />}
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[300px]">
                {file.name}
              </DialogTitle>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{file.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-8">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              onClick={() => setFullScreen(!fullScreen)}
            >
              {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg text-xs font-semibold">
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </a>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 p-4 flex items-center justify-center">
          {isImage ? (
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain shadow-lg rounded-lg" 
            />
          ) : isPdf ? (
            <iframe
              src={`${file.url}#toolbar=0`}
              className="w-full h-full rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
              title={file.name}
            />
          ) : isText ? (
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <p className="text-xs text-slate-400">Loading content...</p>
                </div>
              ) : (
                <pre className="text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {textContent}
                </pre>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto">
                <File className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Preview Available</h3>
                <p className="text-sm text-slate-400 mt-1">This file type cannot be previewed directly.</p>
              </div>
              <a href={file.url} download={file.name}>
                <Button className="rounded-xl bg-blue-500 hover:bg-blue-600 gap-2">
                  <Download className="w-4 h-4" />
                  Download to View
                </Button>
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
