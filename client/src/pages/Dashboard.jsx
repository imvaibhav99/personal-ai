import React, { useEffect, useState } from 'react'
import { Gem, Sparkles } from 'lucide-react'
import { Protect, useAuth } from '@clerk/clerk-react'
import CreationItem from '../components/CreationItem'
import axios from 'axios'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()

  const getDashboardData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await axios.get('/api/user/get-user-creations', {
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

  useEffect(() => {
    getDashboardData()
  }, [])

  return (
    <div className="h-full overflow-y-scroll p-6 bg-gray-50">
      <div className="flex flex-wrap gap-6 mb-6">
        {/* Total Creations Card */}
        <div className="flex justify-between items-center w-72 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-gray-500 font-medium">Total Creations</p>
            <h2 className="text-2xl font-bold text-gray-800">{creations.length}</h2>
          </div>
          <div className="bg-blue-500 p-3 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
          <div>
            <p className="text-gray-500 font-medium">Active Plan</p>
            <h2 className="text-2xl font-bold text-gray-800">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>
          <div className="bg-yellow-500 p-3 rounded-full flex items-center justify-center">
            <Gem className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div>
        <p className="text-gray-700 font-semibold mb-2">Recent Creations</p>
        {loading ? (
          <p className="text-gray-500">Loading creations...</p>
        ) : creations.length === 0 ? (
          <p className="text-gray-400 italic">No creations found.</p>
        ) : (
          creations.map((item) => <CreationItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}

export default Dashboard
