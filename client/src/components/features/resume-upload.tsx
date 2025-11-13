import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ResumeUploadProps {
  onSuccess?: () => void;
  currentResumeUrl?: string;
}

export default function ResumeUpload({ onSuccess, currentResumeUrl }: ResumeUploadProps) {
  const [targetRole, setTargetRole] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, targetRole }: { file: File; targetRole: string }) => {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetRole", targetRole);

      const response = await apiRequest("POST", "/api/resume/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume Uploaded Successfully",
        description: "Your resume has been analyzed and your skill profile has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/skills/analysis"] });
      onSuccess?.();
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload resume. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Simulate upload progress
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    uploadMutation.mutate({ file, targetRole });
  }, [targetRole, uploadMutation]);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const isUploading = uploadMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Resume Upload & Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentResumeUrl && (
          <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-foreground">Resume already uploaded</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a new resume to update your skill analysis.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="targetRole">Target Role (Optional)</Label>
            <Input
              id="targetRole"
              placeholder="e.g., Frontend Developer, Data Scientist, Product Manager"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specify your target role for more accurate skill gap analysis.
            </p>
          </div>

          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
              ${isUploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
            `}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Processing Resume...</h3>
                  <p className="text-muted-foreground">Our AI is analyzing your skills and experience</p>
                  <Progress value={uploadProgress} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : acceptedFiles.length > 0 ? (
              <div className="space-y-2">
                <CheckCircle className="w-12 h-12 text-success mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">File Selected</h3>
                <p className="text-muted-foreground">{acceptedFiles[0].name}</p>
                <Button onClick={() => uploadMutation.mutate({ file: acceptedFiles[0], targetRole })}>
                  Upload & Analyze
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold text-foreground">
                  {isDragActive ? "Drop your resume here" : "Upload your resume"}
                </h3>
                <p className="text-muted-foreground">
                  Drag & drop your resume here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, DOCX, TXT (max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {!currentResumeUrl && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Why upload your resume?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                  <li>• AI-powered skill gap analysis</li>
                  <li>• Personalized learning path recommendations</li>
                  <li>• Better job matching based on your experience</li>
                  <li>• Track your skill development progress</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
