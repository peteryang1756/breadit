import { useState } from 'react'
import { db } from '@/lib/db'

const AddEmailForm = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, check: true }),
      })

      if (response.ok) {
        setMessage('用戶已成功添加！')
        setEmail('')
        setUsername('')
      } else {
        setMessage('添加用戶時出錯，請稍後再試。')
      }
    } catch (error) {
      setMessage('發生錯誤：' + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          電子郵件
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          用戶名
        </label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        添加用戶
      </button>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </form>
  )
}

export default AddEmailForm