"use client";

import { ChangeEvent, DragEvent, FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { IssueField, type IssueFieldParts } from "@/components/issueField";
import { cn } from "@/lib/utils";
import { File as FileIcon, Upload, X } from "lucide-react";

const fieldClassName =
  "h-8 w-full border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500";
const labelClassName = "text-sm font-medium text-zinc-900 dark:text-zinc-100";

type Attachment = {
  storageId: Id<"_storage">;
  name: string;
  contentType: string;
  size: number;
  previewUrl?: string;
};

export function NewLeadForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: () => void;
}) {
  const createLead = useMutation(api.leads.create);
  const generateUploadUrl = useMutation(api.leads.generateUploadUrl);
  const deleteAttachment = useMutation(api.leads.deleteAttachment);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [source, setSource] = useState("");
  const [issue, setIssue] = useState<IssueFieldParts>({ number: "", year: "" });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        fileList.map(async (file) => {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!result.ok) throw new Error(`Failed to upload ${file.name}`);
          const { storageId } = (await result.json()) as { storageId: Id<"_storage"> };
          return {
            storageId,
            name: file.name,
            contentType: file.type,
            size: file.size,
            previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
          };
        }),
      );
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) void uploadFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files) void uploadFiles(event.dataTransfer.files);
  };

  const removeAttachment = (storageId: Id<"_storage">) => {
    setAttachments((prev) => {
      const target = prev.find((attachment) => attachment.storageId === storageId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((attachment) => attachment.storageId !== storageId);
    });
    void deleteAttachment({ storageId });
  };

  const onCancelClick = () => {
    for (const attachment of attachments) {
      if (attachment.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
      void deleteAttachment({ storageId: attachment.storageId });
    }
    setAttachments([]);
    onCancel();
  };

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
        attachments: attachments.map(({ storageId, name, contentType, size }) => ({
          storageId,
          name,
          contentType,
          size,
        })),
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

      <div className="space-y-2">
        <span className={labelClassName}>Attachments</span>
        <label
          htmlFor="lead-attachments"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-1 border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 cursor-pointer dark:border-zinc-700 dark:text-zinc-400",
            isDraggingOver && "border-zinc-500 bg-zinc-50 dark:bg-zinc-900",
          )}
        >
          <Upload className="size-5" />
          <span>
            {isUploading ? "Uploading..." : "Drag and drop files here, or click to browse"}
          </span>
          <input
            id="lead-attachments"
            type="file"
            multiple
            className="hidden"
            onChange={onFileInputChange}
            disabled={isUploading}
          />
        </label>

        {attachments.length > 0 ? (
          <ul className="space-y-1">
            {attachments.map((attachment) => (
              <li
                key={attachment.storageId}
                className="flex items-center gap-2 border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-800"
              >
                {attachment.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.previewUrl}
                    alt={attachment.name}
                    className="size-8 shrink-0 rounded object-cover"
                  />
                ) : (
                  <FileIcon className="size-8 shrink-0 rounded p-1.5 text-zinc-500 dark:text-zinc-400" />
                )}
                <span className="min-w-0 flex-1 truncate text-zinc-900 dark:text-zinc-100">
                  {attachment.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.storageId)}
                  className="shrink-0 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  aria-label={`Remove ${attachment.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelClick} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Creating..." : "Create Lead"}
        </Button>
      </div>
    </form>
  );
}
