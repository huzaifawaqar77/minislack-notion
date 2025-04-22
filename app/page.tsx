import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">MinSlack</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/#testimonials"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900 dark:to-zinc-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-emerald-600 dark:text-emerald-500">
                  Modern Communication Platform for Teams
                </h1>
                <p className="max-w-[600px] text-zinc-700 dark:text-zinc-300 md:text-xl">
                  Stay connected, organized, and productive with MinSlack. The
                  all-in-one platform for team collaboration.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:h-[400px] lg:h-[500px] shadow-lg">
                <Image
                  src="/dashboard-preview.png"
                  alt="MinSlack Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-zinc-950"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-emerald-600 dark:text-emerald-500">
                Powerful Features
              </h2>
              <p className="max-w-[900px] text-zinc-700 dark:text-zinc-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to keep your team connected and productive
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <MessageSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Real-time Messaging</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Instant messaging with read receipts, reactions, and threaded
                conversations.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Team Workspaces</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Organize your team into workspaces with customizable permissions
                and channels.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold">Integrations</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Connect with your favorite tools and services for a seamless
                workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-emerald-600 dark:text-emerald-500">
                Simple, Transparent Pricing
              </h2>
              <p className="max-w-[900px] text-zinc-700 dark:text-zinc-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose the plan that's right for your team
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 mt-12">
            <div className="flex flex-col rounded-lg border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              <div className="p-6 bg-zinc-100 dark:bg-zinc-800">
                <h3 className="text-xl font-bold">Free</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  For small teams getting started
                </p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="ml-1 text-sm text-zinc-600 dark:text-zinc-400">
                    /month
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Up to 10 users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">5GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Basic integrations</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                POPULAR
              </div>
              <div className="p-6 bg-zinc-100 dark:bg-zinc-800">
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  For growing teams
                </p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold">$12</span>
                  <span className="ml-1 text-sm text-zinc-600 dark:text-zinc-400">
                    /user/month
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Unlimited users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">50GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Advanced integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex flex-col rounded-lg border bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
              <div className="p-6 bg-zinc-100 dark:bg-zinc-800">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  For large organizations
                </p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Unlimited users</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Unlimited storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                    <span className="text-sm">White labeling</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-emerald-600 dark:bg-emerald-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Ready to transform your team's communication?
              </h2>
              <p className="max-w-[900px] text-zinc-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of teams already using MinSlack to collaborate
                better.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-zinc-100"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-zinc-100 dark:bg-zinc-900">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#features"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#pricing"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2024 MinSlack. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
              <Link
                href="#"
                className="text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M12 2H2v10h10V2z"></path>
                  <path d="M12 12H2v10h10V12z"></path>
                  <path d="M22 2h-10v10h10V2z"></path>
                  <path d="M22 12h-10v10h10V12z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
