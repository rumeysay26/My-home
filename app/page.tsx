import Link from "next/link";
import { ArrowRight, Box, Layers, Users, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-bold text-primary tracking-tight">
            HomeDesign
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/suggestions"
              className="text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-2"
            >
              Explore
            </Link>
            <Link href="/login" className="btn-secondary text-sm px-4 py-2 rounded-button">
              Sign in
            </Link>
            <Link href="/login?tab=register" className="btn-primary text-sm px-4 py-2 rounded-button">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-dark text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Now with 3D room planning
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight mb-6 max-w-3xl mx-auto">
          Design your home,{" "}
          <span className="text-accent-dark">room by room</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Enter your room dimensions, upload furniture, and see everything come
          together in a 3D preview. Share ideas with the community and get
          inspired.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?tab=register"
            className="btn-accent inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            Start designing <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/suggestions"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
          >
            Browse ideas
          </Link>
        </div>
      </section>

      {/* Preview image placeholder */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="aspect-[16/9] bg-gradient-to-br from-muted to-accent/10 rounded-2xl shadow-modal flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Box className="w-12 h-12 mx-auto mb-3 text-accent/50" />
            <p className="text-sm">3D Room Preview</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Everything you need to plan your space
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent-dark" />
              </div>
              <h3 className="font-semibold text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/50 border-y border-border/60 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-primary mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Ready to design your perfect room?
        </h2>
        <p className="text-muted-foreground mb-8">
          Free to use. No credit card required.
        </p>
        <Link
          href="/login?tab=register"
          className="btn-accent inline-flex items-center gap-2 px-8 py-3 text-base"
        >
          Create your first project <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          HomeDesign &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Box,
    title: "3D Room Visualization",
    description:
      "Enter your room dimensions and watch a real-scale 3D model appear. Place furniture and see exactly how it fits.",
  },
  {
    icon: Layers,
    title: "Furniture Upload",
    description:
      "Upload any furniture image. Enter its dimensions and it appears in the room at the correct scale — ready to drag and rotate.",
  },
  {
    icon: Users,
    title: "Community Suggestions",
    description:
      "Browse thousands of furniture ideas shared by others. Like, save, and add pieces directly to your room.",
  },
];

const steps = [
  { title: "Create a project", desc: "Name your home project and add rooms." },
  {
    title: "Enter dimensions",
    desc: "Set your room's exact width, length, and ceiling height.",
  },
  {
    title: "Upload furniture",
    desc: "Add photos with real measurements — they appear at scale in 3D.",
  },
  {
    title: "Design & share",
    desc: "Arrange everything, save your design, and share for feedback.",
  },
];
