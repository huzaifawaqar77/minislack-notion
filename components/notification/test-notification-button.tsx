'use client';

import { Button } from "@/components/ui/button";
import { notificationApi } from "@/lib/api/notificationApi";
import { useState } from "react";
import { toast } from "sonner";

export function TestNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);

  const createTestNotification = async () => {
    try {
      setIsLoading(true);
      
      // Make a POST request to create a test notification
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create test notification');
      }
      
      toast.success('Test notification created successfully');
      
      // Refresh notifications
      await notificationApi.getNotifications();
      
    } catch (error: any) {
      console.error('Error creating test notification:', error);
      toast.error(error.message || 'Failed to create test notification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={createTestNotification} 
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? 'Creating...' : 'Create Test Notification'}
    </Button>
  );
}
