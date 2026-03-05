"use client";

import { useState } from "react";
import { Mail, Send, X, Loader2 } from "lucide-react";

interface EmailComposerProps {
  recipientEmail?: string;
  recipientName?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  onSent?: () => void;
}

export default function EmailComposer({
  recipientEmail,
  recipientName,
  contactId,
  dealId,
  leadId,
  onSent,
}: EmailComposerProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(recipientEmail || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError("To, Subject, and Body are required");
      return;
    }

    setSending(true);
    setError("");

    const res = await fetch("/api/integrations/google/gmail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, body, contactId, dealId, leadId }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setSubject("");
        setBody("");
        onSent?.();
      }, 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send email");
    }

    setSending(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bc-btn bc-btn-neutral text-xs"
      >
        <Mail className="w-3.5 h-3.5" />
        Email
      </button>
    );
  }

  return (
    <div className="bc-card mt-3">
      <div className="bc-section-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Send Email
          {recipientName && (
            <span className="font-normal text-[#706E6B]">
              to {recipientName}
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[#706E6B] hover:text-[#3E3E3C]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded border border-green-200">
            Email sent successfully!
          </div>
        )}

        <div>
          <label className="bc-label">To</label>
          <input
            className="bc-input"
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>
        <div>
          <label className="bc-label">Subject</label>
          <input
            className="bc-input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
          />
        </div>
        <div>
          <label className="bc-label">Body</label>
          <textarea
            className="bc-input min-h-[120px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="bc-btn bc-btn-neutral"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="bc-btn bc-btn-primary"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
