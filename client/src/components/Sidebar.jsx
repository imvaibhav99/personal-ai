// import React from 'react'
// import { useClerk, useUser } from '@clerk/clerk-react'
// import { 
//   Eraser, 
//   FileText, 
//   Hash, 
//   Scissors, 
//   SquarePen, 
//   House, 
//   Image, 
//   Users, 
//   LogOut 
// } from 'lucide-react'
// import { NavLink } from 'react-router-dom'

// const navItems = [
//   { to: '/ai', label: 'Dashboard', Icon: House },
//   { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
//   { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
//   { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
//   { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
//   { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
//   { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
//   { to: '/ai/community', label: 'Community', Icon: Users },
// ]

// const Sidebar = ({ sidebar, setSidebar }) => {
//   const { user, isLoaded } = useUser()
//   const { signOut, openUserProfile } = useClerk()

//   if (!isLoaded) {
//     return null // or a loader skeleton
//   }

//   return (
//     <div
//       className={`w-60 bg-white border-r border-gray-200 flex flex-col
//         justify-between items-center max-sm:absolute top-14 bottom-0 
//         ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300
//         ease-in-out`}
//     >
//       <div className='my-7 w-full'>
//         {user?.imageUrl && (
//           <img 
//             src={user.imageUrl} 
//             alt="User avatar" 
//             className='w-14 h-14 rounded-full mx-auto'
//           />
//         )}
//         <h1 className='mt-1 text-center font-medium'>{user?.fullName}</h1>

//         <div className="mt-6 flex flex-col gap-1">
//           {navItems.map(({ to, label, Icon }) => (
//             <NavLink 
//               key={to} 
//               to={to} 
//               end={to === '/ai'} 
//               onClick={() => setSidebar(false)}
//               className={({ isActive }) => 
//                 `px-4 py-2.5 flex items-center gap-3 rounded-md transition-colors 
//                  ${isActive 
//                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white' 
//                    : 'text-gray-700 hover:bg-gray-100'}`
//               }
//             >
//               <Icon className="w-4 h-4" />
//               <span>{label}</span>
//             </NavLink>
//           ))}
//         </div>
//       </div>

//       {/* Footer actions */}
//       <div className="mb-6 w-full px-4">
//         <button 
//           onClick={() => openUserProfile()} 
//           className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
//         >
//           <Users className="w-4 h-4" />
//           Profile
//         </button>
//         <button 
//           onClick={() => signOut()} 
//           className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-md hover:bg-gray-100 text-gray-700"
//         >
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Sidebar




// import React from 'react'
// import { Protect, useClerk, useUser } from '@clerk/clerk-react'
// import { 
//   Eraser, 
//   FileText, 
//   Hash, 
//   Scissors, 
//   SquarePen, 
//   House, 
//   Image, 
//   Users, 
//   LogOut,
//   Crown
// } from 'lucide-react'
// import { NavLink } from 'react-router-dom'

// const navItems = [
//   { to: '/ai', label: 'Dashboard', Icon: House },
//   { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
//   { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
//   { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
//   { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
//   { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
//   { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
//   { to: '/ai/community', label: 'Community', Icon: Users },
// ]

// const Sidebar = ({ sidebar, setSidebar }) => {
//   const { user, isLoaded } = useUser()
//   const { signOut, openUserProfile } = useClerk()

//   if (!isLoaded) return null

//   // Get user plan from metadata (default = Free)
//   const userPlan = user?.publicMetadata?.plan || "free"

//   return (
//     <div
//       className={`w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col 
//         justify-between max-sm:absolute top-14 bottom-0 z-50
//         ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
//         transition-transform duration-300 ease-in-out`}
//     >
//       {/* Top section */}
//       <div className="flex flex-col items-center py-6 px-4">
//         {/* Avatar */}
//         {user?.imageUrl && (
//           <img 
//             src={user.imageUrl} 
//             alt="User avatar" 
//             className="w-16 h-16 rounded-full border shadow-sm"
//           />
//         )}
//         <h1 className="mt-2 text-lg font-semibold text-gray-800">{user?.fullName}</h1>

