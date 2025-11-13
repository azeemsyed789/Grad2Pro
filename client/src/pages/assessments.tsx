import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/navbar";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Award, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Trophy,
  BookOpen,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Filter
} from "lucide-react";

interface Question {
  id: string;
  type: "multiple-choice" | "coding" | "essay";
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  type: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
  skillIds: string[];
  isActive: boolean;
}

export default function Assessments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments"],
    enabled: isAuthenticated,
  });

  const { data: myAttempts } = useQuery({
    queryKey: ["/api/assessment-attempts"],
    enabled: isAuthenticated,
  });

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (assessmentStarted && timeRemaining > 0 && !assessmentCompleted) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [assessmentStarted, timeRemaining, assessmentCompleted]);

  const submitAssessmentMutation = useMutation({
    mutationFn: async ({ assessmentId, answers }: { assessmentId: string; answers: any }) => {
      const response = await apiRequest("POST", `/api/assessments/${assessmentId}/submit`, { answers });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment Completed",
        description: `You scored ${data.score}%! ${data.passed ? "Congratulations, you passed!" : "Better luck next time."}`,
        variant: data.passed ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessment-attempts"] });
      setAssessmentCompleted(true);
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
        title: "Submission Failed",
        description: error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStartAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(assessment.timeLimit * 60); // Convert minutes to seconds
    setAssessmentStarted(true);
    setAssessmentCompleted(false);
    setIsDialogOpen(true);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (selectedAssessment && currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    if (selectedAssessment) {
      submitAssessmentMutation.mutate({
        assessmentId: selectedAssessment.id,
        answers,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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

  const getAttemptForAssessment = (assessmentId: string) => {
    return myAttempts?.find((attempt: any) => attempt.assessmentId === assessmentId);
  };

  // Filter assessments
  const filteredAssessments = assessments?.filter((assessment: Assessment) => {
    const matchesDifficulty = difficultyFilter === "all" || assessment.difficulty === difficultyFilter;
    const matchesType = typeFilter === "all" || assessment.type === typeFilter;
    return matchesDifficulty && matchesType && assessment.isActive;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading assessments...</p>
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
            <div>
              <h1 className="text-3xl font-bold text-foreground">Skill Assessments</h1>
              <p className="text-muted-foreground">
                Test and verify your skills with AI-powered assessments and earn certificates.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Award className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {assessments?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Available Tests</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {myAttempts?.filter((attempt: any) => attempt.passed).length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Passed</p>
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
                        {myAttempts?.length > 0 
                          ? Math.round(myAttempts.reduce((acc: number, attempt: any) => acc + attempt.score, 0) / myAttempts.length)
                          : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-8 h-8 text-secondary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {myAttempts?.reduce((acc: number, attempt: any) => acc + (attempt.timeSpent || 0), 0) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Minutes Tested</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
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

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDifficultyFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessments Grid */}
          {assessmentsLoading ? (
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
          ) : !filteredAssessments || filteredAssessments.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <Award className="w-16 h-16 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">No Assessments Available</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    No assessments match your current filters. Try adjusting your criteria.
                  </p>
                  <Button variant="outline" onClick={() => {
                    setDifficultyFilter("all");
                    setTypeFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssessments.map((assessment: Assessment) => {
                const attempt = getAttemptForAssessment(assessment.id);
                return (
                  <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assessment.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getDifficultyColor(assessment.difficulty)}>
                              {assessment.difficulty}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {assessment.type}
                            </Badge>
                          </div>
                        </div>
                        {attempt && (
                          <Badge variant={attempt.passed ? "default" : "secondary"}>
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {assessment.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{assessment.timeLimit} min</span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Target className="w-4 h-4" />
                          <span>{assessment.passingScore}% to pass</span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <BookOpen className="w-4 h-4" />
                          <span>{assessment.questions.length} questions</span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Award className="w-4 h-4" />
                          <span>{assessment.skillIds.length} skills</span>
                        </div>
                      </div>

                      {attempt && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Previous Score</span>
                            <Badge variant={attempt.passed ? "default" : "secondary"}>
                              {attempt.score}%
                            </Badge>
                          </div>
                          <Progress value={attempt.score} className="h-2" />
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleStartAssessment(assessment)}
                          className="flex-1"
                          disabled={submitAssessmentMutation.isPending}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {attempt ? "Retake" : "Start"} Assessment
                        </Button>
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Assessment Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedAssessment?.title}</span>
                  {assessmentStarted && !assessmentCompleted && (
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(timeRemaining)}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              {selectedAssessment && assessmentStarted && !assessmentCompleted && (
                <div className="space-y-6">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}</span>
                      <span>{Math.round(((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100)}% Complete</span>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100} />
                  </div>

                  {/* Current Question */}
                  {selectedAssessment.questions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-medium text-foreground mb-2">
                          {selectedAssessment.questions[currentQuestionIndex].question}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {selectedAssessment.questions[currentQuestionIndex].points} points
                        </Badge>
                      </div>

                      {/* Answer Input */}
                      {selectedAssessment.questions[currentQuestionIndex].type === "multiple-choice" && (
                        <RadioGroup
                          value={answers[selectedAssessment.questions[currentQuestionIndex].id] || ""}
                          onValueChange={(value) => handleAnswerChange(selectedAssessment.questions[currentQuestionIndex].id, value)}
                        >
                          {selectedAssessment.questions[currentQuestionIndex].options?.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <RadioGroupItem value={option} id={`option-${index}`} />
                              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {selectedAssessment.questions[currentQuestionIndex].type === "essay" && (
                        <Textarea
                          placeholder="Type your answer here..."
                          value={answers[selectedAssessment.questions[currentQuestionIndex].id] || ""}
                          onChange={(e) => handleAnswerChange(selectedAssessment.questions[currentQuestionIndex].id, e.target.value)}
                          rows={6}
                        />
                      )}

                      {selectedAssessment.questions[currentQuestionIndex].type === "coding" && (
                        <div className="space-y-2">
                          <Label>Write your code solution:</Label>
                          <Textarea
                            placeholder="// Write your code here..."
                            value={answers[selectedAssessment.questions[currentQuestionIndex].id] || ""}
                            onChange={(e) => handleAnswerChange(selectedAssessment.questions[currentQuestionIndex].id, e.target.value)}
                            rows={10}
                            className="font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex space-x-2">
                      {currentQuestionIndex === selectedAssessment.questions.length - 1 ? (
                        <Button
                          onClick={handleSubmitAssessment}
                          disabled={submitAssessmentMutation.isPending}
                        >
                          {submitAssessmentMutation.isPending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Assessment"
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextQuestion}
                          disabled={currentQuestionIndex === selectedAssessment.questions.length - 1}
                        >
                          Next
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {assessmentCompleted && (
                <div className="text-center space-y-4 py-8">
                  <Trophy className="w-16 h-16 text-warning mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">Assessment Completed!</h3>
                  <p className="text-muted-foreground">
                    Your results have been saved and you can view them in your profile.
                  </p>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
