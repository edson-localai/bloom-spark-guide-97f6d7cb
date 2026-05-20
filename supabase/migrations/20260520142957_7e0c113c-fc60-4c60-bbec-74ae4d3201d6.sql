-- Create policy to allow users to insert their own agent profile
CREATE POLICY "Users can insert their own agent profile" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);