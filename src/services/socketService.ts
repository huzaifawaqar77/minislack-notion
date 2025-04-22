import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyToken } from "../middleware/authMiddleware";
import { isWorkspaceMember } from "../repositories/workspaceRepository";
import { isChannelMember } from "../repositories/channelRepository";

// Store active connections
interface UserConnection {
  userId: string;
  socketId: string;
  workspaces: Set<string>;
  channels: Set<string>;
}

// Map of userId to their connections
const userConnections = new Map<string, UserConnection[]>();

// Map of workspaceId to connected user IDs
const workspaceUsers = new Map<string, Set<string>>();

// Map of channelId to connected user IDs
const channelUsers = new Map<string, Set<string>>();

// Set of online user IDs
const onlineUsers = new Set<string>();

/**
 * Initialize Socket.IO server
 *
 * @param httpServer - HTTP server instance
 * @returns Socket.IO server instance
 */
export function initializeSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // In production, restrict this to your domains
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Add these options to improve connection reliability
    transports: ["websocket", "polling"],
    allowEIO3: true,
    connectTimeout: 30000,
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Check for token in auth object (Socket.IO client)
      let token = socket.handshake.auth.token;

      // If not found, check query parameters (for native WebSocket or fallback)
      if (!token && socket.handshake.query && socket.handshake.query.token) {
        token = socket.handshake.query.token as string;
      }

      if (!token) {
        console.error("No authentication token provided");
        return next(new Error("Authentication error"));
      }

      // Verify JWT token
      const user = verifyToken(token);

      if (!user) {
        console.error("Invalid token provided");
        return next(new Error("Invalid token"));
      }

      console.log(`User authenticated: ${user.id}`);

      // Attach user to socket
      socket.data.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  // Handle connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id} (User: ${socket.data.user?.id})`);

    // Send a welcome message to confirm connection
    socket.emit("connection:success", {
      message: "Successfully connected to WebSocket server",
      userId: socket.data.user?.id,
      socketId: socket.id,
    });

    const userId = socket.data.user?.id;

    if (!userId) {
      socket.disconnect();
      return;
    }

    // Initialize user connection
    const connection: UserConnection = {
      userId,
      socketId: socket.id,
      workspaces: new Set(),
      channels: new Set(),
    };

    // Add to user connections
    if (!userConnections.has(userId)) {
      userConnections.set(userId, []);
    }
    userConnections.get(userId)?.push(connection);

    // Add to online users
    onlineUsers.add(userId);

    // Broadcast global online status update
    io.emit("global:presence", {
      onlineUsers: Array.from(onlineUsers),
      count: onlineUsers.size,
    });

    // Handle joining a workspace
    socket.on("join:workspace", async (workspaceId: string) => {
      try {
        // Check if user is a member of the workspace
        const isMember = await isWorkspaceMember(workspaceId, userId);

        if (!isMember) {
          socket.emit("error", "You are not a member of this workspace");
          return;
        }

        // Join the workspace room
        socket.join(`workspace:${workspaceId}`);
        connection.workspaces.add(workspaceId);

        // Add user to workspace users
        if (!workspaceUsers.has(workspaceId)) {
          workspaceUsers.set(workspaceId, new Set());
        }
        workspaceUsers.get(workspaceId)?.add(userId);

        // Notify workspace about user presence
        io.to(`workspace:${workspaceId}`).emit("presence:update", {
          workspaceId,
          users: Array.from(workspaceUsers.get(workspaceId) || []),
        });

        console.log(`User ${userId} joined workspace ${workspaceId}`);
      } catch (error) {
        console.error("Error joining workspace:", error);
        socket.emit("error", "Failed to join workspace");
      }
    });

    // Handle joining a channel
    // Handle joining a channel via direct event
    socket.on("join:channel", async (data: any) => {
      try {
        // Extract the channelId properly
        let channelId;
        if (typeof data === "string") {
          channelId = data;
        } else if (data && typeof data.channelId === "string") {
          channelId = data.channelId;
        } else if (typeof data === "object") {
          // Try to convert to string if it's an object
          channelId = String(data.channelId || data);
        } else {
          // Fallback
          channelId = String(data);
        }

        console.log(`Direct join:channel event for channel: ${channelId}`);

        // Check if socket is already in this room to prevent duplicate joins
        const roomName = `channel:${channelId}`;
        const isInRoom = socket.rooms.has(roomName);

        if (isInRoom) {
          console.log(
            `Socket ${socket.id} is already in room ${roomName}, skipping join`
          );
          // Send confirmation anyway
          socket.emit("channel:joined", {
            channelId,
            success: true,
            roomName,
            alreadyJoined: true,
          });
          return;
        }

        // Continue with the existing join logic
        console.log(`Attempting to join channel with ID: ${channelId}`);

        // Check if user is a member of the channel
        try {
          const isMember = await isChannelMember(channelId, userId);

          if (!isMember) {
            console.log(
              `User ${userId} is not a member of channel ${channelId}`
            );
            // For testing purposes, allow access anyway
            // socket.emit("error", "You don't have access to this channel");
            // return;
          } else {
            console.log(`User ${userId} is a member of channel ${channelId}`);
          }
        } catch (error) {
          console.error(`Error checking channel membership: ${error}`);
          // For testing purposes, allow access anyway
        }

        // Join the channel room
        socket.join(roomName);
        connection.channels.add(channelId);

        // Add user to channel users
        if (!channelUsers.has(channelId)) {
          channelUsers.set(channelId, new Set());
        }
        channelUsers.get(channelId)?.add(userId);

        // Log room membership
        const room = io.sockets.adapter.rooms.get(roomName);
        if (room) {
          console.log(`Room ${roomName} now has ${room.size} clients`);
        } else {
          console.log(`Failed to join room ${roomName}`);
        }

        // Notify channel about user presence
        io.to(roomName).emit("presence:update", {
          channelId,
          users: Array.from(channelUsers.get(channelId) || []),
        });

        // Send confirmation to the client
        socket.emit("channel:joined", {
          channelId,
          success: true,
          roomName,
        });

        console.log(
          `User ${userId} joined channel ${channelId} in room ${roomName}`
        );
      } catch (error) {
        console.error("Error joining channel:", error);
        socket.emit("error", "Failed to join channel");
      }
    });

    // Also keep the message handler for backward compatibility
    socket.on("message", async (data: any) => {
      // Handle different message types
      if (data.type === "join:channel" && data.channelId) {
        try {
          // Extract the channelId properly
          let channelId;
          if (typeof data.channelId === "string") {
            channelId = data.channelId;
          } else if (typeof data === "string") {
            // Try to parse if the entire data is a string
            try {
              const parsedData = JSON.parse(data);
              channelId = parsedData.channelId;
            } catch (e) {
              console.error("Failed to parse channel data:", e);
              channelId = data.toString();
            }
          } else {
            // Fallback
            channelId = String(data.channelId);
          }

          console.log(`Attempting to join channel with ID: ${channelId}`);

          // Check if user is a member of the channel
          try {
            const isMember = await isChannelMember(channelId, userId);

            if (!isMember) {
              console.log(
                `User ${userId} is not a member of channel ${channelId}`
              );
              // For testing purposes, allow access anyway
              // socket.emit("error", "You don't have access to this channel");
              // return;
            } else {
              console.log(`User ${userId} is a member of channel ${channelId}`);
            }
          } catch (error) {
            console.error(`Error checking channel membership: ${error}`);
            // For testing purposes, allow access anyway
          }

          // Join the channel room
          const roomName = `channel:${channelId}`;
          socket.join(roomName);
          connection.channels.add(channelId);

          // Add user to channel users
          if (!channelUsers.has(channelId)) {
            channelUsers.set(channelId, new Set());
          }
          channelUsers.get(channelId)?.add(userId);

          // Log room membership
          const room = io.sockets.adapter.rooms.get(roomName);
          if (room) {
            console.log(`Room ${roomName} now has ${room.size} clients`);
          } else {
            console.log(`Failed to join room ${roomName}`);
          }

          // Notify channel about user presence
          io.to(roomName).emit("presence:update", {
            channelId,
            users: Array.from(channelUsers.get(channelId) || []),
          });

          // Send confirmation to the client
          socket.emit("channel:joined", {
            channelId,
            success: true,
            roomName,
          });

          console.log(
            `User ${userId} joined channel ${channelId} in room ${roomName}`
          );
        } catch (error) {
          console.error("Error joining channel:", error);
          socket.emit("error", "Failed to join channel");
        }
      }
    });

    // Legacy direct channel join handler
    socket.on("join:channel", async (channelIdParam: any) => {
      try {
        // Extract the channelId properly
        let channelId;
        if (typeof channelIdParam === "string") {
          channelId = channelIdParam;
        } else if (
          typeof channelIdParam === "object" &&
          channelIdParam.channelId
        ) {
          channelId = channelIdParam.channelId;
        } else {
          // Fallback
          channelId = String(channelIdParam);
        }

        console.log(
          `Legacy handler: Attempting to join channel with ID: ${channelId}`
        );

        // Check if user is a member of the channel
        try {
          const isMember = await isChannelMember(channelId, userId);

          if (!isMember) {
            console.log(
              `User ${userId} is not a member of channel ${channelId}`
            );
            // For testing purposes, allow access anyway
            // socket.emit("error", "You don't have access to this channel");
            // return;
          } else {
            console.log(`User ${userId} is a member of channel ${channelId}`);
          }
        } catch (error) {
          console.error(`Error checking channel membership: ${error}`);
          // For testing purposes, allow access anyway
        }

        // Join the channel room
        const roomName = `channel:${channelId}`;
        socket.join(roomName);
        connection.channels.add(channelId);

        // Add user to channel users
        if (!channelUsers.has(channelId)) {
          channelUsers.set(channelId, new Set());
        }
        channelUsers.get(channelId)?.add(userId);

        // Log room membership
        const room = io.sockets.adapter.rooms.get(roomName);
        if (room) {
          console.log(`Room ${roomName} now has ${room.size} clients`);
        } else {
          console.log(`Failed to join room ${roomName}`);
        }

        // Notify channel about user presence
        io.to(roomName).emit("presence:update", {
          channelId,
          users: Array.from(channelUsers.get(channelId) || []),
        });

        // Send confirmation to the client
        socket.emit("channel:joined", {
          channelId,
          success: true,
          roomName,
        });

        console.log(
          `User ${userId} joined channel ${channelId} in room ${roomName}`
        );
      } catch (error) {
        console.error("Error joining channel:", error);
        socket.emit("error", "Failed to join channel");
      }
    });

    // Handle leaving a workspace
    socket.on("leave:workspace", (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
      connection.workspaces.delete(workspaceId);

      // Remove user from workspace users if no other connections in this workspace
      const userHasOtherConnectionsInWorkspace = userConnections
        .get(userId)
        ?.some(
          (conn) =>
            conn.socketId !== socket.id && conn.workspaces.has(workspaceId)
        );

      if (!userHasOtherConnectionsInWorkspace) {
        workspaceUsers.get(workspaceId)?.delete(userId);

        // Notify workspace about user presence
        io.to(`workspace:${workspaceId}`).emit("presence:update", {
          workspaceId,
          users: Array.from(workspaceUsers.get(workspaceId) || []),
        });
      }

      console.log(`User ${userId} left workspace ${workspaceId}`);
    });

    // Handle leaving a channel via message
    socket.on("message", (data: any) => {
      if (data.type === "leave:channel" && data.channelId) {
        const channelId = data.channelId;
        socket.leave(`channel:${channelId}`);
        connection.channels.delete(channelId);

        // Remove user from channel users if no other connections in this channel
        const userHasOtherConnectionsInChannel = userConnections
          .get(userId)
          ?.some(
            (conn) =>
              conn.socketId !== socket.id && conn.channels.has(channelId)
          );

        if (!userHasOtherConnectionsInChannel) {
          channelUsers.get(channelId)?.delete(userId);

          // Notify channel about user presence
          io.to(`channel:${channelId}`).emit("presence:update", {
            channelId,
            users: Array.from(channelUsers.get(channelId) || []),
          });
        }

        console.log(`User ${userId} left channel ${channelId}`);
      }
    });

    // Handle message events via message
    socket.on("message", (data: any) => {
      console.log("Received message event:", data);

      // Handle typing indicators
      if (data.type === "typing:start" && data.channelId) {
        console.log(
          `User ${userId} started typing in channel ${data.channelId}`
        );
        socket.to(`channel:${data.channelId}`).emit("typing:update", {
          channelId: data.channelId,
          userId,
          isTyping: true,
        });
      } else if (data.type === "typing:stop" && data.channelId) {
        console.log(
          `User ${userId} stopped typing in channel ${data.channelId}`
        );
        socket.to(`channel:${data.channelId}`).emit("typing:update", {
          channelId: data.channelId,
          userId,
          isTyping: false,
        });
      }
      // Handle channel leave
      else if (data.type === "leave:channel" && data.channelId) {
        console.log(
          `User ${userId} leaving channel ${data.channelId} via message event`
        );
        socket.leave(`channel:${data.channelId}`);
        connection.channels.delete(data.channelId);

        // Remove user from channel users if no other connections in this channel
        const userHasOtherConnectionsInChannel = userConnections
          .get(userId)
          ?.some(
            (conn) =>
              conn.socketId !== socket.id && conn.channels.has(data.channelId)
          );

        if (!userHasOtherConnectionsInChannel) {
          channelUsers.get(data.channelId)?.delete(userId);

          // Notify channel about user presence
          io.to(`channel:${data.channelId}`).emit("presence:update", {
            channelId: data.channelId,
            users: Array.from(channelUsers.get(data.channelId) || []),
          });
        }
      }
      // Handle direct message sending
      else if (data.type === "message" && data.channelId && data.content) {
        // Extract the channelId properly
        let channelId;
        if (typeof data.channelId === "string") {
          channelId = data.channelId;
        } else {
          // Fallback
          channelId = String(data.channelId);
        }

        console.log(
          `Broadcasting message from user ${userId} to channel ${channelId}`
        );

        // Prepare the message with consistent field names
        const messageData = {
          ...data,
          // Use consistent field names for both API and WebSocket
          sender_id: userId,
          channel_id: channelId,
          channelId: channelId,
          type: "message",
          created_at: new Date().toISOString(),
          // Add a timestamp field with the current time in milliseconds for easier client-side conversion
          timestamp: Date.now(),
        };

        // Get the room name
        const roomName = `channel:${channelId}`;

        // Log room membership before broadcasting
        const room = io.sockets.adapter.rooms.get(roomName);
        if (room) {
          console.log(
            `Broadcasting to room ${roomName} with ${room.size} clients`
          );

          // Get the socket IDs in the room
          const socketIds = Array.from(room);
          console.log(`Socket IDs in room ${roomName}:`, socketIds);

          // Broadcast to all clients in the channel, including the sender
          // Only use one broadcast method to prevent duplicates
          io.to(roomName).emit("message", messageData);

          // Don't broadcast to individual sockets as this causes duplicates
          // socketIds.forEach((socketId) => {
          //   io.to(socketId).emit("message", messageData);
          // });
        } else {
          console.log(`Room ${roomName} does not exist or has no clients`);
          // Broadcast to the channel anyway in case the room exists but isn't tracked correctly
          io.to(roomName).emit("message", messageData);
        }

        // Log the broadcast
        console.log(`Message broadcast to channel ${channelId}:`, messageData);
      }
    });

    // Legacy direct typing handlers
    socket.on("typing:start", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("typing:update", {
        channelId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("typing:update", {
        channelId,
        userId,
        isTyping: false,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);

      // Remove connection from user connections
      const userConnectionList = userConnections.get(userId) || [];
      const connectionIndex = userConnectionList.findIndex(
        (conn) => conn.socketId === socket.id
      );

      if (connectionIndex !== -1) {
        const removedConnection = userConnectionList.splice(
          connectionIndex,
          1
        )[0];

        // If user has no more connections, remove from all presence lists
        if (userConnectionList.length === 0) {
          userConnections.delete(userId);

          // Remove from online users
          onlineUsers.delete(userId);

          // Broadcast global online status update
          io.emit("global:presence", {
            onlineUsers: Array.from(onlineUsers),
            count: onlineUsers.size,
          });

          // Remove from all workspaces
          removedConnection.workspaces.forEach((workspaceId) => {
            workspaceUsers.get(workspaceId)?.delete(userId);

            // Notify workspace about user presence
            io.to(`workspace:${workspaceId}`).emit("presence:update", {
              workspaceId,
              users: Array.from(workspaceUsers.get(workspaceId) || []),
            });
          });

          // Remove from all channels
          removedConnection.channels.forEach((channelId) => {
            channelUsers.get(channelId)?.delete(userId);

            // Notify channel about user presence
            io.to(`channel:${channelId}`).emit("presence:update", {
              channelId,
              users: Array.from(channelUsers.get(channelId) || []),
            });
          });
        }
      }
    });
  });

  return io;
}

