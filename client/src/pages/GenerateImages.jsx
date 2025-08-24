

import React, { useState } from 'react'
import { Image as ImageIcon, Sparkles, Brush, Loader2, Globe, Lock } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const GenerateImages = () => {
  const ImageStyle = [
    'Realistic',
    'Ghibli Style',
    'Anime Style',
    'Cartoon Style',
    'Fantasy Style',
    '3D Style',
    'Portrait Style',
  ]

  const [selectedStyle, setSelectedStyle] = useState('Realistic')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('') // final generated image URL
  const [publish, setPublish] = useState(false)
  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const prompt = `Generate an image of ${input} in the style ${selectedStyle}`

      const { data } = await axios.post(
        '/api/ai/generate-image',
        { prompt, publish },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      )

      if (data.success) {
        setContent(data.content) // image url from backend
      } else {
        toast.error(data.message || 'Failed to generate image')
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* left */}
        <form onSubmit={onSubmitHandler} className="space-y-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">AI Image Generator</h2>
          </div>

          {/* prompt input */}
          <div>
            <label className="text-sm font-medium text-gray-600">Image Prompt</label>
            <div className="relative mt-2">
              <input
                type="text"
                placeholder="Describe the image..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
              />
              <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* style select */}
          <div>
            <label className="text-sm font-medium text-gray-600">Select Style</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {ImageStyle.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
                    selectedStyle === style
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <Brush className="w-4 h-4" />
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Make Public Option */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
            <div className="flex items-center gap-2">
              {publish ? (
                <Globe className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <span className="text-gray-700 font-medium">
                {publish ? 'Image will be Public' : 'Image will be Private'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPublish(!publish)}
              className={`w-12 h-6 flex items-center rounded-full transition ${
                publish ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`h-5 w-5 bg-white rounded-full shadow-md transform transition ${
                  publish ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Image
              </>
            )}
          </button>
        </form>

        {/* right */}
        <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
          {loading ? (
            <div className="text-center">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-500">Generating image...</p>
            </div>
          ) : content ? (
            <img
              src={content}
              alt="Generated"
              className="rounded-xl shadow-md w-full h-auto"
            />
          ) : (
            <p className="text-gray-400 text-sm">Image will appear here</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GenerateImages
