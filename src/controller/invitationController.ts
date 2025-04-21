import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import * as invitationRepository from "../repositories/invitationRepository";

/**
 * Creates a new invitation
 */
export async function createInvitationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    const { email, role, message } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const invitation = await invitationRepository.createInvitation({
      email,
      workspaceId,
      inviterId: req.user.id,
      role,
      message
    });
    
    return res.status(201).json({
      status: "success",
      data: invitation
    });
  } catch (error: any) {
    console.error("Error creating invitation:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to create invitation"
    });
  }
}

/**
 * Gets all invitations for a workspace
 */
export async function getWorkspaceInvitationsController(req: AuthenticatedRequest, res: Response) {
  try {
    const { workspaceId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const invitations = await invitationRepository.getWorkspaceInvitations(workspaceId);
    
    return res.status(200).json({
      status: "success",
      data: invitations
    });
  } catch (error: any) {
    console.error("Error getting invitations:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get invitations"
    });
  }
}

/**
 * Gets all invitations for the current user
 */
export async function getUserInvitationsController(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    // Get user email
    const user = await req.db
      .selectFrom("users")
      .select(["email"])
      .where("id", "=", req.user.id)
      .executeTakeFirst();
    
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    
    const invitations = await invitationRepository.getUserInvitations(user.email);
    
    return res.status(200).json({
      status: "success",
      data: invitations
    });
  } catch (error: any) {
    console.error("Error getting user invitations:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get invitations"
    });
  }
}

/**
 * Gets an invitation by token
 */
export async function getInvitationByTokenController(req: AuthenticatedRequest, res: Response) {
  try {
    const { token } = req.params;
    
    const invitation = await invitationRepository.getInvitationByToken(token);
    
    if (!invitation) {
      return res.status(404).json({
        status: "error",
        message: "Invitation not found or expired"
      });
    }
    
    return res.status(200).json({
      status: "success",
      data: invitation
    });
  } catch (error: any) {
    console.error("Error getting invitation:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to get invitation"
    });
  }
}

/**
 * Accepts an invitation
 */
export async function acceptInvitationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { token } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const workspaceId = await invitationRepository.acceptInvitation(token, req.user.id);
    
    return res.status(200).json({
      status: "success",
      data: { workspaceId }
    });
  } catch (error: any) {
    console.error("Error accepting invitation:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to accept invitation"
    });
  }
}

/**
 * Declines an invitation
 */
export async function declineInvitationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { token } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await invitationRepository.declineInvitation(token, req.user.id);
    
    return res.status(200).json({
      status: "success",
      message: "Invitation declined successfully"
    });
  } catch (error: any) {
    console.error("Error declining invitation:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to decline invitation"
    });
  }
}

/**
 * Cancels an invitation
 */
export async function cancelInvitationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { invitationId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    await invitationRepository.cancelInvitation(invitationId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      message: "Invitation cancelled successfully"
    });
  } catch (error: any) {
    console.error("Error cancelling invitation:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to cancel invitation"
    });
  }
}

/**
 * Resends an invitation
 */
export async function resendInvitationController(req: AuthenticatedRequest, res: Response) {
  try {
    const { invitationId } = req.params;
    
    if (!req.user?.id) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    
    const invitation = await invitationRepository.resendInvitation(invitationId, req.user.id);
    
    return res.status(200).json({
      status: "success",
      data: invitation
    });
  } catch (error: any) {
    console.error("Error resending invitation:", error);
    return res.status(400).json({
      status: "error",
      message: error.message || "Failed to resend invitation"
    });
  }
}
