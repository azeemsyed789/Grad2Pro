import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/navbar";
import LearningPathCard from "@/components/features/learning-path-card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Target, 
  Clock,
  TrendingUp,
  Award
} from "lucide-react";

export default function LearningPaths() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
    enabled: isAuthenticated,
  });

  const { data: learningResources } = useQuery({
    queryKey: ["/api/learning-resources"],
    enabled: isAuthenticated,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ pathId, progress }: { pathId: string; progress: number }) => {
      const response = await apiRequest("PUT", `/api/learning-paths/${pathId}/progress`, { progress });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Progress Updated",
        description: "Your learning path progress has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContinueLearning = (pathId: string) => {
    // Navigate to learning path details or start learning
    toast({
      title: "Learning Path Started",
      description: "Opening your personalized learning path...",
    });
  };

  const handleViewDetails = (pathId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Detailed learning path view is coming soon!",
    });
  };

  // Filter and sort learning paths
  const filteredPaths = learningPaths?.filter((path: any) => {
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || path.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "progress":
        return b.progress - a.progress;
      case "title":
        return a.title.localeCompare(b.title);
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading learning paths...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Learning Paths</h1>
                <p className="text-muted-foreground">
                  Follow AI-curated learning paths to develop your skills systematically.
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Path
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {learningPaths?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Paths</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {learningPaths?.reduce((acc: number, path: any) => acc + path.progress, 0) / (learningPaths?.length || 1) || 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {learningPaths?.filter((path: any) => path.progress >= 100).length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">Hours This Week</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search learning paths..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Paths</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Paths */}
          {pathsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-4/5"></div>
                      <div className="h-2 bg-muted rounded"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !filteredPaths || filteredPaths.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {searchQuery ? "No matching learning paths" : "No learning paths yet"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery 
                      ? "Try adjusting your search terms or filters to find learning paths."
                      : "Complete your skill analysis to get AI-generated learning paths tailored to your goals."
                    }
                  </p>
                  <div className="flex justify-center space-x-2">
                    {searchQuery ? (
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    ) : (
                      <Button asChild>
                        <a href="/profile">
                          <Target className="w-4 h-4 mr-2" />
                          Get Started
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPaths.map((path: any) => (
                <LearningPathCard
                  key={path.id}
                  learningPath={path}
                  onContinue={handleContinueLearning}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}

          {/* Recommended Resources */}
          {learningResources && learningResources.length > 0 && (
            <>
              <Separator />
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Recommended Resources</h2>
                  <p className="text-muted-foreground">
                    Additional learning resources to complement your paths.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {learningResources.slice(0, 6).map((resource: any) => (
                    <Card key={resource.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-foreground line-clamp-2">
                              {resource.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {resource.provider}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {resource.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{resource.difficulty}</span>
                            <span>{resource.duration}</span>
                            <Badge variant={resource.cost === "free" ? "success" : "secondary"}>
                              {resource.cost}
                            </Badge>
                          </div>
                          
                          <Button size="sm" variant="outline" className="w-full">
                            View Resource
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
