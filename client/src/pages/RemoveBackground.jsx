
import React, { useState } from 'react'
import { Image as ImageIcon, Loader2, Scissors } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveBackground = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(null) // processed image url

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setContent(null) // reset processed image
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!file) return
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const token = await getToken()
      const { data } = await axios.post(
        '/api/ai/remove-image-background',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        setContent(data.content) // backend returns processed image URL
      } else {
        toast.error(data.message || 'Failed to process image')
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-teal-50 p-8">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left - Upload Controls */}
        <form 
          onSubmit={onSubmitHandler} 
          className="col-span-1 space-y-6 flex flex-col justify-center"
        >
          <div className="flex items-center gap-3">
            <Scissors className="w-6 h-6 text-teal-600" />
            <h2 className="text-xl font-bold text-gray-800">Remove Background</h2>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Upload Image</label>
            <div className="relative mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-gray-800"
              />
              <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full flex justify-center items-center gap-2 py-3 px-5 bg-teal-600 text-white rounded-xl shadow-lg hover:bg-teal-700 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5" /> Remove Background
              </>
            )}
          </button>
        </form>

        {/* Right - Preview Section (takes 2 columns) */}
        <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[400px]">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto" />
              <p className="mt-3 text-gray-500 text-lg">Removing background...</p>
            </div>
          ) : content ? (
            <img
              src={content}
              alt="Processed"
              className="rounded-xl shadow-lg max-h-[500px] w-auto object-contain"
            />
          ) : preview ? (
            <img
              src={preview}
              alt="Preview"
              className="rounded-xl shadow-lg max-h-[500px] w-auto object-contain"
            />
          ) : (
            <p className="text-gray-400 text-lg">Upload an image to preview here</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveBackground
