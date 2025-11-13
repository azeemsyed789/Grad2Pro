import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, CheckCircle, AlertCircle } from "lucide-react";

interface SkillProgressProps {
  skills: Array<{
    id: string;
    name: string;
    currentLevel: string;
    targetLevel?: string;
    progress: number;
    verified: boolean;
  }>;
  onUpdateProgress?: (skillId: string, progress: number) => void;
}

export default function SkillProgress({ skills, onUpdateProgress }: SkillProgressProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "expert":
        return "bg-success text-success-foreground";
      case "advanced":
        return "bg-primary text-primary-foreground";
      case "intermediate":
        return "bg-warning text-warning-foreground";
      case "beginner":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-success";
    if (progress >= 60) return "bg-primary";
    if (progress >= 40) return "bg-warning";
    return "bg-destructive";
  };

  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Skills Tracked Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your skill analysis to start tracking your progress.
            </p>
            <Button>Analyze Skills</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Skill Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {skills.filter(s => s.verified).length}
              </div>
              <div className="text-sm text-muted-foreground">Verified Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(skills.reduce((acc, s) => acc + s.progress, 0) / skills.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {skills.filter(s => s.targetLevel && s.currentLevel !== s.targetLevel).length}
              </div>
              <div className="text-sm text-muted-foreground">Skills to Improve</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-foreground">{skill.name}</h4>
                    {skill.verified ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-warning" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getLevelColor(skill.currentLevel)}>
                      {skill.currentLevel}
                    </Badge>
                    {skill.targetLevel && skill.targetLevel !== skill.currentLevel && (
                      <>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline" className="border-primary text-primary">
                          Target: {skill.targetLevel}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{skill.progress}%</span>
                  </div>
                  <Progress 
                    value={skill.progress} 
                    className="h-2"
                  />
                </div>

                {onUpdateProgress && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateProgress(skill.id, Math.min(100, skill.progress + 10))}
                    >
                      +10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateProgress(skill.id, Math.max(0, skill.progress - 10))}
                    >
                      -10%
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
