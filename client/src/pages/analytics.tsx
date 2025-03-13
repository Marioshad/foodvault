import { useQuery } from "@tanstack/react-query";
import { FoodItem, Location } from "@shared/schema";
import { SidebarNav } from "@/components/ui/sidebar-nav";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { differenceInDays } from "date-fns";

export default function Analytics() {
  const { data: foodItems } = useQuery<FoodItem[]>({
    queryKey: ["/api/food-items"],
  });

  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Calculate total inventory value
  const totalValue = foodItems?.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  ) || 0;

  // Calculate expiration metrics
  const expirationMetrics = foodItems?.reduce(
    (acc, item) => {
      const daysUntilExpiry = differenceInDays(
        new Date(item.expiryDate),
        new Date()
      );
      if (daysUntilExpiry < 0) {
        acc.expired += (item.price || 0) * item.quantity;
      } else if (daysUntilExpiry <= 7) {
        acc.expiringSoon += (item.price || 0) * item.quantity;
      }
      return acc;
    },
    { expired: 0, expiringSoon: 0 }
  ) || { expired: 0, expiringSoon: 0 };

  // Storage utilization by location
  const storageUtilization = locations?.map((location) => ({
    name: location.name,
    items: foodItems?.filter((item) => item.locationId === location.id).length || 0,
    value: foodItems
      ?.filter((item) => item.locationId === location.id)
      .reduce((sum, item) => sum + ((item.price || 0) * item.quantity) / 100, 0), // Convert to dollars
  }));

  // Cost distribution by item type (using name as a proxy for type)
  const costDistribution = foodItems
    ?.reduce((acc, item) => {
      const value = ((item.price || 0) * item.quantity) / 100; // Convert to dollars
      if (value > 0) {
        acc.push({
          name: item.name,
          value,
        });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Analytics & Reports</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Total Value Card */}
          <Card>
            <CardHeader>
              <CardTitle>Total Inventory Value</CardTitle>
              <CardDescription>Current value of all items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${(totalValue / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          {/* Expiration Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Expiration Risk</CardTitle>
              <CardDescription>Value of items at risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-muted-foreground">Expired</div>
                  <div className="text-xl font-semibold text-destructive">
                    ${(expirationMetrics.expired / 100).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Expiring Soon</div>
                  <div className="text-xl font-semibold text-yellow-500">
                    ${(expirationMetrics.expiringSoon / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Utilization Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Storage Utilization</CardTitle>
              <CardDescription>Items and value by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={storageUtilization}>
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === "value") return [`$${Number(value).toFixed(2)}`, "Value"];
                        return [value, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="items" fill="#82ca9d" name="Items" />
                    <Bar
                      yAxisId="right"
                      dataKey="value"
                      fill="#8884d8"
                      name="Value ($)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cost Distribution Chart */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Top Items by Value</CardTitle>
              <CardDescription>Distribution of inventory value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => 
                        `${name} ($${value.toFixed(2)})`
                      }
                    >
                      {costDistribution?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}