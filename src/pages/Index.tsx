import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Camera, Sparkles, Zap, Upload, Image, CheckCircle, Languages } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [sourceLanguage] = useState("auto"); // Auto-detect by default
  const [targetLanguage, setTargetLanguage] = useState("eng");
  
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
    sessionStorage.setItem('sourceLanguage', sourceLanguage);
    sessionStorage.setItem('targetLanguage', targetLanguage);
    
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
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-card/80 backdrop-blur-sm rounded-2xl shadow-glow">
              <Camera className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Transform Your
            <span className="block bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">
              Menu Photos
            </span>
            Into Digital Magic
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload any menu image and watch as our AI transforms it into a beautiful, 
            interactive digital menu with stunning food photos.
          </p>
          
          {/* Compact Language Selection */}
          <div className="flex items-center justify-center gap-2 mb-6 text-sm">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Translate menu to:</span>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="w-40 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="jpn">Japanese</SelectItem>
                <SelectItem value="spa">Spanish</SelectItem>
                <SelectItem value="fra">French</SelectItem>
                <SelectItem value="deu">German</SelectItem>
                <SelectItem value="ita">Italian</SelectItem>
                <SelectItem value="kor">Korean</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload Section */}
          <div className="max-w-2xl mx-auto mb-8">
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
              <div className="flex gap-4 mt-6">
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
                  className="flex-1 bg-accent hover:bg-accent-hover text-accent-foreground font-semibold shadow-float hover:shadow-glow transition-all duration-300"
                >
                  Process Menu
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Smart Image Recognition
            </h3>
            <p className="text-muted-foreground">
              Advanced OCR technology extracts menu items and prices from any photo with incredible accuracy.
            </p>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Beautiful Food Photos
            </h3>
            <p className="text-muted-foreground">
              Automatically finds and adds stunning, professional food photos for each menu item.
            </p>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm border-0 shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Instant Results
            </h3>
            <p className="text-muted-foreground">
              Get your complete digital menu in minutes, not hours. Mobile-optimized and ready to share.
            </p>
          </Card>
        </div>

        {/* Tips Section */}
        {!selectedFile && (
          <Card className="mt-8 p-6 bg-accent/5 border-accent/20 max-w-4xl mx-auto">
            <h3 className="font-semibold text-foreground mb-3">📸 Tips for best results:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">📤 Image Quality:</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Choose clear, high-quality photos</li>
                  <li>• Supports JPG, PNG, WebP up to 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">📋 Menu Guidelines:</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Ensure text is readable and not blurry</li>
                  <li>• Include the full menu or section</li>
                  <li>• Avoid reflections or glare on the menu</li>
                </ul>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;