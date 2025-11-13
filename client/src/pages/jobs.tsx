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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/navbar";
import JobCard from "@/components/features/job-card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Plus, 
  MapPin,
  Building,
  Clock,
  DollarSign,
  Target,
  Send,
  BookOpen,
  TrendingUp
} from "lucide-react";

const applicationSchema = z.object({
  coverLetter: z.string().min(50, "Cover letter must be at least 50 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export default function Jobs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("available");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

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

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs"],
    enabled: isAuthenticated,
  });

  const { data: myApplications } = useQuery({
    queryKey: ["/api/my-applications"],
    enabled: isAuthenticated,
  });

  const { data: myCompanyJobs } = useQuery({
    queryKey: ["/api/jobs", { companyId: user?.id }],
    enabled: isAuthenticated && user?.userType === "company",
  });

  const applyToJobMutation = useMutation({
    mutationFn: async ({ jobId, coverLetter }: { jobId: string; coverLetter: string }) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/apply`, { coverLetter });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Application Submitted",
        description: `Your application has been submitted with a ${data.matchScore}% match score!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      setApplicationDialogOpen(false);
      form.reset();
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
        title: "Application Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyToJob = (jobId: string) => {
    const job = jobs?.find((j: any) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setApplicationDialogOpen(true);
    }
  };

  const handleViewJobDetails = (jobId: string) => {
    const job = jobs?.find((j: any) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      // In a real app, this would navigate to a detailed job view
      toast({
        title: "Job Details",
        description: `Viewing details for ${job.title}`,
      });
    }
  };

  const onSubmitApplication = (data: ApplicationFormData) => {
    if (selectedJob) {
      applyToJobMutation.mutate({
        jobId: selectedJob.id,
        coverLetter: data.coverLetter,
      });
    }
  };

  // Check if user has applied to a job
  const hasApplied = (jobId: string) => {
    return myApplications?.some((app: any) => app.jobId === jobId);
  };

  // Filter and sort jobs
  const filteredJobs = jobs?.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === "all" || 
                           (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase())) ||
                           (locationFilter === "remote" && job.remote);
    const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;
    const matchesExperience = experienceFilter === "all" || job.experienceLevel === experienceFilter;
    const isActive = job.status === "active";
    
    return matchesSearch && matchesLocation && matchesJobType && matchesExperience && isActive;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "salary":
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      case "company":
        return (a.companyName || "").localeCompare(b.companyName || "");
      case "experience":
        const expOrder = { entry: 1, junior: 2, mid: 3, senior: 4 };
        return expOrder[a.experienceLevel as keyof typeof expOrder] - 
               expOrder[b.experienceLevel as keyof typeof expOrder];
      case "recent":
      default:
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
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
              <p className="text-muted-foreground">Loading jobs...</p>
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
                <h1 className="text-3xl font-bold text-foreground">Job Opportunities</h1>
                <p className="text-muted-foreground">
                  Discover entry-level positions and internships matched to your skills.
                </p>
              </div>
              {user?.userType === "company" && (
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {jobs?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Open Positions</p>
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
                        {new Set(jobs?.map((j: any) => j.companyId)).size || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Hiring Companies</p>
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
                        {myApplications?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Applications Sent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {jobs?.filter((j: any) => j.experienceLevel === "entry").length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Entry Level</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Jobs</TabsTrigger>
              <TabsTrigger value="applications">My Applications</TabsTrigger>
              {user?.userType === "company" && (
                <TabsTrigger value="company-jobs">Company Jobs</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="available" className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search jobs, companies, or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Most Recent</SelectItem>
                            <SelectItem value="salary">Salary</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                            <SelectItem value="experience">Experience</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Select value={locationFilter} onValueChange={setLocationFilter}>
                        <SelectTrigger>
                          <MapPin className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="new york">New York</SelectItem>
                          <SelectItem value="san francisco">San Francisco</SelectItem>
                          <SelectItem value="los angeles">Los Angeles</SelectItem>
                          <SelectItem value="chicago">Chicago</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                        <SelectTrigger>
                          <Clock className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                        <SelectTrigger>
                          <Target className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button variant="outline" onClick={() => {
                        setSearchQuery("");
                        setLocationFilter("all");
                        setJobTypeFilter("all");
                        setExperienceFilter("all");
                      }}>
                        <Filter className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs Grid */}
              {jobsLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
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
              ) : !filteredJobs || filteredJobs.length === 0 ? (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <Briefcase className="w-16 h-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold text-foreground">
                        {searchQuery || locationFilter !== "all" || jobTypeFilter !== "all" || experienceFilter !== "all" 
                          ? "No matching jobs found" 
                          : "No jobs available"}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        {searchQuery || locationFilter !== "all" || jobTypeFilter !== "all" || experienceFilter !== "all"
                          ? "Try adjusting your search criteria or filters to find more opportunities."
                          : "Check back soon for new job opportunities from our partner companies."
                        }
                      </p>
                      {(searchQuery || locationFilter !== "all" || jobTypeFilter !== "all" || experienceFilter !== "all") && (
                        <Button variant="outline" onClick={() => {
                          setSearchQuery("");
                          setLocationFilter("all");
                          setJobTypeFilter("all");
                          setExperienceFilter("all");
                        }}>
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredJobs.map((job: any) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      applied={hasApplied(job.id)}
                      onApply={handleApplyToJob}
                      onViewDetails={handleViewJobDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              {myApplications && myApplications.length > 0 ? (
                <div className="space-y-4">
                  {myApplications.map((application: any) => (
                    <Card key={application.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground">
                              {application.jobTitle || "Job Application"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="capitalize">
                                {application.status}
                              </Badge>
                              {application.matchScore && (
                                <Badge variant="secondary">
                                  {application.matchScore}% Match
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12">
                    <div className="text-center space-y-4">
                      <BookOpen className="w-16 h-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold text-foreground">No Applications Yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        You haven't applied to any jobs yet. Browse available positions to get started.
                      </p>
                      <Button onClick={() => setActiveTab("available")}>
                        Browse Jobs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {user?.userType === "company" && (
              <TabsContent value="company-jobs" className="space-y-6">
                {myCompanyJobs && myCompanyJobs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {myCompanyJobs.map((job: any) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onViewDetails={handleViewJobDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12">
                      <div className="text-center space-y-4">
                        <Building className="w-16 h-16 text-muted-foreground mx-auto" />
                        <h3 className="text-xl font-semibold text-foreground">No Company Jobs</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          You haven't posted any jobs yet. Create your first job posting to start attracting talent.
                        </p>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>

          {/* Application Dialog */}
          <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Apply to {selectedJob?.title}</DialogTitle>
              </DialogHeader>
              
              {selectedJob && (
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">{selectedJob.title}</h4>
                      <p className="text-sm text-muted-foreground">{selectedJob.companyName}</p>
                      <div className="flex items-center space-x-2">
                        {selectedJob.location && (
                          <Badge variant="outline">{selectedJob.location}</Badge>
                        )}
                        <Badge variant="outline" className="capitalize">{selectedJob.jobType}</Badge>
                        <Badge variant="outline" className="capitalize">{selectedJob.experienceLevel}</Badge>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={form.handleSubmit(onSubmitApplication)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverLetter">Cover Letter *</Label>
                      <Textarea
                        id="coverLetter"
                        placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role..."
                        rows={8}
                        {...form.register("coverLetter")}
                      />
                      {form.formState.errors.coverLetter && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.coverLetter.message}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={applyToJobMutation.isPending}
                        className="flex-1"
                      >
                        {applyToJobMutation.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Application
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setApplicationDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
