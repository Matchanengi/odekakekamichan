import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://sfzjvpordilroakqmjnp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmemp2cG9yZGlscm9ha3Ftam5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NDY4NDIsImV4cCI6MjA4MjIyMjg0Mn0.f_0QO9dqlY99yr_2YdKw_B8lqxu6fkKMV3z140h2Y8I'
);
