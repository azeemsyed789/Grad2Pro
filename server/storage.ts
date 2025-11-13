import {
  users,
  profiles,
  skillAnalyses,
  learningPaths,
  learningResources,
  projects,
  jobs,
  jobApplications,
  assessments,
  companies,
  skills,
  userSkills,
  skillCategories,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type SkillAnalysis,
  type InsertSkillAnalysis,
  type LearningPath,
  type InsertLearningPath,
  type Project,
  type InsertProject,
  type Job,
  type InsertJob,
  type Assessment,
  type InsertAssessment,
  type Company,
  type InsertCompany,
  type Skill,
  type SkillCategory,
  type UserSkill,
  type JobApplication,
  // New evaluation system types
  candidateDemos,
  gamifiedAssessments,
  evaluationSessions,
  demoAttempts,
  gameAttempts,
  evaluationPipelines,
  candidateEvaluations,
  type CandidateDemo,
  type InsertCandidateDemo,
  type GamifiedAssessment,
  type InsertGamifiedAssessment,
  type EvaluationSession,
  type InsertEvaluationSession,
  type DemoAttempt,
  type InsertDemoAttempt,
  type GameAttempt,
  type InsertGameAttempt,
  type EvaluationPipeline,
  type InsertEvaluationPipeline,
  type CandidateEvaluation,
  type InsertCandidateEvaluation,
  type LearningResource,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile operations
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, profile: Partial<InsertProfile>): Promise<Profile>;
  
  // Skill operations
  getSkillCategories(): Promise<SkillCategory[]>;
  getSkills(): Promise<Skill[]>;
  getSkillsByCategory(categoryId: string): Promise<Skill[]>;
  getUserSkills(userId: string): Promise<UserSkill[]>;
  
  // Skill analysis operations
  createSkillAnalysis(analysis: InsertSkillAnalysis): Promise<SkillAnalysis>;
  getLatestSkillAnalysis(userId: string): Promise<SkillAnalysis | undefined>;
  
  // Learning path operations
  createLearningPath(path: InsertLearningPath): Promise<LearningPath>;
  getUserLearningPaths(userId: string): Promise<LearningPath[]>;
  updateLearningPathProgress(pathId: string, progress: number): Promise<void>;
  
  // Learning resources
  getLearningResources(skillIds?: string[]): Promise<any[]>;
  searchLearningResources(query: string): Promise<any[]>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjects(filters?: { companyId?: string; status?: string }): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: { companyId?: string; location?: string; jobType?: string }): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job>;
  
  // Job application operations
  applyToJob(jobId: string, userId: string, application: { coverLetter?: string; matchScore?: number }): Promise<void>;
  getUserJobApplications(userId: string): Promise<JobApplication[]>;
  
  // Assessment operations
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAssessments(): Promise<Assessment[]>;
  getAssessment(id: string): Promise<Assessment | undefined>;
  
  // Company operations
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(userId: string): Promise<Company | undefined>;
  updateCompany(userId: string, updates: Partial<InsertCompany>): Promise<Company>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [newProfile] = await db
      .insert(profiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateProfile(userId: string, profileUpdates: Partial<InsertProfile>): Promise<Profile> {
    const [updatedProfile] = await db
      .update(profiles)
      .set({ ...profileUpdates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Skill operations
  async getSkillCategories(): Promise<SkillCategory[]> {
    return await db.select().from(skillCategories).orderBy(asc(skillCategories.name));
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills).orderBy(asc(skills.name));
  }

  async getSkillsByCategory(categoryId: string): Promise<Skill[]> {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.categoryId, categoryId))
      .orderBy(asc(skills.name));
  }

  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId))
      .orderBy(desc(userSkills.progress));
  }

  // Skill analysis operations
  async createSkillAnalysis(analysis: InsertSkillAnalysis): Promise<SkillAnalysis> {
    const [newAnalysis] = await db
      .insert(skillAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getLatestSkillAnalysis(userId: string): Promise<SkillAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(skillAnalyses)
      .where(eq(skillAnalyses.userId, userId))
      .orderBy(desc(skillAnalyses.createdAt))
      .limit(1);
    return analysis;
  }

  // Learning path operations
  async createLearningPath(path: InsertLearningPath): Promise<LearningPath> {
    const [newPath] = await db
      .insert(learningPaths)
      .values(path)
      .returning();
    return newPath;
  }

  async getUserLearningPaths(userId: string): Promise<LearningPath[]> {
    return await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.userId, userId))
      .orderBy(desc(learningPaths.createdAt));
  }

  async updateLearningPathProgress(pathId: string, progress: number): Promise<void> {
    await db
      .update(learningPaths)
      .set({ progress, updatedAt: new Date() })
      .where(eq(learningPaths.id, pathId));
  }

  // Learning resources
  async getLearningResources(skillIds?: string[]): Promise<LearningResource[]> {
    let query = db.select().from(learningResources);
    
    if (skillIds && skillIds.length > 0) {
      // Filter by skills - this is a simplified approach
      // In a real implementation, you'd want to use array operations
      query = query.orderBy(desc(learningResources.rating));
    }
    
    return await query.limit(50);
  }

  async searchLearningResources(searchQuery: string): Promise<LearningResource[]> {
    return await db
      .select()
      .from(learningResources)
      .where(like(learningResources.title, `%${searchQuery}%`))
      .orderBy(desc(learningResources.rating))
      .limit(20);
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProjects(filters?: { companyId?: string; status?: string }): Promise<Project[]> {
    let conditions = [];
    
    if (filters?.companyId) {
      conditions.push(eq(projects.companyId, filters.companyId));
    }
    
    if (filters?.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    
    let query = db.select().from(projects);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project;
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return newJob;
  }

  async getJobs(filters?: { companyId?: string; location?: string; jobType?: string }): Promise<Job[]> {
    let conditions = [];
    
    if (filters?.companyId) {
      conditions.push(eq(jobs.companyId, filters.companyId));
    }
    
    if (filters?.location) {
      conditions.push(like(jobs.location, `%${filters.location}%`));
    }
    
    if (filters?.jobType) {
      conditions.push(eq(jobs.jobType, filters.jobType));
    }
    
    let query = db.select().from(jobs);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(jobs.postedAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, id));
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job> {
    const [updatedJob] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  // Job application operations
  async applyToJob(jobId: string, userId: string, application: { coverLetter?: string; matchScore?: number }): Promise<void> {
    await db
      .insert(jobApplications)
      .values({
        jobId,
        userId,
        coverLetter: application.coverLetter,
        matchScore: application.matchScore,
      });
  }

  async getUserJobApplications(userId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedAt));
  }

  // Assessment operations
  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getAssessments(): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.isActive, true))
      .orderBy(asc(assessments.title));
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id));
    return assessment;
  }

  // Company operations
  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db
      .insert(companies)
      .values(company)
      .returning();
    return newCompany;
  }

  async getCompany(userId: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId));
    return company;
  }

  async updateCompany(userId: string, updates: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.userId, userId))
      .returning();
    return updatedCompany;
  }
}

export const storage = new DatabaseStorage();
