import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import type { Competition } from '@/types/database';

interface LeaderboardEntry {
  student_id: string;
  student_name: string;
  total_marks: number;
  submitted_at: string | null;
}

export default function Results() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxMarks, setMaxMarks] = useState(0);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchLeaderboard(selectedCompetition);
      fetchMaxMarks(selectedCompetition);
    }
  }, [selectedCompetition]);

  async function fetchCompetitions() {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setCompetitions((data as Competition[]) || []);
      if (data && data.length > 0) {
        setSelectedCompetition(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMaxMarks(competitionId: string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('marks')
        .eq('competition_id', competitionId);

      if (error) throw error;
      const total = data?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0;
      setMaxMarks(total);
    } catch (error) {
      console.error('Error fetching max marks:', error);
    }
  }

  async function fetchLeaderboard(competitionId: string) {
    try {
      const { data: submissions, error: subError } = await supabase
        .from('student_competitions')
        .select(`
          student_id,
          total_marks,
          submitted_at,
          students!inner(name)
        `)
        .eq('competition_id', competitionId)
        .eq('has_submitted', true)
        .order('total_marks', { ascending: false });

      if (subError) throw subError;

      const entries: LeaderboardEntry[] = (submissions || []).map((s: any) => ({
        student_id: s.student_id,
        student_name: s.students.name,
        total_marks: s.total_marks,
        submitted_at: s.submitted_at,
      }));

      setLeaderboard(entries);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }

  function getRankIcon(rank: number) {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">{rank}</span>;
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Results & Leaderboard</h1>
          <p className="text-muted-foreground mt-1">View student scores and rankings</p>
        </div>

        <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map((comp) => (
              <SelectItem key={comp.id} value={comp.id}>{comp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedCompetition ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">Select a competition</h3>
            <p className="text-sm text-muted-foreground">Choose a competition to view results</p>
          </CardContent>
        </Card>
      ) : leaderboard.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">No submissions yet</h3>
            <p className="text-sm text-muted-foreground">No students have submitted their answers</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <Card 
                key={entry.student_id} 
                className={`border-2 ${
                  index === 0 ? 'border-yellow-500/50 bg-yellow-50/50' :
                  index === 1 ? 'border-gray-400/50 bg-gray-50/50' :
                  'border-amber-600/50 bg-amber-50/50'
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4">{getRankIcon(index + 1)}</div>
                  <h3 className="font-semibold text-lg text-foreground">{entry.student_name}</h3>
                  <p className="text-3xl font-bold mt-2 text-primary">
                    {entry.total_marks}
                    <span className="text-lg text-muted-foreground">/{maxMarks}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round((entry.total_marks / maxMarks) * 100)}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Full Leaderboard</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow key={entry.student_id}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{entry.student_name}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">{entry.total_marks}</span>
                      <span className="text-muted-foreground">/{maxMarks}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(entry.total_marks / maxMarks) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {Math.round((entry.total_marks / maxMarks) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.submitted_at 
                        ? new Date(entry.submitted_at).toLocaleString() 
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
