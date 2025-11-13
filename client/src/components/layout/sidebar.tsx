import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Briefcase, 
  Award, 
  User, 
  Building,
  BarChart3,
  Settings,
  HelpCircle
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const graduateNavigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: location === "/dashboard",
    },
    {
      name: "Learning Paths",
      href: "/learning-paths",
      icon: BookOpen,
      current: location === "/learning-paths",
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Users,
      current: location === "/projects",
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      current: location === "/jobs",
    },
    {
      name: "Assessments",
      href: "/assessments",
      icon: Award,
      current: location === "/assessments",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      current: location === "/profile",
    },
  ];

  const companyNavigation = [
    {
      name: "Dashboard",
      href: "/company",
      icon: LayoutDashboard,
      current: location === "/company",
    },
    {
      name: "Analytics",
      href: "/company/analytics",
      icon: BarChart3,
      current: location === "/company/analytics",
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Users,
      current: location === "/projects",
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: Briefcase,
      current: location === "/jobs",
    },
    {
      name: "Candidates",
      href: "/company/candidates",
      icon: User,
      current: location === "/company/candidates",
    },
    {
      name: "Company Profile",
      href: "/company/profile",
      icon: Building,
      current: location === "/company/profile",
    },
  ];

  const navigation = user?.userType === "company" ? companyNavigation : graduateNavigation;

  return (
    <div className={cn("flex flex-col w-64 bg-card border-r border-border", className)}>
      <div className="flex-grow">
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={item.current ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      item.current && "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="mr-3 h-4 w-4" />
            Help & Support
          </Button>
        </div>
        
        {user?.userType === "graduate" && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-1">
              Upgrade to Pro
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Get advanced analytics and priority support
            </div>
            <Button size="sm" className="w-full">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
