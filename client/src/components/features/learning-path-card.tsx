import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Clock, Target, PlayCircle, CheckCircle } from "lucide-react";

interface LearningPathCardProps {
  learningPath: {
    id: string;
    title: string;
    description: string;
    targetRole?: string;
    estimatedDuration?: string;
    progress: number;
    status: string;
    skillIds: string[];
    resourceIds: string[];
    createdAt: string;
  };
  onContinue?: (pathId: string) => void;
  onViewDetails?: (pathId: string) => void;
}

export default function LearningPathCard({ 
  learningPath, 
  onContinue, 
  onViewDetails 
}: LearningPathCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "completed":
        return "bg-success text-success-foreground";
      case "paused":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-success";
    if (progress >= 75) return "bg-primary";
    if (progress >= 50) return "bg-warning";
    return "bg-secondary";
  };

  const isCompleted = learningPath.progress >= 100 || learningPath.status === "completed";
  const canContinue = learningPath.status === "active" && !isCompleted;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg hover:text-primary cursor-pointer"
                      onClick={() => onViewDetails?.(learningPath.id)}>
              {learningPath.title}
            </CardTitle>
            {learningPath.targetRole && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Target: {learningPath.targetRole}</span>
              </div>
            )}
          </div>
          <Badge className={getStatusColor(learningPath.status)}>
            {learningPath.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {learningPath.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {learningPath.progress}% Complete
            </span>
          </div>
          <Progress 
            value={learningPath.progress} 
            className="h-2"
          />
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{learningPath.estimatedDuration || "Self-paced"}</span>
          </div>

          <div className="flex items-center space-x-2 text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>{learningPath.resourceIds.length} resources</span>
          </div>
        </div>

        {/* Skills covered */}
        {learningPath.skillIds.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Skills Covered</h4>
            <div className="flex flex-wrap gap-1">
              {learningPath.skillIds.slice(0, 3).map((skillId, index) => (
                <Badge key={skillId} variant="outline" className="text-xs">
                  Skill {index + 1}
                </Badge>
              ))}
              {learningPath.skillIds.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{learningPath.skillIds.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          {canContinue ? (
            <Button onClick={() => onContinue?.(learningPath.id)} className="flex-1">
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          ) : isCompleted ? (
            <Button disabled className="flex-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => onContinue?.(learningPath.id)} 
              className="flex-1"
            >
              Resume Path
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onViewDetails?.(learningPath.id)}>
            View Details
          </Button>
        </div>

        {isCompleted && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">
                Congratulations! You've completed this learning path.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
