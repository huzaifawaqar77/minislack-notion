import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    // Make sure the token is properly decoded
    const invitationToken = decodeURIComponent(params.id);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Declining invitation with token:", invitationToken);
    console.log("Using auth token:", token ? "[PRESENT]" : "[MISSING]");

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/invitations/${invitationToken}/decline`;
    console.log("API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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
    console.error("Error declining invitation:", error);
    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to decline invitation: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
