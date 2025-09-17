import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Eye, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import Tesseract from "tesseract.js";

const UNSPLASH_KEY = "Yxtdb1RkUN0vivfPLtZFsxypStl78w8vN7KWK58utzY";

// Language mapping for Tesseract and translation
const LANGUAGE_MAP = {
  'jpn': 'ja',
  'eng': 'en',
  'spa': 'es',
  'fra': 'fr',
  'deu': 'de',
  'ita': 'it',
  'kor': 'ko',
  'chi_sim': 'zh',
  'zh': 'zh'
};

interface MenuItem {
  name: string;
  price: string;
  photo: string;
}

const Processing = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("Preparing...");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const parseLine = (line: string) => {
    if (!line) return null;
    const cleaned = line.replace(/\u00A0/g, " ").trim();
    const numberMatches = cleaned.match(/[\d]+(?:[.,]\d+)?/g);
    if (numberMatches?.length) {
      const lastNumberRaw = numberMatches[numberMatches.length - 1];
      const price = lastNumberRaw.replace(/,/g, ".");
      const lastIndex = cleaned.lastIndexOf(lastNumberRaw);
      let name = cleaned.slice(0, lastIndex).replace(/[\-:\—\.\|]+$/g, "").trim();
      return { name: name || cleaned.replace(lastNumberRaw, "").trim(), price };
    }
    return { name: cleaned, price: "" };
  };

  const translateText = async (text: string, sourceLang: string, targetLang: string) => {
    if (sourceLang === targetLang || !text.trim()) return text;
    
    try {
      // Using MyMemory Translation API (free)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.warn('Translation failed, using original text:', error);
    }
    
    return text;
  };

  const fetchImageFor = async (query: string) => {
    const safeQuery = query?.trim() || "food";
    if (!safeQuery) return `https://via.placeholder.com/400x300?text=No+Image`;
    
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(safeQuery)}&per_page=1`,
        {
          headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.results?.[0]?.urls?.small) return data.results[0].urls.small;
      }
    } catch (e) {
      console.warn("Image fetch failed, using fallback.");
    }
    return `https://source.unsplash.com/400x300/?${encodeURIComponent(safeQuery)}`;
  };

  const processImage = async () => {
    try {
      const fileData = sessionStorage.getItem('fileData');
      const fileUrl = sessionStorage.getItem('fileUrl');
      const sourceLanguage = sessionStorage.getItem('sourceLanguage') || 'eng';
      const targetLanguage = sessionStorage.getItem('targetLanguage') || 'eng';
      
      if (!fileData) {
        setError("No image found. Please upload an image first.");
        return;
      }

      setPreviewUrl(fileUrl || "");
      setCurrentStep("Reading text from image...");
      setProgress(10);

      // Convert base64 to blob for Tesseract
      const response = await fetch(fileData);
      const blob = await response.blob();

      const { data } = await Tesseract.recognize(blob, sourceLanguage, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progressPercent = Math.round(m.progress * 40) + 10; // 10-50%
            setProgress(progressPercent);
          }
        }
      });

      setCurrentStep("Extracting menu items...");
      setProgress(55);

      const lines = data.text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const items: MenuItem[] = [];

      const sourceLang = LANGUAGE_MAP[sourceLanguage as keyof typeof LANGUAGE_MAP] || 'en';
      const targetLang = LANGUAGE_MAP[targetLanguage as keyof typeof LANGUAGE_MAP] || 'en';
      const needsTranslation = sourceLang !== targetLang;

      setCurrentStep(needsTranslation ? "Translating menu items..." : "Finding beautiful photos...");
      
      for (let i = 0; i < lines.length; i++) {
        const parsed = parseLine(lines[i]);
        if (!parsed || !parsed.name) continue;

        const progressBase = needsTranslation ? 55 : 60;
        const progressRange = needsTranslation ? 20 : 35;
        setProgress(progressBase + Math.round((i / lines.length) * progressRange));

        let translatedName = parsed.name;
        let translatedPrice = parsed.price;

        if (needsTranslation) {
          setCurrentStep(`Translating ${parsed.name}...`);
          translatedName = await translateText(parsed.name, sourceLang, targetLang);
          if (parsed.price) {
            translatedPrice = await translateText(parsed.price, sourceLang, targetLang);
          }
        }

        setCurrentStep(`Finding photo for ${translatedName}...`);
        const photo = await fetchImageFor(translatedName);
        items.push({ 
          name: translatedName, 
          price: translatedPrice, 
          photo 
        });
      }

      setMenuItems(items);
      setCurrentStep("Complete!");
      setProgress(100);
      setIsComplete(true);

      // Store processed data
      sessionStorage.setItem('processedMenuItems', JSON.stringify(items));

      toast({
        title: "Processing complete!",
        description: `Successfully processed ${items.length} menu items.`,
      });

    } catch (err: any) {
      setError(`Processing failed: ${err.message}`);
      toast({
        title: "Processing failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    processImage();
  }, []);

  const handleContinue = () => {
    navigate('/editor');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/upload">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Processing Error</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/upload">
                <Button className="bg-primary hover:bg-primary-hover">
                  Try Again
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/upload">
              <Button variant="ghost" size="sm" disabled={!isComplete}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Processing Menu</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Processing Status */}
          <Card className="p-8 shadow-card mb-8">
            <div className="text-center mb-6">
              {isComplete ? (
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              ) : (
                <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              )}
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isComplete ? "Processing Complete!" : "Processing Your Menu"}
              </h2>
              
              <p className="text-muted-foreground mb-6">
                {currentStep}
              </p>

              <div className="space-y-2">
                <Progress value={progress} className="w-full h-3" />
                <p className="text-sm text-muted-foreground">
                  {progress}% complete
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="mb-6">
                <img
                  src={previewUrl}
                  alt="Processing"
                  className="mx-auto max-h-48 rounded-lg shadow-soft"
                />
              </div>
            )}

            {isComplete && (
              <div className="text-center">
                <p className="text-foreground mb-4">
                  Found <span className="font-semibold text-primary">{menuItems.length}</span> menu items
                </p>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const element = document.getElementById('preview');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Results
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="flex-1 bg-primary hover:bg-primary-hover shadow-soft"
                  >
                    Continue to Editor
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Preview Results */}
          {isComplete && menuItems.length > 0 && (
            <div id="preview">
              <h3 className="text-xl font-semibold text-foreground mb-4">Preview Results</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menuItems.slice(0, 6).map((item, idx) => (
                  <Card key={idx} className="overflow-hidden shadow-card hover:shadow-float transition-all duration-300">
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-foreground text-sm mb-1">
                        {item.name}
                      </h4>
                      <p className="text-primary font-medium text-sm">
                        {item.price || 'Price not found'}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
              {menuItems.length > 6 && (
                <p className="text-center text-muted-foreground mt-4">
                  + {menuItems.length - 6} more items
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Processing;