import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // This is a placeholder - in a real app, you'd need to fetch invitations from all workspaces
    // where the user is an admin or owner
    // For now, we'll return an empty array
    return NextResponse.json({
      status: "success",
      data: []
    });
  } catch (error) {
    console.error("Error fetching sent invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch sent invitations" },
      { status: 500 }
    );
  }
}
