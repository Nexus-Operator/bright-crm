import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  Contact,
  Building2,
  Handshake,
  DollarSign,
  Trophy,
  Phone,
  Mail,
  CalendarCheck,
  ClipboardList,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    totalContacts,
    totalAccounts,
    openDealsData,
    wonThisMonth,
    dealsByStage,
    recentLeads,
    recentDeals,
    upcomingActivities,
  ] = await Promise.all([
    prisma.lead.count({
      where: { ownerId: userId },
    }),
    prisma.contact.count({
      where: { ownerId: userId },
    }),
    prisma.account.count({
      where: { ownerId: userId },
    }),
    prisma.deal.findMany({
      where: {
        ownerId: userId,
        stage: {
          name: { not: "Closed Lost" },
        },
      },
      select: { amount: true },
    }),
    prisma.deal.count({
      where: {
        ownerId: userId,
        stage: { name: "Closed Won" },
        createdAt: { gte: startOfMonth },
      },
    }),
    prisma.stage.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            deals: {
              where: { ownerId: userId },
            },
          },
        },
      },
    }),
    prisma.lead.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.deal.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        account: { select: { name: true } },
        stage: { select: { name: true } },
      },
    }),
    prisma.activity.findMany({
      where: {
        ownerId: userId,
        status: "Open",
        dueDate: { gte: now },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const openDeals = openDealsData.length;
  const pipelineValue = openDealsData.reduce(
    (sum, deal) => sum + (deal.amount || 0),
    0
  );

  const maxDealCount = Math.max(
    ...dealsByStage.map((s) => s._count.deals),
    1
  );

  const activityIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4 text-green-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-600" />;
      case "meeting":
        return <CalendarCheck className="h-4 w-4 text-purple-600" />;
      case "task":
        return <ClipboardList className="h-4 w-4 text-orange-600" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-500" />;
    }
  };

  const leadStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Unqualified":
        return "bg-red-100 text-red-800";
      case "Converted":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stageColor = (name: string) => {
    switch (name) {
      case "Closed Won":
        return "bg-green-100 text-green-800";
      case "Closed Lost":
        return "bg-red-100 text-red-800";
      case "Negotiation":
        return "bg-orange-100 text-orange-800";
      case "Proposal":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const summaryCards = [
    {
      label: "Total Leads",
      value: totalLeads,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      href: "/leads",
    },
    {
      label: "Total Contacts",
      value: totalContacts,
      icon: <Contact className="h-6 w-6 text-indigo-500" />,
      href: "/contacts",
    },
    {
      label: "Total Accounts",
      value: totalAccounts,
      icon: <Building2 className="h-6 w-6 text-teal-500" />,
      href: "/accounts",
    },
    {
      label: "Open Deals",
      value: openDeals,
      icon: <Handshake className="h-6 w-6 text-orange-500" />,
      href: "/deals",
    },
    {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      href: "/deals",
    },
    {
      label: "Won This Month",
      value: wonThisMonth,
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      href: "/deals",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#3E3E3C]">
          Dashboard
        </h1>
        <p className="text-sm text-[#706E6B] mt-1">
          Welcome back, {session?.user?.name || "User"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {summaryCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <div className="bc-card p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#706E6B] uppercase tracking-wide">
                  {card.label}
                </span>
                {card.icon}
              </div>
              <div className="text-2xl font-bold text-[#3E3E3C]">
                {card.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Deals by Stage */}
      <div className="bc-card mb-6">
        <div className="bc-section-header flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#706E6B]" />
          Deals by Stage
        </div>
        <div className="p-4 space-y-3">
          {dealsByStage.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3">
              <div className="w-32 text-xs font-medium text-[#3E3E3C] truncate">
                {stage.name}
              </div>
              <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(stage._count.deals / maxDealCount) * 100}%`,
                    backgroundColor: stage.color,
                    minWidth: stage._count.deals > 0 ? "24px" : "0px",
                  }}
                />
              </div>
              <div className="w-8 text-right text-xs font-bold text-[#3E3E3C]">
                {stage._count.deals}
              </div>
            </div>
          ))}
          {dealsByStage.length === 0 && (
            <p className="text-sm text-[#706E6B] text-center py-4">
              No pipeline stages configured yet.
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout: Recent Leads + Recent Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Leads */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#706E6B]" />
              Recent Leads
            </div>
            <Link
              href="/leads"
              className="text-xs font-semibold text-[#0070D2] hover:text-[#005FB2] flex items-center gap-1"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-[#0070D2] hover:text-[#005FB2] font-medium"
                      >
                        {lead.firstName} {lead.lastName}
                      </Link>
                    </td>
                    <td className="text-[#706E6B]">
                      {lead.company || "--"}
                    </td>
                    <td>
                      <span
                        className={`bc-badge ${leadStatusColor(lead.status)}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="text-[#706E6B]">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-[#706E6B] py-4">
                      No leads yet.{" "}
                      <Link
                        href="/leads/new"
                        className="text-[#0070D2] hover:text-[#005FB2]"
                      >
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-[#706E6B]" />
              Recent Deals
            </div>
            <Link
              href="/deals"
              className="text-xs font-semibold text-[#0070D2] hover:text-[#005FB2] flex items-center gap-1"
            >
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Close Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-[#0070D2] hover:text-[#005FB2] font-medium"
                      >
                        {deal.name}
                      </Link>
                    </td>
                    <td className="text-[#706E6B]">
                      {deal.account ? (
                        <Link
                          href={`/accounts/${deal.accountId}`}
                          className="text-[#0070D2] hover:text-[#005FB2]"
                        >
                          {deal.account.name}
                        </Link>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="font-medium">
                      {deal.amount != null
                        ? formatCurrency(deal.amount)
                        : "--"}
                    </td>
                    <td>
                      <span
                        className={`bc-badge ${stageColor(deal.stage.name)}`}
                      >
                        {deal.stage.name}
                      </span>
                    </td>
                    <td className="text-[#706E6B]">
                      {deal.closeDate
                        ? formatDate(deal.closeDate)
                        : "--"}
                    </td>
                  </tr>
                ))}
                {recentDeals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-[#706E6B] py-4">
                      No deals yet.{" "}
                      <Link
                        href="/deals/new"
                        className="text-[#0070D2] hover:text-[#005FB2]"
                      >
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="bc-card">
        <div className="bc-section-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#706E6B]" />
            Upcoming Activities
          </div>
          <Link
            href="/activities"
            className="text-xs font-semibold text-[#0070D2] hover:text-[#005FB2] flex items-center gap-1"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-[#DDDBDA]">
          {upcomingActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#F4F6F9] transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {activityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#3E3E3C] truncate">
                  {activity.subject}
                </p>
                <p className="text-xs text-[#706E6B] capitalize">
                  {activity.type}
                  {activity.priority && (
                    <span className="ml-2">
                      &middot; {activity.priority} priority
                    </span>
                  )}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-[#706E6B]">
                {activity.dueDate ? formatDate(activity.dueDate) : "--"}
              </div>
            </div>
          ))}
          {upcomingActivities.length === 0 && (
            <div className="text-center text-[#706E6B] text-sm py-6">
              No upcoming activities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
