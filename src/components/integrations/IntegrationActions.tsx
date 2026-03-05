"use client";

import EmailComposer from "./EmailComposer";
import SmsComposer from "./SmsComposer";
import CallButton from "./CallButton";
import ScheduleMeeting from "./ScheduleMeeting";

interface IntegrationActionsProps {
  email?: string;
  phone?: string;
  name?: string;
  contactId?: string;
  dealId?: string;
  leadId?: string;
  onAction?: () => void;
}

export default function IntegrationActions({
  email,
  phone,
  name,
  contactId,
  dealId,
  leadId,
  onAction,
}: IntegrationActionsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {email && (
          <EmailComposer
            recipientEmail={email}
            recipientName={name}
            contactId={contactId}
            dealId={dealId}
            leadId={leadId}
            onSent={onAction}
          />
        )}
        {phone && (
          <>
            <CallButton
              phoneNumber={phone}
              contactId={contactId}
              dealId={dealId}
              leadId={leadId}
              onCalled={onAction}
            />
            <SmsComposer
              recipientPhone={phone}
              recipientName={name}
              contactId={contactId}
              dealId={dealId}
              leadId={leadId}
              onSent={onAction}
            />
          </>
        )}
        {email && (
          <ScheduleMeeting
            recipientEmail={email}
            recipientName={name}
            contactId={contactId}
            dealId={dealId}
            defaultSummary={name ? `Meeting with ${name}` : undefined}
            onScheduled={onAction}
          />
        )}
      </div>
    </div>
  );
}
