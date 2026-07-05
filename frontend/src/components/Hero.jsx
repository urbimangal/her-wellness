import { Bot, Siren, CalendarHeart, MapPin, HeartHandshake, Sparkles, ShieldCheck, Users, Clock3 } from 'lucide-react'

const quickCards = [
  { icon: Bot, title: 'AI Health Assistant', desc: 'Smart insights for you', color: 'bg-brand-purpleLight text-brand-purple' },
  { icon: Siren, title: 'Emergency SOS', desc: 'Instant help, anywhere', color: 'bg-rose-100 text-rose-600' },
  { icon: CalendarHeart, title: 'Track & Predict', desc: 'Cycles, mood & more', color: 'bg-pink-100 text-pink-600' },
  { icon: MapPin, title: 'Nearby Services', desc: 'Hospitals, shops & more', color: 'bg-emerald-100 text-emerald-600' },
  { icon: HeartHandshake, title: 'Personalized Care', desc: 'Just for You', color: 'bg-rose-100 text-rose-500' },
]

const trustBadges = [
  { icon: Sparkles, label: 'AI-Powered Insights' },
  { icon: ShieldCheck, label: '100% Secure & Private' },
  { icon: Users, label: 'Trusted by Women' },
  { icon: Clock3, label: '24/7 Support Always' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-purpleLight/60 to-white">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20 grid lg:grid-cols-[1.1fr_1fr_0.9fr] gap-10 items-center">
        {/* Left copy */}
        <div>
          <span className="inline-block text-xs font-semibold tracking-widest text-brand-purple bg-white border border-brand-purple/30 rounded-full px-4 py-1.5 section-eyebrow">
            AI POWERED &bull; PERSONALIZED &bull; SECURE
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-brand-purpleDark mt-5 leading-tight">
            Empowering Every Woman's Health &amp; Safety
          </h1>
          <p className="text-gray-500 mt-5 max-w-md">
            Your all-in-one AI powered platform for health tracking, wellness, pregnancy
            care, mental well-being and emergency support.
          </p>
          <div className="flex flex-wrap gap-4 mt-7">
            <button className="px-6 py-3 rounded-full gradient-purple text-white font-semibold shadow-card hover:shadow-cardHover transition-shadow">
              Get Started &rarr;
            </button>
            <button className="px-6 py-3 rounded-full border-2 border-rose-400 text-rose-500 font-semibold flex items-center gap-2 hover:bg-rose-50 transition-colors">
              <Siren size={18} /> Emergency SOS
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Icon size={16} className="text-brand-purple shrink-0" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle illustration */}
        <div className="relative flex justify-center">
          <div className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full bg-brand-purpleLight/70 blur-2xl" />
          <svg viewBox="0 0 300 340" className="relative w-64 md:w-80 drop-shadow-xl">
            <defs>
              <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F3C7A6" />
                <stop offset="100%" stopColor="#E8AF87" />
              </linearGradient>
            </defs>
            {/* hair back */}
            <ellipse cx="150" cy="150" rx="95" ry="120" fill="#2E1A47" />
            {/* body/dress */}
            <path d="M75 220 Q150 190 225 220 L235 340 L65 340 Z" fill="#F06292" />
            {/* neck */}
            <rect x="130" y="150" width="40" height="40" fill="url(#skin)" />
            {/* face */}
            <circle cx="150" cy="120" r="58" fill="url(#skin)" />
            {/* hair front */}
            <path d="M92 100 Q100 40 150 42 Q200 40 208 100 Q210 70 150 65 Q90 70 92 100 Z" fill="#2E1A47" />
            <path d="M95 110 Q80 200 105 250 Q95 160 110 110 Z" fill="#2E1A47" />
            <path d="M205 110 Q220 200 195 250 Q205 160 190 110 Z" fill="#2E1A47" />
            {/* arms crossed */}
            <path d="M95 230 Q150 260 205 230 L200 260 Q150 285 100 260 Z" fill="#F3C7A6" />
            {/* flowers */}
            <g opacity="0.9">
              <circle cx="55" cy="270" r="14" fill="#F8A5C2" />
              <circle cx="80" cy="290" r="10" fill="#F06292" />
              <circle cx="245" cy="260" r="14" fill="#F8A5C2" />
              <circle cx="225" cy="295" r="10" fill="#F06292" />
            </g>
            <g opacity="0.6" fill="#8CC63F">
              <ellipse cx="45" cy="255" rx="18" ry="8" />
              <ellipse cx="255" cy="245" rx="18" ry="8" />
            </g>
          </svg>
          {/* floating hearts */}
          <span className="absolute top-6 left-8 text-rose-300 text-xl animate-pulse">&#10084;</span>
          <span className="absolute bottom-10 right-4 text-brand-purple/40 text-2xl">&#10084;</span>
        </div>

        {/* Right quick cards */}
        <div className="space-y-3">
          {quickCards.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3 hover:shadow-cardHover transition-shadow"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-purpleDark">{title}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
