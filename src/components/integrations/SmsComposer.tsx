"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";

interface SmsComposerProps {
  recipientPhone?: string;
  recipientName?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  onSent?: () => void;
}

const smsTemplates = [
  {
    label: "Appointment Reminder",
    body: "Hi {name}, this is a reminder about your upcoming appointment. Please let us know if you need to reschedule.",
  },
  {
    label: "Lab Results Ready",
    body: "Hi {name}, your lab results are in. Please call us to schedule your consultation to review them.",
  },
  {
    label: "Follow-up Check-in",
    body: "Hi {name}, just checking in to see how you're doing. Let us know if you have any questions or concerns.",
  },
  {
    label: "Scheduling",
    body: "Hi {name}, we'd like to schedule your next appointment. Please reply with your availability or call us.",
  },
];

export default function SmsComposer({
  recipientPhone,
  recipientName,
  contactId,
  dealId,
  leadId,
  onSent,
}: SmsComposerProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(recipientPhone || "");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const applyTemplate = (template: string) => {
    setBody(template.replace("{name}", recipientName || "there"));
  };

  const handleSend = async () => {
    if (!to || !body) {
      setError("Phone number and message are required");
      return;
    }

    setSending(true);
    setError("");

    const res = await fetch("/api/integrations/twilio/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, body, contactId, dealId, leadId }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setBody("");
        onSent?.();
      }, 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to send SMS");
    }

    setSending(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bc-btn bc-btn-neutral text-xs"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        SMS
      </button>
    );
  }

  return (
    <div className="bc-card mt-3">
      <div className="bc-section-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Send SMS
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
            SMS sent successfully!
          </div>
        )}

        <div>
          <label className="bc-label">To</label>
          <input
            className="bc-input"
            type="tel"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Templates */}
        <div>
          <label className="bc-label">Quick Templates</label>
          <div className="flex flex-wrap gap-1.5">
            {smsTemplates.map((t) => (
              <button
                key={t.label}
                onClick={() => applyTemplate(t.body)}
                className="text-xs bg-[#F4F6F9] border border-[#DDDBDA] rounded px-2 py-1 hover:bg-[#E8F4FC] hover:border-[#0070D2] text-[#3E3E3C] transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="bc-label">
            Message{" "}
            <span className="font-normal text-[#706E6B]">
              ({160 - body.length} chars remaining)
            </span>
          </label>
          <textarea
            className="bc-input min-h-[80px]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message..."
            maxLength={320}
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
            {sending ? "Sending..." : "Send SMS"}
          </button>
        </div>
      </div>
    </div>
  );
}
