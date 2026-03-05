"use client";

import { useState } from "react";
import { Calendar, X, Loader2, Check } from "lucide-react";

interface ScheduleMeetingProps {
  recipientEmail?: string;
  recipientName?: string;
  contactId?: string;
  dealId?: string;
  defaultSummary?: string;
  onScheduled?: () => void;
}

export default function ScheduleMeeting({
  recipientEmail,
  recipientName,
  contactId,
  dealId,
  defaultSummary,
  onScheduled,
}: ScheduleMeetingProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(
    defaultSummary || (recipientName ? `Meeting with ${recipientName}` : "")
  );
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [attendeeEmail, setAttendeeEmail] = useState(recipientEmail || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSchedule = async () => {
    if (!summary || !date || !startTime || !endTime) {
      setError("Title, date, start time, and end time are required");
      return;
    }

    setSaving(true);
    setError("");

    const startDateTime = `${date}T${startTime}:00`;
    const endDateTime = `${date}T${endTime}:00`;

    const res = await fetch("/api/integrations/google/calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summary,
        description,
        location,
        startDateTime,
        endDateTime,
        attendeeEmails: attendeeEmail ? [attendeeEmail] : [],
        contactId,
        dealId,
      }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setSummary(defaultSummary || "");
        setDescription("");
        setDate("");
        onScheduled?.();
      }, 1500);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to schedule meeting");
    }

    setSaving(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bc-btn bc-btn-neutral text-xs"
      >
        <Calendar className="w-3.5 h-3.5" />
        Schedule
      </button>
    );
  }

  return (
    <div className="bc-card mt-3">
      <div className="bc-section-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Meeting
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
          <div className="bg-green-50 text-green-700 text-sm px-3 py-2 rounded border border-green-200 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Meeting scheduled! Calendar invite sent.
          </div>
        )}

        <div>
          <label className="bc-label">Title</label>
          <input
            className="bc-input"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Meeting title"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="bc-label">Date</label>
            <input
              className="bc-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="bc-label">Start</label>
            <input
              className="bc-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="bc-label">End</label>
            <input
              className="bc-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="bc-label">Attendee Email</label>
          <input
            className="bc-input"
            type="email"
            value={attendeeEmail}
            onChange={(e) => setAttendeeEmail(e.target.value)}
            placeholder="attendee@example.com"
          />
        </div>

        <div>
          <label className="bc-label">Location</label>
          <input
            className="bc-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Office, Zoom link, etc."
          />
        </div>

        <div>
          <label className="bc-label">Notes</label>
          <textarea
            className="bc-input min-h-[60px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Meeting notes or agenda..."
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
            onClick={handleSchedule}
            disabled={saving}
            className="bc-btn bc-btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
            {saving ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
