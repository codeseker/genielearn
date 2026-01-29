import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";
import type { RootState } from "@/store/store";
import { useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user, shallowEqual);

  useEffect(() => {
    if (!user.user && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, location.pathname]);

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="h-14 lg:hidden shrink-0" />

        <main
          className={cn(
            "flex-1 overflow-y-auto",
            location.pathname === "/" && "overflow-hidden",
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
