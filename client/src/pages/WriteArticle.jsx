
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, Edit } from 'lucide-react'
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

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: 'Short (500–800 words)' },
    { length: 1200, text: 'Medium (800–1200 words)' },
    { length: 1500, text: 'Long (1200+ words)' },
  ]

  const [selectedLength, setSelectedLength] = useState(articleLength[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [playing, setPlaying] = useState(false)

  const { getToken } = useAuth()
  const maxTopicChars = 140
  const inputCharCount = input.length

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setPlaying(false)
    setContent('')
    try {
      setLoading(true)
      const prompt = `Write an article about ${input} in ${selectedLength.text}`
      const { data } = await axios.post(
        '/api/ai/generate-article',
        { prompt, length: selectedLength.length },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      )

      if (data.success) {
        setContent(data.content || '')
        setPlaying(true)
      } else {
        toast.error(data.message || 'Failed to generate')
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
          <Sparkles className="w-7 h-7 text-indigo-700" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Article Generator</h1>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Article Topic</p>
          <span className={`text-xs font-mono ${inputCharCount > maxTopicChars ? 'text-red-600' : 'text-gray-500'}`}>
            {inputCharCount}/{maxTopicChars}
          </span>
        </div>
        <div className="relative">
          <input
            onChange={(e) => setInput(e.target.value.slice(0, maxTopicChars))}
            value={input}
            type="text"
            placeholder="The future of AI is..."
            required
            className="mt-2 w-full px-5 py-3 pr-24 border border-gray-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none text-gray-800 placeholder-gray-400"
          />
          <div className="absolute -bottom-5 right-0 text-[10px] text-gray-400 italic">
            live: “{input}”
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-gray-700 mb-3">Article Length</p>
        <div className="grid grid-cols-2 gap-3">
          {articleLength.map((item) => (
            <button
              key={item.length}
              type="button"
              onClick={() => setSelectedLength(item)}
              className={`px-4 py-3 rounded-xl border text-left font-medium transition-all duration-300 transform hover:scale-[1.02] 
                ${selectedLength.length === item.length
                  ? 'border-indigo-600 bg-indigo-100 text-indigo-800 shadow-md'
                  : 'border-gray-300 text-gray-700 hover:border-indigo-400 hover:bg-gray-50'}`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          type="submit"
          disabled={loading || !input}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all disabled:opacity-50"
        >
          <Edit className="w-5 h-5" />
          {loading ? 'Generating...' : 'Generate Article'}
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
        {content && (
          <button
            type="button"
            onClick={() => { setPlaying(false); setContent('') }}
            className="text-xs px-3 py-1 rounded-lg border hover:bg-gray-50 text-gray-700 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 border border-gray-200 rounded-2xl p-6 bg-gray-50 overflow-y-auto shadow-inner">
        {content ? (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{input}</h3>
            <Typewriter text={content} speed={12} playing={playing} />
          </>
        ) : (
          <p className="text-gray-400 italic text-center mt-20">
            Enter a topic and select length to preview the article.
          </p>
        )}
      </div>
    </div>

  </div>
</div>

  )
}

export default WriteArticle
