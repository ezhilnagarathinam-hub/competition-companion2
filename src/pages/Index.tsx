import { Link } from 'react-router-dom';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-primary shadow-primary mb-6">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              TestMaster
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A modern online test conducting platform for competitions and assessments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/student/login">
                <Button size="lg" className="w-full sm:w-auto gradient-primary text-primary-foreground shadow-primary hover:opacity-90">
                  <Users className="w-5 h-5 mr-2" />
                  Student Portal
                </Button>
              </Link>
              <Link to="/admin/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Admin Portal
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Competition Management',
                description: 'Create and manage multiple competitions with custom dates, times, and durations.',
                icon: '🏆',
              },
              {
                title: 'MCQ Questions',
                description: 'Add questions with multiple choice options, images, and custom marks.',
                icon: '📝',
              },
              {
                title: 'Auto Credentials',
                description: 'Student credentials are auto-generated upon enrollment for easy access.',
                icon: '🔐',
              },
              {
                title: 'Live Timer',
                description: 'Real-time countdown timer with automatic submission when time runs out.',
                icon: '⏱️',
              },
              {
                title: 'Result Control',
                description: 'Admin controls when students can see their results and leaderboard.',
                icon: '📊',
              },
              {
                title: 'Leaderboard',
                description: 'Automatic ranking and leaderboard generation based on scores.',
                icon: '🥇',
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto gradient-primary border-0">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-primary-foreground mb-4">
                Ready to conduct your next competition?
              </h2>
              <p className="text-primary-foreground/90 mb-6">
                Login as admin to create competitions, add questions, and enroll students.
              </p>
              <Link to="/admin/login">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 TestMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
