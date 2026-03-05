import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Building2,
  Activity,
  Phone,
  Mail,
  CalendarCheck,
  ClipboardList,
} from "lucide-react";

export default async function ReportsPage() {
  await auth();

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    pipelineStages,
    allDeals,
    leads,
    topAccounts,
    activities,
  ] = await Promise.all([
    // Pipeline Summary: stages from default pipeline with deals
    prisma.stage.findMany({
      where: {
        pipeline: { isDefault: true },
      },
      orderBy: { order: "asc" },
      include: {
        deals: {
          select: { amount: true },
        },
      },
    }),
    // All deals created in last 6 months
    prisma.deal.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    // All leads for source and status breakdown
    prisma.lead.findMany({
      select: {
        source: true,
        status: true,
      },
    }),
    // Top 5 accounts by annual revenue
    prisma.account.findMany({
      where: {
        annualRevenue: { not: null },
      },
      orderBy: { annualRevenue: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        industry: true,
        annualRevenue: true,
      },
    }),
    // All activities for type summary
    prisma.activity.findMany({
      select: {
        type: true,
      },
    }),
  ]);

  // ---- Pipeline Summary ----
  const pipelineSummary = pipelineStages.map((stage) => {
    const dealCount = stage.deals.length;
    const totalValue = stage.deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const avgSize = dealCount > 0 ? totalValue / dealCount : 0;
    return {
      id: stage.id,
      name: stage.name,
      color: stage.color,
      dealCount,
      totalValue,
      avgSize,
    };
  });
  const maxPipelineValue = Math.max(...pipelineSummary.map((s) => s.totalValue), 1);

  // ---- Deals by Month ----
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dealsByMonth: { month: string; count: number; totalValue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthDeals = allDeals.filter(
      (deal) => deal.createdAt >= monthStart && deal.createdAt < monthEnd
    );
    dealsByMonth.push({
      month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      count: monthDeals.length,
      totalValue: monthDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0),
    });
  }
  const maxMonthValue = Math.max(...dealsByMonth.map((m) => m.totalValue), 1);

  // ---- Lead Source Breakdown ----
  const sourceMap = new Map<string, number>();
  leads.forEach((lead) => {
    const source = lead.source || "Unknown";
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });
  const totalLeads = leads.length;
  const leadSources = Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ---- Lead Status Distribution ----
  const statusMap = new Map<string, number>();
  leads.forEach((lead) => {
    statusMap.set(lead.status, (statusMap.get(lead.status) || 0) + 1);
  });
  const leadStatuses = Array.from(statusMap.entries())
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);

  const statusColorMap: Record<string, string> = {
    New: "bg-blue-100 text-blue-800",
    Contacted: "bg-yellow-100 text-yellow-800",
    Qualified: "bg-green-100 text-green-800",
    Unqualified: "bg-red-100 text-red-800",
    Converted: "bg-purple-100 text-purple-800",
  };

  // ---- Activity Summary ----
  const activityMap = new Map<string, number>();
  activities.forEach((a) => {
    activityMap.set(a.type, (activityMap.get(a.type) || 0) + 1);
  });
  const activityTypes = ["task", "call", "email", "meeting"];
  const activitySummary = activityTypes.map((type) => ({
    type,
    count: activityMap.get(type) || 0,
  }));

  const activityIconMap: Record<string, React.ReactNode> = {
    task: <ClipboardList className="h-6 w-6 text-orange-500" />,
    call: <Phone className="h-6 w-6 text-green-500" />,
    email: <Mail className="h-6 w-6 text-blue-500" />,
    meeting: <CalendarCheck className="h-6 w-6 text-purple-500" />,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#3E3E3C]">Reports</h1>
        <p className="text-sm text-[#706E6B] mt-1">
          Overview of your pipeline, leads, and activity metrics
        </p>
      </div>

      {/* Pipeline Summary */}
      <div className="bc-card mb-6">
        <div className="bc-section-header flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#706E6B]" />
          Pipeline Summary
        </div>
        <div className="overflow-x-auto">
          <table className="bc-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Deals</th>
                <th>Total Value</th>
                <th>Avg Deal Size</th>
                <th className="w-64">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {pipelineSummary.map((stage) => (
                <tr key={stage.id}>
                  <td className="font-medium text-[#3E3E3C]">{stage.name}</td>
                  <td>{stage.dealCount}</td>
                  <td className="font-medium">{formatCurrency(stage.totalValue)}</td>
                  <td>{formatCurrency(stage.avgSize)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(stage.totalValue / maxPipelineValue) * 100}%`,
                            backgroundColor: stage.color,
                            minWidth: stage.totalValue > 0 ? "8px" : "0px",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {pipelineSummary.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#706E6B] py-4">
                    No pipeline stages configured.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column: Deals by Month + Lead Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Deals by Month */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#706E6B]" />
            Deals by Month (Last 6 Months)
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Deals</th>
                  <th>Total Value</th>
                  <th className="w-40">Chart</th>
                </tr>
              </thead>
              <tbody>
                {dealsByMonth.map((m) => (
                  <tr key={m.month}>
                    <td className="font-medium text-[#3E3E3C] whitespace-nowrap">
                      {m.month}
                    </td>
                    <td>{m.count}</td>
                    <td className="font-medium">{formatCurrency(m.totalValue)}</td>
                    <td>
                      <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0070D2] transition-all"
                          style={{
                            width: `${(m.totalValue / maxMonthValue) * 100}%`,
                            minWidth: m.totalValue > 0 ? "8px" : "0px",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center gap-2">
            <Users className="h-4 w-4 text-[#706E6B]" />
            Lead Source Breakdown
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th className="w-40">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {leadSources.map((s) => (
                  <tr key={s.source}>
                    <td className="font-medium text-[#3E3E3C]">{s.source}</td>
                    <td>{s.count}</td>
                    <td>{s.percentage}%</td>
                    <td>
                      <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#4BCA81] transition-all"
                          style={{
                            width: `${s.percentage}%`,
                            minWidth: s.percentage > 0 ? "8px" : "0px",
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {leadSources.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-[#706E6B] py-4">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two-column: Lead Status + Top Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Lead Status Distribution */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center gap-2">
            <Target className="h-4 w-4 text-[#706E6B]" />
            Lead Status Distribution
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {leadStatuses.map((s) => (
                  <tr key={s.status}>
                    <td>
                      <span
                        className={`bc-badge ${statusColorMap[s.status] || "bg-gray-100 text-gray-800"}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="font-medium">{s.count}</td>
                  </tr>
                ))}
                {leadStatuses.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-[#706E6B] py-4">
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Accounts by Revenue */}
        <div className="bc-card">
          <div className="bc-section-header flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#706E6B]" />
            Top Accounts by Revenue
          </div>
          <div className="overflow-x-auto">
            <table className="bc-table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Industry</th>
                  <th>Annual Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topAccounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <Link
                        href={`/accounts/${account.id}`}
                        className="text-[#0070D2] hover:text-[#005FB2] font-medium"
                      >
                        {account.name}
                      </Link>
                    </td>
                    <td className="text-[#706E6B]">{account.industry || "--"}</td>
                    <td className="font-medium">
                      {account.annualRevenue != null
                        ? formatCurrency(account.annualRevenue)
                        : "--"}
                    </td>
                  </tr>
                ))}
                {topAccounts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center text-[#706E6B] py-4">
                      No accounts with revenue data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bc-card mb-6">
        <div className="bc-section-header flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#706E6B]" />
          Activity Summary
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
          {activitySummary.map((a) => (
            <div
              key={a.type}
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-[#F4F6F9] border border-[#DDDBDA]"
            >
              <div className="mb-2">{activityIconMap[a.type]}</div>
              <div className="text-2xl font-bold text-[#3E3E3C]">{a.count}</div>
              <div className="text-xs font-semibold text-[#706E6B] uppercase tracking-wide mt-1 capitalize">
                {a.type === "email" ? "Emails" : `${a.type}s`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
