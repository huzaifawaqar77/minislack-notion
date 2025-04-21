import { db } from "../db/database";
import crypto from "crypto";
import { getWorkspaceRole } from "./workspaceRepository";
import { getOrganizationById } from "./organizationRepository";
import { sendInvitationEmail } from "../services/emailService";
import { OrganizationBranding } from "../services/emailService";

/**
 * Interface for invitation creation
 */
export interface CreateInvitationInput {
  email: string;
  workspaceId: string;
  inviterId: string;
  role?: string;
  message?: string;
}

/**
 * Creates a new invitation
 * 
 * @param input - Invitation creation input
 * @returns The created invitation
 */
export async function createInvitation(input: CreateInvitationInput) {
  // Check if inviter has permission to invite users
  const inviterRole = await getWorkspaceRole(input.workspaceId, input.inviterId);
  
  if (!inviterRole || (inviterRole !== "admin" && inviterRole !== "owner")) {
    throw new Error("You don't have permission to invite users to this workspace");
  }
  
  // Check if invitation already exists
  const existingInvitation = await db
    .selectFrom("workspace_invitations")
    .select(["id", "status"])
    .where("email", "=", input.email)
    .where("workspace_id", "=", input.workspaceId)
    .where("status", "=", "pending")
    .executeTakeFirst();
  
  if (existingInvitation) {
    throw new Error("An invitation has already been sent to this email");
  }
  
  // Generate a token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Calculate expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Create the invitation
  const invitation = await db
    .insertInto("workspace_invitations")
    .values({
      id: crypto.randomUUID(),
      email: input.email,
      workspace_id: input.workspaceId,
      invited_by: input.inviterId,
      role: input.role || "member",
      token,
      status: "pending",
      message: input.message || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  
  // Get workspace details
  const workspace = await db
    .selectFrom("workspaces")
    .select(["id", "name", "organization_id"])
    .where("id", "=", input.workspaceId)
    .executeTakeFirst();
  
  // Get inviter details
  const inviter = await db
    .selectFrom("users")
    .select(["id", "email", "username", "first_name", "last_name"])
    .where("id", "=", input.inviterId)
    .executeTakeFirst();
  
  // Get organization details if available
  let branding: OrganizationBranding | undefined;
  
  if (workspace?.organization_id) {
    const organization = await getOrganizationById(workspace.organization_id);
    
    if (organization) {
      branding = {
        name: organization.name,
        logoUrl: organization.logo_url || undefined,
        primaryColor: organization.primary_color || undefined,
        secondaryColor: organization.secondary_color || undefined,
      };
    }
  }
  
  // Send invitation email
  try {
    await sendInvitationEmail(
      input.email,
      inviter?.first_name || inviter?.username || "Someone",
      workspace?.name || "a workspace",
      token,
      input.message,
      branding
    );
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // Continue even if email sending fails
  }
  
  return invitation;
}

/**
 * Gets an invitation by token
 * 
 * @param token - The invitation token
 * @returns The invitation or null if not found
 */
export async function getInvitationByToken(token: string) {
  return db
    .selectFrom("workspace_invitations")
    .innerJoin("workspaces", "workspaces.id", "workspace_invitations.workspace_id")
    .innerJoin("users", "users.id", "workspace_invitations.invited_by")
    .select([
      "workspace_invitations.id",
      "workspace_invitations.email",
      "workspace_invitations.workspace_id",
      "workspace_invitations.invited_by",
      "workspace_invitations.role",
      "workspace_invitations.status",
      "workspace_invitations.created_at",
      "workspace_invitations.expires_at",
      "workspaces.name as workspace_name",
      "workspaces.organization_id",
      "users.username as inviter_username",
      "users.first_name as inviter_first_name",
      "users.last_name as inviter_last_name",
    ])
    .where("workspace_invitations.token", "=", token)
    .executeTakeFirst();
}

/**
 * Gets all invitations for a workspace
 * 
 * @param workspaceId - The ID of the workspace
 * @returns Array of invitations
 */
export async function getWorkspaceInvitations(workspaceId: string) {
  return db
    .selectFrom("workspace_invitations")
    .innerJoin("users", "users.id", "workspace_invitations.invited_by")
    .select([
      "workspace_invitations.id",
      "workspace_invitations.email",
      "workspace_invitations.role",
      "workspace_invitations.status",
      "workspace_invitations.created_at",
      "workspace_invitations.expires_at",
      "users.username as inviter_username",
      "users.first_name as inviter_first_name",
      "users.last_name as inviter_last_name",
    ])
    .where("workspace_invitations.workspace_id", "=", workspaceId)
    .orderBy("workspace_invitations.created_at", "desc")
    .execute();
}

/**
 * Gets all invitations for a user by email
 * 
 * @param email - The email of the user
 * @returns Array of invitations
 */
export async function getUserInvitations(email: string) {
  return db
    .selectFrom("workspace_invitations")
    .innerJoin("workspaces", "workspaces.id", "workspace_invitations.workspace_id")
    .innerJoin("users", "users.id", "workspace_invitations.invited_by")
    .select([
      "workspace_invitations.id",
      "workspace_invitations.workspace_id",
      "workspace_invitations.role",
      "workspace_invitations.status",
      "workspace_invitations.created_at",
      "workspace_invitations.expires_at",
      "workspaces.name as workspace_name",
      "users.username as inviter_username",
      "users.first_name as inviter_first_name",
      "users.last_name as inviter_last_name",
    ])
    .where("workspace_invitations.email", "=", email)
    .where("workspace_invitations.status", "=", "pending")
    .where("workspace_invitations.expires_at", ">", new Date().toISOString())
    .orderBy("workspace_invitations.created_at", "desc")
    .execute();
}

/**
 * Accepts an invitation
 * 
 * @param token - The invitation token
 * @param userId - The ID of the user accepting the invitation
 * @returns The workspace ID
 */
export async function acceptInvitation(token: string, userId: string) {
  // Get the invitation
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }
  
  if (invitation.status !== "pending") {
    throw new Error("This invitation has already been used");
  }
  
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error("This invitation has expired");
  }
  
  // Get user email
  const user = await db
    .selectFrom("users")
    .select(["email"])
    .where("id", "=", userId)
    .executeTakeFirst();
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check if email matches
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("This invitation was sent to a different email address");
  }
  
  // Check if user is already a member of the workspace
  const existingMember = await db
    .selectFrom("workspace_members")
    .select(["id"])
    .where("workspace_id", "=", invitation.workspace_id)
    .where("user_id", "=", userId)
    .executeTakeFirst();
  
  if (existingMember) {
    // Update invitation status
    await db
      .updateTable("workspace_invitations")
      .set({
        status: "accepted",
        updated_at: new Date().toISOString(),
      })
      .where("token", "=", token)
      .execute();
    
    return invitation.workspace_id;
  }
  
  // Add user to workspace
  await db
    .insertInto("workspace_members")
    .values({
      id: crypto.randomUUID(),
      workspace_id: invitation.workspace_id,
      user_id: userId,
      role: invitation.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .execute();
  
  // Update invitation status
  await db
    .updateTable("workspace_invitations")
    .set({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .where("token", "=", token)
    .execute();
  
  return invitation.workspace_id;
}

/**
 * Declines an invitation
 * 
 * @param token - The invitation token
 * @param userId - The ID of the user declining the invitation
 * @returns True if successful
 */
export async function declineInvitation(token: string, userId: string) {
  // Get the invitation
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }
  
  if (invitation.status !== "pending") {
    throw new Error("This invitation has already been used");
  }
  
  // Get user email
  const user = await db
    .selectFrom("users")
    .select(["email"])
    .where("id", "=", userId)
    .executeTakeFirst();
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check if email matches
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    throw new Error("This invitation was sent to a different email address");
  }
  
  // Update invitation status
  await db
    .updateTable("workspace_invitations")
    .set({
      status: "declined",
      updated_at: new Date().toISOString(),
    })
    .where("token", "=", token)
    .execute();
  
  return true;
}

/**
 * Cancels an invitation
 * 
 * @param invitationId - The ID of the invitation
 * @param userId - The ID of the user cancelling the invitation
 * @returns True if successful
 */
export async function cancelInvitation(invitationId: string, userId: string) {
  // Get the invitation
  const invitation = await db
    .selectFrom("workspace_invitations")
    .select(["workspace_id", "status"])
    .where("id", "=", invitationId)
    .executeTakeFirst();
  
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  
  if (invitation.status !== "pending") {
    throw new Error("This invitation has already been used");
  }
  
  // Check if user has permission to cancel
  const userRole = await getWorkspaceRole(invitation.workspace_id, userId);
  
  if (!userRole || (userRole !== "admin" && userRole !== "owner")) {
    throw new Error("You don't have permission to cancel this invitation");
  }
  
  // Update invitation status
  await db
    .updateTable("workspace_invitations")
    .set({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .where("id", "=", invitationId)
    .execute();
  
  return true;
}

/**
 * Resends an invitation
 * 
 * @param invitationId - The ID of the invitation
 * @param userId - The ID of the user resending the invitation
 * @returns The updated invitation
 */
export async function resendInvitation(invitationId: string, userId: string) {
  // Get the invitation
  const invitation = await db
    .selectFrom("workspace_invitations")
    .select(["id", "email", "workspace_id", "token", "message", "status"])
    .where("id", "=", invitationId)
    .executeTakeFirst();
  
  if (!invitation) {
    throw new Error("Invitation not found");
  }
  
  if (invitation.status !== "pending") {
    throw new Error("This invitation has already been used");
  }
  
  // Check if user has permission to resend
  const userRole = await getWorkspaceRole(invitation.workspace_id, userId);
  
  if (!userRole || (userRole !== "admin" && userRole !== "owner")) {
    throw new Error("You don't have permission to resend this invitation");
  }
  
  // Get workspace details
  const workspace = await db
    .selectFrom("workspaces")
    .select(["id", "name", "organization_id"])
    .where("id", "=", invitation.workspace_id)
    .executeTakeFirst();
  
  // Get inviter details
  const inviter = await db
    .selectFrom("users")
    .select(["id", "email", "username", "first_name", "last_name"])
    .where("id", "=", userId)
    .executeTakeFirst();
  
  // Get organization details if available
  let branding: OrganizationBranding | undefined;
  
  if (workspace?.organization_id) {
    const organization = await getOrganizationById(workspace.organization_id);
    
    if (organization) {
      branding = {
        name: organization.name,
        logoUrl: organization.logo_url || undefined,
        primaryColor: organization.primary_color || undefined,
        secondaryColor: organization.secondary_color || undefined,
      };
    }
  }
  
  // Calculate new expiry date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Update invitation expiry
  const updatedInvitation = await db
    .updateTable("workspace_invitations")
    .set({
      updated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .where("id", "=", invitationId)
    .returningAll()
    .executeTakeFirstOrThrow();
  
  // Send invitation email
  try {
    await sendInvitationEmail(
      invitation.email,
      inviter?.first_name || inviter?.username || "Someone",
      workspace?.name || "a workspace",
      invitation.token,
      invitation.message || undefined,
      branding
    );
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    // Continue even if email sending fails
  }
  
  return updatedInvitation;
}
