import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Camera, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
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
          
          <Link to="/upload">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-semibold px-8 py-4 rounded-xl shadow-float hover:shadow-glow transition-all duration-300 hover:scale-105">
              Start Creating Your Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
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

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-primary-foreground/80 mb-4">
            Join thousands of restaurants already using our digital menu solution
          </p>
          <Link to="/upload">
            <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;