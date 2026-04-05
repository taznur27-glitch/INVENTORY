import { Suspense, lazy, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Layout from "@/components/Layout";

const queryClient = new QueryClient();

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const AddPhone = lazy(() => import("@/pages/AddPhone"));
const Sales = lazy(() => import("@/pages/Sales"));
const Parties = lazy(() => import("@/pages/Parties"));
const Returns = lazy(() => import("@/pages/Returns"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Admin = lazy(() => import("@/pages/Admin"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));

async function fetchApprovalStatus(userId: string): Promise<boolean> {
  const [adminRes, memberRes] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" } as any),
    supabase.rpc("has_role", { _user_id: userId, _role: "member" } as any),
  ]);

  return Boolean(adminRes.data) || Boolean(memberRes.data);
}

function AppRoutes() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const handleSession = async (nextSession: Session | null) => {
      setSession(nextSession);

    if (!nextSession?.user?.id) {
        setApproved(false);
        setLoading(false);
        return;
      }
    
const isApproved = await fetchApprovalStatus(nextSession.user.id);
      setApproved(isApproved);
      setLoading(false);
      };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void handleSession(nextSession);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void handleSession(initialSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (session && !approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 text-center space-y-3">
          <h2 className="text-xl font-semibold">Waiting for Admin Approval</h2>
          <p className="text-sm text-muted-foreground">
            Your account is created, but access is blocked until an admin approves your membership.
          </p>
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <Routes>
      <Route path="/reset-password" element={<ResetPassword />} />
        {!session ? (
          <Route path="*" element={<Auth />} />
        ) : (
          <>
            <Route path="/" element={<Layout><Navigate to="/dashboard" replace /></Layout>} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
            <Route path="/inventory/add" element={<Layout><AddPhone /></Layout>} />
            <Route path="/sales" element={<Layout><Sales /></Layout>} />
            <Route path="/returns" element={<Layout><Returns /></Layout>} />
            <Route path="/parties" element={<Layout><Parties /></Layout>} />
            <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
            <Route path="/admin" element={<Layout><Admin /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </>
        )}
    </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
