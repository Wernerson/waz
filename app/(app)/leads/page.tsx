"use client";

import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { HelpCircle, Mail, Search, User } from "lucide-react";
import { IssueField, type IssueFieldParts } from "@/components/issueField";

type Lead = FunctionReturnType<typeof api.leads.list>[number];
type PlannedIssue = NonNullable<Lead["plannedIssue"]>;

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

function matchesSearch(lead: Lead, query: string): boolean {
  const haystack = [lead.title, lead.description, lead.tag, sourceLabel(lead.source)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function distinctIssues(leads: Lead[]): PlannedIssue[] {
  const byKey = new Map<string, PlannedIssue>();
  for (const lead of leads) {
    if (!lead.plannedIssue) continue;
    byKey.set(`${lead.plannedIssue.year}-${lead.plannedIssue.number}`, lead.plannedIssue);
  }
  return [...byKey.values()].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.number - b.number,
  );
}

type MenuState = { leadId: Id<"leads">; x: number; y: number };

function IssueMenu({
  menu,
  issues,
  onSelect,
  onClose,
}: {
  menu: MenuState;
  issues: PlannedIssue[];
  onSelect: (issue: PlannedIssue) => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ top: menu.y, left: menu.x }}
      className="fixed z-30 min-w-36 border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-800 dark:bg-zinc-950"
    >
      <p className="border-b border-zinc-200 px-2 py-1 text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
        Assign to...
      </p>
      {issues.length === 0 ? (
        <p className="px-2 py-1 text-sm text-zinc-500 dark:text-zinc-400">No issues yet</p>
      ) : (
        issues.map((issue) => (
          <button
            key={`${issue.year}-${issue.number}`}
            type="button"
            role="menuitem"
            className="block w-full px-2 py-1 text-left text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            onClick={() => onSelect(issue)}
          >
            {issueLabel(issue)}
          </button>
        ))
      )}

      <NewIssueOption onSelect={onSelect} />
    </div>
  );
}

function NewIssueOption({ onSelect }: { onSelect: (issue: PlannedIssue) => void }) {
  const [parts, setParts] = useState<IssueFieldParts>({ number: "", year: "" });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!parts.number || !parts.year) return;
    onSelect({ number: Number(parts.number), year: Number(parts.year) });
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-zinc-200 p-1 dark:border-zinc-800">
      <p className="px-1 pb-1 text-xs text-zinc-500 dark:text-zinc-400">New issue</p>
      <IssueField
        aria-label="New issue"
        onValueChange={(_, nextParts) => setParts(nextParts)}
        className="h-7"
      />
    </form>
  );
}

function LeadCard({
  lead,
  onContextMenu,
}: {
  lead: Lead;
  onContextMenu: (event: MouseEvent) => void;
}) {
  const source = lead.source;
  const label = sourceLabel(source);

  return (
    <div
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu(event);
      }}
      className="relative border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
    >
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
  const assignIssue = useMutation(api.leads.assignIssue);
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<MenuState | null>(null);

  const query = search.trim().toLowerCase();
  const filteredLeads = leads?.filter((lead) => !query || matchesSearch(lead, query));

  const onCardContextMenu = (leadId: Id<"leads">, event: MouseEvent) => {
    setMenu({ leadId, x: event.clientX, y: event.clientY });
  };

  const onSelectIssue = (issue: PlannedIssue) => {
    if (!menu) return;
    void assignIssue({ leadId: menu.leadId, plannedIssue: issue });
    setMenu(null);
  };

  return (
    <section className="w-full">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Leads</h1>

      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search leads…"
          className="h-8 w-full border border-zinc-300 bg-white pr-2 pl-8 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
        />
      </div>

      {leads === undefined ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading…</p>
      ) : leads.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No leads yet.</p>
      ) : filteredLeads && filteredLeads.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">No leads match your search.</p>
      ) : (
        <div className="mt-4 space-y-8">
          {groupByIssue(filteredLeads ?? []).map((group) => (
            <section key={group.key}>
              <h2 className="border-b border-zinc-200 pb-2 text-sm font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {group.label}
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.leads.map((lead) => (
                  <LeadCard
                    key={lead._id}
                    lead={lead}
                    onContextMenu={(event) => onCardContextMenu(lead._id, event)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {menu ? (
        <IssueMenu
          menu={menu}
          issues={distinctIssues(leads ?? [])}
          onSelect={onSelectIssue}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </section>
  );
}
