import {
  Ambulance,
  Building2,
  Pill,
  HomeIcon,
  Siren,
  Globe,
  User,
  ClipboardList,
  BrainCircuit,
  Grid2x2,
  Cpu,
  BarChart3,
  Bell,
  Smartphone,
  Droplets,
  Footprints,
} from 'lucide-react'

const emergencyItems = [
  { icon: Ambulance, title: 'Ambulance (24/7)', desc: 'One tap ambulance booking' },
  { icon: Building2, title: 'Nearby Hospitals', desc: 'Find hospitals near you' },
  { icon: Pill, title: 'Medical Shop', desc: 'Check medicine availability' },
  { icon: HomeIcon, title: 'Home Care', desc: 'Book nurses & caretakers' },
  { icon: Siren, title: 'SOS Alert', desc: 'Instant alert to contacts & authorities' },
]

const flowSteps = [
  { icon: Globe, label: 'User Visits Website' },
  { icon: User, label: 'Login / Signup' },
  { icon: ClipboardList, label: 'Profile Creation' },
  { icon: BrainCircuit, label: 'AI Understands User' },
]

const flowStepsRow2 = [
  { icon: Grid2x2, label: 'Choose Service' },
  { icon: Cpu, label: 'AI Processing' },
  { icon: BarChart3, label: 'Results & Insights' },
  { icon: Bell, label: 'Recommendations & Alerts' },
]

export default function EmergencyAndFlow() {
  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid lg:grid-cols-3 gap-6 items-start">
        {/* Emergency services */}
        <div className="bg-white border border-rose-100 rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-rose-500 text-lg">Emergency Services</h3>
          <p className="text-xs text-gray-400 mb-5">One click is all it takes</p>
          <div className="space-y-4">
            {emergencyItems.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-purpleDark">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 rounded-full bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 transition-colors">
            Trigger SOS Now
          </button>
        </div>

        {/* System flow */}
        <div className="bg-white border border-brand-purpleLight rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-brand-purpleDark text-lg text-center">
            System Flow (Website)
          </h3>

          <div className="mt-6 grid grid-cols-4 gap-2 text-center">
            {flowSteps.map(({ icon: Icon, label }, i) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-brand-purpleLight text-brand-purple flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center text-brand-purple/40 my-2 text-lg">&#8595;</div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {flowStepsRow2.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-11 h-11 rounded-xl bg-brand-purpleLight text-brand-purple flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <p className="text-[11px] text-gray-500 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 bg-brand-purpleLight/70 rounded-full py-2.5 px-4 text-xs font-semibold text-brand-purple">
            <Smartphone size={16} />
            Smart Notifications (Email / SMS / In-App)
          </div>
        </div>

        {/* Dashboard */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-card p-6">
          <h3 className="font-display font-bold text-brand-purpleDark text-lg">Personalized Dashboard</h3>
          <p className="text-xs text-gray-400 mb-4">Your health, all in one place</p>

          <div className="flex items-center justify-between bg-brand-purpleLight/50 rounded-xl px-4 py-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-brand-purpleDark">Hello, Urbi 👋</p>
              <p className="text-xs text-gray-400">Welcome back!</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-purple/20" />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Health Score</p>
              <p className="text-xl font-bold text-emerald-500">85<span className="text-xs text-gray-400">/100</span></p>
              <p className="text-[10px] text-emerald-500">Good job!</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Cycle Status</p>
              <p className="text-xl font-bold text-rose-500">Day 5</p>
              <p className="text-[10px] text-rose-400">Fertile Window</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center">
            <div className="bg-gray-50 rounded-xl p-2">
              <Droplets size={16} className="mx-auto text-amber-400" />
              <p className="text-[10px] text-gray-400 mt-1">Mood</p>
              <p className="text-xs font-semibold text-brand-purpleDark">Good</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <Droplets size={16} className="mx-auto text-sky-400" />
              <p className="text-[10px] text-gray-400 mt-1">Water Intake</p>
              <p className="text-xs font-semibold text-brand-purpleDark">6/8 Glasses</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-2">
              <Footprints size={16} className="mx-auto text-emerald-400" />
              <p className="text-[10px] text-gray-400 mt-1">Steps</p>
              <p className="text-xs font-semibold text-brand-purpleDark">4,236</p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-xs bg-amber-50 text-amber-600 rounded-lg px-3 py-2">
              <span className="font-semibold">Upcoming Reminder:</span> Doctor Appointment — 12 May, 11:00 AM
            </div>
            <div className="text-xs bg-brand-purpleLight text-brand-purple rounded-lg px-3 py-2">
              <span className="font-semibold">AI Suggestion:</span> Drink more water or try relaxation exercises
            </div>
            <div className="text-xs bg-emerald-50 text-emerald-600 rounded-lg px-3 py-2">
              <span className="font-semibold">Nearby Hospital:</span> City Care Hospital — 1.2 km away
            </div>
          </div>

          <button className="w-full py-2.5 rounded-full bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors">
            Emergency SOS
          </button>
        </div>
      </div>
    </section>
  )
}
