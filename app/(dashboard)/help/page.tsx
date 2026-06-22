'use client';
import { HelpCircle, MessageCircle, BookOpen, Phone, ChevronDown } from 'lucide-react';
import TopBar from '../../components/TopBar';

const faqs = [
  { q: 'How does the AI price suggestion work?', a: 'Our AI uses a Gradient Boosting model trained on historical oil market prices, factoring in oil type, grade, volume, season, and local demand patterns to suggest a fair price range.' },
  { q: 'How do I get my FSSAI certificate?', a: 'Certificates are auto-generated after each completed pickup. Go to Compliance Docs → download the relevant certificate.' },
  { q: 'Who are the verified buyers?', a: 'ReLoop only connects you with FSSAI-licensed biodiesel producers, CPCB-authorized recyclers, and verified resellers. All buyers are vetted before onboarding.' },
  { q: 'What is the commission on each transaction?', a: 'ReLoop charges 5–8% on completed Oil Exchange and E-Waste Marketplace transactions. No charge for rainwater tracking.' },
  { q: 'How does rainwater forecasting work?', a: 'We use the Prophet time-series model on IMD/OpenWeatherMap historical rainfall data, combined with your building catchment area × runoff coefficient formula.' },
  { q: 'Can I cancel a scheduled pickup?', a: 'Yes — go to Schedule Pickup → Upcoming Pickups and click Cancel on any Requested pickup. Confirmed pickups need to be cancelled 12 hrs in advance.' },
];

export default function HelpPage() {
  return (
    <div>
      <TopBar title="Help & Support" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with support team', action: 'Start Chat', color: '#1B5E20', bg: '#F1F8F0' },
          { icon: Phone,         label: 'Call Support', desc: '+91 98765 43210', action: 'Call Now', color: '#2196F3', bg: '#E8F2FC' },
          { icon: BookOpen,      label: 'Documentation', desc: 'Full platform guide', action: 'Read Docs', color: '#F59E0B', bg: '#FDF3E3' },
        ].map(({ icon: Icon, label, desc, action, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>{label}</div>
            <div className="text-sm mb-4" style={{ color: '#5B6B63' }}>{desc}</div>
            <button className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: color }}>{action}</button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle size={18} style={{ color: '#1B5E20' }} />
          <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>FREQUENTLY ASKED QUESTIONS</h3>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 list-none">
                <span className="text-sm font-semibold" style={{ color: '#1F2A24' }}>{faq.q}</span>
                <ChevronDown size={16} style={{ color: '#5B6B63' }} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm" style={{ color: '#5B6B63', background: '#FAFAFA' }}>{faq.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
