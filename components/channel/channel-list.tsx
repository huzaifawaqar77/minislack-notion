"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/workspace-context";
import { useChannel, Channel } from "@/contexts/channel-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreateChannelDialog } from "@/components/channel/create-channel-dialog";
import { cn } from "@/lib/utils";
import { Hash, Lock, Loader2, Plus } from "lucide-react";

interface ChannelListProps {
  isCollapsed?: boolean;
}

export function ChannelList({ isCollapsed = false }: ChannelListProps) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspace();
  const { channels, activeChannel, isLoading, setActiveChannel } = useChannel();
  const [publicChannels, setPublicChannels] = useState<Channel[]>([]);
  const [privateChannels, setPrivateChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (channels) {
      setPublicChannels(channels.filter((channel) => !channel.is_private));
      setPrivateChannels(channels.filter((channel) => channel.is_private));
    }
  }, [channels]);

  if (!activeWorkspace) {
    return (
      <div className="py-2 px-3 text-sm text-muted-foreground">
        Select a workspace to view channels
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between py-1"
        )}
      >
        {!isCollapsed && (
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Channels
          </h2>
        )}
        {!isCollapsed && (
          <CreateChannelDialog
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-zinc-400 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Channel</span>
              </Button>
            }
          />
        )}
      </div>
      <div className="mt-2">
        <div className="space-y-1">
          {publicChannels.length > 0 ? (
            publicChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannel?.id === channel.id}
                onClick={() => setActiveChannel(channel)}
                isCollapsed={isCollapsed}
              />
            ))
          ) : (
            <div className="py-2 px-3 text-sm text-muted-foreground">
              No public channels
            </div>
          )}

          {privateChannels.length > 0 && (
            <>
              <div className="pt-3 pb-1">
                <h3 className="text-xs font-semibold text-muted-foreground">
                  PRIVATE CHANNELS
                </h3>
              </div>
              {privateChannels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannel?.id === channel.id}
                  onClick={() => setActiveChannel(channel)}
                  isCollapsed={isCollapsed}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
  isCollapsed?: boolean;
}

function ChannelItem({
  channel,
  isActive,
  onClick,
  isCollapsed = false,
}: ChannelItemProps) {
  return (
    <Link href={`/dashboard/channels/${channel.id}`}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "font-normal transition-all",
          isActive
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
          isCollapsed
            ? "h-8 w-8 p-0 mx-auto justify-center"
            : "w-full justify-start px-2 py-1.5 h-auto"
        )}
        onClick={onClick}
      >
        {channel.is_private ? (
          <Lock className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
        ) : (
          <Hash className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
        )}
        {!isCollapsed && (
          <span className="truncate text-sm">{channel.name}</span>
        )}
      </Button>
    </Link>
  );
}
