import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion'; // Smooth animations
import { ShoppingBag, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

// Initialize Supabase (Replace with your actual keys)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') throw new Error("You're already on the list!");
        throw error;
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-300 to-white flex flex-col relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Navbar */}
      <nav className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl text-gray-900">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <ShoppingBag size={18} />
          </div>
          TradeSquare
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10 max-w-4xl mx-auto">
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-primary font-medium text-sm mb-6 border border-green-200">
            🚀 Coming to your campus soon
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
            The Marketplace <br />
            <span className="text-primary">Built for Students.</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Buy, sell, and discover everything you need on campus. 
            From textbooks to gadgets, household items and many more, TradeSquare makes student commerce safe and easy.
          </p>
        </motion.div>

        {/* Waitlist Form */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {status === 'success' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">You're on the list!</h3>
              <p className="text-gray-600">We'll notify you as soon as we launch.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="Enter your student email" 
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-white text-lg outline-none focus:border-primary focus:ring-4 focus:ring-green-50 transition-all placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === 'loading'}
                  required
                />
              </div>
              
              <button 
                disabled={status === 'loading'}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-green-600/20"
              >
                {status === 'loading' ? 'Joining...' : 'Get Early Access'}
                {!status && <ArrowRight size={20} />}
              </button>
            </form>
          )}

          {status === 'error' && (
            <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg justify-center text-sm">
              <AlertCircle size={16} />
              {message}
            </div>
          )}
        </motion.div>

        <p className="mt-8 text-gray-400 text-sm">
          No spam. Unsubscribe anytime.
        </p>

      </main>
    </div>
  );
}