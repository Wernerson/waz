"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { IssueField, type IssueFieldParts } from "@/components/issueField";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-8 w-full border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500";
const labelClassName = "text-sm font-medium text-zinc-900 dark:text-zinc-100";

export function NewLeadForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: () => void;
}) {
  const createLead = useMutation(api.leads.create);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [source, setSource] = useState("");
  const [issue, setIssue] = useState<IssueFieldParts>({ number: "", year: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const plannedIssue =
        issue.number && issue.year
          ? { number: Number(issue.number), year: Number(issue.year) }
          : undefined;
      await createLead({
        title,
        description: description || undefined,
        tag: tag || undefined,
        source: source || undefined,
        plannedIssue,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-4">
      <div className="space-y-1">
        <label htmlFor="lead-title" className={labelClassName}>
          Title
        </label>
        <input
          id="lead-title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lead-description" className={labelClassName}>
          Description
        </label>
        <textarea
          id="lead-description"
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={cn(fieldClassName, "h-auto resize-none py-1.5")}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lead-category" className={labelClassName}>
          Tag
        </label>
        <input
          id="lead-category"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className={fieldClassName}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lead-owner" className={labelClassName}>
          Source
        </label>
        <input
            id="lead-source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={fieldClassName}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="lead-issue" className={labelClassName}>
          Issue
        </label>
        <IssueField id="lead-issue" onValueChange={(_, parts) => setIssue(parts)} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
