# Grad2Pro - Career Transition Platform

## Overview

Grad2Pro is a full-stack web platform designed to help fresh graduates and early job seekers transition into professional careers. The platform identifies skill gaps, provides AI-curated learning paths, connects users with real-world projects, and facilitates job matching with companies. It bridges the gap between academic learning and industry requirements through intelligent analysis and personalized recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and bundling
- **UI Components**: Comprehensive set of Radix UI-based components for consistent design

**Rationale**: React provides a robust component-based architecture, while TailwindCSS ensures rapid UI development with consistent styling. TanStack Query handles complex server state synchronization efficiently.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Session Management**: Express sessions with PostgreSQL storage
- **File Handling**: Multer for resume uploads and document processing
- **Error Handling**: Centralized error middleware with structured logging

**Rationale**: Express.js offers flexibility and extensive middleware ecosystem. TypeScript ensures type safety across the full stack.

### Authentication Strategy
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with secure flags for production

**Rationale**: Replit Auth provides seamless integration with the deployment environment while maintaining security standards.

## Key Components

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless driver
- **Migrations**: Schema versioning through drizzle-kit
- **Connection**: Connection pooling for optimal performance

**Schema Design**:
- User management (users, profiles, sessions)
- Skill tracking (skills, userSkills, skillCategories, skillAnalyses)
- Learning system (learningPaths, learningResources)
- Project management (projects, companies)
- Job matching (jobs, jobApplications)
- Assessment system (assessments)

### AI Integration
- **Provider**: OpenAI GPT-4o for natural language processing
- **Use Cases**: Resume analysis, skill gap identification, learning path generation, job matching
- **Services**: Dedicated service layer for AI operations (skillAnalysis.ts, openai.ts)

**Rationale**: OpenAI provides reliable AI capabilities for text analysis and content generation. Service abstraction allows for easy provider switching if needed.

### File Processing
- **Storage**: File upload handling with validation
- **Formats**: PDF, DOC, DOCX, and TXT support for resumes
- **Limits**: 5MB file size limit for optimal performance
- **Security**: File type validation and sanitization

## Data Flow

1. **User Onboarding**: Registration via Replit Auth → Profile creation → Resume upload
2. **Skill Analysis**: Resume processing → AI analysis → Skill gap identification → Recommendation generation
3. **Learning Path**: AI-generated curriculum → Resource curation → Progress tracking
4. **Project Engagement**: Company-posted projects → User participation → Skill validation
5. **Job Matching**: Profile analysis → Job compatibility scoring → Application facilitation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Database operations and type safety
- **openai**: AI-powered analysis and recommendations
- **@tanstack/react-query**: Client-side data fetching and caching
- **multer**: File upload handling

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form state management and validation
- **zod**: Runtime type validation

### Development Dependencies
- **vite**: Development server and build tool
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Server**: Development server with hot reloading via Vite
- **Database**: Neon PostgreSQL with environment-based configuration
- **Build Process**: Concurrent client and server builds

### Production Build
- **Client**: Static asset generation via Vite
- **Server**: ESM bundle generation via esbuild
- **Optimization**: Tree shaking and code splitting for optimal performance

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **AI Services**: `OPENAI_API_KEY` for AI functionality
- **Authentication**: `SESSION_SECRET` and Replit-specific variables
- **Deployment**: Platform-agnostic design with Replit optimization

**Rationale**: The deployment strategy supports both development flexibility and production performance, with clear separation between client and server builds.

### Key Architectural Benefits
1. **Type Safety**: Full-stack TypeScript ensures consistent data flow
2. **Scalability**: Modular architecture supports feature expansion
3. **Performance**: Optimized queries and efficient state management
4. **Security**: Proper session handling and input validation
5. **Maintainability**: Clear separation of concerns and service abstraction