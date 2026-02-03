import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Clock, Play, CheckCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudentAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Competition, StudentCompetition } from '@/types/database';
import { format, isToday, parseISO } from 'date-fns';

interface CompetitionWithStatus extends Competition {
  studentStatus?: StudentCompetition;
}

export default function StudentDashboard() {
  const { studentId } = useStudentAuth();
  const [competitions, setCompetitions] = useState<CompetitionWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) {
      fetchCompetitions();
    }
  }, [studentId]);

  async function fetchCompetitions() {
    try {
      const { data: comps, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (compError) throw compError;

      const { data: statuses, error: statusError } = await supabase
        .from('student_competitions')
        .select('*')
        .eq('student_id', studentId);

      if (statusError) throw statusError;

      const compsWithStatus: CompetitionWithStatus[] = ((comps as Competition[]) || []).map((comp) => ({
        ...comp,
        studentStatus: (statuses as StudentCompetition[])?.find((s) => s.competition_id === comp.id),
      }));

      setCompetitions(compsWithStatus);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  }

  function canStartTest(comp: CompetitionWithStatus): boolean {
    if (comp.studentStatus?.has_submitted) return false;
    
    const now = new Date();
    const compDate = parseISO(comp.date);
    
    if (!isToday(compDate)) return false;
    
    const [startH, startM] = comp.start_time.split(':').map(Number);
    const [endH, endM] = comp.end_time.split(':').map(Number);
    
    const startTime = new Date(now);
    startTime.setHours(startH, startM, 0, 0);
    
    const endTime = new Date(now);
    endTime.setHours(endH, endM, 0, 0);
    
    return now >= startTime && now <= endTime;
  }

  async function handleStartTest(competitionId: string) {
    try {
      // Check if already enrolled
      const { data: existing } = await supabase
        .from('student_competitions')
        .select('*')
        .eq('student_id', studentId)
        .eq('competition_id', competitionId)
        .maybeSingle();

      if (!existing) {
        // Create enrollment
        const { error } = await supabase
          .from('student_competitions')
          .insert([{
            student_id: studentId,
            competition_id: competitionId,
            has_started: true,
            started_at: new Date().toISOString(),
          }]);
        
        if (error) throw error;
      } else if (!existing.has_started) {
        // Update to started
        const { error } = await supabase
          .from('student_competitions')
          .update({
            has_started: true,
            started_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        
        if (error) throw error;
      }

      navigate(`/student/test/${competitionId}`);
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Competitions</h1>
        <p className="text-muted-foreground mt-1">View your enrolled competitions and results</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : competitions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">No active competitions</h3>
            <p className="text-sm text-muted-foreground">Check back later for upcoming tests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {competitions.map((comp) => {
            const canStart = canStartTest(comp);
            const hasSubmitted = comp.studentStatus?.has_submitted;
            const hasStarted = comp.studentStatus?.has_started;

            return (
              <Card key={comp.id} className="border-border/50 overflow-hidden">
                <div 
                  className="h-2"
                  style={{ backgroundColor: comp.primary_color }}
                />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-2">{comp.name}</h3>
                      {comp.description && (
                        <p className="text-sm text-muted-foreground mb-3">{comp.description}</p>
                      )}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(comp.date), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {comp.start_time} - {comp.end_time}
                        </span>
                        <span>{comp.duration_minutes} minutes</span>
                      </div>
                    </div>

                    <div className="ml-4">
                      {hasSubmitted ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Submitted</span>
                        </div>
                      ) : hasStarted && !canStart ? (
                        <Button
                          onClick={() => navigate(`/student/test/${comp.id}`)}
                          className="gradient-primary text-primary-foreground shadow-primary"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Test
                        </Button>
                      ) : canStart ? (
                        <Button
                          onClick={() => handleStartTest(comp.id)}
                          className="gradient-primary text-primary-foreground shadow-primary"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {hasStarted ? 'Continue' : 'Start Test'}
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground">
                          <Lock className="w-5 h-5" />
                          <span className="font-medium">Not Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            My Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentResults />
        </CardContent>
      </Card>
    </div>
  );
}

function StudentResults() {
  const { studentId } = useStudentAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchResults();
    }
  }, [studentId]);

  async function fetchResults() {
    try {
      const { data, error } = await supabase
        .from('student_competitions')
        .select(`
          *,
          competitions!inner(*)
        `)
        .eq('student_id', studentId)
        .eq('has_submitted', true);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading results...</p>;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results yet. Complete a test to see your scores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const comp = result.competitions;
        const showResult = comp.show_results;

        return (
          <div 
            key={result.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
          >
            <div>
              <h4 className="font-medium text-foreground">{comp.name}</h4>
              <p className="text-sm text-muted-foreground">
                Submitted: {new Date(result.submitted_at).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              {showResult ? (
                <div className="text-2xl font-bold text-primary">
                  {result.total_marks} marks
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Results will be announced shortly
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
