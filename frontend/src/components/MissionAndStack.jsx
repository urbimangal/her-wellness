import { HeartHandshake } from 'lucide-react'

const stack = [
  { name: 'React.js', role: 'Frontend' },
  { name: 'Tailwind CSS', role: 'UI Library' },
  { name: 'Node.js', role: 'Backend' },
  { name: 'Express.js', role: 'API' },
  { name: 'MongoDB', role: 'Database' },
  { name: 'Python (AI)', role: 'ML Models' },
]

export default function MissionAndStack() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-2 gap-6">
        {/* Mission */}
        <div className="gradient-purple rounded-2xl p-8 text-white flex items-center gap-6">
          <div>
            <h3 className="font-display font-bold text-xl mb-2">Our Mission</h3>
            <p className="text-white/80 text-sm max-w-sm">
              To empower every woman with AI-driven health insights, personalized care and
              instant support for a healthier, safer &amp; happier life.
            </p>
          </div>
          <div className="hidden sm:flex w-20 h-20 rounded-full bg-white/15 items-center justify-center shrink-0">
            <HeartHandshake size={36} />
          </div>
        </div>

        {/* Tech stack */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-8">
          <h3 className="font-display font-bold text-brand-purpleDark text-lg mb-5">Tech Stack (MERN + AI)</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {stack.map(({ name, role }) => (
              <div key={name} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-brand-purpleLight flex items-center justify-center text-brand-purple font-bold text-sm">
                  {name[0]}
                </div>
                <p className="text-[11px] font-semibold text-brand-purpleDark mt-2">{name}</p>
                <p className="text-[10px] text-gray-400">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
