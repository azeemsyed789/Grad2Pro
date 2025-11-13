import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import { Brain, BookOpen, Target, TrendingUp, ArrowRight, Users, Briefcase, Award, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: skillAnalysis } = useQuery({
    queryKey: ["/api/skills/analysis"],
    enabled: isAuthenticated,
  });

  const { data: learningPaths } = useQuery({
    queryKey: ["/api/learning-paths"],
    enabled: isAuthenticated,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["/api/recommendations"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue your journey from graduate to professional with personalized insights and recommendations.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {skillAnalysis?.overallScore || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Skill Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {learningPaths?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Learning Paths</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {profile?.profileCompletion || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Profile Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Job Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Getting Started */}
            {(!profile || profile.profileCompletion < 100) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span>Complete Your Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Complete your profile to get personalized skill analysis and job recommendations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link href="/profile">
                        <Target className="w-4 h-4 mr-2" />
                        Complete Profile
                      </Link>
                    </Button>
                    {!profile?.resumeUrl && (
                      <Button variant="outline" asChild>
                        <Link href="/profile">
                          Upload Resume
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skill Analysis Summary */}
            {skillAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-primary" />
                      <span>Skill Analysis</span>
                    </div>
                    <Badge variant="secondary">{skillAnalysis.overallScore}% Match</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Detected Skills</h4>
                      <div className="space-y-2">
                        {(skillAnalysis.detectedSkills as any[])?.slice(0, 3).map((skill: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{skill.name}</span>
                            <Badge variant="outline">{skill.level}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Skill Gaps</h4>
                      <div className="space-y-2">
                        {(skillAnalysis.skillGaps as any[])?.slice(0, 3).map((gap: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{gap.skill}</span>
                            <Badge variant="secondary">{gap.importance}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/dashboard">
                      View Full Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Learning Paths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-secondary" />
                    <span>Learning Paths</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/learning-paths">View All</Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {learningPaths && learningPaths.length > 0 ? (
                  <div className="space-y-4">
                    {learningPaths.slice(0, 2).map((path: any) => (
                      <div key={path.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{path.title}</h4>
                          <Badge variant="outline">{path.progress}% Complete</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full transition-all" 
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-medium text-foreground mb-2">No Learning Paths Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete your skill analysis to get personalized learning recommendations.
                    </p>
                    <Button asChild>
                      <Link href="/profile">Get Started</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/jobs">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/projects">
                    <Users className="w-4 h-4 mr-2" />
                    View Projects
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/assessments">
                    <Award className="w-4 h-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Profile updated</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Skill analysis completed</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Learning path created</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* This Week */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Learning Hours</span>
                  <span className="font-bold text-foreground">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Projects Completed</span>
                  <span className="font-bold text-foreground">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Job Applications</span>
                  <span className="font-bold text-foreground">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
