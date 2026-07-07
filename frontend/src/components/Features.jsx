import { Droplet, Brain, Baby, Activity, Siren, MapPin } from 'lucide-react'

const features = [
  {
    icon: Droplet,
    title: 'Menstrual Tracker',
    color: 'text-rose-500 bg-rose-50',
    items: ['Cycle Tracking', 'Period Prediction', 'Smart Reminders'],
  },
  {
    icon: Brain,
    title: 'Mental Wellness',
    color: 'text-brand-purple bg-brand-purpleLight',
    items: ['Mood Tracking', 'Stress Analysis', 'Meditation & Tips'],
  },
  {
    icon: Baby,
    title: 'Pregnancy Care',
    color: 'text-pink-500 bg-pink-50',
    items: ['Trimester Tracking', 'Baby Growth', 'Doctor Suggestions'],
  },
  {
    icon: Activity,
    title: 'Fitness & Activity',
    color: 'text-emerald-500 bg-emerald-50',
    items: ['Workouts', 'Calorie Tracker', 'Water Intake'],
  },
  {
    icon: Siren,
    title: 'Emergency SOS',
    color: 'text-red-500 bg-red-50',
    items: ['Live Location Share', 'Emergency Contacts', 'Police Alert'],
  },
  {
    icon: MapPin,
    title: 'Nearby Services',
    color: 'text-violet-500 bg-violet-50',
    items: ['Hospitals', 'Medical Shops', 'Home Care & More'],
  },
]

export default function Features() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-brand-purpleDark">
            Explore Our Key Features
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Everything you need for a healthier, safer &amp; happier life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, color, items }) => (
            <div
              key={title}
              className="bg-white border border-gray-100 rounded-2xl shadow-card p-6 hover:shadow-cardHover hover:-translate-y-1 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-display font-semibold text-brand-purpleDark mb-3">{title}</h3>
              <ul className="space-y-1.5 mb-4">
                {items.map((item) => (
                  <li key={item} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-purple/50" />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="text-sm font-semibold text-brand-purple hover:underline">
                Explore &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
