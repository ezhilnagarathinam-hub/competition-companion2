
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'student');

-- Create admin users table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create competitions table
CREATE TABLE public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  primary_color TEXT DEFAULT '#0D9488',
  secondary_color TEXT DEFAULT '#F59E0B',
  is_active BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT false,
  show_leaderboard BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  image_url TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  marks INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create students table with auto-generated credentials
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  student_number INTEGER UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create student_competitions junction table
CREATE TABLE public.student_competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  has_started BOOLEAN DEFAULT false,
  has_submitted BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  total_marks INTEGER DEFAULT 0,
  UNIQUE(student_id, competition_id)
);

-- Create student answers table
CREATE TABLE public.student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  selected_answer CHAR(1) CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
  is_marked_for_review BOOLEAN DEFAULT false,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(student_id, question_id)
);

-- Create sequence for student numbers
CREATE SEQUENCE IF NOT EXISTS student_number_seq START WITH 101 MAXVALUE 1001;

-- Function to auto-generate student credentials
CREATE OR REPLACE FUNCTION public.generate_student_credentials()
RETURNS TRIGGER AS $$
DECLARE
  new_student_number INTEGER;
  generated_username TEXT;
  generated_password TEXT;
BEGIN
  -- Get next student number
  new_student_number := nextval('student_number_seq');
  
  -- Generate username: stu + number
  generated_username := 'stu' || new_student_number;
  
  -- Generate password: name (lowercase, no spaces) + @ + last 2 digits of phone
  generated_password := LOWER(REPLACE(NEW.name, ' ', '')) || '@' || RIGHT(NEW.phone, 2);
  
  NEW.student_number := new_student_number;
  NEW.username := generated_username;
  NEW.password := generated_password;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-generate credentials on insert
CREATE TRIGGER generate_credentials_trigger
BEFORE INSERT ON public.students
FOR EACH ROW
WHEN (NEW.username IS NULL OR NEW.password IS NULL)
EXECUTE FUNCTION public.generate_student_credentials();

-- Function to calculate marks
CREATE OR REPLACE FUNCTION public.calculate_student_marks(p_student_id UUID, p_competition_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE WHEN sa.is_correct THEN q.marks ELSE 0 END
  ), 0) INTO total
  FROM public.student_answers sa
  JOIN public.questions q ON sa.question_id = q.id
  WHERE sa.student_id = p_student_id
  AND sa.competition_id = p_competition_id;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_competitions_updated_at
BEFORE UPDATE ON public.competitions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_student_answers_updated_at
BEFORE UPDATE ON public.student_answers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (admin auth handled in app layer)
CREATE POLICY "Allow public read competitions" ON public.competitions FOR SELECT USING (true);
CREATE POLICY "Allow public insert competitions" ON public.competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update competitions" ON public.competitions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete competitions" ON public.competitions FOR DELETE USING (true);

CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update questions" ON public.questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete questions" ON public.questions FOR DELETE USING (true);

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);
CREATE POLICY "Allow public delete students" ON public.students FOR DELETE USING (true);

CREATE POLICY "Allow public read student_competitions" ON public.student_competitions FOR SELECT USING (true);
CREATE POLICY "Allow public insert student_competitions" ON public.student_competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update student_competitions" ON public.student_competitions FOR UPDATE USING (true);

CREATE POLICY "Allow public read student_answers" ON public.student_answers FOR SELECT USING (true);
CREATE POLICY "Allow public insert student_answers" ON public.student_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update student_answers" ON public.student_answers FOR UPDATE USING (true);

CREATE POLICY "Allow public read admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Allow public insert admins" ON public.admins FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_questions_competition ON public.questions(competition_id);
CREATE INDEX idx_student_answers_student ON public.student_answers(student_id);
CREATE INDEX idx_student_answers_competition ON public.student_answers(competition_id);
CREATE INDEX idx_student_competitions_student ON public.student_competitions(student_id);
CREATE INDEX idx_student_competitions_competition ON public.student_competitions(competition_id);

-- Insert default admin
INSERT INTO public.admins (email, password_hash, name) VALUES ('admin@test.com', 'admin123', 'Administrator');
