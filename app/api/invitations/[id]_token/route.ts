import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Make sure the token is properly decoded
    const invitationToken = decodeURIComponent(params.id);
    console.log("API Route: Fetching invitation with token:", invitationToken);

    // Log the API URL for debugging
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/invitations/${invitationToken}`;
    console.log("API URL:", apiUrl);

    // This endpoint doesn't require authentication
    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache: 'no-store' to prevent caching issues
      cache: "no-store",
    });

    console.log("API Response status:", response.status);

    if (!response.ok) {
      console.error("API returned error status:", response.status);
      return NextResponse.json(
        {
          status: "error",
          message: `Backend API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to fetch invitation: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
