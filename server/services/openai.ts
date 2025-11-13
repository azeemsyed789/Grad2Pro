import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "placeholder-for-development"
});

interface SkillGapAnalysis {
  detectedSkills: Array<{
    name: string;
    level: string;
    confidence: number;
  }>;
  skillGaps: Array<{
    skill: string;
    importance: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
  overallScore: number;
  careerReadiness: string;
}

export async function analyzeResumeSkills(
  resumeText: string,
  targetRole?: string
): Promise<SkillGapAnalysis> {
  try {
    const prompt = `
Analyze the following resume and identify skills, gaps, and recommendations for ${targetRole || 'professional development'}.

Resume Text:
${resumeText}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "detectedSkills": [
    {
      "name": "skill name",
      "level": "beginner|intermediate|advanced|expert",
      "confidence": 0.8
    }
  ],
  "skillGaps": [
    {
      "skill": "missing skill name",
      "importance": "critical|high|medium|low",
      "recommendation": "specific learning recommendation"
    }
  ],
  "recommendations": [
    {
      "type": "course|project|certification|practice",
      "title": "recommendation title",
      "description": "detailed description",
      "priority": "high|medium|low"
    }
  ],
  "overallScore": 75,
  "careerReadiness": "assessment of readiness for target role"
}

Focus on:
- Technical skills (programming languages, tools, frameworks)
- Soft skills (communication, leadership, teamwork)
- Industry-specific skills
- Experience level indicators
- Areas for improvement
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor and technical recruiter with deep knowledge of industry skill requirements. Provide detailed, actionable analysis of resumes and skill gaps."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as SkillGapAnalysis;
  } catch (error) {
    console.error("Error analyzing resume skills:", error);
    throw new Error("Failed to analyze resume skills: " + (error as Error).message);
  }
}

interface LearningPathRecommendation {
  title: string;
  description: string;
  estimatedDuration: string;
  resources: Array<{
    title: string;
    type: string;
    provider: string;
    url: string;
    difficulty: string;
    estimatedHours: number;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    skills: string[];
  }>;
}

export async function generateLearningPath(
  skillGaps: any[],
  targetRole: string,
  currentLevel: string = "beginner"
): Promise<LearningPathRecommendation> {
  try {
    const prompt = `
Create a personalized learning path for someone targeting the role of "${targetRole}" with current level "${currentLevel}".

Skill gaps to address:
${JSON.stringify(skillGaps, null, 2)}

Generate a comprehensive learning path in JSON format:
{
  "title": "Learning path title",
  "description": "Overview of the learning journey",
  "estimatedDuration": "3-6 months",
  "resources": [
    {
      "title": "Course/Resource title",
      "type": "course|video|article|project|book",
      "provider": "Udemy|Coursera|YouTube|FreeCodeCamp|etc",
      "url": "placeholder-url",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": 20
    }
  ],
  "milestones": [
    {
      "title": "Milestone name",
      "description": "What to achieve",
      "skills": ["skill1", "skill2"]
    }
  ]
}

Focus on:
- Practical, hands-on learning
- Progressive skill building
- Real-world applications
- Mix of free and premium resources
- Clear progression path
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert learning strategist who creates comprehensive, personalized learning paths for career development. Recommend practical, industry-relevant resources and create clear learning progressions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as LearningPathRecommendation;
  } catch (error) {
    console.error("Error generating learning path:", error);
    throw new Error("Failed to generate learning path: " + (error as Error).message);
  }
}

export async function calculateJobMatch(
  userSkills: any[],
  jobRequirements: string[],
  jobDescription: string
): Promise<{ score: number; analysis: string; recommendations: string[] }> {
  try {
    const prompt = `
Calculate job match score and provide analysis.

User Skills:
${JSON.stringify(userSkills, null, 2)}

Job Requirements:
${JSON.stringify(jobRequirements, null, 2)}

Job Description:
${jobDescription}

Provide analysis in JSON format:
{
  "score": 85,
  "analysis": "Detailed match analysis explaining strengths and gaps",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ]
}

Score should be 0-100 based on:
- Direct skill matches (40%)
- Related/transferable skills (30%)
- Experience level alignment (20%)
- Cultural/soft skill fit (10%)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional recruiter and career matching expert. Provide accurate job-candidate fit analysis with actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error calculating job match:", error);
    throw new Error("Failed to calculate job match: " + (error as Error).message);
  }
}

export async function evaluateProjectSubmission(
  projectDescription: string,
  submissionText: string,
  submissionUrl?: string
): Promise<{ score: number; feedback: string; strengths: string[]; improvements: string[] }> {
  try {
    const prompt = `
Evaluate a project submission against the project requirements.

Project Description:
${projectDescription}

Submission Text:
${submissionText}

${submissionUrl ? `Submission URL: ${submissionUrl}` : ''}

Provide evaluation in JSON format:
{
  "score": 85,
  "feedback": "Comprehensive feedback on the submission",
  "strengths": [
    "What was done well",
    "Strong points"
  ],
  "improvements": [
    "Areas for improvement",
    "Suggestions for enhancement"
  ]
}

Evaluation criteria:
- Completeness (25%)
- Technical quality (25%)
- Creativity/Innovation (20%)
- Documentation/Presentation (15%)
- Problem-solving approach (15%)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced project evaluator and mentor. Provide constructive, detailed feedback that helps improve skills and performance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error evaluating project submission:", error);
    throw new Error("Failed to evaluate project submission: " + (error as Error).message);
  }
}
