import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Image, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleProcessMenu = () => {
    if (!selectedFile) return;
    
    // Store the file in sessionStorage or pass via state
    const fileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified,
    };
    
    sessionStorage.setItem('uploadedFile', JSON.stringify(fileData));
    sessionStorage.setItem('fileUrl', previewUrl);
    
    // Create a new File object and store it
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        sessionStorage.setItem('fileData', e.target.result as string);
        navigate('/processing');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Upload Menu Image</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Upload Area */}
          <Card className="p-8 shadow-card border-2 border-dashed border-border hover:border-primary/50 transition-colors">
            <div
              className={`relative rounded-xl p-8 transition-colors duration-300 ${
                isDragging
                  ? 'bg-primary/5 border-primary border-2 border-dashed'
                  : 'bg-muted/30 border-2 border-dashed border-muted-foreground/20'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {previewUrl ? (
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Menu preview"
                    className="mx-auto max-h-64 rounded-lg shadow-soft mb-4"
                  />
                  <div className="flex items-center justify-center gap-2 text-primary mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Image ready to process</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {selectedFile?.name} ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Drop your menu image here
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Or click to browse from your device
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-4"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Choose Image
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Supports JPG, PNG, WebP up to 10MB
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </Card>

          {/* Action Buttons */}
          {selectedFile && (
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                }}
                className="flex-1"
              >
                Choose Different Image
              </Button>
              <Button
                onClick={handleProcessMenu}
                className="flex-1 bg-primary hover:bg-primary-hover shadow-soft"
              >
                Process Menu
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            </div>
          )}

          {/* Tips */}
          <Card className="mt-8 p-6 bg-accent/5 border-accent/20">
            <h3 className="font-semibold text-foreground mb-3">📸 Tips for best results:</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>• Use clear, well-lit photos</li>
              <li>• Ensure text is readable and not blurry</li>
              <li>• Include the full menu or section you want to digitize</li>
              <li>• Avoid shadows or reflections over text</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;