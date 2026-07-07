import { Heart, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react'

const columns = [
  {
    title: 'Company',
    links: ['About Us', 'Our Mission', 'Careers', 'Contact Us'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'FAQs', 'Privacy Policy', 'Terms & Conditions'],
  },
  {
    title: 'Important Links',
    links: ['Emergency Numbers', 'Health Resources', 'Community Guidelines'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-brand-purpleDark text-white pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-10 pb-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Heart size={18} fill="white" />
            </div>
            <p className="font-display font-bold text-lg">HerWellness</p>
          </div>
          <p className="text-white/60 text-sm max-w-xs">
            Health &amp; Wellness for Every Woman.
          </p>
        </div>

        {columns.map(({ title, links }) => (
          <div key={title}>
            <p className="font-semibold mb-3 text-sm">{title}</p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-white/60 text-sm hover:text-white transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="font-semibold mb-3 text-sm">Connect With Us</p>
          <div className="flex gap-3">
            {[Facebook, Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 text-center text-xs text-white/50">
        &copy; 2026 HerWellness. All rights reserved.
      </div>
    </footer>
  )
}
