import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type DetectedItem = {
  name: string;
  price: number;
  quantity: number;
};

export function ReceiptUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("receipt", file);

      // Don't use apiRequest here as it sets Content-Type which breaks multipart/form-data
      const res = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      return await res.json();
    },
    onSuccess: (data) => {
      setDetectedItems(data.items);
      toast({
        title: "Receipt processed",
        description: `Found ${data.items.length} items in the receipt`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadMutation.mutate(file);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col items-center gap-4">
          <label
            htmlFor="receipt"
            className="w-full cursor-pointer"
          >
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload a receipt photo
              </p>
              <Input
                id="receipt"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending}
              />
            </div>
          </label>

          {preview && (
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Receipt preview"
                className="object-contain w-full h-full"
              />
              {uploadMutation.isPending && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}
            </div>
          )}

          {detectedItems.length > 0 && (
            <div className="w-full space-y-4">
              <h3 className="font-medium">Detected Items</h3>
              <div className="space-y-2">
                {detectedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${(item.price / 100).toFixed(2)} • Qty: {item.quantity}
                      </p>
                    </div>
                    <Button variant="outline" size="icon">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full" disabled={uploadMutation.isPending}>
                Add Selected Items to Inventory
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}