import { db } from "../db/database";
import { createNotification } from "../repositories/notificationRepository";

async function createTestNotification() {
  try {
    // Get a user from the database
    const user = await db
      .selectFrom("users")
      .select(["id", "username", "first_name", "last_name"])
      .limit(1)
      .executeTakeFirst();

    if (!user) {
      console.error("No users found in the database");
      process.exit(1);
    }

    console.log(`Creating test notification for user: ${user.username}`);

    // Create a test notification
    const notification = await createNotification({
      userId: user.id,
      type: "system",
      title: "Test Notification",
      content: "This is a test notification to verify the notification system is working correctly.",
      actionUrl: "/dashboard?tab=notifications",
    });

    console.log("Test notification created successfully:", notification);
    process.exit(0);
  } catch (error) {
    console.error("Error creating test notification:", error);
    process.exit(1);
  }
}

createTestNotification();
