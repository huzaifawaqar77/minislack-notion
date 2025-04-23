import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Users,
  Zap,
  Lock,
  BarChart,
  Globe,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { SplitText } from "@/components/ui/reactbits/split-text";
import { FeatureCard } from "@/components/ui/aceternity/feature-card";
import { TestimonialCard } from "@/components/ui/aceternity/testimonial-card";
import { PricingCard } from "@/components/ui/aceternity/pricing-card";
import { AnimatedGradient } from "@/components/ui/aceternity/animated-gradient";
import { MacBook } from "@/components/ui/aceternity/3d-macbook";

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
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-zinc-950 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="text-amber-500 dark:text-amber-400 block mb-2">
                  Modern Communication
                </span>
                <span>Platform for Teams</span>
              </h1>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 mt-4">
                Stay connected, organized, and productive with MinSlack. The
                all-in-one platform for team collaboration.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
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

            {/* Right side - MacBook */}
            <div className="flex items-center justify-center">
              <div className="w-full h-[400px] md:h-[450px] lg:h-[500px]">
                <MacBook
                  screenshotUrl="/dashboard-preview.png"
                  altText="MinSlack Dashboard"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/30"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
              Features
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                <SplitText animation="slide-in" splitBy="words">
                  Powerful Features for Modern Teams
                </SplitText>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Everything you need to keep your team connected and productive
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <FeatureCard
              title="Real-time Messaging"
              description="Instant messaging with read receipts, reactions, and threaded conversations."
              icon={<MessageSquare className="h-6 w-6" />}
            />
            <FeatureCard
              title="Team Workspaces"
              description="Organize your team into workspaces with customizable permissions and channels."
              icon={<Users className="h-6 w-6" />}
            />
            <FeatureCard
              title="Advanced Security"
              description="Enterprise-grade security with end-to-end encryption and compliance controls."
              icon={<Lock className="h-6 w-6" />}
            />
            <FeatureCard
              title="Powerful Integrations"
              description="Connect with your favorite tools and services for a seamless workflow."
              icon={<Zap className="h-6 w-6" />}
            />
            <FeatureCard
              title="Analytics Dashboard"
              description="Gain insights into team communication patterns and productivity metrics."
              icon={<BarChart className="h-6 w-6" />}
            />
            <FeatureCard
              title="Global Accessibility"
              description="Access your workspace from anywhere with our mobile and desktop apps."
              icon={<Globe className="h-6 w-6" />}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="w-full py-12 md:py-24 lg:py-32 bg-background"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
              Testimonials
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                <SplitText animation="fade-up" splitBy="words">
                  What Our Customers Say
                </SplitText>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Join thousands of satisfied teams already using MinSlack
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <TestimonialCard
              quote="MinSlack has transformed how our team communicates. The interface is intuitive and the features are exactly what we needed."
              name="Sarah Johnson"
              title="CTO, TechNova"
            />
            <TestimonialCard
              quote="We've tried many collaboration tools, but MinSlack stands out with its seamless integrations and powerful workspace management."
              name="Michael Chen"
              title="Product Manager, Innovate Inc."
            />
            <TestimonialCard
              quote="The security features in MinSlack give us peace of mind while maintaining an excellent user experience. Highly recommended!"
              name="Jessica Williams"
              title="Security Director, SecureFlow"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/30"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
              Pricing
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                <SplitText animation="fade-up" splitBy="words">
                  Simple, Transparent Pricing
                </SplitText>
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                Choose the plan that's right for your team
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 mt-12">
            <PricingCard
              title="Free"
              price="$0"
              description="For small teams getting started"
              features={[
                { text: "Up to 10 users", included: true },
                { text: "5GB storage", included: true },
                { text: "Basic integrations", included: true },
                { text: "Community support", included: true },
                { text: "Advanced security", included: false },
              ]}
              buttonText="Get Started"
              buttonLink="/register"
            />
            <PricingCard
              title="Pro"
              price="$12"
              description="For growing teams"
              features={[
                { text: "Unlimited users", included: true },
                { text: "50GB storage", included: true },
                { text: "Advanced integrations", included: true },
                { text: "Priority support", included: true },
                { text: "Advanced security", included: true },
              ]}
              popular={true}
              buttonText="Get Started"
              buttonLink="/register"
            />
            <PricingCard
              title="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                { text: "Unlimited users", included: true },
                { text: "Unlimited storage", included: true },
                { text: "Custom integrations", included: true },
                { text: "Dedicated support", included: true },
                { text: "White labeling", included: true },
              ]}
              buttonText="Contact Sales"
              buttonLink="/contact"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        <AnimatedGradient>
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  <SplitText animation="fade-up" splitBy="words">
                    Ready to transform your team's communication?
                  </SplitText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
                  Join thousands of teams already using MinSlack to collaborate
                  better.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-8">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 group"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </AnimatedGradient>
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
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#pricing"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    href="/security"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
                className="text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400"
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
