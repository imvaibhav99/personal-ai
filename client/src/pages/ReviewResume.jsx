// import React, { useState } from 'react'
// import { Upload, Loader2, FileText } from 'lucide-react'
// import axios from 'axios'


// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

// const ReviewResume = () => {
//   const [file, setFile] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [analysis, setAnalysis] = useState(null)
//   const [content, setContent] = useState('') // final generated image URL

//   const { getToken } = useAuth()

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0]
//     if (selectedFile) {
//       setFile(selectedFile)
//     }
//   }

//   const onSubmitHandler = async (e) => {
//     e.preventDefault()
//     if (!file) return
//     setLoading(true)

//   try {
//       // validation: only one word allowed for object name
//       if (description.trim().split(' ').length > 1) {
//         setLoading(false)
//         return toast.error('Please enter only one object name')
//       }

//       const formData = new FormData()
//       formData.append('resume', input)
     

//       const token = await getToken()
//       const { data } = await axios.post(
//         '/api/ai/resume-review',
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       )

//       if (data.success) {
//         setContent(data.content) // backend should return processed image URL
//       } else {
//         toast.error(data.message || 'Failed to process image')
//       }
//     } catch (error) {
//       toast.error(error.message || 'Something went wrong')
//     }

//     setLoading(false)
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
//       <div className="w-full max-w-6xl bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        
//         {/* Left - Upload Controls */}
//         <form 
//           onSubmit={onSubmitHandler} 
//           className="col-span-1 space-y-6 flex flex-col justify-center"
//         >
//           <div className="flex items-center gap-3">
//             <FileText className="w-6 h-6 text-indigo-600" />
//             <h2 className="text-xl font-bold text-gray-800">Review Resume</h2>
//           </div>

//           <div>
//             <label className="text-sm font-medium text-gray-600">Upload Resume (PDF/DOC)</label>
//             <div className="relative mt-2">
//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx"
//                 onChange={handleFileChange}
//                 required
//                 className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-gray-800"
//               />
//               <Upload className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={loading || !file}
//             className="w-full flex justify-center items-center gap-2 py-3 px-5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition disabled:opacity-60"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
//               </>
//             ) : (
//               <>
//                 <FileText className="w-5 h-5" /> Review Resume
//               </>
//             )}
//           </button>
//         </form>

//         {/* Right - Analysis Section */}
//         <div className="col-span-2 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 min-h-[400px]">
//           {loading ? (
//             <div className="text-center">
//               <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
//               <p className="mt-3 text-gray-500 text-lg">Analyzing your resume...</p>
//             </div>
//           ) : analysis ? (
//             <div className="space-y-4 text-left max-w-lg">
//               <h3 className="text-lg font-bold text-gray-800">Resume Analysis</h3>
//               <p className="text-gray-600">{analysis.summary}</p>

//               <div>
//                 <h4 className="font-semibold text-indigo-700">Strengths</h4>
//                 <ul className="list-disc list-inside text-gray-600">
//                   {analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
//                 </ul>
//               </div>

//               <div>
//                 <h4 className="font-semibold text-red-600">Improvements</h4>
//                 <ul className="list-disc list-inside text-gray-600">
//                   {analysis.improvements.map((i, idx) => <li key={idx}>{i}</li>)}
//                 </ul>
//               </div>
//             </div>
//           ) : (
//             <p className="text-gray-400 text-lg">Upload a resume to analyze here</p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ReviewResume


import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

const Typewriter = ({ text, speed = 12, playing }) => {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  useEffect(() => setIdx(0), [text])
  useEffect(() => {
    if (!playing || !text || idx >= text.length) return
    timer.current = setTimeout(() => setIdx(i => i + 1), speed)
    return () => clearTimeout(timer.current)
  }, [idx, text, speed, playing])

  const visible = useMemo(() => text.slice(0, idx), [text, idx])

  return (
    <div className="prose prose-indigo max-w-none leading-7 text-gray-800">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {visible}
      </ReactMarkdown>
      {playing && idx < text.length && <span className="animate-pulse text-indigo-600">▍</span>}
    </div>
  )
}

const ReviewResume = () => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [playing, setPlaying] = useState(false)
  const [strengths, setStrengths] = useState([])
const [improvements, setImprovements] = useState([])

  const { getToken } = useAuth()

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setPlaying(false)
    setContent('')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('plan', 'premium')

      const { data } = await axios.post('/api/ai/resume-review', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      })

     if (data.success) {
  setContent(data.analysis.summary || '')
  setStrengths(data.analysis.strengths || [])
  setImprovements(data.analysis.improvements || [])
  setPlaying(true)
}
 else {
        toast.error(data.message || 'Failed to review resume')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-10 border border-gray-200 h-[85vh]">
        
        {/* Left Column */}
        <form onSubmit={onSubmitHandler} className="space-y-8 h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-xl shadow-inner flex items-center justify-center">
              <Upload className="w-7 h-7 text-indigo-700" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">Resume Review</h1>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Upload Resume (PDF)</p>
            <input
              type="file"
              accept="application/pdf"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2 w-full px-5 py-3 border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-800 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={loading || !file}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Reviewing...' : 'Upload & Review'}
            </button>

            <button
              type="button"
              onClick={() => setPlaying(p => !p)}
              disabled={!content}
              className="px-4 py-3 rounded-xl border bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-50"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
        </form>

        {/* Right Column */}
        <div className="flex-1 border border-gray-200 rounded-2xl p-6 bg-gray-50 overflow-y-auto shadow-inner">
  {content ? (
    <>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Resume Review</h3>
      <Typewriter text={content} speed={12} playing={playing} />

      {strengths.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">✅ Strengths</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {strengths.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {improvements.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-2">🔧 Improvements</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {improvements.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  ) : (
    <p className="text-gray-400 italic text-center mt-20">
      Upload a resume to see the review.
    </p>
  )}
</div>
</div>
</div>
  )
}

export default ReviewResume
