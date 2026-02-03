import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar size="xl" alt={user?.email || ''} />
            <div>
              <h2 className="text-xl font-semibold">{user?.email?.split('@')[0]}</h2>
              <p className="text-sm text-neutral-500">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-neutral-600">Profile settings coming soon!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
