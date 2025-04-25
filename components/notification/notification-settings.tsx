"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NotificationSettings() {
  // Notification preferences state
  const [preferences, setPreferences] = useState({
    // General
    enableNotifications: true,
    enableSounds: true,
    
    // Direct messages
    directMessages: true,
    directMessageMentions: true,
    
    // Channels
    channelMessages: false,
    channelMentions: true,
    
    // Workspace
    workspaceInvitations: true,
    channelInvitations: true,
    newChannels: true,
    
    // Files and reactions
    fileSharing: true,
    reactions: true,
    replies: true,
    
    // Delivery method
    deliveryMethod: "all", // all, email, in-app
    
    // Quiet hours
    enableQuietHours: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  });

  // Handle toggle change
  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle select change
  const handleSelectChange = (key: keyof typeof preferences, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save preferences
  const savePreferences = () => {
    // In a real implementation, this would call an API to save the preferences
    console.log("Saving notification preferences:", preferences);
    toast.success("Notification preferences saved");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* General settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableNotifications" className="flex flex-col gap-1">
                  <span>Enable notifications</span>
                  <span className="text-xs text-muted-foreground">
                    Receive notifications in the application
                  </span>
                </Label>
                <Switch
                  id="enableNotifications"
                  checked={preferences.enableNotifications}
                  onCheckedChange={() => handleToggleChange("enableNotifications")}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="enableSounds" className="flex flex-col gap-1">
                  <span>Notification sounds</span>
                  <span className="text-xs text-muted-foreground">
                    Play sounds for new notifications
                  </span>
                </Label>
                <Switch
                  id="enableSounds"
                  checked={preferences.enableSounds}
                  onCheckedChange={() => handleToggleChange("enableSounds")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Direct messages */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Direct Messages</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="directMessages" className="flex flex-col gap-1">
                  <span>Direct messages</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when you receive a direct message
                  </span>
                </Label>
                <Switch
                  id="directMessages"
                  checked={preferences.directMessages}
                  onCheckedChange={() => handleToggleChange("directMessages")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="directMessageMentions" className="flex flex-col gap-1">
                  <span>Mentions in direct messages</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when you are mentioned in a direct message
                  </span>
                </Label>
                <Switch
                  id="directMessageMentions"
                  checked={preferences.directMessageMentions}
                  onCheckedChange={() => handleToggleChange("directMessageMentions")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Channels */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Channels</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="channelMessages" className="flex flex-col gap-1">
                  <span>Channel messages</span>
                  <span className="text-xs text-muted-foreground">
                    Notify for all messages in channels you are a member of
                  </span>
                </Label>
                <Switch
                  id="channelMessages"
                  checked={preferences.channelMessages}
                  onCheckedChange={() => handleToggleChange("channelMessages")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="channelMentions" className="flex flex-col gap-1">
                  <span>Mentions in channels</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when you are mentioned in a channel
                  </span>
                </Label>
                <Switch
                  id="channelMentions"
                  checked={preferences.channelMentions}
                  onCheckedChange={() => handleToggleChange("channelMentions")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Workspace */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Workspace</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="workspaceInvitations" className="flex flex-col gap-1">
                  <span>Workspace invitations</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when you are invited to a workspace
                  </span>
                </Label>
                <Switch
                  id="workspaceInvitations"
                  checked={preferences.workspaceInvitations}
                  onCheckedChange={() => handleToggleChange("workspaceInvitations")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="channelInvitations" className="flex flex-col gap-1">
                  <span>Channel invitations</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when you are invited to a channel
                  </span>
                </Label>
                <Switch
                  id="channelInvitations"
                  checked={preferences.channelInvitations}
                  onCheckedChange={() => handleToggleChange("channelInvitations")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="newChannels" className="flex flex-col gap-1">
                  <span>New channels</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when a new channel is created in your workspace
                  </span>
                </Label>
                <Switch
                  id="newChannels"
                  checked={preferences.newChannels}
                  onCheckedChange={() => handleToggleChange("newChannels")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Files and reactions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Files and Reactions</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="fileSharing" className="flex flex-col gap-1">
                  <span>File sharing</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when someone shares a file with you
                  </span>
                </Label>
                <Switch
                  id="fileSharing"
                  checked={preferences.fileSharing}
                  onCheckedChange={() => handleToggleChange("fileSharing")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reactions" className="flex flex-col gap-1">
                  <span>Reactions</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when someone reacts to your message
                  </span>
                </Label>
                <Switch
                  id="reactions"
                  checked={preferences.reactions}
                  onCheckedChange={() => handleToggleChange("reactions")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="replies" className="flex flex-col gap-1">
                  <span>Replies</span>
                  <span className="text-xs text-muted-foreground">
                    Notify when someone replies to your message
                  </span>
                </Label>
                <Switch
                  id="replies"
                  checked={preferences.replies}
                  onCheckedChange={() => handleToggleChange("replies")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Delivery method */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Delivery Method</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deliveryMethod" className="flex flex-col gap-1">
                  <span>Notification delivery</span>
                  <span className="text-xs text-muted-foreground">
                    Choose how you want to receive notifications
                  </span>
                </Label>
                <Select
                  value={preferences.deliveryMethod}
                  onValueChange={(value) => handleSelectChange("deliveryMethod", value)}
                  disabled={!preferences.enableNotifications}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select delivery method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="email">Email only</SelectItem>
                    <SelectItem value="in-app">In-app only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Quiet hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiet Hours</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableQuietHours" className="flex flex-col gap-1">
                  <span>Enable quiet hours</span>
                  <span className="text-xs text-muted-foreground">
                    Disable notifications during specific hours
                  </span>
                </Label>
                <Switch
                  id="enableQuietHours"
                  checked={preferences.enableQuietHours}
                  onCheckedChange={() => handleToggleChange("enableQuietHours")}
                  disabled={!preferences.enableNotifications}
                />
              </div>
              
              {preferences.enableQuietHours && (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursStart">Start time</Label>
                    <input
                      id="quietHoursStart"
                      type="time"
                      value={preferences.quietHoursStart}
                      onChange={(e) => handleSelectChange("quietHoursStart", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietHoursEnd">End time</Label>
                    <input
                      id="quietHoursEnd"
                      type="time"
                      value={preferences.quietHoursEnd}
                      onChange={(e) => handleSelectChange("quietHoursEnd", e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={savePreferences}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
