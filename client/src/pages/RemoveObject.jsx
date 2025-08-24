import React, { useState } from 'react'
import { Image as ImageIcon, Upload, Loader2, Eraser } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const RemoveObject = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [content, setContent] = useState(null) // processed image url

  const { getToken } = useAuth()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setContent(null) // reset processed result
    } else {
      toast.error("Please upload a valid image file")
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!file || !description.trim()) return
    setLoading(true)

    try {
      // validation: only one word allowed for object name
      if (description.trim().split(' ').length > 1) {
        setLoading(false)
        return toast.error('Please enter only one object name')
      }

      const formData = new FormData()
      formData.append('image', file)
      formData.append('object', description.trim()) // ✅ send text, not file

      const token = await getToken()
      const { data } = await axios.post(
        '/api/ai/remove-image-object',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (data.success) {
        setContent(data.content) // backend should return processed image URL
      } else {
        toast.error(data.message || 'Failed to process image')
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
      <div className="w-full max-w-6xl bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
        {/* Left - Upload + Description */}
        <form 
          onSubmit={onSubmitHandler} 
          className="col-span-1 space-y-6 flex flex-col justify-center"
        >
          <div className="flex items-center gap-3">
            <Eraser className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Remove Object</h2>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="hidden"
              id="fileInput"
            />
            <label 
              htmlFor="fileInput" 
              className="cursor-pointer flex flex-col items-center text-gray-500"
            >
              <Upload className="w-8 h-8 mb-2 text-purple-600" />
              <span className="text-sm">Click or drag to upload image</span>
            </label>
          </div>

          {/* Description Section */}
          {file && (
            <div>
              <label className="text-sm font-medium text-gray-600">Describe the object to remove</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. car"
                className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 text-gray-800"
                required
              />
              <p className="text-xs text-gray-400 mt-1">⚠️ Only one word allowed</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || !description.trim()}
            className="w-full flex justify-center items-center gap-2 py-3 px-5 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Eraser className="w-5 h-5" /> Remove Object
              </>
            )}
          </button>
        </form>

        {/* Right - Preview Section */}
        <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[400px]">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
              <p className="mt-3 text-gray-500 text-lg">Removing object...</p>
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
            <div className="flex flex-col items-center text-gray-400">
              <ImageIcon className="w-12 h-12 mb-3" />
              <p className="text-lg">Upload an image to preview here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RemoveObject
