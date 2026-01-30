import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  rightSlot?: React.ReactNode; 
}

export function MobileHeader({
  title,
  onMenuClick,
  rightSlot,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 text-foreground",
        "h-14 px-4",
        "flex items-center justify-between",
        "bg-sidebar border-b border-sidebar-border",
        "lg:hidden"
      )}
    >
      {/* LEFT: Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* RIGHT: Optional slot */}
      <div className="flex items-center">
        {rightSlot ?? <div className="w-9" />}
      </div>
    </header>
  );
}