//         {/* Plan Badge */}
//         <div className="mt-3 px-3 py-1.5 rounded-lg flex items-center gap-2 
//           border shadow-sm
//           bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9]">
//           <Crown className={`w-4 h-4 ${userPlan === "premium" ? "text-yellow-500" : "text-gray-400"}`} />
//           <span className={`text-sm font-medium capitalize ${userPlan === "premium" ? "text-yellow-600" : "text-gray-600"}`}>
//             {userPlan}
//           </span>
//         </div>

//         {/* Nav links */}
//         <div className="mt-6 w-full flex flex-col gap-1">
//           {navItems.map(({ to, label, Icon }) => (
//             <NavLink 
//               key={to} 
//               to={to} 
//               end={to === '/ai'} 
//               onClick={() => setSidebar(false)}
//               className={({ isActive }) => 
//                 `px-4 py-2.5 flex items-center gap-3 rounded-md transition-all 
//                  ${isActive 
//                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white shadow-md' 
//                    : 'text-gray-700 hover:bg-gray-100'}`
//               }
//             >
//               <Icon className="w-4 h-4" />
//               <span>{label}</span>
//             </NavLink>
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="mb-6 w-full px-4">
//         <p>
//        <Protect
//   condition={userPlan === "premium"}
//   fallback={<span>Free Plan</span>}
// >
//   <span className="text-yellow-600 font-medium">Premium Plan</span>
// </Protect>

//         </p>
//         <button 
//           onClick={() => openUserProfile()} 
//           className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 transition"
//         >
//           <Users className="w-4 h-4" />
//           Profile
//         </button>

//         <button 
//           onClick={() => signOut()} 
//           className="w-full flex items-center gap-3 px-3 py-2 mt-2 rounded-md hover:bg-red-50 text-red-600 transition"
//         >
//           <LogOut className="w-4 h-4" />
//           Logout
//         </button>
//       </div>
//     </div>
//   )
// }

// export default Sidebar








import React from 'react'
import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import { 
  Eraser, FileText, Hash, Scissors, SquarePen, House, Image, Users, LogOut, Crown
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-article', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/review-resume', label: 'Review Resume', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users },
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user, isLoaded } = useUser()
  const { signOut, openUserProfile } = useClerk()

  if (!isLoaded) return null

  const userPlan = user?.publicMetadata?.plan || "free"

  return (
    <div
      className={`w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col 
        justify-between max-sm:absolute top-14 bottom-0 z-50
        ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
        transition-transform duration-300 ease-in-out`}
    >
      {/* Top Section */}
      <div className="flex flex-col items-center py-6 px-4">
        {user?.imageUrl && (
          <img 
            src={user.imageUrl} 
            alt="User avatar" 
            className="w-16 h-16 rounded-full border shadow-sm"
          />
        )}
        <h1 className="mt-2 text-lg font-semibold text-gray-800">{user?.fullName}</h1>

        {/* Plan Badge */}
        <Protect
          condition={userPlan === "premium"}
          fallback={
            <div className="mt-3 px-3 py-1.5 rounded-full flex items-center gap-2 border bg-gray-100">
              <Crown className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 text-sm font-medium">Free Plan</span>
            </div>
          }
        >
          <div className="mt-3 px-3 py-1.5 rounded-full flex items-center gap-2 border bg-yellow-50 shadow-sm">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-700 text-sm font-semibold">Premium Plan</span>
          </div>
        </Protect>

        {/* Navigation */}
        <div className="mt-6 w-full flex flex-col gap-1">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({ isActive }) => 
                `px-4 py-2.5 flex items-center gap-3 rounded-lg transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-100'}`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mb-6 w-full px-4 flex flex-col gap-2">
        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
        >
          <Users className="w-5 h-5" />
          Profile
        </button>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
