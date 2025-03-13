import { useQuery } from "@tanstack/react-query";
import { FoodItem } from "@shared/schema";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpiryCard } from "@/components/expiry-card";

export default function Shopping() {
  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const expiredItems = foodItems?.filter(
    (item) => new Date(item.expiryDate) < new Date(),
  );

  const lowQuantityItems = foodItems?.filter((item) => item.quantity <= 1);

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Shopping List</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Expired Items{" "}
                <Badge variant="destructive">
                  {expiredItems?.length || 0}
                </Badge>
              </CardTitle>
              <CardDescription>Items that need replacement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expiredItems?.length === 0 ? (
                <p className="text-muted-foreground">No expired items</p>
              ) : (
                expiredItems?.map((item) => (
                  <ExpiryCard key={item.id} item={item} />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Low Quantity{" "}
                <Badge variant="secondary">
                  {lowQuantityItems?.length || 0}
                </Badge>
              </CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowQuantityItems?.length === 0 ? (
                <p className="text-muted-foreground">No items running low</p>
              ) : (
                lowQuantityItems?.map((item) => (
                  <ExpiryCard key={item.id} item={item} showQuantity />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
