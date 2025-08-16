import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, LucideIcon } from "lucide-react";

interface AdminSectionCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  stats: string;
  count: number;
  loading?: boolean;
}

const AdminSectionCard = ({
  id,
  title,
  description,
  icon: Icon,
  href,
  color,
  stats,
  count,
  loading = false
}: AdminSectionCardProps) => {
  return (
    <Link to={href}>
      <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {loading ? '...' : stats}
          </Badge>
        </div>
        
        <h3 className="text-xl font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary font-medium">
            Перейти →
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default AdminSectionCard; 