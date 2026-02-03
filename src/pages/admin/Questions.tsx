import { useEffect, useState } from 'react';
import { Plus, Image, Trash2, Edit, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Competition, Question } from '@/types/database';

export default function Questions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    question_text: '',
    image_url: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    marks: 1,
  });

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchQuestions(selectedCompetition);
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

  async function fetchQuestions(competitionId: string) {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('competition_id', competitionId)
        .order('question_number');

      if (error) throw error;
      setQuestions((data as Question[]) || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('questions')
          .update({
            ...formData,
            image_url: formData.image_url || null,
          })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Question updated successfully');
      } else {
        const nextNumber = questions.length + 1;
        const { error } = await supabase
          .from('questions')
          .insert([{
            ...formData,
            competition_id: selectedCompetition,
            question_number: nextNumber,
            image_url: formData.image_url || null,
          }]);
        if (error) throw error;
        toast.success('Question added successfully');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchQuestions(selectedCompetition);
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error('Failed to save question');
    }
  }

  async function deleteQuestion(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Question deleted');
      fetchQuestions(selectedCompetition);
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  }

  function resetForm() {
    setFormData({
      question_text: '',
      image_url: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks: 1,
    });
    setEditingId(null);
  }

  function openEdit(q: Question) {
    setFormData({
      question_text: q.question_text,
      image_url: q.image_url || '',
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      marks: q.marks,
    });
    setEditingId(q.id);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Questions</h1>
          <p className="text-muted-foreground mt-1">Manage MCQ questions for your competitions</p>
        </div>

        <div className="flex items-center gap-4">
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

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button 
                className="gradient-primary text-primary-foreground shadow-primary"
                disabled={!selectedCompetition}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Question' : 'Add New Question'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <div className="flex gap-2">
                    <Image className="w-5 h-5 mt-2 text-muted-foreground" />
                    <Input
                      id="image"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="mt-2 max-h-32 rounded-lg object-contain"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="option_a">Option A</Label>
                    <Input
                      id="option_a"
                      value={formData.option_a}
                      onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_b">Option B</Label>
                    <Input
                      id="option_b"
                      value={formData.option_b}
                      onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_c">Option C</Label>
                    <Input
                      id="option_c"
                      value={formData.option_c}
                      onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_d">Option D</Label>
                    <Input
                      id="option_d"
                      value={formData.option_d}
                      onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  <RadioGroup
                    value={formData.correct_answer}
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value as 'A' | 'B' | 'C' | 'D' })}
                    className="flex gap-6"
                  >
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt} id={`answer_${opt}`} />
                        <Label htmlFor={`answer_${opt}`}>{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                    className="w-24"
                    required
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary text-primary-foreground">
                  {editingId ? 'Update Question' : 'Add Question'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!selectedCompetition ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">Select a competition</h3>
            <p className="text-sm text-muted-foreground">Choose a competition to manage its questions</p>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-foreground mb-1">No questions yet</h3>
            <p className="text-sm text-muted-foreground">Add questions to this competition</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={q.id} className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-semibold text-primary">{q.question_number}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground mb-3">{q.question_text}</p>
                    {q.image_url && (
                      <img 
                        src={q.image_url} 
                        alt="Question" 
                        className="mb-3 max-h-32 rounded-lg object-contain"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const optionKey = `option_${opt.toLowerCase()}` as keyof Question;
                        const isCorrect = q.correct_answer === opt;
                        return (
                          <div 
                            key={opt}
                            className={`p-2 rounded-lg ${isCorrect ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}
                          >
                            <span className="font-medium">{opt}.</span> {q[optionKey] as string}
                            {isCorrect && <span className="ml-2">✓</span>}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">Marks: {q.marks}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(q)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deleteQuestion(q.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
