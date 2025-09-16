import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Image, CheckCircle, Camera, X, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const UploadPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  const startCamera = useCallback(async () => {
    try {
      // More flexible constraints for mobile devices
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays on mobile
        videoRef.current.play().catch(console.error);
      }
    } catch (error) {
      console.error('Camera error:', error);
      
      // Try with basic constraints if the ideal ones fail
      try {
        const basicStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        setStream(basicStream);
        setIsCameraActive(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = basicStream;
          videoRef.current.play().catch(console.error);
        }
      } catch (basicError) {
        toast({
          title: "Camera access denied",
          description: "Please allow camera access to take photos of your menu.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Wait for video to be ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      toast({
        title: "Camera not ready",
        description: "Please wait for the camera to fully load before capturing.",
        variant: "destructive",
      });
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `menu-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        handleFileSelect(file);
        stopCamera();
        setActiveTab("upload"); // Switch back to upload tab to show preview
        
        toast({
          title: "Photo captured!",
          description: "Your menu photo is ready for processing.",
        });
      }
    }, 'image/jpeg', 0.9);
  }, [handleFileSelect, stopCamera, toast]);

  // Cleanup camera on unmount
  useState(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  });

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
          {/* Upload Methods */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Image
              </TabsTrigger>
              <TabsTrigger value="camera" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Take Photo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
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
            </TabsContent>

            <TabsContent value="camera">
              <Card className="p-8 shadow-card">
                {!isCameraActive ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Take a Photo of Your Menu
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Use your device camera to capture your menu directly
                    </p>
                    <Button onClick={startCamera} className="bg-primary hover:bg-primary-hover shadow-soft">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                    <div className="text-sm text-muted-foreground mt-4">
                      Make sure the menu is well-lit and text is clearly visible
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        webkit-playsinline="true"
                        className="w-full h-64 md:h-80 object-cover"
                        onLoadedMetadata={() => {
                          // Ensure video plays on mobile
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.error);
                          }
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={stopCamera}
                          className="bg-destructive/80 hover:bg-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={stopCamera}
                        className="flex-1 max-w-32"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={capturePhoto}
                        className="flex-1 max-w-32 bg-primary hover:bg-primary-hover shadow-soft"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Capture
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      📸 Position your menu in the frame and tap Capture
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          {selectedFile && (
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl("");
                  // Reset to upload tab
                  setActiveTab("upload");
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">📤 Upload Image:</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Choose clear, high-quality photos</li>
                  <li>• Supports JPG, PNG, WebP up to 10MB</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">📷 Take Photo:</h4>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>• Use good lighting, avoid shadows</li>
                  <li>• Hold device steady when capturing</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-accent/20">
              <h4 className="font-medium text-foreground mb-2">General Tips:</h4>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• Ensure text is readable and not blurry</li>
                <li>• Include the full menu or section you want to digitize</li>
                <li>• Avoid reflections or glare on the menu</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;