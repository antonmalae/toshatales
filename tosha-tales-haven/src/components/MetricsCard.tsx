import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  loading?: boolean;
  className?: string;
}

const MetricsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  loading = false,
  className = ""
}: MetricsCardProps) => {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {loading ? '...' : value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </Card>
  );
};

export default MetricsCard; 