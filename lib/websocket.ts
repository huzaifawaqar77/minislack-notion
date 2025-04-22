// WebSocket service for real-time messaging using Socket.IO client
import { io, Socket } from "socket.io-client";

type MessageCallback = (message: any) => void;
type StatusCallback = (status: "connected" | "disconnected" | "error") => void;

class WebSocketService {
  private socket: Socket | null = null;
  private messageCallbacks: Map<string, Set<MessageCallback>> = new Map();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private token: string | null = null;
  private joinedChannels: Set<string> = new Set(); // Track joined channels to prevent duplicates

  constructor() {
    this.messageCallbacks = new Map();
    this.statusCallbacks = new Set();
  }

  // Connect to the Socket.IO server
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log("Socket.IO already connected");
      return;
    }

    this.token = token;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    try {
      console.log("Connecting to Socket.IO server:", wsUrl);

      // Create Socket.IO connection with auth token
      this.socket = io(wsUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["websocket", "polling"],
        forceNew: false,
        multiplex: true,
      });

      // Connection events
      this.socket.on("connect", () => {
        console.log("Socket.IO connected with ID:", this.socket?.id);
        this.reconnectAttempts = 0;
        this.notifyStatusChange("connected");
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Socket.IO disconnected. Reason:", reason);
        this.notifyStatusChange("disconnected");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
        this.notifyStatusChange("error");
        this.reconnectAttempts++;
      });

      // Handle incoming messages
      this.socket.onAny((eventName, ...args) => {
        console.log(`Received event: ${eventName}`, args[0]);
        this.handleMessage({ type: eventName, ...args[0] });
      });
    } catch (error) {
      console.error("Failed to connect to Socket.IO:", error);
      this.notifyStatusChange("error");
    }
  }

  // Disconnect from the Socket.IO server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.reconnectAttempts = 0;

    // Clear joined channels when disconnecting
    this.joinedChannels.clear();
    console.log("Cleared joined channels on disconnect");
  }

  // Send a message through Socket.IO
  send(message: any): void {
    if (this.socket?.connected) {
      // Special handling for channel join to prevent duplicates
      if (message.type === "join:channel" && message.channelId) {
        // Check if we've already joined this channel
        if (this.joinedChannels.has(message.channelId)) {
          console.log(
            `Already joined channel ${message.channelId}, skipping duplicate join`
          );
          return;
        }

        // Mark this channel as joined
        this.joinedChannels.add(message.channelId);
        console.log(`Marking channel ${message.channelId} as joined`);
      }

      // Special handling for channel leave
      if (message.type === "leave:channel" && message.channelId) {
        // Remove from joined channels
        this.joinedChannels.delete(message.channelId);
        console.log(`Marking channel ${message.channelId} as left`);
      }

      console.log("Sending message:", message);
      if (message.type) {
        // If message has a type, use it as the event name
        this.socket.emit(message.type, message);
      } else {
        // Default to 'message' event
        this.socket.emit("message", message);
      }
    } else {
      console.error("Socket.IO not connected. Cannot send message:", message);
    }
  }

  // Subscribe to a specific event type
  subscribe(eventType: string, callback: MessageCallback): () => void {
    if (!this.messageCallbacks.has(eventType)) {
      this.messageCallbacks.set(eventType, new Set());
    }

    this.messageCallbacks.get(eventType)?.add(callback);

    // If we have an active socket, also subscribe to the event directly
    if (this.socket) {
      this.socket.on(eventType, (data) => {
        this.handleMessage({ type: eventType, ...data });
      });
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.messageCallbacks.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.messageCallbacks.delete(eventType);
          // Also unsubscribe from the socket event
          if (this.socket) {
            this.socket.off(eventType);
          }
        }
      }
    };
  }

  // Subscribe to connection status changes
  subscribeToStatus(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // Handle incoming messages
  private handleMessage(data: any): void {
    const eventType = data.type || "unknown";

    // Notify all callbacks for this event type
    const callbacks = this.messageCallbacks.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} callback:`, error);
        }
      });
    }

    // Also notify 'all' subscribers
    const allCallbacks = this.messageCallbacks.get("all");
    if (allCallbacks) {
      allCallbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in "all" callback:', error);
        }
      });
    }
  }

  // Notify status change
  private notifyStatusChange(
    status: "connected" | "disconnected" | "error"
  ): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in status callback:", error);
      }
    });
  }

  // Check if Socket.IO is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService();

export default webSocketService;
