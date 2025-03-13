import { FoodItem } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  item: FoodItem;
  showQuantity?: boolean;
};

export function ExpiryCard({ item, showQuantity = false }: Props) {
  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const daysUntilExpiry = differenceInDays(
    new Date(item.expiryDate),
    new Date(),
  );

  const location = locations?.find((l) => l.id === item.locationId);

  const getExpiryStatus = () => {
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 3) return "critical";
    if (daysUntilExpiry <= 7) return "warning";
    return "good";
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">
              {location?.name} • {format(new Date(item.expiryDate), "PP")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showQuantity && (
              <Badge variant="outline">
                {item.quantity} {item.unit}
              </Badge>
            )}
            <Badge
              className={cn(
                expiryStatus === "expired" &&
                  "bg-destructive text-destructive-foreground",
                expiryStatus === "critical" &&
                  "bg-red-500/15 text-red-500 hover:bg-red-500/25",
                expiryStatus === "warning" &&
                  "bg-yellow-500/15 text-yellow-500 hover:bg-yellow-500/25",
                expiryStatus === "good" &&
                  "bg-green-500/15 text-green-500 hover:bg-green-500/25",
              )}
            >
              {expiryStatus === "expired"
                ? "Expired"
                : `${daysUntilExpiry} days left`}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
