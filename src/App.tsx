import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, AlertCircle, Zap, ShieldCheck, Loader2, X, Heart } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function TradeSquareFinal() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_joined' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase.from('waitlist').insert([{ email }]);
      
      if (error) {
        // Catch duplicate email error and route to friendly modal
        if (error.code === '23505') {
          setStatus('already_joined');
          setEmail('');
          return;
        }
        throw error;
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || "Something went wrong.");
    }
  };

  const closeModal = () => setStatus('idle');

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans relative" style={{ backgroundColor: '#ECFDF5' }}>
      
      {/* Dynamic Success/Info Modal */}
      <AnimatePresence>
        {(status === 'success' || status === 'already_joined') && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: '#6B7280' }}
              >
                <X size={20} />
              </button>

              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: status === 'success' ? '#ECFDF5' : '#FFFBEB' }}>
                  {status === 'success' ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                      <motion.path 
                        d="M20 6L9 17L4 12" 
                        stroke="#16A34A" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </svg>
                  ) : (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                      <Heart size={40} fill="#F59E0B" stroke="#F59E0B" />
                    </motion.div>
                  )}
                </div>
              </div>

              <h3 className="text-2xl font-black mb-2" style={{ color: '#0F172A' }}>
                {status === 'success' ? "Welcome to the Square!" : "Welcome Back!"}
              </h3>
              <p className="mb-8" style={{ color: '#6B7280' }}>
                {status === 'success' 
                  ? "We've added your email to our early access list. We'll be in touch soon!" 
                  : "You're already on the list! We love the enthusiasm—hang tight for our launch."}
              </p>

              <button 
                onClick={closeModal}
                className="w-full py-4 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{ backgroundColor: '#16A34A' }}
              >
                {status === 'success' ? "Awesome" : "Got it!"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Sidebar */}
      <aside className="w-full md:w-1/3 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden" 
             style={{ backgroundColor: '#0F172A' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            {/* <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" 
                 style={{ backgroundColor: '#fff' }}>
              <ShoppingBag size={24} />
            </div> */}
            {/* <div className='w-16 h-16 bg-white'> */}
              <img src="/logo.png" className='w-10' alt="Tradesquare" />
            {/* </div> */}
            <span className="text-2xl font-bold tracking-tight">TradeSquare</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            The Student <br />
            <span style={{ color: '#22C55E' }}>Economy</span> <br />
            Redefined.
          </h2>
          <div className="space-y-6 mt-12">
            <div className="flex items-start gap-4">
              <div className="mt-1" style={{ color: '#22C55E' }}><Zap size={20} /></div>
              <p className="text-sm opacity-80" style={{ color: '#E5E7EB' }}>Instant campus-wide reach for your listings.</p>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1" style={{ color: '#22C55E' }}><ShieldCheck size={20} /></div>
              <p className="text-sm opacity-80" style={{ color: '#E5E7EB' }}>Verified student profiles for safe trading.</p>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" 
             style={{ border: '40px solid #16A34A' }} />
      </aside>

      {/* Form Content Area */}
      <main className="flex-1 flex flex-col p-8 md:p-24 relative">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-5 h-5 rounded-full animate-pulse" style={{ backgroundColor: '#F59E0B' }}></span>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B7280' }}>
            Beta Version Launching Soon
          </span>
        </div>

        <section className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-black mb-8 leading-[1.1]" style={{ color: '#0F172A' }}>
            Ready to <span style={{ color: '#16A34A' }}>Buy & Sell?</span>
          </h1>
          <p className="text-lg mb-12 leading-relaxed" style={{ color: '#6B7280' }}>
            Stop wasting time on sketchy group chats. Join the waitlist for the only marketplace 
            officially designed for Nigerian campus life.
          </p>

          <form onSubmit={handleSubmit} className="p-1 rounded-2xl bg-white shadow-xl border flex flex-col md:flex-row gap-2" style={{ borderColor: '#E5E7EB' }}>
            <input 
              type="email" 
              placeholder="student@university.edu" 
              className="flex-1 px-6 py-5 rounded-xl text-lg outline-none transition-all disabled:opacity-50"
              style={{ color: '#111827' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              required
            />
            <button 
              disabled={status === 'loading'}
              className="px-8 py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95 text-white disabled:opacity-70"
              style={{ backgroundColor: '#16A34A' }}
            >
              {status === 'loading' ? <Loader2 size={24} className="animate-spin" /> : <>Join Waitlist <ArrowRight size={20} /></>}
            </button>
          </form>

          {/* Regular Errors (Not Duplicate Email) */}
          {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                        className="mt-6 flex items-center gap-2 p-4 rounded-xl border bg-white" 
                        style={{ borderColor: '#F59E0B', color: '#0F172A' }}>
              <AlertCircle size={20} style={{ color: '#F59E0B' }} />
              <span className="text-sm font-medium">{message}</span>
            </motion.div>
          )}
        </section>

        <footer className="mt-auto pt-12 flex justify-between items-center border-t" style={{ borderColor: '#E5E7EB' }}>
          <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>&copy; 2026 TRADESQUARE NOVA</p>
          <div className="flex gap-4">
             <span className="text-xs font-bold cursor-pointer" style={{ color: '#0F172A' }}>Privacy</span>
             <span className="text-xs font-bold cursor-pointer" style={{ color: '#0F172A' }}>Campus Terms</span>
          </div>
        </footer>
      </main>
    </div>
  );
}