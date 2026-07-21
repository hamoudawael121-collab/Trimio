-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Everyone can view reviews" ON public.reviews FOR SELECT USING (true);

-- Policy: Only customers who have a completed booking at the shop can insert a review
CREATE POLICY "Customers with completed bookings can review" ON public.reviews 
FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    EXISTS (
        SELECT 1 FROM public.bookings 
        WHERE customer_id = auth.uid() 
        AND shop_id = public.reviews.shop_id 
        AND status = 'completed'
    )
);

-- Policy: Customers can update their own reviews
CREATE POLICY "Customers can update own reviews" ON public.reviews 
FOR UPDATE USING (auth.uid() = customer_id);
