import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ReceiptUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("receipt", file);
      const res = await apiRequest("POST", "/api/receipts/upload", formData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Receipt processed",
        description: "Found items: " + data.items.length,
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
      <CardContent className="pt-6">
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
        </div>
      </CardContent>
    </Card>
  );
}
