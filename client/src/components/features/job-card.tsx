import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building, Clock, DollarSign, Users, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    description: string;
    companyId: string;
    companyName?: string;
    location?: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    skillsRequired: string[];
    experienceLevel: string;
    remote: boolean;
    postedAt: string;
    applicationUrl?: string;
  };
  matchScore?: number;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  applied?: boolean;
}

export default function JobCard({ 
  job, 
  matchScore, 
  onApply, 
  onViewDetails, 
  applied = false 
}: JobCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-success text-success-foreground";
    if (score >= 75) return "bg-primary text-primary-foreground";
    if (score >= 60) return "bg-warning text-warning-foreground";
    return "bg-destructive text-destructive-foreground";
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "entry":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "junior":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "mid":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "senior":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg hover:text-primary cursor-pointer" 
                      onClick={() => onViewDetails?.(job.id)}>
              {job.title}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{job.companyName || "Company"}</span>
              {job.location && (
                <>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </>
              )}
              {job.remote && (
                <>
                  <span>•</span>
                  <Badge variant="secondary" className="text-xs">Remote</Badge>
                </>
              )}
            </div>
          </div>
          {matchScore !== undefined && (
            <Badge className={getMatchScoreColor(matchScore)}>
              {matchScore}% Match
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {job.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skillsRequired.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{job.skillsRequired.length - 4} more
            </Badge>
          )}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <Badge className={getExperienceLevelColor(job.experienceLevel)}>
                {job.experienceLevel}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="capitalize">{job.jobType}</span>
            </div>

            {salary && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{salary}</span>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
          </div>
        </div>

        <div className="flex space-x-2">
          {applied ? (
            <Button disabled className="flex-1">
              Applied
            </Button>
          ) : (
            <Button 
              onClick={() => onApply?.(job.id)} 
              className="flex-1"
            >
              Apply Now
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onViewDetails?.(job.id)}
          >
            View Details
          </Button>

          {job.applicationUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
