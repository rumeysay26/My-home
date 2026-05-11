"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function handleLogin(data: LoginForm) {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setIsLoading(false);
  }

  async function handleRegister(data: RegisterForm) {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { name: data.name } },
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-accent/20 via-muted to-accent/5 items-center justify-center p-12">
        <div>
          <Link href="/" className="text-2xl font-bold text-primary block mb-8">
            HomeDesign
          </Link>
          <h2 className="text-4xl font-bold text-primary mb-4 leading-snug">
            Plan your perfect space in 3D
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Upload furniture, set your room dimensions, and visualize your dream
            home — all in your browser.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3">
            {["Kitchen", "Living Room", "Bedroom", "3D Preview"].map((tag) => (
              <div
                key={tag}
                className="bg-white/70 rounded-xl px-4 py-3 text-sm font-medium text-primary shadow-card"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="text-lg font-bold text-primary lg:hidden block mb-8">
            HomeDesign
          </Link>

          {/* Tabs */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => { setTab("login"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-white text-primary shadow-card"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => { setTab("register"); setError(null); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === "register"
                  ? "bg-white text-primary shadow-card"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Create account
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-input mb-6">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  {...loginForm.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    {...loginForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign in
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
              <div>
                <label className="label">Full name</label>
                <input
                  {...registerForm.register("name")}
                  placeholder="Jane Doe"
                  className="input"
                />
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  {...registerForm.register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    {...registerForm.register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input
                  {...registerForm.register("confirmPassword")}
                  type="password"
                  placeholder="Repeat password"
                  className="input"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <button type="submit" disabled={isLoading} className="btn-accent w-full py-3 flex items-center justify-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
