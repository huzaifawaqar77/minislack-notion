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
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { AuthStepsCard } from "@/components/ui/aceternity/auth-steps-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-center">
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
              <Button
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-zinc-950 border-b relative overflow-hidden">
        {/* Background Beams Effect */}
        <BackgroundBeams
          beamColor="#7c3aed" /* Purple-600 color */
          gridSize={12}
          beamCount={15}
          beamOpacity={0.6}
          beamLength={300}
          beamWidth={1.5}
          beamSpeed={0.007}
          className="z-0"
        />

        {/* Subtle overlay to improve text readability */}
        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 z-10"></div>

        <div className="container px-4 md:px-6 mx-auto relative z-20">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <div className="flex flex-col justify-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                <span className="gradient-text block mb-2 drop-shadow-sm">
                  Modern Communication
                </span>
                <span className="text-zinc-800 dark:text-zinc-100">
                  Platform for Teams
                </span>
              </h1>
              <p className="text-lg text-zinc-700 dark:text-zinc-300 mt-4 max-w-xl">
                Stay connected, organized, and productive with MinSlack. The
                all-in-one platform for team collaboration.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
                  >
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side - MacBook */}
            <div className="flex items-center justify-center">
              <div className="w-full h-[400px] md:h-[450px] lg:h-[500px] relative px-4 md:px-8">
                {/* Subtle glow effect behind the MacBook */}
                <div className="absolute inset-0 bg-accent/10 dark:bg-accent/15 blur-3xl rounded-full transform scale-90 translate-y-4"></div>

                <MacBook
                  screenshotUrl="/dashboard-preview.png"
                  altText="MinSlack Dashboard"
                  className="w-full h-full relative z-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 relative overflow-hidden flex items-center justify-center"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-5"></div>

        <div className="container px-4 md:px-6 relative z-10">
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

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-16">
            <FeatureCard
              title="Real-time Messaging"
              description="Instant messaging with read receipts, reactions, and threaded conversations."
              icon={<MessageSquare className="h-7 w-7" />}
              className="h-full"
            />
            <FeatureCard
              title="Team Workspaces"
              description="Organize your team into workspaces with customizable permissions and channels."
              icon={<Users className="h-7 w-7" />}
              className="h-full"
            />
            <FeatureCard
              title="Advanced Security"
              description="Enterprise-grade security with end-to-end encryption and compliance controls."
              icon={<Lock className="h-7 w-7" />}
              className="h-full"
            />
            <FeatureCard
              title="Powerful Integrations"
              description="Connect with your favorite tools and services for a seamless workflow."
              icon={<Zap className="h-7 w-7" />}
              className="h-full"
            />
            <FeatureCard
              title="Analytics Dashboard"
              description="Gain insights into team communication patterns and productivity metrics."
              icon={<BarChart className="h-7 w-7" />}
              className="h-full"
            />
            <FeatureCard
              title="Global Accessibility"
              description="Access your workspace from anywhere with our mobile and desktop apps."
              icon={<Globe className="h-7 w-7" />}
              className="h-full"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="w-full py-12 md:py-24 lg:py-32 bg-background flex items-center justify-center"
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
        className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 flex items-center justify-center"
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

      {/* Authentication Steps Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-zinc-950 border-b relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(#7c3aed_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-5"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 max-w-xl">
              <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
                Secure Authentication
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6">
                <SplitText animation="slide-in" splitBy="words">
                  Simple and Secure Setup
                </SplitText>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our authentication process is designed to be straightforward
                while maintaining the highest security standards. Follow these
                simple steps to get started with MinSlack.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 group"
                >
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="flex-1 flex justify-center">
              <AuthStepsCard
                title="Authentication steps"
                description="Follow these steps to secure your account:"
                steps={[
                  { text: "Enter your email address" },
                  { text: "Create a strong password" },
                  { text: "Set up two-factor authentication" },
                  { text: "Verify your identity" },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 md:py-24 lg:py-32 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-50/50 to-white/50 dark:from-zinc-900/50 dark:to-zinc-950/50 z-0"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#3f3f46_1px,transparent_1px)] opacity-25 z-0"></div>

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-4xl mx-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="inline-block px-4 py-1.5 mb-2 text-sm font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                  </span>
                  Limited time offer: 50% off for teams
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-zinc-800 dark:text-zinc-100">
                  <SplitText animation="fade-up" splitBy="words">
                    Ready to transform your team's communication?
                  </SplitText>
                </h2>

                <p className="max-w-[800px] mx-auto text-zinc-600 dark:text-zinc-300 text-lg md:text-xl/relaxed mt-4">
                  Join thousands of innovative teams already using MinSlack to
                  collaborate more effectively and drive productivity.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md mx-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-300 group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/demo" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
                  >
                    Book a Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-bold">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/#features"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#pricing"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent"
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
                className="text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent"
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
                className="text-zinc-600 dark:text-zinc-400 hover:text-accent dark:hover:text-accent"
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
