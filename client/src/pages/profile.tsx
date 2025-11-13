import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/layout/navbar";
import ResumeUpload from "@/components/features/resume-upload";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User, MapPin, Target, Briefcase, Globe, Github, Linkedin, Save } from "lucide-react";

const profileSchema = z.object({
  careerGoals: z.string().optional(),
  desiredRole: z.string().optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");

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

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      careerGoals: "",
      desiredRole: "",
      experience: "entry",
      location: "",
      portfolioUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      bio: "",
      skills: [],
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        careerGoals: profile.careerGoals || "",
        desiredRole: profile.desiredRole || "",
        experience: profile.experience || "entry",
        location: profile.location || "",
        portfolioUrl: profile.portfolioUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        bio: profile.bio || "",
        skills: profile.skills || [],
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("POST", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
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
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    
    const currentSkills = form.getValues("skills") || [];
    if (!currentSkills.includes(newSkill.trim())) {
      form.setValue("skills", [...currentSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues("skills") || [];
    form.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.careerGoals,
      profile.desiredRole,
      profile.experience,
      profile.location,
      profile.bio,
      profile.resumeUrl,
      profile.skills?.length > 0 ? "hasSkills" : null,
    ];
    
    const completedFields = fields.filter(field => field && field.toString().trim() !== "").length;
    return Math.round((completedFields / fields.length) * 100);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const watchedSkills = form.watch("skills") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">
              Complete your profile to get personalized skill analysis and job recommendations.
            </p>
            
            {/* Profile completion */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">Profile Completion</h3>
                  <Badge variant={profileCompletion >= 80 ? "default" : "secondary"}>
                    {profileCompletion}%
                  </Badge>
                </div>
                <Progress value={profileCompletion} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your profile to unlock all features and get better job matches.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Personal Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={user?.firstName || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={user?.lastName || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      {...form.register("location")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      rows={4}
                      {...form.register("bio")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Portfolio URL
                    </Label>
                    <Input
                      id="portfolioUrl"
                      placeholder="https://yourportfolio.com"
                      {...form.register("portfolioUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">
                      <Linkedin className="w-4 h-4 inline mr-1" />
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedinUrl"
                      placeholder="https://linkedin.com/in/yourprofile"
                      {...form.register("linkedinUrl")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">
                      <Github className="w-4 h-4 inline mr-1" />
                      GitHub URL
                    </Label>
                    <Input
                      id="githubUrl"
                      placeholder="https://github.com/yourusername"
                      {...form.register("githubUrl")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Career Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span>Career Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="desiredRole">Desired Role</Label>
                    <Input
                      id="desiredRole"
                      placeholder="e.g., Frontend Developer, Data Scientist"
                      {...form.register("desiredRole")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select 
                      value={form.watch("experience")} 
                      onValueChange={(value) => form.setValue("experience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="junior">Junior (1-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careerGoals">Career Goals</Label>
                    <Textarea
                      id="careerGoals"
                      placeholder="Describe your career goals and aspirations..."
                      rows={4}
                      {...form.register("careerGoals")}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>

                  {watchedSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {watchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Click on a skill to remove it. Add skills relevant to your target role.
                  </p>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
                className="w-full"
                size="lg"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Resume Upload Section */}
          <ResumeUpload
            currentResumeUrl={profile?.resumeUrl}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
              toast({
                title: "Success",
                description: "Resume uploaded and analyzed successfully!",
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
