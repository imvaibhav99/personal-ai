import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 w-full max-w-5xl bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-gray-800 font-semibold">{item.prompt}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {item.type} • {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
          {item.type}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 animate-fadeIn">
          {item.type === 'image' ? (
            <div className="flex justify-center">
              <img
                src={item.content}
                alt="generated"
                className="rounded-lg shadow-md max-w-md w-full"
              />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-sm text-gray-700">
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
              
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreationItem
