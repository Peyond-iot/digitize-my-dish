import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2, RefreshCw, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface MenuItem {
  name: string;
  price: string;
  photo: string;
}

const MenuEditor = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantName, setRestaurantName] = useState("My Restaurant");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedItems = sessionStorage.getItem('processedMenuItems');
    if (storedItems) {
      setMenuItems(JSON.parse(storedItems));
    } else {
      toast({
        title: "No menu data found",
        description: "Please upload and process an image first.",
        variant: "destructive",
      });
      navigate('/upload');
    }
  }, [navigate, toast]);

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const removeMenuItem = (index: number) => {
    const updated = menuItems.filter((_, i) => i !== index);
    setMenuItems(updated);
    toast({
      title: "Item removed",
      description: "Menu item has been deleted.",
    });
  };

  const addMenuItem = () => {
    const newItem: MenuItem = {
      name: "New Item",
      price: "",
      photo: "https://via.placeholder.com/400x300?text=New+Item"
    };
    setMenuItems([...menuItems, newItem]);
  };

  const refreshImage = async (index: number) => {
    setIsLoading(true);
    try {
      const item = menuItems[index];
      const query = encodeURIComponent(item.name);
      const newImageUrl = `https://source.unsplash.com/400x300/?${query}&sig=${Date.now()}`;
      updateMenuItem(index, 'photo', newImageUrl);
      toast({
        title: "Image refreshed",
        description: "New image loaded for this item.",
      });
    } catch (error) {
      toast({
        title: "Failed to refresh image",
        description: "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const saveMenu = () => {
    const menuData = {
      id: Date.now().toString(),
      restaurantName,
      items: menuItems,
      createdAt: new Date().toISOString(),
    };
    
    sessionStorage.setItem('finalMenu', JSON.stringify(menuData));
    localStorage.setItem(`menu_${menuData.id}`, JSON.stringify(menuData));
    
    toast({
      title: "Menu saved!",
      description: "Your digital menu is ready to view.",
    });
    
    navigate(`/menu/${menuData.id}`);
  };

  const previewMenu = () => {
    const menuData = {
      id: 'preview',
      restaurantName,
      items: menuItems,
      createdAt: new Date().toISOString(),
    };
    
    sessionStorage.setItem('previewMenu', JSON.stringify(menuData));
    window.open(`/menu/preview`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/processing">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Edit Your Menu</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={previewMenu}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveMenu} className="bg-primary hover:bg-primary-hover">
                <Save className="w-4 h-4 mr-2" />
                Save Menu
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Restaurant Name */}
          <Card className="p-6 shadow-card mb-8">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Restaurant Name</Label>
              <Input
                id="restaurant-name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="text-xl font-semibold"
                placeholder="Enter your restaurant name"
              />
            </div>
          </Card>

          {/* Menu Items */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Menu Items ({menuItems.length})
              </h2>
              <Button onClick={addMenuItem} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid gap-6">
              {menuItems.map((item, index) => (
                <Card key={index} className="p-6 shadow-card">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Image */}
                    <div className="space-y-3">
                      <div className="relative group">
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => refreshImage(index)}
                            disabled={isLoading}
                            className="bg-card/90 hover:bg-card"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${index}`}>Item Name</Label>
                          <Input
                            id={`name-${index}`}
                            value={item.name}
                            onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                            placeholder="Enter item name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`price-${index}`}>Price</Label>
                          <Input
                            id={`price-${index}`}
                            value={item.price}
                            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                            placeholder="Enter price"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {menuItems.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No menu items found.</p>
                <Button onClick={addMenuItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Item
                </Button>
              </Card>
            )}
          </div>

          {/* Save Section */}
          {menuItems.length > 0 && (
            <Card className="p-6 shadow-card mt-8 bg-gradient-card">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Ready to save your menu?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your digital menu will be saved and ready to share with customers.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={previewMenu}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview First
                  </Button>
                  <Button onClick={saveMenu} className="bg-primary hover:bg-primary-hover shadow-soft">
                    <Save className="w-4 h-4 mr-2" />
                    Save & Continue
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuEditor;