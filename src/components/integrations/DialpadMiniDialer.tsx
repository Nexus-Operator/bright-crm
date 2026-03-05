"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, X, Minimize2, Maximize2 } from "lucide-react";

export default function DialpadMiniDialer({
  open,
  onClose,
  miniDialerUrl,
  initialNumber,
}: {
  open: boolean;
  onClose: () => void;
  miniDialerUrl: string;
  initialNumber?: string;
}) {
  const [minimized, setMinimized] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send the initial number to the iframe via postMessage once loaded
  useEffect(() => {
    if (!open || !initialNumber || !iframeRef.current) return;

    // Small delay to ensure the iframe has loaded enough to receive messages
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "dialpad:dial", number: initialNumber },
        "https://dialpad.com"
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [open, initialNumber]);

  if (!open) return null;

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 bg-[#1B2A4A] text-white px-4 py-3 rounded-lg shadow-2xl hover:bg-[#243656] transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">Dialpad</span>
          <Maximize2 className="w-3.5 h-3.5 ml-1 opacity-60" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-[#DDDBDA] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1B2A4A] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-semibold">Dialpad</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized(true)}
            className="p-1 hover:bg-white/10 rounded"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dialpad Mini Dialer iframe */}
      <iframe
        ref={iframeRef}
        src={miniDialerUrl}
        title="Dialpad Mini Dialer"
        className="w-full border-0"
        style={{ height: 500 }}
        allow="microphone; autoplay; clipboard-write"
      />
    </div>
  );
}
