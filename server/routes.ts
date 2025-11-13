import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { performSkillAnalysis, generatePersonalizedRecommendations } from "./services/skillAnalysis";
import { calculateJobMatch, evaluateProjectSubmission } from "./services/openai";
import { insertProfileSchema, insertProjectSchema, insertJobSchema, insertCompanySchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and common document formats
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  if (process.env.NODE_ENV === 'production') {
    await setupAuth(app);
  } else {
    // In development, skip authentication
    app.use((req, res, next) => next());
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    if (process.env.NODE_ENV !== 'production') {
      // Return a mock user in development
      return res.json({
        id: 'dev-user',
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User',
        userType: 'graduate',
      });
    }
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertProfileSchema.parse({ ...req.body, userId });
      
      const existingProfile = await storage.getProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateProfile(userId, profileData);
      } else {
        profile = await storage.createProfile(profileData);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error creating/updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save profile" });
    }
  });

  // Resume upload and analysis
  app.post('/api/resume/upload', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No resume file provided" });
      }
      
      // Convert buffer to text (simplified - in production, use proper PDF/DOC parsing)
      const resumeText = file.buffer.toString('utf-8');
      const targetRole = req.body.targetRole || undefined;
      
      // Store file URL (in production, upload to cloud storage)
      const resumeUrl = `uploads/resumes/${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;
      
      // Update profile with resume URL
      await storage.updateProfile(userId, { resumeUrl });
      
      // Perform skill analysis
      await performSkillAnalysis(userId, resumeText, targetRole);
      
      res.json({ message: "Resume uploaded and analyzed successfully", resumeUrl });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload and analyze resume" });
    }
  });

  // Skill analysis routes
  app.get('/api/skills/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analysis = await storage.getLatestSkillAnalysis(userId);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching skill analysis:", error);
      res.status(500).json({ message: "Failed to fetch skill analysis" });
    }
  });

  app.get('/api/skills/categories', async (req, res) => {
    try {
      const categories = await storage.getSkillCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching skill categories:", error);
      res.status(500).json({ message: "Failed to fetch skill categories" });
    }
  });

  app.get('/api/skills', async (req, res) => {
    try {
      const { categoryId } = req.query;
      let skills;
      
      if (categoryId) {
        skills = await storage.getSkillsByCategory(categoryId as string);
      } else {
        skills = await storage.getSkills();
      }
      
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.get('/api/user-skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userSkills = await storage.getUserSkills(userId);
      res.json(userSkills);
    } catch (error) {
      console.error("Error fetching user skills:", error);
      res.status(500).json({ message: "Failed to fetch user skills" });
    }
  });

  // Learning path routes
  app.get('/api/learning-paths', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paths = await storage.getUserLearningPaths(userId);
      res.json(paths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });

  app.put('/api/learning-paths/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must be a number between 0 and 100" });
      }
      
      await storage.updateLearningPathProgress(id, progress);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Error updating learning path progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Learning resources
  app.get('/api/learning-resources', async (req, res) => {
    try {
      const { skillIds, search } = req.query;
      
      let resources;
      if (search) {
        resources = await storage.searchLearningResources(search as string);
      } else {
        const skills = skillIds ? (skillIds as string).split(',') : undefined;
        resources = await storage.getLearningResources(skills);
      }
      
      res.json(resources);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ message: "Failed to fetch learning resources" });
    }
  });

  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await generatePersonalizedRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const { companyId, status } = req.query;
      const projects = await storage.getProjects({
        companyId: companyId as string,
        status: status as string,
      });
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'company') {
        return res.status(403).json({ message: "Only companies can create projects" });
      }
      
      const projectData = insertProjectSchema.parse({ ...req.body, companyId: userId });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const { companyId, location, jobType } = req.query;
      const jobs = await storage.getJobs({
        companyId: companyId as string,
        location: location as string,
        jobType: jobType as string,
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'company') {
        return res.status(403).json({ message: "Only companies can create jobs" });
      }
      
      const jobData = insertJobSchema.parse({ ...req.body, companyId: userId });
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const job = await storage.getJob(id);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post('/api/jobs/:id/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: jobId } = req.params;
      const { coverLetter } = req.body;
      
      // Get user skills for match calculation
      const userSkills = await storage.getUserSkills(userId);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Calculate match score
      const matchResult = await calculateJobMatch(
        userSkills,
        job.skillsRequired || [],
        job.description
      );
      
      await storage.applyToJob(jobId, userId, {
        coverLetter,
        matchScore: matchResult.score,
      });
      
      res.json({ 
        message: "Application submitted successfully", 
        matchScore: matchResult.score 
      });
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to apply to job" });
    }
  });

  app.get('/api/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserJobApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Assessment routes
  app.get('/api/assessments', async (req, res) => {
    try {
      const assessments = await storage.getAssessments();
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.get('/api/assessments/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  // Company routes
  app.get('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const company = await storage.getCompany(userId);
      res.json(company);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.post('/api/company/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'company') {
        return res.status(403).json({ message: "Only company users can create company profiles" });
      }
      
      const companyData = insertCompanySchema.parse({ ...req.body, userId });
      
      const existingCompany = await storage.getCompany(userId);
      
      let company;
      if (existingCompany) {
        company = await storage.updateCompany(userId, companyData);
      } else {
        company = await storage.createCompany(companyData);
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error creating/updating company profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save company profile" });
    }
  });

  // Project submission evaluation (for companies)
  app.post('/api/projects/:id/evaluate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: projectId } = req.params;
      const { submissionText, submissionUrl } = req.body;
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.companyId !== userId) {
        return res.status(403).json({ message: "Not authorized to evaluate this project" });
      }
      
      const evaluation = await evaluateProjectSubmission(
        project.description,
        submissionText,
        submissionUrl
      );
      
      res.json(evaluation);
    } catch (error) {
      console.error("Error evaluating project submission:", error);
      res.status(500).json({ message: "Failed to evaluate submission" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
