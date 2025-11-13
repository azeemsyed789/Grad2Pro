import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default("graduate"), // graduate, company, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles with additional career information
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resumeUrl: text("resume_url"),
  careerGoals: text("career_goals"),
  desiredRole: varchar("desired_role"),
  experience: varchar("experience"), // entry, junior, mid, senior
  location: varchar("location"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  skills: text("skills").array(),
  bio: text("bio"),
  profileCompletion: integer("profile_completion").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skill categories and definitions
export const skillCategories = pgTable("skill_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // technical, soft, industry
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual skills within categories
export const skills = pgTable("skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  categoryId: varchar("category_id").notNull().references(() => skillCategories.id),
  description: text("description"),
  level: varchar("level"), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at").defaultNow(),
});

// User skill assessments and progress
export const userSkills = pgTable("user_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: varchar("skill_id").notNull().references(() => skills.id),
  currentLevel: varchar("current_level").notNull(), // beginner, intermediate, advanced, expert
  targetLevel: varchar("target_level"),
  progress: integer("progress").default(0), // 0-100
  verified: boolean("verified").default(false),
  lastAssessedAt: timestamp("last_assessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI-generated skill gap analysis results
export const skillAnalyses = pgTable("skill_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resumeText: text("resume_text"),
  detectedSkills: jsonb("detected_skills"), // Array of skills found in resume
  skillGaps: jsonb("skill_gaps"), // Skills missing for target roles
  recommendations: jsonb("recommendations"), // AI recommendations
  overallScore: integer("overall_score"), // 0-100
  analysisData: jsonb("analysis_data"), // Raw AI analysis results
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning resources and courses
export const learningResources = pgTable("learning_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  provider: varchar("provider"), // udemy, coursera, youtube, etc.
  type: varchar("type"), // course, video, article, tutorial
  skillIds: text("skill_ids").array(),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  duration: varchar("duration"), // estimated time to complete
  rating: decimal("rating", { precision: 3, scale: 2 }),
  cost: varchar("cost"), // free, paid, subscription
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personalized learning paths for users
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  targetRole: varchar("target_role"),
  skillIds: text("skill_ids").array(),
  resourceIds: text("resource_ids").array(),
  estimatedDuration: varchar("estimated_duration"),
  progress: integer("progress").default(0), // 0-100
  status: varchar("status").default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress on learning resources
export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  resourceId: varchar("resource_id").notNull().references(() => learningResources.id),
  pathId: varchar("path_id").references(() => learningPaths.id),
  progress: integer("progress").default(0), // 0-100
  completed: boolean("completed").default(false),
  timeSpent: integer("time_spent").default(0), // minutes
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real-world projects posted by companies
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  skillsRequired: text("skills_required").array(),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  estimatedHours: integer("estimated_hours"),
  compensation: varchar("compensation"), // none, credits, paid
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  deadline: timestamp("deadline"),
  status: varchar("status").default("active"), // active, closed, completed
  projectType: varchar("project_type"), // simulation, real-project, assessment
  attachments: text("attachments").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User participation in projects
export const projectParticipants = pgTable("project_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").default("applied"), // applied, accepted, rejected, completed
  submissionUrl: text("submission_url"),
  submissionText: text("submission_text"),
  score: integer("score"), // 0-100
  feedback: text("feedback"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job and internship listings
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").array(),
  skillsRequired: text("skills_required").array(),
  location: varchar("location"),
  jobType: varchar("job_type"), // full-time, part-time, internship, contract
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  experienceLevel: varchar("experience_level"), // entry, junior, mid, senior
  remote: boolean("remote").default(false),
  applicationUrl: text("application_url"),
  status: varchar("status").default("active"), // active, closed, filled
  postedAt: timestamp("posted_at").defaultNow(),
  closesAt: timestamp("closes_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User applications to jobs
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").default("applied"), // applied, reviewed, interview, rejected, accepted
  matchScore: integer("match_score"), // 0-100 AI calculated match
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skill assessments and tests
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  skillIds: text("skill_ids").array(),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced
  type: varchar("type"), // multiple-choice, coding, project, essay
  questions: jsonb("questions"), // Array of question objects
  timeLimit: integer("time_limit"), // minutes
  passingScore: integer("passing_score"), // 0-100
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User assessment attempts and results
export const assessmentAttempts = pgTable("assessment_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").notNull().references(() => assessments.id),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  answers: jsonb("answers"), // User's submitted answers
  score: integer("score"), // 0-100
  passed: boolean("passed").default(false),
  timeSpent: integer("time_spent"), // minutes
  feedback: text("feedback"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company profiles and information
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name").notNull(),
  description: text("description"),
  industry: varchar("industry"),
  size: varchar("size"), // startup, small, medium, large, enterprise
  location: varchar("location"),
  website: text("website"),
  logoUrl: text("logo_url"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template automation workflows for companies
export const evaluationTemplates = pgTable("evaluation_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type"), // resume-only, resume-notify, resume-test-auto
  workflow: jsonb("workflow"), // Template configuration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interactive demos for candidate evaluation
export const candidateDemos = pgTable("candidate_demos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type"), // coding-challenge, design-task, presentation, simulation
  difficulty: varchar("difficulty"), // easy, medium, hard, expert
  timeLimit: integer("time_limit"), // minutes
  skillsRequired: text("skills_required").array(),
  instructions: text("instructions"),
  demoData: jsonb("demo_data"), // Demo configuration and content
  evaluationCriteria: jsonb("evaluation_criteria"), // Scoring criteria
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gamified assessments for skills evaluation
export const gamifiedAssessments = pgTable("gamified_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  gameType: varchar("game_type"), // puzzle-solving, scenario-based, strategy, simulation
  skillsEvaluated: text("skills_evaluated").array(),
  difficulty: varchar("difficulty"), // beginner, intermediate, advanced, expert
  estimatedDuration: integer("estimated_duration"), // minutes
  gameConfig: jsonb("game_config"), // Game mechanics and rules  
  scoringSystem: jsonb("scoring_system"), // How scores are calculated
  levels: jsonb("levels"), // Game levels/stages
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidate evaluation sessions
export const evaluationSessions = pgTable("evaluation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => users.id),
  jobId: varchar("job_id").references(() => jobs.id),
  sessionType: varchar("session_type"), // demo, gamified, hybrid
  status: varchar("status").default("pending"), // pending, in-progress, completed, cancelled
  overallScore: integer("overall_score"), // 0-100
  feedback: text("feedback"),
  nextSteps: text("next_steps"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual demo attempts within evaluation sessions
export const demoAttempts = pgTable("demo_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => evaluationSessions.id, { onDelete: "cascade" }),
  demoId: varchar("demo_id").notNull().references(() => candidateDemos.id),
  candidateId: varchar("candidate_id").notNull().references(() => users.id),
  status: varchar("status").default("not-started"), // not-started, in-progress, submitted, evaluated
  submissionData: jsonb("submission_data"), // Candidate's work/answers
  evaluationData: jsonb("evaluation_data"), // Automated scoring results
  score: integer("score"), // 0-100
  timeSpent: integer("time_spent"), // minutes
  feedback: text("feedback"),
  startedAt: timestamp("started_at"),
  submittedAt: timestamp("submitted_at"),
  evaluatedAt: timestamp("evaluated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Individual gamified assessment attempts
export const gameAttempts = pgTable("game_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => evaluationSessions.id, { onDelete: "cascade" }),
  gameId: varchar("game_id").notNull().references(() => gamifiedAssessments.id),
  candidateId: varchar("candidate_id").notNull().references(() => users.id),
  status: varchar("status").default("not-started"), // not-started, in-progress, completed
  gameState: jsonb("game_state"), // Current game progress/state
  finalScore: integer("final_score"), // 0-100
  achievementsUnlocked: text("achievements_unlocked").array(),
  levelProgress: jsonb("level_progress"), // Progress per level
  timeSpent: integer("time_spent"), // minutes
  moves: integer("moves"), // For puzzle games
  hints: integer("hints"), // Hints used
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Company candidate evaluation pipelines
export const evaluationPipelines = pgTable("evaluation_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  stages: jsonb("stages"), // Array of evaluation stages
  triggerConditions: jsonb("trigger_conditions"), // When to start pipeline
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Candidate evaluation results and company feedback
export const candidateEvaluations = pgTable("candidate_evaluations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  candidateId: varchar("candidate_id").notNull().references(() => users.id),
  companyId: varchar("company_id").notNull().references(() => users.id),
  jobId: varchar("job_id").references(() => jobs.id),
  pipelineId: varchar("pipeline_id").references(() => evaluationPipelines.id),
  overallScore: integer("overall_score"), // 0-100
  overallRating: varchar("overall_rating"), // poor, fair, good, excellent, outstanding
  skillScores: jsonb("skill_scores"), // Breakdown by skill
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  recommendation: varchar("recommendation"), // reject, maybe, hire, fast-track
  feedback: text("feedback"),
  notes: text("notes"),
  evaluatedBy: varchar("evaluated_by").references(() => users.id),
  evaluatedAt: timestamp("evaluated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  userSkills: many(userSkills),
  skillAnalyses: many(skillAnalyses),
  learningPaths: many(learningPaths),
  learningProgress: many(learningProgress),
  projectParticipants: many(projectParticipants),
  jobApplications: many(jobApplications),
  assessmentAttempts: many(assessmentAttempts),
  postedProjects: many(projects),
  postedJobs: many(jobs),
  evaluationTemplates: many(evaluationTemplates),
  candidateDemos: many(candidateDemos),
  gamifiedAssessments: many(gamifiedAssessments),
  evaluationSessions: many(evaluationSessions),
  evaluationPipelines: many(evaluationPipelines),
  candidateEvaluations: many(candidateEvaluations),
  demoAttempts: many(demoAttempts),
  gameAttempts: many(gameAttempts),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const learningResourcesRelations = relations(learningResources, ({ many }) => ({
  learningProgress: many(learningProgress),
}));

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  user: one(users, {
    fields: [learningPaths.userId],
    references: [users.id],
  }),
  learningProgress: many(learningProgress),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(users, {
    fields: [projects.companyId],
    references: [users.id],
  }),
  participants: many(projectParticipants),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(users, {
    fields: [jobs.companyId],
    references: [users.id],
  }),
  applications: many(jobApplications),
  evaluationSessions: many(evaluationSessions),
}));

// New evaluation system relations
export const candidateDemosRelations = relations(candidateDemos, ({ one, many }) => ({
  company: one(users, {
    fields: [candidateDemos.companyId],
    references: [users.id],
  }),
  demoAttempts: many(demoAttempts),
}));

export const gamifiedAssessmentsRelations = relations(gamifiedAssessments, ({ one, many }) => ({
  company: one(users, {
    fields: [gamifiedAssessments.companyId],
    references: [users.id],
  }),
  gameAttempts: many(gameAttempts),
}));

export const evaluationSessionsRelations = relations(evaluationSessions, ({ one, many }) => ({
  candidate: one(users, {
    fields: [evaluationSessions.candidateId],
    references: [users.id],
  }),
  company: one(users, {
    fields: [evaluationSessions.companyId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [evaluationSessions.jobId],
    references: [jobs.id],
  }),
  demoAttempts: many(demoAttempts),
  gameAttempts: many(gameAttempts),
}));

export const demoAttemptsRelations = relations(demoAttempts, ({ one }) => ({
  session: one(evaluationSessions, {
    fields: [demoAttempts.sessionId],
    references: [evaluationSessions.id],
  }),
  demo: one(candidateDemos, {
    fields: [demoAttempts.demoId],
    references: [candidateDemos.id],
  }),
  candidate: one(users, {
    fields: [demoAttempts.candidateId],
    references: [users.id],
  }),
}));

export const gameAttemptsRelations = relations(gameAttempts, ({ one }) => ({
  session: one(evaluationSessions, {
    fields: [gameAttempts.sessionId],
    references: [evaluationSessions.id],
  }),
  game: one(gamifiedAssessments, {
    fields: [gameAttempts.gameId],
    references: [gamifiedAssessments.id],
  }),
  candidate: one(users, {
    fields: [gameAttempts.candidateId],
    references: [users.id],
  }),
}));

export const evaluationPipelinesRelations = relations(evaluationPipelines, ({ one, many }) => ({
  company: one(users, {
    fields: [evaluationPipelines.companyId],
    references: [users.id],
  }),
  candidateEvaluations: many(candidateEvaluations),
}));

export const candidateEvaluationsRelations = relations(candidateEvaluations, ({ one }) => ({
  candidate: one(users, {
    fields: [candidateEvaluations.candidateId],
    references: [users.id],
  }),
  company: one(users, {
    fields: [candidateEvaluations.companyId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [candidateEvaluations.jobId],
    references: [jobs.id],
  }),
  pipeline: one(evaluationPipelines, {
    fields: [candidateEvaluations.pipelineId],
    references: [evaluationPipelines.id],
  }),
  evaluatedByUser: one(users, {
    fields: [candidateEvaluations.evaluatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  userType: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillAnalysisSchema = createInsertSchema(skillAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateDemoSchema = createInsertSchema(candidateDemos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGamifiedAssessmentSchema = createInsertSchema(gamifiedAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEvaluationSessionSchema = createInsertSchema(evaluationSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDemoAttemptSchema = createInsertSchema(demoAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertGameAttemptSchema = createInsertSchema(gameAttempts).omit({
  id: true,
  createdAt: true,
});

export const insertEvaluationPipelineSchema = createInsertSchema(evaluationPipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCandidateEvaluationSchema = createInsertSchema(candidateEvaluations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type SkillCategory = typeof skillCategories.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type SkillAnalysis = typeof skillAnalyses.$inferSelect;
export type InsertSkillAnalysis = z.infer<typeof insertSkillAnalysisSchema>;
export type LearningResource = typeof learningResources.$inferSelect;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectParticipant = typeof projectParticipants.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type EvaluationTemplate = typeof evaluationTemplates.$inferSelect;

// New evaluation system types
export type CandidateDemo = typeof candidateDemos.$inferSelect;
export type InsertCandidateDemo = z.infer<typeof insertCandidateDemoSchema>;
export type GamifiedAssessment = typeof gamifiedAssessments.$inferSelect;
export type InsertGamifiedAssessment = z.infer<typeof insertGamifiedAssessmentSchema>;
export type EvaluationSession = typeof evaluationSessions.$inferSelect;
export type InsertEvaluationSession = z.infer<typeof insertEvaluationSessionSchema>;
export type DemoAttempt = typeof demoAttempts.$inferSelect;
export type InsertDemoAttempt = z.infer<typeof insertDemoAttemptSchema>;
export type GameAttempt = typeof gameAttempts.$inferSelect;
export type InsertGameAttempt = z.infer<typeof insertGameAttemptSchema>;
export type EvaluationPipeline = typeof evaluationPipelines.$inferSelect;
export type InsertEvaluationPipeline = z.infer<typeof insertEvaluationPipelineSchema>;
export type CandidateEvaluation = typeof candidateEvaluations.$inferSelect;
export type InsertCandidateEvaluation = z.infer<typeof insertCandidateEvaluationSchema>;
