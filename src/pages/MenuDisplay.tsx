import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Download, Star, Clock, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface MenuItem {
  name: string;
  price: string;
  photo: string;
}

interface MenuData {
  id: string;
  restaurantName: string;
  items: MenuItem[];
  createdAt: string;
}

const MenuDisplay = () => {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const loadMenu = () => {
      setIsLoading(true);
      let data: MenuData | null = null;

      if (id === 'preview') {
        const previewData = sessionStorage.getItem('previewMenu');
        if (previewData) {
          data = JSON.parse(previewData);
        }
      } else {
        // Try sessionStorage first (for just-created menus)
        const sessionData = sessionStorage.getItem('finalMenu');
        if (sessionData) {
          const parsedData = JSON.parse(sessionData);
          if (parsedData.id === id) {
            data = parsedData;
          }
        }

        // Try localStorage (for saved menus)
        if (!data && id) {
          const localData = localStorage.getItem(`menu_${id}`);
          if (localData) {
            data = JSON.parse(localData);
          }
        }
      }

      if (data) {
        setMenuData(data);
      } else {
        toast({
          title: "Menu not found",
          description: "The requested menu could not be loaded.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    };

    loadMenu();
  }, [id, toast]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${menuData?.restaurantName} - Digital Menu`,
          text: `Check out the menu for ${menuData?.restaurantName}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Menu link has been copied to your clipboard.",
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download feature coming soon!",
      description: "PDF download will be available in the next update.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your menu...</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">Menu Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The menu you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary-hover">
              Create New Menu
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            {id !== 'preview' ? (
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Create New Menu
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.close()}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Close Preview
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDownload}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {menuData.restaurantName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-primary-foreground/90">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current" />
                <span>4.8 Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Open Now</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Digital Menu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Our Menu</h2>
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
              {menuData.items.length} Items
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuData.items.map((item, index) => (
              <Card key={index} className="overflow-hidden shadow-card hover:shadow-float transition-all duration-300 hover:-translate-y-1 group">
                <div className="relative">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {item.price || 'Market Price'}
                    </span>
                    <Button size="sm" className="bg-primary hover:bg-primary-hover text-xs">
                      Order Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {menuData.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No menu items available.</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16 pt-8 border-t text-center">
            <p className="text-muted-foreground mb-4">
              Created with Digital Menu Builder
            </p>
            <Link to="/">
              <Button variant="outline">
                Create Your Own Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDisplay;