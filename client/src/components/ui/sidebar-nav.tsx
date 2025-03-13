import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  LayoutDashboard,
  Package,
  MapPin,
  ShoppingCart,
  LogOut,
  BarChart2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function SidebarNav() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const items = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      title: "Locations",
      href: "/locations",
      icon: MapPin,
    },
    {
      title: "Shopping List",
      href: "/shopping",
      icon: ShoppingCart,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart2,
    },
  ];

  return (
    <nav className="flex flex-col h-screen bg-sidebar border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground">
          Food Tracker
        </h2>
      </div>
      <div className="flex-1 px-4">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={location === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2 mb-1",
                location === item.href && "bg-sidebar-accent",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Button>
          </Link>
        ))}
      </div>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}