import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import Navbar from "@/components/layout/navbar";
import { 
  Building, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  BarChart3,
  Eye,
  MessageSquare,
  Calendar,
  Award,
  Target,
  Clock,
  FileText,
  Download,
  Mail,
  UserCheck
} from "lucide-react";

export default function CompanyDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [candidateFilter, setCandidateFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

  // Redirect non-company users
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.userType !== "company") {
      toast({
        title: "Access Denied",
        description: "This dashboard is only available for company accounts.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: companyProfile } = useQuery({
    queryKey: ["/api/company/profile"],
    enabled: isAuthenticated && user?.userType === "company",
  });

  const { data: companyJobs } = useQuery({
    queryKey: ["/api/jobs", { companyId: user?.id }],
    enabled: isAuthenticated && user?.userType === "company",
  });

  const { data: companyProjects } = useQuery({
    queryKey: ["/api/projects", { companyId: user?.id }],
    enabled: isAuthenticated && user?.userType === "company",
  });

  const { data: jobApplications } = useQuery({
    queryKey: ["/api/company/applications"],
    enabled: isAuthenticated && user?.userType === "company",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.userType !== "company") {
    return null; // Will redirect above
  }

  const totalApplications = jobApplications?.length || 0;
  const activeJobs = companyJobs?.filter((job: any) => job.status === "active").length || 0;
  const activeProjects = companyProjects?.filter((project: any) => project.status === "active").length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Company Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage your hiring process, view candidates, and track performance.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link href="/jobs">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/projects">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{activeJobs}</p>
                      <p className="text-sm text-muted-foreground">Active Job Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
                      <p className="text-sm text-muted-foreground">Active Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {totalApplications > 0 ? Math.round((totalApplications * 0.15)) : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Qualified Candidates</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Profile Status */}
          {!companyProfile && (
            <Card className="border-warning">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Building className="w-6 h-6 text-warning mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Complete Your Company Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete your company profile to attract better candidates and improve your hiring success rate.
                    </p>
                    <Button className="mt-3" size="sm" asChild>
                      <Link href="/company/profile">
                        Complete Profile
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {jobApplications && jobApplications.length > 0 ? (
                        <div className="space-y-4">
                          {jobApplications.slice(0, 5).map((application: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-foreground">New Application</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Applied to Frontend Developer • Just now
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">85% Match</Badge>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-medium text-foreground mb-2">No Applications Yet</h4>
                          <p className="text-sm text-muted-foreground">
                            Applications will appear here once candidates start applying to your jobs.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Job Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {companyJobs && companyJobs.length > 0 ? (
                        <div className="space-y-4">
                          {companyJobs.filter((job: any) => job.status === "active").slice(0, 3).map((job: any) => (
                            <div key={job.id} className="p-4 border border-border rounded-lg">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-foreground">{job.title}</h4>
                                  <p className="text-sm text-muted-foreground">{job.location || "Remote"}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant="outline">{job.jobType}</Badge>
                                    <Badge variant="outline">{job.experienceLevel}</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-foreground">0 Applications</p>
                                  <p className="text-xs text-muted-foreground">Posted 2 days ago</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-medium text-foreground mb-2">No Active Jobs</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Post your first job to start attracting candidates.
                          </p>
                          <Button asChild>
                            <Link href="/jobs">
                              <Plus className="w-4 h-4 mr-2" />
                              Post Job
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full justify-start">
                        <Link href="/jobs">
                          <Plus className="w-4 h-4 mr-2" />
                          Post New Job
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/projects">
                          <Target className="w-4 h-4 mr-2" />
                          Create Project
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/company/profile">
                          <Building className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Hiring Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">New Applications</span>
                        <span className="font-medium">{Math.round(totalApplications * 0.4)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Under Review</span>
                        <span className="font-medium">{Math.round(totalApplications * 0.3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Interviewing</span>
                        <span className="font-medium">{Math.round(totalApplications * 0.2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Offers Extended</span>
                        <span className="font-medium">{Math.round(totalApplications * 0.1)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Applications</span>
                        <span className="font-bold text-foreground">{totalApplications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interviews</span>
                        <span className="font-bold text-foreground">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hires</span>
                        <span className="font-bold text-foreground">0</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="candidates" className="space-y-6">
              {/* Candidate Filters */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search candidates..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Select value={candidateFilter} onValueChange={setCandidateFilter}>
                        <SelectTrigger className="w-[150px]">
                          <Filter className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Candidates</SelectItem>
                          <SelectItem value="new">New Applications</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="interviewed">Interviewed</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Candidates List */}
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {jobApplications && jobApplications.length > 0 ? (
                    <div className="space-y-4">
                      {jobApplications.map((application: any, index: number) => (
                        <div key={index} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">JD</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">John Doe</h4>
                                <p className="text-sm text-muted-foreground">Applied for Frontend Developer</p>
                                <p className="text-xs text-muted-foreground">Applied 2 hours ago</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline">React</Badge>
                                  <Badge variant="outline">JavaScript</Badge>
                                  <Badge variant="outline">TypeScript</Badge>
                                  <Badge className="bg-success text-success-foreground">92% Match</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                              <Button size="sm">
                                <UserCheck className="w-4 h-4 mr-1" />
                                Shortlist
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No Candidates Yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Once candidates start applying to your jobs, they will appear here with their match scores and profiles.
                      </p>
                      <Button asChild>
                        <Link href="/jobs">
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Applications</span>
                        <span className="text-2xl font-bold text-foreground">{totalApplications}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Applications This Week</span>
                        <span className="text-lg font-semibold text-foreground">{Math.round(totalApplications * 0.3)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Average Match Score</span>
                        <span className="text-lg font-semibold text-foreground">84%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="text-lg font-semibold text-foreground">67%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Skills in Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["JavaScript", "React", "Node.js", "Python", "CSS"].map((skill, index) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{skill}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-muted rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${90 - index * 15}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {90 - index * 15}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Job Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {companyJobs?.slice(0, 3).map((job: any, index: number) => (
                        <div key={job.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-foreground">{job.title}</h5>
                              <p className="text-xs text-muted-foreground">Posted {index + 1} days ago</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">{Math.round(Math.random() * 20)} views</p>
                              <p className="text-xs text-muted-foreground">0 applications</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hiring Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Applications</span>
                          <span>{totalApplications}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Screened</span>
                          <span>{Math.round(totalApplications * 0.6)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-secondary h-2 rounded-full" style={{ width: "60%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Interviewed</span>
                          <span>{Math.round(totalApplications * 0.2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-warning h-2 rounded-full" style={{ width: "20%" }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hired</span>
                          <span>{Math.round(totalApplications * 0.05)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-success h-2 rounded-full" style={{ width: "5%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evaluation Templates</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Create automated workflows for different types of candidate evaluation.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Resume Only</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Simple resume review process
                        </p>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Template
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6 text-center">
                        <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Resume + Notify</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Review resume and send notification
                        </p>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Template
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                      <CardContent className="p-6 text-center">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold text-foreground mb-2">Full Automation</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Resume + assessment + auto evaluation
                        </p>
                        <Button variant="outline" className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Template
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Existing Templates</h4>
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h5 className="font-medium text-foreground mb-2">No Templates Created</h5>
                      <p className="text-sm text-muted-foreground">
                        Create your first evaluation template to streamline your hiring process.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
