import { storage } from "../storage";
import { analyzeResumeSkills, generateLearningPath } from "./openai";
import type { InsertSkillAnalysis, InsertLearningPath } from "@shared/schema";

export async function performSkillAnalysis(
  userId: string,
  resumeText: string,
  targetRole?: string
): Promise<void> {
  try {
    // Perform AI analysis
    const analysis = await analyzeResumeSkills(resumeText, targetRole);
    
    // Store analysis results
    const skillAnalysisData: InsertSkillAnalysis = {
      userId,
      resumeText,
      detectedSkills: analysis.detectedSkills,
      skillGaps: analysis.skillGaps,
      recommendations: analysis.recommendations,
      overallScore: analysis.overallScore,
      analysisData: analysis,
    };
    
    await storage.createSkillAnalysis(skillAnalysisData);
    
    // Generate learning path based on skill gaps
    if (analysis.skillGaps.length > 0) {
      const learningPath = await generateLearningPath(
        analysis.skillGaps,
        targetRole || "Professional Development",
        "beginner"
      );
      
      const learningPathData: InsertLearningPath = {
        userId,
        title: learningPath.title,
        description: learningPath.description,
        targetRole: targetRole || "General",
        skillIds: [], // Would be populated based on detected skills
        resourceIds: [], // Would be populated after creating resources
        estimatedDuration: learningPath.estimatedDuration,
        progress: 0,
        status: "active",
      };
      
      await storage.createLearningPath(learningPathData);
    }
    
    console.log(`Skill analysis completed for user ${userId}`);
  } catch (error) {
    console.error("Error performing skill analysis:", error);
    throw error;
  }
}

export async function updateUserSkillProgress(
  userId: string,
  skillId: string,
  progress: number
): Promise<void> {
  try {
    // This would update the user's skill progress
    // Implementation would depend on the specific requirements
    console.log(`Updating skill progress for user ${userId}: skill ${skillId} to ${progress}%`);
  } catch (error) {
    console.error("Error updating skill progress:", error);
    throw error;
  }
}

export async function generatePersonalizedRecommendations(
  userId: string
): Promise<any[]> {
  try {
    // Get user's latest skill analysis
    const analysis = await storage.getLatestSkillAnalysis(userId);
    
    if (!analysis) {
      return [];
    }
    
    // Get learning resources based on skill gaps
    const skillGaps = analysis.skillGaps as any[] || [];
    const skillIds = skillGaps.map((gap: any) => gap.skill);
    
    const resources = await storage.getLearningResources(skillIds);
    
    return resources.slice(0, 10); // Return top 10 recommendations
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    return [];
  }
}

export async function assessSkillLevel(
  userId: string,
  skillName: string,
  assessmentData: any
): Promise<{ level: string; score: number; feedback: string }> {
  try {
    // This would be expanded to use AI for skill assessment
    // For now, return a basic assessment
    
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
    
    let level = "beginner";
    if (baseScore >= 90) level = "expert";
    else if (baseScore >= 75) level = "advanced";
    else if (baseScore >= 60) level = "intermediate";
    
    return {
      level,
      score: baseScore,
      feedback: `Based on your assessment, you demonstrate ${level} level skills in ${skillName}.`
    };
  } catch (error) {
    console.error("Error assessing skill level:", error);
    throw error;
  }
}
