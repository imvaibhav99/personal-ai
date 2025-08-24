// import React, { useState } from 'react'
// import { Tags, Edit } from 'lucide-react'
// import toast from 'react-hot-toast'
// import Markdown from 'react-markdown'
// import axios from 'axios'
// import { useAuth } from '@clerk/clerk-react'



// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// const BlogTitles = () => {
//   const blogCategories = [
//     'General',
//     'Technology',
//     'Business',
//     'Health',
//     'Lifestyle',
//     'Education',
//     'Travel',
//     'Food',
//   ]

//   const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
//   const [input, setInput] = useState('')
//  const [loading, setLoading] = useState(false)
//   const [content, setContent] = useState('')

//   const { getToken } = useAuth()

//  const onSubmitHandler = async (e) => {
//   e.preventDefault()
//   try {
//     setLoading(true)
//     const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}`
//     const { data } = await axios.post(
//       '/api/ai/generate-blog-title',
//       { prompt },
//       { headers: { Authorization: `Bearer ${await getToken()}` } }
//     )
//     if(data.success){
//         setContent(data.content)
//     }else{
//         toast.error(data.message)
//     }

    
//   } catch (error) {
   
//     toast.error("Something went wrong")
//   } finally {
//     setLoading(false)
//   }
// }


//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
//       <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border border-gray-100">
        
//         {/* Left Column */}
//         <form onSubmit={onSubmitHandler} className="space-y-8">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-purple-100 rounded-lg">
//               <Tags className="w-6 h-6 text-purple-600" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-800">Blog Title Generator</h1>
//           </div>

//           {/* Keywords Input */}
//           <div>
//             <p className="text-sm font-semibold text-gray-700">Keywords</p>
//             <input
//               onChange={(e) => setInput(e.target.value)}
//               value={input}
//               type="text"
//               placeholder="AI, future, innovation..."
//               required
//               className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 placeholder-gray-400"
//             />
//           </div>

//           {/* Category Selection */}
//           <div>
//             <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
//             <div className="flex flex-col gap-3">
//               {blogCategories.map((item, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   onClick={() => setSelectedCategory(item)}
//                   className={`px-4 py-3 rounded-xl border text-left font-medium transition-all duration-200 
//                     ${selectedCategory === item
//                       ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
//                       : 'border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-gray-50'}`}
//                 >
//                   {item}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all"
//           >
//             <Edit className="w-5 h-5" />
//             Generate Titles
//           </button>
//         </form>

//         {/* Right Column (Preview) */}
//         <div className="flex flex-col h-full">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>

//           <div className="flex-1 border border-gray-200 rounded-xl p-4 bg-gray-50 overflow-y-auto">
//             {input && selectedCategory ? (
//               <div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-3">Sample Blog Titles</h3>
//                 <ul className="list-disc pl-5 space-y-2 text-gray-700">
//                   <li>{`The Future of ${input}: A ${selectedCategory} Perspective`}</li>
//                   <li>{`${input} Trends Shaping the World of ${selectedCategory}`}</li>
//                   <li>{`How ${input} is Revolutionizing ${selectedCategory}`}</li>
//                 </ul>
//               </div>
//             ) : (
//               <p className="text-gray-400 italic text-center">
//                 Enter keywords and select a category to preview your blog titles.
//               </p>
//             )}
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default BlogTitles



import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Tags, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// Typewriter with play/pause
const Typewriter = ({ text, speed = 20, playing }) => {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    setIdx(0)
  }, [text])

  useEffect(() => {
    if (!playing || !text) return
    if (idx >= text.length) return
    timer.current = setTimeout(() => setIdx(i => i + 1), speed)
    return () => clearTimeout(timer.current)
  }, [idx, text, speed, playing])

  const visible = useMemo(() => text.slice(0, idx), [text, idx])

  return (
    <div className="prose prose-indigo max-w-none leading-7 text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {visible}
      </ReactMarkdown>
      {playing && idx < text.length ? <span className="animate-pulse">▍</span> : null}
    </div>
  )
}

const BlogTitles = () => {
  const blogCategories = [
    'General',
    'Technology',
    'Business',
    'Health',
    'Lifestyle',
    'Education',
    'Travel',
    'Food',
  ]

  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [playing, setPlaying] = useState(false)

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setPlaying(false)
    setContent('')
    try {
      setLoading(true)
      const prompt = `Generate 5 creative blog titles for the keyword "${input}" in the category "${selectedCategory}". Format them as a numbered list.`
      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )
      if (data.success) {
        setContent(data.content || '')
        setPlaying(true)
      } else {
        toast.error(data.message || 'Failed to generate titles')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border border-gray-200">
        
        {/* Left Column */}
        <form onSubmit={onSubmitHandler} className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-xl shadow-inner">
              <Tags className="w-7 h-7 text-purple-700" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Blog Title Generator</h1>
          </div>

          {/* Keywords Input */}
          <div>
            <p className="text-sm font-semibold text-gray-700">Keywords</p>
            <div className="relative">
              <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder="AI, future, innovation..."
                required
                className="mt-2 w-full px-5 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none text-gray-800 placeholder-gray-400"
              />
              <div className="absolute -bottom-5 right-0 text-[10px] text-gray-400">
                live: “{input}”
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Category</p>
            <div className="grid grid-cols-2 gap-3">
              {blogCategories.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedCategory(item)}
                  className={`px-4 py-3 rounded-xl border text-left font-medium transition-all duration-300 transform hover:scale-[1.02] 
                    ${selectedCategory === item
                      ? 'border-purple-600 bg-purple-100 text-purple-800 shadow-md'
                      : 'border-gray-300 text-gray-700 hover:border-purple-400 hover:bg-gray-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Submit & Play/Pause */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !input}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all disabled:opacity-60"
            >
              <Edit className="w-5 h-5" />
              {loading ? 'Generating...' : 'Generate Titles'}
            </button>

            <button
              type="button"
              onClick={() => setPlaying(p => !p)}
              disabled={!content}
              className="px-4 py-3 rounded-xl border bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
              title="Play/Pause typing"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
        </form>

        {/* Right Column (Preview) */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
            {content && (
              <button
                type="button"
                onClick={() => { setPlaying(false); setContent('') }}
                className="text-xs px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 border border-gray-200 rounded-2xl p-6 bg-gray-50 overflow-y-auto max-h-[30rem] shadow-inner">
            {loading ? (
              <p className="text-gray-500 italic animate-pulse">Generating titles...</p>
            ) : content ? (
              <Typewriter text={content} speed={20} playing={playing} />
            ) : (
              <p className="text-gray-400 italic text-center">
                Enter keywords and select a category to preview your blog titles.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default BlogTitles
