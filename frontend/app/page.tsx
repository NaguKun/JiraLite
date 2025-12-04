import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Users, BarChart3, Brain } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl text-foreground">Jira Lite</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
              <span className="text-balance">Powerful issue tracking with AI</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Manage projects, collaborate with your team, and get AI-powered insights. Built for teams that ship fast.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              View demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
            <div>
              <div className="font-bold text-2xl text-primary">100+</div>
              <p className="text-sm text-muted-foreground">Active teams</p>
            </div>
            <div>
              <div className="font-bold text-2xl text-primary">10K+</div>
              <p className="text-sm text-muted-foreground">Issues tracked</p>
            </div>
            <div>
              <div className="font-bold text-2xl text-primary">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
          <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg space-y-4">
            <div className="space-y-3">
              <div className="h-3 bg-secondary rounded w-2/3"></div>
              <div className="h-3 bg-secondary rounded w-1/2"></div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-6">
              <div className="h-12 bg-primary/20 rounded"></div>
              <div className="h-12 bg-accent/20 rounded"></div>
              <div className="h-12 bg-secondary/20 rounded"></div>
            </div>
            <div className="space-y-2 pt-4">
              <div className="h-2 bg-border rounded w-full"></div>
              <div className="h-2 bg-border rounded w-5/6"></div>
              <div className="h-2 bg-border rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-secondary/30 border-y border-border py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Everything your team needs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From issue tracking to AI-powered insights, Jira Lite has it all
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, label: "Fast", desc: "Lightning quick issue management" },
              { icon: Users, label: "Collaborative", desc: "Team-first design for working together" },
              { icon: Brain, label: "AI-Powered", desc: "Smart suggestions and automation" },
              { icon: BarChart3, label: "Insights", desc: "Track progress and analytics" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{feature.label}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