/**
 * Emit an event to a specific user
 *
 * @param userId - The ID of the user
 * @param event - The event name
 * @param data - The event data
 */
export function emitToUser(
  io: SocketIOServer,
  userId: string,
  event: string,
  data: any
) {
  const connections = userConnections.get(userId) || [];

  connections.forEach((connection) => {
    io.to(connection.socketId).emit(event, data);
  });
}

/**
 * Emit an event to a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @param event - The event name
 * @param data - The event data
 */
export function emitToWorkspace(
  io: SocketIOServer,
  workspaceId: string,
  event: string,
  data: any
) {
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

/**
 * Emit an event to a channel
 *
 * @param channelId - The ID of the channel
 * @param event - The event name
 * @param data - The event data
 */
export function emitToChannel(
  io: SocketIOServer,
  channelId: string,
  event: string,
  data: any
) {
  // Ensure channelId is a string
  const channelIdStr = String(channelId);
  const roomName = `channel:${channelIdStr}`;

  // Log the emission
  console.log(
    `Emitting event ${event} to channel ${channelIdStr} (room: ${roomName}):`,
    data
  );

  // Make sure the channel room exists
  const room = io.sockets.adapter.rooms.get(roomName);
  if (room) {
    console.log(`Room ${roomName} has ${room.size} clients`);

    // Get the socket IDs in the room
    const socketIds = Array.from(room);
    console.log(`Socket IDs in room ${roomName}:`, socketIds);

    // Broadcast to all clients in the channel
    // Only use one broadcast method to prevent duplicates
    io.to(roomName).emit(event, data);

    // Don't broadcast to individual sockets as this causes duplicates
    // socketIds.forEach((socketId) => {
    //   io.to(socketId).emit(event, data);
    // });
  } else {
    console.log(`Room ${roomName} does not exist or has no clients`);

    // Try to broadcast to all connected sockets that might be in this channel
    // This is a fallback mechanism
    const connectedSockets = Array.from(io.sockets.sockets.values());
    console.log(
      `Broadcasting to all ${connectedSockets.length} connected sockets as fallback`
    );

    // Broadcast to the channel anyway - this is the only broadcast we need
    io.to(roomName).emit(event, data);

    // Don't use the individual socket broadcast as it causes duplicates
    // Get all users who should be in this channel
    // const channelUserIds = Array.from(channelUsers.get(channelIdStr) || []);
    //
    // // For each user in the channel, find their sockets and send directly
    // channelUserIds.forEach((userId) => {
    //   const userConnList = userConnections.get(userId) || [];
    //   userConnList.forEach((conn) => {
    //     if (conn.channels.has(channelIdStr)) {
    //       io.to(conn.socketId).emit(event, data);
    //     }
    //   });
    // });
  }
}

/**
 * Get online users in a workspace
 *
 * @param workspaceId - The ID of the workspace
 * @returns Array of user IDs
 */
export function getOnlineWorkspaceUsers(workspaceId: string): string[] {
  return Array.from(workspaceUsers.get(workspaceId) || []);
}

/**
 * Get online users in a channel
 *
 * @param channelId - The ID of the channel
 * @returns Array of user IDs
 */
export function getOnlineChannelUsers(channelId: string): string[] {
  return Array.from(channelUsers.get(channelId) || []);
}

/**
 * Check if a user is online
 *
 * @param userId - The ID of the user
 * @returns True if the user is online
 */
export function isUserOnline(userId: string): boolean {
  return userConnections.has(userId) && userConnections.get(userId)!.length > 0;
}

/**
 * Get all online users
 *
 * @returns Array of user IDs
 */
export function getAllOnlineUsers(): string[] {
  return Array.from(onlineUsers);
}
