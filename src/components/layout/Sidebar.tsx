"use client";

import Link from "next/link";
import { Plus, Clock, Users, Building2, DollarSign, UserCircle } from "lucide-react";

interface RecentItem {
  id: string;
  name: string;
  type: "lead" | "contact" | "account" | "deal";
}

const typeIcons = {
  lead: Users,
  contact: UserCircle,
  account: Building2,
  deal: DollarSign,
};

const typeColors = {
  lead: "text-orange-500",
  contact: "text-purple-500",
  account: "text-blue-500",
  deal: "text-green-500",
};

const typeHrefs = {
  lead: "/leads",
  contact: "/contacts",
  account: "/accounts",
  deal: "/deals",
};

export default function Sidebar({ recentItems = [] }: { recentItems?: RecentItem[] }) {
  return (
    <aside className="w-56 bg-white border-r border-[#DDDBDA] min-h-[calc(100vh-88px)] flex-shrink-0">
      {/* Quick Create */}
      <div className="p-3 border-b border-[#DDDBDA]">
        <p className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2">
          Quick Create
        </p>
        <div className="space-y-1">
          {[
            { label: "New Lead", href: "/leads/new" },
            { label: "New Contact", href: "/contacts/new" },
            { label: "New Account", href: "/accounts/new" },
            { label: "New Deal", href: "/deals/new" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm text-[#0070D2] hover:text-[#005FB2] py-1"
            >
              <Plus className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Items */}
      <div className="p-3">
        <p className="text-xs font-bold text-[#706E6B] uppercase tracking-wider mb-2 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Recent Items
        </p>
        {recentItems.length === 0 ? (
          <p className="text-xs text-[#706E6B] italic">No recent items</p>
        ) : (
          <div className="space-y-1">
            {recentItems.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <Link
                  key={item.id}
                  href={`${typeHrefs[item.type]}/${item.id}`}
                  className="flex items-center gap-2 text-sm text-[#0070D2] hover:text-[#005FB2] py-1"
                >
                  <Icon className={`w-3.5 h-3.5 ${typeColors[item.type]}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
