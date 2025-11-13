import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import SkillProgress from "@/components/features/skill-progress";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Award,
  Clock
} from "lucide-react";

export default function Dashboard() {
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

  const { data: skillAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/skills/analysis"],
    enabled: isAuthenticated,
  });

  const { data: userSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/user-skills"],
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
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
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Skill Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Track your skill development progress and get personalized recommendations.
            </p>
          </div>

          {/* No Analysis State */}
          {!analysisLoading && !skillAnalysis && (
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <Brain className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">No Skill Analysis Yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Upload your resume to get AI-powered skill analysis and personalized learning recommendations.
                  </p>
                  <Button asChild size="lg">
                    <Link href="/profile">
                      <Target className="w-4 h-4 mr-2" />
                      Upload Resume & Analyze
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {skillAnalysis && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Overall Score */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span>Overall Skill Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {skillAnalysis.overallScore}%
                      </div>
                      <p className="text-muted-foreground">Career Readiness Score</p>
                    </div>
                    
                    <Progress value={skillAnalysis.overallScore} className="h-3" />
                    
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-foreground">
                          {(skillAnalysis.detectedSkills as any[])?.length || 0}
                        </div>
                        <div className="text-muted-foreground">Skills Detected</div>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {(skillAnalysis.skillGaps as any[])?.length || 0}
                        </div>
                        <div className="text-muted-foreground">Skill Gaps</div>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {(skillAnalysis.recommendations as any[])?.length || 0}
                        </div>
                        <div className="text-muted-foreground">Recommendations</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detected Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span>Detected Skills</span>
                      </div>
                      <Badge variant="secondary">
                        {(skillAnalysis.detectedSkills as any[])?.length || 0} skills
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(skillAnalysis.detectedSkills as any[])?.map((skill: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <h4 className="font-medium text-foreground">{skill.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {Math.round((skill.confidence || 0) * 100)}%
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {skill.level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Gaps */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <span>Skill Gaps to Address</span>
                      </div>
                      <Badge variant="secondary">
                        {(skillAnalysis.skillGaps as any[])?.length || 0} gaps
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(skillAnalysis.skillGaps as any[])?.map((gap: any, index: number) => (
                        <div key={index} className="p-4 border border-border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground">{gap.skill}</h4>
                            <Badge 
                              variant={gap.importance === "critical" ? "destructive" : 
                                     gap.importance === "high" ? "default" : "secondary"}
                            >
                              {gap.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* User Skills Progress */}
                {userSkills && userSkills.length > 0 && (
                  <SkillProgress skills={userSkills} />
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-warning" />
                      <span>AI Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(skillAnalysis.recommendations as any[])?.slice(0, 3).map((rec: any, index: number) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-foreground text-sm">{rec.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

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
                      <div className="space-y-3">
                        {learningPaths.slice(0, 2).map((path: any) => (
                          <div key={path.id} className="p-3 border border-border rounded-lg">
                            <h4 className="font-medium text-foreground text-sm mb-1">{path.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
                            <Progress value={path.progress} className="h-1" />
                            <p className="text-xs text-muted-foreground mt-1">{path.progress}% complete</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No learning paths yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/learning-paths">
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Learning Paths
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/assessments">
                        <Award className="w-4 h-4 mr-2" />
                        Take Skill Assessment
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/jobs">
                        <Target className="w-4 h-4 mr-2" />
                        Find Matching Jobs
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/profile">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Update Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Career Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Career Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profile Completion</span>
                        <span className="font-medium">85%</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skills Verified</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Job Match Rate</span>
                        <span className="font-medium">
                          {skillAnalysis.overallScore >= 80 ? "High" : 
                           skillAnalysis.overallScore >= 60 ? "Medium" : "Improving"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
