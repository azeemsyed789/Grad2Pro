import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, Clock, Users, Target, Calendar, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    companyId: string;
    companyName?: string;
    requirements: string[];
    skillsRequired: string[];
    difficulty: string;
    estimatedHours?: number;
    compensation: string;
    maxParticipants?: number;
    currentParticipants: number;
    deadline?: string;
    status: string;
    projectType: string;
    createdAt: string;
  };
  participation?: {
    status: string;
    submissionUrl?: string;
    score?: number;
  };
  onJoin?: (projectId: string) => void;
  onViewDetails?: (projectId: string) => void;
}

export default function ProjectCard({ 
  project, 
  participation, 
  onJoin, 
  onViewDetails 
}: ProjectCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getCompensationColor = (compensation: string) => {
    switch (compensation.toLowerCase()) {
      case "paid":
        return "bg-success text-success-foreground";
      case "credits":
        return "bg-primary text-primary-foreground";
      case "none":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const isDeadlineClose = () => {
    if (!project.deadline) return false;
    const deadline = new Date(project.deadline);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3;
  };

  const isFull = project.maxParticipants && project.currentParticipants >= project.maxParticipants;
  const canJoin = project.status === "active" && !isFull && !participation;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg hover:text-primary cursor-pointer"
                      onClick={() => onViewDetails?.(project.id)}>
              {project.title}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Building className="w-4 h-4" />
              <span>{project.companyName || "Company"}</span>
              <span>•</span>
              <Badge className={getDifficultyColor(project.difficulty)}>
                {project.difficulty}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={getCompensationColor(project.compensation)}>
              {project.compensation === "none" ? "Volunteer" : project.compensation}
            </Badge>
            {participation && (
              <Badge className={getStatusColor(participation.status)}>
                {participation.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {project.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.skillsRequired.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{project.skillsRequired.length - 4} more
            </Badge>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{project.estimatedHours ? `${project.estimatedHours}h` : "Flexible"}</span>
          </div>

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>
              {project.currentParticipants}
              {project.maxParticipants ? `/${project.maxParticipants}` : ""} participants
            </span>
          </div>

          {project.deadline && (
            <div className={`flex items-center space-x-2 ${isDeadlineClose() ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Calendar className="w-4 h-4" />
              <span>
                Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Target className="w-4 h-4" />
            <span className="capitalize">{project.projectType}</span>
          </div>
        </div>

        {participation?.score !== undefined && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">Score: {participation.score}/100</span>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {canJoin ? (
            <Button onClick={() => onJoin?.(project.id)} className="flex-1">
              {isFull ? "Full" : "Join Project"}
            </Button>
          ) : participation ? (
            <Button disabled className="flex-1">
              {participation.status === "completed" ? "Completed" : "Participating"}
            </Button>
          ) : (
            <Button disabled className="flex-1">
              {isFull ? "Full" : project.status === "closed" ? "Closed" : "Unavailable"}
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onViewDetails?.(project.id)}>
            View Details
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-right">
          Posted {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
}
