import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden md:flex flex-col bg-accent text-accent-foreground p-8 justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <span className="font-bold text-xl">MinSlack</span>
          </Link>

          <div className="mt-16">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Modern Communication Platform for Teams
            </h1>
            <p className="text-emerald-100 mb-8 text-lg">
              Stay connected, organized, and productive with MinSlack.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-emerald-500/20 p-5 rounded-lg border border-emerald-400/20 hover:bg-emerald-500/30 transition-colors">
                <h3 className="font-medium mb-2 text-white">
                  Real-time Messaging
                </h3>
                <p className="text-sm text-emerald-100">
                  Instant messaging with read receipts and reactions.
                </p>
              </div>
              <div className="bg-emerald-500/20 p-5 rounded-lg border border-emerald-400/20 hover:bg-emerald-500/30 transition-colors">
                <h3 className="font-medium mb-2 text-white">Team Workspaces</h3>
                <p className="text-sm text-emerald-100">
                  Organize your team with customizable channels.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-sm opacity-80">
            &copy; 2024 MinSlack. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex flex-col">
        <div className="container flex h-16 items-center justify-between py-4 md:justify-end">
          <Link href="/" className="flex items-center md:hidden">
            <div className="bg-accent rounded-full p-1">
              <MessageSquare className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-bold ml-2">MinSlack</span>
          </Link>
          <ThemeToggle />
        </div>
        <main className="flex-1 flex items-center justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
