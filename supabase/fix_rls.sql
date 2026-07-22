-- Fix RLS Policies for Profiles and Admin Access in Supabase

-- 1. Allow profile insertion on signup
DROP POLICY IF EXISTS "Allow profile insertion" ON public.profiles;
CREATE POLICY "Allow profile insertion" ON public.profiles FOR INSERT WITH CHECK (true);

-- 2. Allow viewing all profiles so Admin Dashboard can display registered users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
CREATE POLICY "Everyone can view profiles" ON public.profiles FOR SELECT USING (true);

-- 3. Allow profiles update and delete
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
CREATE POLICY "Allow profile update" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow profile delete" ON public.profiles;
CREATE POLICY "Allow profile delete" ON public.profiles FOR DELETE USING (true);
