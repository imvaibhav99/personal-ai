import { useAuth, useUser } from '@clerk/clerk-react'
import React, { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Community = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()
  const { getToken } = useAuth()

  // fetch published creations
  const fetchCreations = async () => {
    try {
      const token = await getToken()

      const { data } = await axios.get('/api/user/get-published-creations', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setCreations(data.creations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // like toggle
  const imageLikeToggle = async (id) => {
    try {
      const token = await getToken()

      const { data } = await axios.post(
        '/api/user/toggle-like-creation',
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (data.success) {
        toast.success(data.message)
        await fetchCreations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCreations()
    }
  }, [user])

  return (
    <div className="flex-1 h-full flex flex-col gap-6 p-8 bg-gray-50">
      <h2 className="text-2xl font-bold text-gray-800">✨ Community Creations</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creations.map((creation, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Image Section */}
            <div className="relative w-full h-60 overflow-hidden">
              <img
                src={creation.content}
                alt=""
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Info Section */}
            <div className="p-4 flex flex-col justify-between h-28">
              <p className="text-sm text-gray-700 line-clamp-2">
                {creation.prompt}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {creation.likes.length} Likes
                </span>
                <Heart
                  onClick={() => imageLikeToggle(creation._id)}
                  className={`w-5 h-5 cursor-pointer transition-transform duration-200 hover:scale-125 ${
                    creation.likes.includes(user?.id)
                      ? 'fill-red-500 text-red-600'
                      : 'text-gray-400'
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Community
