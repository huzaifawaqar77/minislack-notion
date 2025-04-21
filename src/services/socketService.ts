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
      credentials: true
    }
  });
  
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication error"));
      }
      
      // Verify JWT token
      const user = verifyToken(token);
      
      if (!user) {
        return next(new Error("Invalid token"));
      }
      
      // Attach user to socket
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });
  
  // Handle connections
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    
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
      channels: new Set()
    };
    
    // Add to user connections
    if (!userConnections.has(userId)) {
      userConnections.set(userId, []);
    }
    userConnections.get(userId)?.push(connection);
    
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
          users: Array.from(workspaceUsers.get(workspaceId) || [])
        });
        
        console.log(`User ${userId} joined workspace ${workspaceId}`);
      } catch (error) {
        console.error("Error joining workspace:", error);
        socket.emit("error", "Failed to join workspace");
      }
    });
    
    // Handle joining a channel
    socket.on("join:channel", async (channelId: string) => {
      try {
        // Check if user is a member of the channel
        const isMember = await isChannelMember(channelId, userId);
        
        if (!isMember) {
          socket.emit("error", "You don't have access to this channel");
          return;
        }
        
        // Join the channel room
        socket.join(`channel:${channelId}`);
        connection.channels.add(channelId);
        
        // Add user to channel users
        if (!channelUsers.has(channelId)) {
          channelUsers.set(channelId, new Set());
        }
        channelUsers.get(channelId)?.add(userId);
        
        // Notify channel about user presence
        io.to(`channel:${channelId}`).emit("presence:update", {
          channelId,
          users: Array.from(channelUsers.get(channelId) || [])
        });
        
        console.log(`User ${userId} joined channel ${channelId}`);
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
      const userHasOtherConnectionsInWorkspace = userConnections.get(userId)?.some(
        conn => conn.socketId !== socket.id && conn.workspaces.has(workspaceId)
      );
      
      if (!userHasOtherConnectionsInWorkspace) {
        workspaceUsers.get(workspaceId)?.delete(userId);
        
        // Notify workspace about user presence
        io.to(`workspace:${workspaceId}`).emit("presence:update", {
          workspaceId,
          users: Array.from(workspaceUsers.get(workspaceId) || [])
        });
      }
      
      console.log(`User ${userId} left workspace ${workspaceId}`);
    });
    
    // Handle leaving a channel
    socket.on("leave:channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
      connection.channels.delete(channelId);
      
      // Remove user from channel users if no other connections in this channel
      const userHasOtherConnectionsInChannel = userConnections.get(userId)?.some(
        conn => conn.socketId !== socket.id && conn.channels.has(channelId)
      );
      
      if (!userHasOtherConnectionsInChannel) {
        channelUsers.get(channelId)?.delete(userId);
        
        // Notify channel about user presence
        io.to(`channel:${channelId}`).emit("presence:update", {
          channelId,
          users: Array.from(channelUsers.get(channelId) || [])
        });
      }
      
      console.log(`User ${userId} left channel ${channelId}`);
    });
    
    // Handle typing indicator
    socket.on("typing:start", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("typing:update", {
        channelId,
        userId,
        isTyping: true
      });
    });
    
    socket.on("typing:stop", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("typing:update", {
        channelId,
        userId,
        isTyping: false
      });
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      
      // Remove connection from user connections
      const userConnectionList = userConnections.get(userId) || [];
      const connectionIndex = userConnectionList.findIndex(conn => conn.socketId === socket.id);
      
      if (connectionIndex !== -1) {
        const removedConnection = userConnectionList.splice(connectionIndex, 1)[0];
        
        // If user has no more connections, remove from all presence lists
        if (userConnectionList.length === 0) {
          userConnections.delete(userId);
          
          // Remove from all workspaces
          removedConnection.workspaces.forEach(workspaceId => {
            workspaceUsers.get(workspaceId)?.delete(userId);
            
            // Notify workspace about user presence
            io.to(`workspace:${workspaceId}`).emit("presence:update", {
              workspaceId,
              users: Array.from(workspaceUsers.get(workspaceId) || [])
            });
          });
          
          // Remove from all channels
          removedConnection.channels.forEach(channelId => {
            channelUsers.get(channelId)?.delete(userId);
            
            // Notify channel about user presence
            io.to(`channel:${channelId}`).emit("presence:update", {
              channelId,
              users: Array.from(channelUsers.get(channelId) || [])
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
export function emitToUser(io: SocketIOServer, userId: string, event: string, data: any) {
  const connections = userConnections.get(userId) || [];
  
  connections.forEach(connection => {
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
export function emitToWorkspace(io: SocketIOServer, workspaceId: string, event: string, data: any) {
  io.to(`workspace:${workspaceId}`).emit(event, data);
}

/**
 * Emit an event to a channel
 * 
 * @param channelId - The ID of the channel
 * @param event - The event name
 * @param data - The event data
 */
export function emitToChannel(io: SocketIOServer, channelId: string, event: string, data: any) {
  io.to(`channel:${channelId}`).emit(event, data);
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
