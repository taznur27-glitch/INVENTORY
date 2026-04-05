import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Smartphone, User } from "lucide-react";

export default function Auth() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const guestEmail = import.meta.env.VITE_GUEST_EMAIL as string | undefined;
  const guestPassword = import.meta.env.VITE_GUEST_PASSWORD as string | undefined;

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const credentialCandidates: Array<{ email: string; password: string; source: string }> = [];

      if (email.trim() && password.trim()) {
        credentialCandidates.push({
          email: email.trim(),
          password: password.trim(),
          source: "form",
        });
      }

      if (guestEmail && guestPassword) {
        const hasSameCredentials = credentialCandidates.some(
          (candidate) => candidate.email === guestEmail && candidate.password === guestPassword
        );

        if (!hasSameCredentials) {
          credentialCandidates.push({
            email: guestEmail,
            password: guestPassword,
            source: "env",
          });
        }
      }

      for (const candidate of credentialCandidates) {
        const { error } = await supabase.auth.signInWithPassword({
          email: candidate.email,
          password: candidate.password,
        });

        if (!error) {
          toast.success(
            candidate.source === "form"
              ? "Logged in with provided guest credentials."
              : "Logged in with guest demo account."
          );
          return;
        }
      }

      const { error: anonymousError } = await supabase.auth.signInAnonymously();
      if (!anonymousError) {
        toast.success("Logged in as guest. Your data is temporary for this session.");
        return;
      }

      throw new Error(
        `${anonymousError.message}. Use a guest email/password in the form, or set VITE_GUEST_EMAIL and VITE_GUEST_PASSWORD.`
      );
    } catch (error: any) {
      toast.error(error.message || "Guest login failed. Check Supabase auth configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your email.");
        setMode('login');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Logged in successfully!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Smartphone className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">MobileShop Manager</CardTitle>
          <CardDescription>
            {mode === 'login' ? "Sign in to manage your shop" : mode === 'signup' ? "Create your account" : "Reset your password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : mode === 'login' ? "Sign In" : mode === 'signup' ? "Sign Up" : "Send Reset Link"}
            </Button>
          </form>

          {mode === 'login' && ( 
            <>
            <div className="mt-3 text-center">
                <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary underline-offset-4 hover:underline">
                  Forgot Password?
                </button>
              </div>

              <div className="mt-4">
                <Button type="button" variant="outline" className="w-full" onClick={handleGuestLogin} disabled={loading}>
                  <User className="mr-2 h-4 w-4" />
                  {loading ? "Please wait..." : "Continue as Guest"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Guest button tries filled email/password first, then env demo credentials, then anonymous auth.
                  </p>
              </div>
            </>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'login' ? "Don't have an account?" : mode === 'signup' ? "Already have an account?" : "Remember your password?"}{" "}
            <button type="button" onClick={() => setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup')} className="text-primary underline-offset-4 hover:underline">
              {mode === 'signup' ? "Sign In" : mode === 'forgot' ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
