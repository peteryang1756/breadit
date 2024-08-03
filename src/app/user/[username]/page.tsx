import Profile from '@/components/Profile'
import { getUserData } from '@/lib/userData'  // 假设你有这样一个函数来获取用户数据

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const userData = await getUserData(params.username)
  
  return (
    <div className="container mx-auto p-4">
      <Profile user={userData} postCount={userData.posts.length} />
    </div>
  )
}
