"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useWorkspace } from "@/contexts/workspace-context";
import { toast } from "sonner";
import { channelApi } from "@/lib/api";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Channel name must be at least 2 characters" })
    .max(50, { message: "Channel name must be less than 50 characters" })
    .regex(/^[a-z0-9-_]+$/, {
      message: "Channel name can only contain lowercase letters, numbers, hyphens, and underscores",
    }),
  description: z
    .string()
    .max(200, { message: "Description must be less than 200 characters" })
    .optional(),
  isPrivate: z.boolean().default(false),
});

interface CreateChannelDialogProps {
  trigger: React.ReactNode;
  onChannelCreated?: () => void;
}

export function CreateChannelDialog({
  trigger,
  onChannelCreated,
}: CreateChannelDialogProps) {
  const { activeWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPrivate: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeWorkspace) {
      toast.error("No active workspace selected");
      return;
    }

    setIsLoading(true);
    try {
      await channelApi.createChannel(activeWorkspace.id, values);
      form.reset();
      setOpen(false);
      toast.success(`Channel #${values.name} created successfully`);
      if (onChannelCreated) {
        onChannelCreated();
      }
    } catch (error) {
      console.error("Failed to create channel:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create channel. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
          <DialogDescription>
            Create a new channel in the {activeWorkspace?.name} workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="general"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your channel's name. Use lowercase letters, numbers, hyphens, and underscores only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this channel about?"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the channel's purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Private Channel</FormLabel>
                    <FormDescription>
                      Private channels are only visible to invited members.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Channel"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
