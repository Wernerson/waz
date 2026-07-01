"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type IssueFieldParts = {
  number: string;
  year: string;
};

type IssueFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "placeholder" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, parts: IssueFieldParts) => void;
};

function parseIssueValue(value: string): IssueFieldParts {
  const slashIndex = value.indexOf("/");
  if (slashIndex === -1) {
    return { number: value.replace(/\D/g, "").slice(0, 2), year: "" };
  }
  const number = value
    .slice(0, slashIndex)
    .replace(/\D/g, "")
    .slice(0, 2);
  const year = value
    .slice(slashIndex + 1)
    .replace(/\D/g, "")
    .slice(0, 2);
  return { number, year };
}

function formatIssueValue(parts: IssueFieldParts, hasSlash: boolean): string {
  return hasSlash ? `${parts.number}/${parts.year}` : parts.number;
}

function stripLeadingZero(number: string): string {
  return number.replace(/^0+(?=\d)/, "");
}

function deriveDisplayValue(raw: string): string {
  const parts = parseIssueValue(raw);
  const hasSlash = raw.includes("/") || parts.year.length > 0;
  return formatIssueValue(parts, hasSlash);
}

function sanitizeIssueInput(
  raw: string,
  isDeleting: boolean,
): { value: string; autoInserted: boolean } {
  const cleaned = raw.replace(/[^\d/]/g, "");
  const firstSlash = cleaned.indexOf("/");

  let number: string;
  let year: string;
  let hasSlash: boolean;

  if (firstSlash > 0) {
    // Ignore any slash beyond the first one; treat its digits as part of the year.
    number = cleaned.slice(0, firstSlash).slice(0, 2);
    year = cleaned
      .slice(firstSlash + 1)
      .replace(/\//g, "")
      .slice(0, 2);
    hasSlash = true;
  } else {
    // A leading slash (no number yet) is not a valid separator.
    number = cleaned.replace(/\//g, "").slice(0, 2);
    year = "";
    hasSlash = false;
  }

  let autoInserted = false;
  if (!hasSlash && number.length === 2 && !isDeleting) {
    hasSlash = true;
    autoInserted = true;
  }

  return { value: formatIssueValue({ number, year }, hasSlash), autoInserted };
}

export function IssueField({
  className,
  value,
  defaultValue = "",
  onValueChange,
  onBlur,
  ...props
}: IssueFieldProps) {
  const isControlled = value !== undefined;
  const initial = useMemo(
    () => deriveDisplayValue(isControlled ? value ?? "" : defaultValue),
    [defaultValue, isControlled, value],
  );
  const [internalValue, setInternalValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isControlled) {
      return;
    }
    setInternalValue(deriveDisplayValue(value ?? ""));
  }, [isControlled, value]);

  const emit = (nextValue: string) => {
    setInternalValue(nextValue);
    onValueChange?.(nextValue, parseIssueValue(nextValue));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputType = (event.nativeEvent as InputEvent).inputType ?? "";
    const isDeleting =
      inputType.startsWith("delete") || event.target.value.length < internalValue.length;
    const { value: nextValue, autoInserted } = sanitizeIssueInput(event.target.value, isDeleting);
    emit(nextValue);
    if (autoInserted) {
      requestAnimationFrame(() => {
        const end = nextValue.length;
        inputRef.current?.setSelectionRange(end, end);
      });
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const parts = parseIssueValue(internalValue);
    const number = stripLeadingZero(parts.number);
    if (number !== parts.number) {
      emit(formatIssueValue({ number, year: parts.year }, internalValue.includes("/")));
    }
    onBlur?.(event);
  };

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={internalValue}
      placeholder="_/__"
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn(
        "h-8 w-full border border-zinc-300 bg-white px-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500",
        className,
      )}
    />
  );
}
