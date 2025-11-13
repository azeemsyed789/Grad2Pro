import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Brain, Route, Handshake, Upload, Search, ProjectorIcon, Building, CheckCircle, Star } from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/auth";
  };

  const handleSignIn = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-foreground">Grad2Pro</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a>
                <a href="#companies" className="text-muted-foreground hover:text-primary transition-colors">For Companies</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleSignIn} className="text-muted-foreground hover:text-primary">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Free
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Bridge Your <span className="text-primary">Skills</span> to <span className="text-secondary">Success</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Transform from graduate to professional with AI-powered skill analysis, personalized learning paths, and real-world project experience.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleGetStarted} className="bg-primary text-primary-foreground hover:bg-primary/90 transform hover:scale-105 transition-all">
                  Analyze My Skills
                </Button>
                <Button size="lg" variant="outline" className="border-2 hover:border-primary hover:text-primary">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span>AI-powered analysis</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">AI Skill Analysis</h3>
                      <p className="text-sm text-muted-foreground">Advanced resume analysis</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">React.js</span>
                      <Badge variant="secondary">85%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Communication</span>
                      <Badge className="bg-success text-success-foreground">92%</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm font-medium text-foreground">92% Skill Match</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 hidden lg:block">
                <div className="flex items-center space-x-2">
                  <ProjectorIcon className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">3 Jobs Found</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15,000+</div>
              <div className="text-muted-foreground mt-1">Graduates Placed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">500+</div>
              <div className="text-muted-foreground mt-1">Partner Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">85%</div>
              <div className="text-muted-foreground mt-1">Job Match Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">4.9/5</div>
              <div className="text-muted-foreground mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How Grad2Pro Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Our AI-powered platform guides you through a comprehensive career transformation process</p>
          </div>
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Upload className="text-primary-foreground w-6 h-6" />
              </div>
              <div className="text-xl font-semibold text-foreground">1. Upload Resume</div>
              <p className="text-muted-foreground">Upload your resume and set career goals. Our AI analyzes your background and aspirations.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Search className="text-secondary-foreground w-6 h-6" />
              </div>
              <div className="text-xl font-semibold text-foreground">2. Skill Gap Analysis</div>
              <p className="text-muted-foreground">Get detailed analysis of skill gaps compared to industry requirements and job market trends.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto">
                <Route className="text-success-foreground w-6 h-6" />
              </div>
              <div className="text-xl font-semibold text-foreground">3. Learning Path</div>
              <p className="text-muted-foreground">Receive personalized learning recommendations from top platforms and real-world projects.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-warning rounded-full flex items-center justify-center mx-auto">
                <Handshake className="text-warning-foreground w-6 h-6" />
              </div>
              <div className="text-xl font-semibold text-foreground">4. Get Connected</div>
              <p className="text-muted-foreground">Match with relevant internships and entry-level positions based on your improved skill profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Everything you need to transition from graduate to professional</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-none">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Brain className="text-primary-foreground w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">AI Skill Analysis</h3>
                  <p className="text-muted-foreground">Advanced NLP analyzes your resume and identifies specific skill gaps compared to industry standards.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Resume parsing and analysis
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Industry benchmark comparison
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Personalized recommendations
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-none">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-secondary-foreground w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Curated Learning Paths</h3>
                  <p className="text-muted-foreground">Get personalized course recommendations from top platforms to fill your skill gaps effectively.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Courses from Udemy, Coursera, YouTube
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Soft and hard skills included
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Progress tracking and milestones
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-none">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
                  <ProjectorIcon className="text-success-foreground w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Real-World Projects</h3>
                  <p className="text-muted-foreground">Build portfolio-ready experience through micro-projects and simulations from actual companies.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Company-sponsored projects
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Portfolio building
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-success mr-2" />
                    Mentor feedback included
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Companies Section */}
      <section id="companies" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">For Companies</h2>
                <p className="text-xl text-muted-foreground">Access pre-screened, job-ready talent with verified skills and real-world project experience.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Template-Driven Hiring</div>
                    <div className="text-muted-foreground">Customize evaluation workflows with automated screening templates.</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Skill-Verified Candidates</div>
                    <div className="text-muted-foreground">All candidates have completed AI-evaluated skill assessments and real projects.</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-1" />
                  <div>
                    <div className="font-semibold text-foreground">Project-Based Evaluation</div>
                    <div className="text-muted-foreground">Post micro-projects to evaluate candidates in real-world scenarios.</div>
                  </div>
                </div>
              </div>
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleGetStarted}>
                Start Hiring
              </Button>
            </div>
            <div className="relative">
              <Card className="p-8">
                <CardContent className="space-y-6 p-0">
                  <div className="flex items-center space-x-3">
                    <Building className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">Company Dashboard</h3>
                      <p className="text-sm text-muted-foreground">Manage hiring workflows</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-foreground text-sm">Frontend Developer Candidates</div>
                      <div className="text-xs text-muted-foreground">12 applications • 8 pre-screened</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium text-foreground text-sm">Project Submissions</div>
                      <div className="text-xs text-muted-foreground">5 completed • AI evaluated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">Hear from graduates who transformed their careers with Grad2Pro</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"Grad2Pro helped me identify exactly what skills I was missing for my dream job. Within 3 months, I landed a position at a top tech company!"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">SC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">Software Engineer at Google</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"The AI analysis was spot-on. It identified gaps I didn't even know I had. The personalized learning path made all the difference in my job search."</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Marcus Johnson</div>
                    <div className="text-sm text-muted-foreground">Product Manager at Spotify</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"As a career changer, I was overwhelmed. Grad2Pro's structured approach and real projects gave me the confidence to transition into UX design."</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">ER</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Emily Rodriguez</div>
                    <div className="text-sm text-muted-foreground">UX Designer at Airbnb</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Bridge Your Skills Gap?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of graduates who have successfully transitioned to professional careers with Grad2Pro.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleGetStarted} className="bg-white text-primary hover:bg-gray-100 transform hover:scale-105 transition-all">
              Start Free Analysis
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary">
              Schedule Demo
            </Button>
          </div>
          <p className="text-blue-100 text-sm mt-4">No credit card required • Free to start • Join 15,000+ successful graduates</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <GraduationCap className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold">Grad2Pro</span>
              </div>
              <p className="text-gray-400">Bridging the gap between graduation and professional success through AI-powered career development.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Graduates</h5>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white cursor-pointer">Skill Analysis</div>
                <div className="hover:text-white cursor-pointer">Learning Paths</div>
                <div className="hover:text-white cursor-pointer">Real Projects</div>
                <div className="hover:text-white cursor-pointer">Job Matching</div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">For Companies</h5>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white cursor-pointer">Post Projects</div>
                <div className="hover:text-white cursor-pointer">Find Talent</div>
                <div className="hover:text-white cursor-pointer">Evaluation Templates</div>
                <div className="hover:text-white cursor-pointer">Analytics</div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <div className="space-y-2 text-gray-400">
                <div className="hover:text-white cursor-pointer">Help Center</div>
                <div className="hover:text-white cursor-pointer">Contact Us</div>
                <div className="hover:text-white cursor-pointer">Privacy Policy</div>
                <div className="hover:text-white cursor-pointer">Terms of Service</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Grad2Pro. All rights reserved. Built with ❤️ for the next generation of professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
