import { useQuery } from "@tanstack/react-query";
import { Location } from "@shared/schema";
import { SidebarNav } from "@/components/ui/sidebar-nav";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LocationForm } from "@/components/location-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Locations() {
  const { data: locations } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Locations</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <LocationForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations?.map((location) => (
            <Dialog key={location.id}>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <CardTitle>{location.name}</CardTitle>
                    <CardDescription>{location.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Click to edit location
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <LocationForm locationToEdit={location} />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </div>
  );
}
