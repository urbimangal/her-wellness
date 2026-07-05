import { MessagesSquare, Stethoscope, BookOpen, Users2 } from 'lucide-react'

function MiniBarChart({ bars, color }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map((h, i) => (
        <div key={i} className={`w-2.5 rounded-t ${color}`} style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

function MiniLineChart({ color }) {
  return (
    <svg viewBox="0 0 100 50" className="w-full h-16">
      <polyline
        points="0,40 20,30 40,35 60,15 80,20 100,5"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MiniDonut() {
  return (
    <svg viewBox="0 0 36 36" className="w-16 h-16 mx-auto">
      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F1E9FB" strokeWidth="4" />
      <circle
        cx="18" cy="18" r="15.5" fill="none" stroke="#22C55E" strokeWidth="4"
        strokeDasharray="85 100" strokeLinecap="round" transform="rotate(-90 18 18)"
      />
      <text x="18" y="21" textAnchor="middle" fontSize="9" fill="#16A34A" fontWeight="bold">85</text>
    </svg>
  )
}

const analyticsCards = [
  { title: 'Mood Trend', node: <MiniLineChart color="#A855F7" /> },
  { title: 'Cycle Trend', node: <MiniLineChart color="#F472B6" /> },
  { title: 'Fitness Trend', node: <MiniBarChart bars={[40, 70, 55, 90, 60, 80]} color="bg-brand-purple" /> },
  { title: 'Health Score', node: <MiniDonut /> },
  { title: 'Sleep Analysis', node: <MiniBarChart bars={[60, 80, 45, 70, 90, 55]} color="bg-violet-300" /> },
  {
    title: 'Activity Analysis',
    node: (
      <svg viewBox="0 0 36 36" className="w-16 h-16 mx-auto">
        <circle cx="18" cy="18" r="16" fill="#22C55E" opacity="0.15" />
        <path d="M18 18 L18 2 A16 16 0 0 1 32 24 Z" fill="#F97316" />
        <path d="M18 18 L32 24 A16 16 0 0 1 8 32 Z" fill="#3B82F6" />
        <path d="M18 18 L8 32 A16 16 0 0 1 18 2 Z" fill="#22C55E" />
      </svg>
    ),
  },
  {
    title: 'Risk Analysis',
    node: (
      <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto">
        <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="#E5D5F7" strokeWidth="2" />
        <polygon points="50,25 72,45 62,78 38,78 28,45" fill="#A855F7" opacity="0.4" stroke="#A855F7" strokeWidth="1.5" />
      </svg>
    ),
  },
]

const communityCards = [
  { icon: MessagesSquare, title: 'Discussion Forum', desc: 'Talk about health, wellness & life.', cta: 'Join Now' },
  { icon: Stethoscope, title: 'Ask an Expert', desc: 'Get answers from doctors & experts.', cta: 'Ask Now' },
  { icon: BookOpen, title: 'Blogs & Articles', desc: 'Read health tips & expert advice.', cta: 'Read Now' },
  { icon: Users2, title: 'Success Stories', desc: 'Real stories from real women.', cta: 'Explore' },
]

export default function AnalyticsAndCommunity() {
  return (
    <section className="bg-brand-purpleLight/40 py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-6">
        {/* Analytics */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-brand-purpleDark text-lg">AI Analytics &amp; Insights</h3>
          <p className="text-xs text-gray-400 mb-5">Visualize your health trends</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {analyticsCards.map(({ title, node }) => (
              <div key={title} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* Community */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-brand-purpleDark text-lg">Women's Community</h3>
          <p className="text-xs text-gray-400 mb-5">Connect, share &amp; grow together</p>
          <div className="grid grid-cols-2 gap-4">
            {communityCards.map(({ icon: Icon, title, desc, cta }) => (
              <div key={title} className="bg-gray-50 rounded-xl p-4">
                <div className="w-9 h-9 rounded-lg bg-brand-purpleLight text-brand-purple flex items-center justify-center mb-2">
                  <Icon size={18} />
                </div>
                <p className="text-sm font-semibold text-brand-purpleDark">{title}</p>
                <p className="text-xs text-gray-400 mb-2">{desc}</p>
                <button className="text-xs font-semibold text-brand-purple hover:underline">
                  {cta} &rarr;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
