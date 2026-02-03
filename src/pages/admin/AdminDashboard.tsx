import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, FileQuestion, ClipboardList, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalCompetitions: number;
  totalStudents: number;
  totalQuestions: number;
  activeCompetitions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompetitions: 0,
    totalStudents: 0,
    totalQuestions: 0,
    activeCompetitions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [competitionsRes, studentsRes, questionsRes, activeRes] = await Promise.all([
          supabase.from('competitions').select('id', { count: 'exact', head: true }),
          supabase.from('students').select('id', { count: 'exact', head: true }),
          supabase.from('questions').select('id', { count: 'exact', head: true }),
          supabase.from('competitions').select('id', { count: 'exact', head: true }).eq('is_active', true),
        ]);

        setStats({
          totalCompetitions: competitionsRes.count || 0,
          totalStudents: studentsRes.count || 0,
          totalQuestions: questionsRes.count || 0,
          activeCompetitions: activeRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Competitions', 
      value: stats.totalCompetitions, 
      icon: Trophy, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      title: 'Active Competitions', 
      value: stats.activeCompetitions, 
      icon: ClipboardList, 
      color: 'text-success',
      bg: 'bg-success/10'
    },
    { 
      title: 'Total Students', 
      value: stats.totalStudents, 
      icon: Users, 
      color: 'text-accent',
      bg: 'bg-accent/10'
    },
    { 
      title: 'Total Questions', 
      value: stats.totalQuestions, 
      icon: FileQuestion, 
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
  ];

  const quickActions = [
    { label: 'Create Competition', path: '/admin/competitions/new', icon: Trophy },
    { label: 'Add Questions', path: '/admin/questions', icon: FileQuestion },
    { label: 'Enroll Students', path: '/admin/students', icon: Users },
    { label: 'View Results', path: '/admin/results', icon: ClipboardList },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your test platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold mt-1 text-foreground">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Getting Started</span>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                <span className="text-sm text-foreground">Create a new competition with date and time</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                <span className="text-sm text-foreground">Add questions with MCQ options and images</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                <span className="text-sm text-foreground">Enroll students - credentials auto-generated</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                <span className="text-sm text-foreground">Activate competition when ready</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
