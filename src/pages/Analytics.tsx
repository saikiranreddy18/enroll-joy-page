import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </Link>
        </div>
      </header>

      {/* Analytics Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <AnalyticsDashboard />
        </div>
      </section>
    </div>
  );
};

export default Analytics;
