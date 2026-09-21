"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";

interface ConfirmDeleteButtonProps {
  /** API path to DELETE. */
  apiPath: string;
  /** Where to go afterwards. Omit to stay on the current page and refresh it. */
  redirectTo?: string;
  title: string;
  description: string;
  size?: "default" | "sm";
}

/** A delete button that asks for confirmation, then calls the API. */
export const ConfirmDeleteButton = ({
  apiPath,
  redirectTo,
  title,
  description,
  size = "default",
}: ConfirmDeleteButtonProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await api(apiPath, { method: "DELETE" });
      if (redirectTo) router.push(redirectTo);
      router.refresh();
      setOpen(false);
    } catch {
      setError("Could not delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size={size} />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
