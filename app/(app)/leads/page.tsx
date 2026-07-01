"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { HelpCircle, Mail, User } from "lucide-react";

type Lead = FunctionReturnType<typeof api.leads.list>[number];

function issueLabel(plannedIssue: Lead["plannedIssue"]): string {
  if (!plannedIssue) return "New Leads";
  return `${plannedIssue.number}/${String(plannedIssue.year).slice(-2)}`;
}

function groupByIssue(leads: Lead[]) {
  const groups: { key: string; label: string; leads: Lead[] }[] = [];
  for (const lead of leads) {
    const key = lead.plannedIssue
      ? `${lead.plannedIssue.year}-${lead.plannedIssue.number}`
      : "unassigned";
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.leads.push(lead);
    } else {
      groups.push({ key, label: issueLabel(lead.plannedIssue), leads: [lead] });
    }
  }
  return groups;
}

function SourceIcon({ kind }: { kind: NonNullable<Lead["source"]>["kind"] }) {
  if (kind === "Email") return <Mail className="size-4" />;
  if (kind === "User") return <User className="size-4" />;
  return <HelpCircle className="size-4" />;
}

function sourceLabel(source: Lead["source"]): string | null {
  if (!source) return null;
  if (source.kind === "Email") return source.email;
  if (source.kind === "Other") return source.name;
  return source.label;
}

function LeadCard({ lead }: { lead: Lead }) {
  const source = lead.source;
  const label = sourceLabel(source);

  return (
    <div className="relative border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      {lead.tag ? (
        <span className="absolute top-2 right-2 border border-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          {lead.tag}
        </span>
      ) : null}

      <div className="pr-16">
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{lead.title}</h3>
        {lead.description ? (
          <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            {lead.description}
          </p>
        ) : null}
      </div>

      {source && label ? (
        <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-200 pt-2 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <SourceIcon kind={source.kind} />
          <span className="truncate">{label}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function LeadsPage() {
  const leads = useQuery(api.leads.list);

  return (
    <section className="w-full">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Leads</h1>

      {leads === undefined ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No leads yet.</p>
      ) : (
        <div className="mt-4 space-y-8">
          {groupByIssue(leads).map((group) => (
            <section key={group.key}>
              <h2 className="border-b border-zinc-200 pb-2 text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {group.label}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.leads.map((lead) => (
                  <LeadCard key={lead._id} lead={lead} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
