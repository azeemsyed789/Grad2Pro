import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/navbar";
import ProjectCard from "@/components/features/project-card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Building,
  Trophy,
  Clock,
  Target
} from "lucide-react";

export default function Projects() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("available");

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

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });

  const { data: myProjects } = useQuery({
    queryKey: ["/api/projects", { companyId: user?.id }],
    enabled: isAuthenticated && user?.userType === "company",
  });

  const joinProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await apiRequest("POST", `/api/projects/${projectId}/join`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Joined",
        description: "You have successfully joined the project!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
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
        title: "Join Failed",
        description: error.message || "Failed to join project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleJoinProject = (projectId: string) => {
    joinProjectMutation.mutate(projectId);
  };

  const handleViewDetails = (projectId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Detailed project view is coming soon!",
    });
  };

  // Filter and sort projects
  const filteredProjects = projects?.filter((project: any) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || project.difficulty === difficultyFilter;
    const isAvailable = project.status === "active";
    
    return matchesSearch && matchesDifficulty && isAvailable;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "difficulty":
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - 
               difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      case "compensation":
        const compOrder = { paid: 3, credits: 2, none: 1 };
        return compOrder[b.compensation as keyof typeof compOrder] - 
               compOrder[a.compensation as keyof typeof compOrder];
      case "participants":
        return b.currentParticipants - a.currentParticipants;
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
              <p className="text-muted-foreground">Loading projects...</p>
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
                <h1 className="text-3xl font-bold text-foreground">Real-World Projects</h1>
                <p className="text-muted-foreground">
                  Build portfolio-ready experience through company-sponsored projects and simulations.
                </p>
              </div>
              {user?.userType === "company" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Project
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {projects?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Available Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {new Set(projects?.map((p: any) => p.companyId)).size || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Partner Companies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">0</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Projects</TabsTrigger>
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              {user?.userType === "company" && (
                <TabsTrigger value="company-projects">Company Projects</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="available" className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                        <SelectTrigger className="w-[150px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="difficulty">Difficulty</SelectItem>
                          <SelectItem value="compensation">Compensation</SelectItem>
                          <SelectItem value="participants">Participants</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Grid */}
              {projectsLoading ? (
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
                          <div className="h-8 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !filteredProjects || filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold text-foreground">
                        {searchQuery ? "No matching projects" : "No projects available"}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery 
                          ? "Try adjusting your search terms or filters to find projects."
                          : "Check back soon for new project opportunities from our partner companies."
                        }
                      </p>
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project: any) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onJoin={handleJoinProject}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-projects" className="space-y-6">
              <Card>
                <CardContent className="p-12">
                  <div className="text-center space-y-4">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h3 className="text-xl font-semibold text-foreground">No Projects Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      You haven't joined any projects yet. Browse available projects to get started.
                    </p>
                    <Button onClick={() => setActiveTab("available")}>
                      Browse Projects
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {user?.userType === "company" && (
              <TabsContent value="company-projects" className="space-y-6">
                {myProjects && myProjects.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myProjects.map((project: any) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12">
                      <div className="text-center space-y-4">
                        <Building className="w-16 h-16 text-muted-foreground mx-auto" />
                        <h3 className="text-xl font-semibold text-foreground">No Company Projects</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          You haven't posted any projects yet. Create your first project to start connecting with talented graduates.
                        </p>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
