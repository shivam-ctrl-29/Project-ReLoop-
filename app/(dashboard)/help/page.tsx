'use client';
import { useState } from 'react';
import { HelpCircle, MessageCircle, BookOpen, Phone, ChevronDown, Search, Mail, ExternalLink } from 'lucide-react';
import TopBar from '../../components/TopBar';

const faqs = [
  { q: 'How does the AI price suggestion work?',
    a: 'Our AI uses a Gradient Boosting model trained on historical oil market prices, factoring in oil type, grade, volume, season, and local demand patterns to suggest a fair price range. Accuracy is ~94% vs. spot market.' },
  { q: 'How do I get my FSSAI certificate?',
    a: 'Certificates are auto-generated after each completed pickup. Go to Compliance Docs → find your pickup → click Download to get a signed PDF certificate.' },
  { q: 'Who are the verified buyers?',
    a: 'ReLoop only connects you with FSSAI-licensed biodiesel producers, CPCB-authorized recyclers, and verified resellers. All buyers are vetted before onboarding and display a verified badge.' },
  { q: 'What is the commission on each transaction?',
    a: 'ReLoop charges 5–8% on completed Oil Exchange and E-Waste Marketplace transactions. There is no charge for rainwater tracking, scheduling, or compliance document downloads.' },
  { q: 'How does rainwater forecasting work?',
    a: 'We use the Prophet time-series model on IMD/OpenWeatherMap historical rainfall data, combined with your building catchment area × runoff coefficient formula to estimate harvestable water.' },
  { q: 'Can I cancel a scheduled pickup?',
    a: 'Yes — go to Schedule Pickup → Upcoming Pickups and click Cancel on any Requested pickup. Confirmed pickups need to be cancelled at least 12 hours in advance.' },
  { q: 'What file formats are reports exported in?',
    a: 'Monthly Impact Reports and CSR/ESG Reports are exported as PDFs generated client-side with jsPDF. Transaction Ledger and NAAC Green Campus data export as CSV files.' },
  { q: 'How do I add more users to my institution?',
    a: 'As an admin, go to Admin Panel → you can view all users. New users can sign up at the /signup page and select your institution. Role can be updated from the Admin Panel.' },
];

export default function HelpPage() {
  const [search, setSearch] = useState('');

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Help & Support" date="June 2026" />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <a href="mailto:support@reloop.in"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer no-underline">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#F1F8F0' }}>
            <Mail size={22} style={{ color: '#1B5E20' }} />
          </div>
          <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>Email Support</div>
          <div className="text-sm mb-4" style={{ color: '#5B6B63' }}>support@reloop.in</div>
          <div className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#1B5E20' }}>
            <Mail size={13} /> Send Email
          </div>
        </a>

        <a href="tel:+919876543210"
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow cursor-pointer no-underline">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#E8F2FC' }}>
            <Phone size={22} style={{ color: '#2196F3' }} />
          </div>
          <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>Call Support</div>
          <div className="text-sm mb-4" style={{ color: '#5B6B63' }}>+91 98765 43210</div>
          <div className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#2196F3' }}>
            <Phone size={13} /> Call Now
          </div>
        </a>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: '#FDF3E3' }}>
            <BookOpen size={22} style={{ color: '#F59E0B' }} />
          </div>
          <div className="font-semibold mb-1" style={{ color: '#1F2A24' }}>Documentation</div>
          <div className="text-sm mb-4" style={{ color: '#5B6B63' }}>Platform user guide & API docs</div>
          <button onClick={() => window.open('https://github.com/econova/reloop', '_blank')}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: '#F59E0B' }}>
            <ExternalLink size={13} /> View Docs
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="font-bold text-sm mb-3" style={{ color: '#1F2A24' }}>SYSTEM STATUS</h3>
        <div className="flex gap-6">
          {[
            { label: 'API',             status: 'Operational' },
            { label: 'Database',        status: 'Operational' },
            { label: 'PDF Generation',  status: 'Operational' },
            { label: 'Auth Service',    status: 'Operational' },
          ].map(({ label, status }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#1B5E20' }} />
              <span className="text-xs font-medium" style={{ color: '#1F2A24' }}>{label}</span>
              <span className="text-xs" style={{ color: '#1B5E20' }}>{status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} style={{ color: '#1B5E20' }} />
            <h3 className="font-bold text-base" style={{ color: '#1F2A24' }}>FREQUENTLY ASKED QUESTIONS</h3>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
            <Search size={13} style={{ color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="text-xs outline-none w-40" style={{ color: '#1F2A24' }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>No FAQs match your search</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, i) => (
              <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 list-none">
                  <span className="text-sm font-semibold pr-4" style={{ color: '#1F2A24' }}>
                    {search ? faq.q.replace(new RegExp(`(${search})`, 'gi'), '<mark>$1</mark>') : faq.q}
                  </span>
                  <ChevronDown size={16} style={{ color: '#5B6B63' }} className="flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: '#5B6B63', background: '#FAFAFA' }}>{faq.a}</div>
              </details>
            ))}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm" style={{ color: '#5B6B63' }}>
            Still have questions? Email us at{' '}
            <a href="mailto:support@reloop.in" className="font-semibold" style={{ color: '#1B5E20' }}>support@reloop.in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
