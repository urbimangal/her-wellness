import { Bot, MessageCircle, Stethoscope, Lightbulb, Smile, FileScan, Mic, BellRing } from 'lucide-react'

const capabilities = [
  { icon: MessageCircle, title: 'AI Chatbot', desc: 'Get answers to your health questions' },
  { icon: Stethoscope, title: 'Symptom Checker', desc: 'Check possible conditions & suggestions' },
  { icon: FileScan, title: 'Risk Prediction', desc: 'AI identifies potential health risks' },
  { icon: Lightbulb, title: 'Personalized Insights', desc: 'AI gives tips & recommendations just for you' },
  { icon: Smile, title: 'Mood Detection', desc: 'Detects mood patterns & suggests activities' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Use voice commands for easy access' },
  { icon: FileScan, title: 'Prescription Scanner', desc: 'Upload & read prescriptions using OCR' },
  { icon: BellRing, title: 'Smart Reminders', desc: 'Never miss your meds, appointments & more' },
]

export default function AIAssistant() {
  return (
    <section className="bg-brand-purpleLight/50 py-16">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="bg-white rounded-3xl shadow-card p-8 md:p-10 grid md:grid-cols-[auto_1fr] gap-10 items-start">
          <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6">
            <div className="w-20 h-20 rounded-full gradient-purple flex items-center justify-center shrink-0">
              <Bot size={38} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl md:text-2xl text-brand-purpleDark">
                AI-Powered Health Assistant
              </h2>
              <p className="text-gray-400 text-sm mt-1 max-w-xs">
                A smart companion that understands your health, mood and needs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-purpleLight text-brand-purple flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-purpleDark">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
