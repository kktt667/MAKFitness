import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // User is authenticated, redirect to feed
    redirect('/feed')
  } else {
    // User is not authenticated, redirect to sign-in
    redirect('/sign-in')
  }
}
