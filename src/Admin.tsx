import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { Lock, LogOut, Users, Loader2, AlertCircle } from 'lucide-react';

// --- CONFIGURATION ---
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    // 2. LISTEN for the Magic Link redirect (Crucial Step!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    );
  }

  // If no user, show Login. If user exists, show Dashboard.
  return session ? <AdminDashboard session={session} /> : <AdminLogin />;
}

// --- SUB-COMPONENT: LOGIN FORM ---
function AdminLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    // Ensure we redirect back to THIS page after login
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href, // Redirects back to /admin
      },
    });

    setLoading(false);
    if (error) setMsg(error.message);
    else setMsg('Magic link sent! Check your email.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <Lock size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Access</h2>
        <p className="text-center text-gray-500 mb-6">Enter your email to manage the waitlist.</p>
        
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${msg.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <AlertCircle size={16} /> {msg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@tradesquare.ng"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
            required
          />
          <button
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 flex justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Send Magic Link'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: DASHBOARD ---
// --- SUB-COMPONENT: DASHBOARD ---
function AdminDashboard({ session }: { session: any }) {
  // Store full data for the table
  const [emails, setEmails] = useState<any[]>([]);
  // Store processed stats for the chart
  const [stats, setStats] = useState<{ total: number; dailyData: any[] }>({ total: 0, dailyData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // 1. Fetch EVERYTHING (email + date), ordered by newest first
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      alert("Error loading data. Check RLS policies.");
    } else if (data) {
      setEmails(data);

      // 2. Process Data for Chart (needs chronological order)
      // We clone the array and reverse it so the chart goes Left->Right (Old->New)
      const sortedForChart = [...data].reverse();
      
      const grouped = sortedForChart.reduce((acc: any, curr: any) => {
        const date = format(parseISO(curr.created_at), 'MMM dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(grouped).map((date) => ({
        date,
        signups: grouped[date],
      }));
      
      setStats({ total: data.length, dailyData: chartData });
    }
    setLoading(false);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    alert(`Copied: ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Waitlist Overview</h1>
             <p className="text-sm text-gray-400 mt-1">Logged in as {session.user.email}</p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Top Grid: Stats & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total Count */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <Users size={24} />
              </div>
              <span className="text-gray-500 font-medium">Total Signups</span>
            </div>
            <p className="text-5xl font-extrabold text-gray-900 mt-2">
               {loading ? '...' : stats.total}
            </p>
          </div>

          {/* Card 2: The Chart (Span 2 columns) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Growth Trend</h3>
            <div className="h-[200px] w-full">
              {loading ? (
                 <div className="h-full flex items-center justify-center text-gray-300">Loading...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="signups" fill="#009c41" radius={[4, 4, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: The Email Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Signed Up Users</h3>
            <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              Newest First
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">#</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emails.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6 text-gray-400 text-sm font-mono">
                      {emails.length - index}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-between max-w-sm">
                        <span className="text-gray-900 font-medium">{row.email}</span>
                        <button 
                          onClick={() => copyEmail(row.email)}
                          className="opacity-0 group-hover:opacity-100 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-all"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-500">
                      {format(parseISO(row.created_at), 'MMM dd, yyyy • h:mm a')}
                    </td>
                  </tr>
                ))}
                
                {emails.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-gray-400">
                      No signups yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}