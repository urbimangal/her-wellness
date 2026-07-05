import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import AIAssistant from './components/AIAssistant'
import EmergencyAndFlow from './components/EmergencyAndFlow'
import AnalyticsAndCommunity from './components/AnalyticsAndCommunity'
import MissionAndStack from './components/MissionAndStack'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <Hero />
      <Features />
      <AIAssistant />
      <EmergencyAndFlow />
      <AnalyticsAndCommunity />
      <MissionAndStack />
      <Footer />
    </div>
  )
}

export default App
