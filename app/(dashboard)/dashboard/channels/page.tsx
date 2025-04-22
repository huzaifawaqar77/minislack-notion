"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWorkspace } from "@/contexts/workspace-context";
import { useChannel, Channel } from "@/contexts/channel-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateChannelDialog } from "@/components/channel/create-channel-dialog";
import {
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ChannelsPage() {
  const { activeWorkspace } = useWorkspace();
  const { channels, isLoading, fetchChannels } = useChannel();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (channels) {
      setFilteredChannels(
        channels.filter((channel) =>
          channel.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [channels, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Channels</h2>
          {activeWorkspace && (
            <p className="text-sm text-muted-foreground">
              Manage channels in {activeWorkspace.name}
            </p>
          )}
        </div>
        <CreateChannelDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Channel
            </Button>
          }
          onChannelCreated={fetchChannels}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <TabsList>
            <TabsTrigger value="all">All Channels</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {filteredChannels.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No channels found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? `No channels matching "${searchQuery}"`
                    : "Create your first channel to get started"}
                </p>
              </div>
              <CreateChannelDialog
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Channel
                  </Button>
                }
                onChannelCreated={fetchChannels}
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredChannels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="public" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChannels
              .filter((channel) => !channel.is_private)
              .map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
          </div>
          {filteredChannels.filter((channel) => !channel.is_private).length ===
            0 && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No public channels found
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChannels
              .filter((channel) => channel.is_private)
              .map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
          </div>
          {filteredChannels.filter((channel) => channel.is_private).length ===
            0 && (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No private channels found
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">#{channel.name}</CardTitle>
            {channel.is_private && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <CardDescription>
          {channel.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">
          Created on {new Date(channel.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/dashboard/channels/${channel.id}`}>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Open
          </Button>
        </Link>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </CardFooter>
    </Card>
  );
}
