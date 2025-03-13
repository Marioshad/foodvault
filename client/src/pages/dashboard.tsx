import { useQuery } from "@tanstack/react-query";
import { FoodItem, Location } from "@shared/schema";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { ExpiryCard } from "@/components/expiry-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { data: foodItems, isLoading: foodLoading } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: locations, isLoading: locationLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  if (foodLoading || locationLoading) {
    return (
      <div className="flex min-h-screen">
        <SidebarNav />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </div>
    );
  }

  const expiringItems = foodItems
    ?.filter((item) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(item.expiryDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    })
    .sort(
      (a, b) =>
        new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(),
    );

  const itemsByLocation = locations?.map((location) => ({
    name: location.name,
    items: foodItems?.filter((item) => item.locationId === location.id).length || 0,
  }));

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Expiring Soon</CardTitle>
              <CardDescription>Items expiring within 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expiringItems?.length === 0 ? (
                <p className="text-muted-foreground">No items expiring soon</p>
              ) : (
                expiringItems?.map((item) => (
                  <ExpiryCard key={item.id} item={item} />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items by Location</CardTitle>
              <CardDescription>Distribution of your inventory</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemsByLocation}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="items"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
