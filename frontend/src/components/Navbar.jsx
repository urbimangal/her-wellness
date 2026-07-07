import { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react'

const links = ['Home', 'About', 'Features', 'Services', 'Community', 'Blog', 'Contact']

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-brand-purpleLight">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-purple flex items-center justify-center">
              <Heart size={18} className="text-white" fill="white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-brand-purple text-lg">HerWellness</p>
              <p className="text-[10px] text-gray-400 -mt-1">Health & Wellness for Every Woman</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-600">
            {links.map((link, i) => (
              <a
                key={link}
                href="#"
                className={i === 0 ? 'text-brand-purple font-semibold' : 'hover:text-brand-purple transition-colors'}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button className="px-5 py-2 rounded-full border border-brand-purple text-brand-purple text-sm font-semibold hover:bg-brand-purpleLight transition-colors">
              Login
            </button>
            <button className="px-5 py-2 rounded-full gradient-purple text-white text-sm font-semibold shadow-card hover:shadow-cardHover transition-shadow">
              Sign Up
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden text-brand-purple" onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-brand-purpleLight px-5 pb-5 pt-3 space-y-3 bg-white">
          {links.map((link) => (
            <a key={link} href="#" className="block text-gray-600 font-medium">
              {link}
            </a>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 px-5 py-2 rounded-full border border-brand-purple text-brand-purple text-sm font-semibold">
              Login
            </button>
            <button className="flex-1 px-5 py-2 rounded-full gradient-purple text-white text-sm font-semibold">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
