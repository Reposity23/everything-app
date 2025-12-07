import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithCustomToken, 
  onAuthStateChanged,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  getDoc,
  arrayUnion,
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import { 
  Home, User, Settings, Plus, Trash2, Check, X, Camera, Bell, 
  Calendar, Book, DollarSign, Heart, Globe, MessageCircle, 
  ArrowLeft, Edit2, Clock, MapPin, AlertTriangle, Loader, 
  Download, Upload, Droplet, Play, Pause, RotateCcw, 
  Search, Star, BarChart2, Coffee, Moon, Sun, Music, 
  Calculator, List, Grid, Shield, Layout, ShoppingBag, CreditCard,
  Gift, CornerDownRight, ThumbsUp, Image as ImageIcon, FileJson,
  Activity, Smile, Frown, Meh, Wind, Zap, Film, Utensils,
  Target, Bookmark, Share2, Lock, Eye, EyeOff, RefreshCw,
  MoreHorizontal, Scissors, Link as LinkIcon, ToggleLeft, ToggleRight
} from 'lucide-react';

// --- Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyArmWSHsDuQCef_zLjihy1nwT_ht36XTsM",
  authDomain: "everything-app-8584d.firebaseapp.com",
  projectId: "everything-app-8584d",
  storageBucket: "everything-app-8584d.firebasestorage.app",
  messagingSenderId: "1080483334998",
  appId: "1:1080483334998:web:203e74e69f07dd2a7964f7",
  measurementId: "G-DBZRRK1B0F"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : "life-os-utility-v5-ultimate"; 

// --- Themes ---
const THEMES = [
  { id: 'slate', name: 'Minimal', bg: 'bg-slate-50', card: 'bg-white', primary: 'bg-slate-900', text: 'text-slate-800', accent: 'text-slate-600', border: 'border-slate-200', gradient: 'from-slate-800 to-slate-900' },
  { id: 'rose', name: 'Blush', bg: 'bg-rose-50', card: 'bg-white', primary: 'bg-rose-500', text: 'text-rose-900', accent: 'text-rose-600', border: 'border-rose-200', gradient: 'from-rose-400 to-rose-600' },
  { id: 'ocean', name: 'Ocean', bg: 'bg-blue-50', card: 'bg-white', primary: 'bg-blue-600', text: 'text-blue-900', accent: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-cyan-600' },
  { id: 'forest', name: 'Forest', bg: 'bg-emerald-50', card: 'bg-white', primary: 'bg-emerald-600', text: 'text-emerald-900', accent: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'sunset', name: 'Sunset', bg: 'bg-orange-50', card: 'bg-white', primary: 'bg-orange-500', text: 'text-orange-900', accent: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-400 to-red-500' },
  { id: 'royal', name: 'Royal', bg: 'bg-violet-50', card: 'bg-white', primary: 'bg-violet-600', text: 'text-violet-900', accent: 'text-violet-600', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-600' },
  { id: 'dark', name: 'Midnight', bg: 'bg-gray-900', card: 'bg-gray-800', primary: 'bg-indigo-500', text: 'text-gray-100', accent: 'text-gray-400', border: 'border-gray-700', gradient: 'from-gray-800 to-black' },
  { id: 'high-contrast', name: 'Contrast', bg: 'bg-black', card: 'bg-gray-900', primary: 'bg-yellow-400', text: 'text-yellow-400', accent: 'text-white', border: 'border-yellow-400', gradient: 'from-black to-gray-900' }, // New Feature: Accessibility
];

// --- Utilities ---
const parseTimeRange = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes('-')) return { start: '', end: '' };
  const convertTo24 = (t) => {
    const cleanT = t.trim().replace(/\./g, '').toUpperCase(); 
    const parts = cleanT.split(' ');
    if (parts.length < 2) return cleanT;
    let [hours, minutes] = parts[0].split(':');
    const modifier = parts[1];
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  const [startRaw, endRaw] = timeStr.split('-');
  return { start: convertTo24(startRaw), end: convertTo24(endRaw) };
};

const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      }
    }
  });
};

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${suffix}`;
};

const formatDate = (val) => {
  if (!val) return '';
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  if (val && typeof val.toDate === 'function') return val.toDate().toLocaleDateString('en-US', options);
  return new Date(val).toLocaleDateString('en-US', options);
};

// --- UI Components ---
const Toast = ({ message, onClose, type='info' }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 w-11/12 max-w-sm">
      <div className={`bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border border-slate-700`}>
        {type === 'error' ? <AlertTriangle size={18} className="text-red-400" /> : <Bell size={18} className="text-yellow-400 animate-pulse" />}
        <span className="text-sm font-medium flex-1">{message}</span>
        <button onClick={onClose}><X size={16} className="opacity-70" /></button>
      </div>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', theme, type="button", disabled=false, icon: Icon }) => {
  const safeTheme = theme || THEMES[0];
  const baseStyle = "px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: `bg-gradient-to-r ${safeTheme.gradient} text-white shadow-lg shadow-${safeTheme.id}-500/20 hover:shadow-xl hover:-translate-y-0.5`,
    secondary: `${safeTheme.card} ${safeTheme.text} border ${safeTheme.border} hover:bg-gray-50`,
    ghost: "bg-transparent hover:bg-black/5 p-2",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {Icon && <Icon size={18} />} {children}
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, required = false, theme, className="", textarea=false, rows=3 }) => {
  const safeTheme = theme || THEMES[0];
  const inputClass = `w-full p-3.5 rounded-xl border ${safeTheme.border} focus:ring-2 focus:ring-opacity-50 focus:outline-none ${safeTheme.card} ${safeTheme.text} shadow-sm transition-all`;
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide opacity-70 ${safeTheme.text}`}>{label}</label>}
      {textarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={inputClass} />
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} className={inputClass} style={{ '--tw-ring-color': safeTheme.primary }} />
      )}
    </div>
  );
};

const ImageUploader = ({ onImageSelected, theme }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const compressed = await compressImage(e.target.files[0]);
      onImageSelected(compressed);
    }
  };
  return (
    <div className="flex items-center gap-2 mb-4 w-full">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <Button theme={theme} variant="secondary" onClick={() => fileInputRef.current.click()} className="text-sm py-2 w-full border-dashed" icon={ImageIcon}>
        Add Photo
      </Button>
    </div>
  );
};

const Card = ({ children, className = '', theme, title, action }) => {
  const safeTheme = theme || THEMES[0];
  return (
    <div className={`${safeTheme.card} p-5 rounded-2xl shadow-sm border ${safeTheme.border} ${className} transition-all`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-100/10">
          {title && <h3 className={`font-bold text-lg ${safeTheme.text}`}>{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
};

// --- HUB: The 40+ Features Super App Container ---
const HubModule = ({ user, theme }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [state, setState] = useState({}); // Local state for simple tools

  // Helper for simple local storage tools
  const useToolState = (key, initial) => {
    const [val, setVal] = useState(() => {
       const saved = localStorage.getItem(`lifeos_tool_${key}_${user.uid}`);
       return saved ? JSON.parse(saved) : initial;
    });
    const update = (v) => {
      const newVal = typeof v === 'function' ? v(val) : v;
      setVal(newVal);
      localStorage.setItem(`lifeos_tool_${key}_${user.uid}`, JSON.stringify(newVal));
    };
    return [val, update];
  };

  // --- Feature Components (Mini Apps) ---
  
  const BMICalculator = () => {
    const [h, setH] = useState('');
    const [w, setW] = useState('');
    const [bmi, setBmi] = useState(null);
    const calc = () => {
      const hm = h / 100;
      setBmi((w / (hm * hm)).toFixed(1));
    }
    return (
      <Card theme={theme} title="BMI Calculator">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Input theme={theme} type="number" placeholder="Height (cm)" value={h} onChange={e=>setH(e.target.value)} />
          <Input theme={theme} type="number" placeholder="Weight (kg)" value={w} onChange={e=>setW(e.target.value)} />
        </div>
        <Button theme={theme} onClick={calc} className="w-full">Calculate</Button>
        {bmi && <div className="mt-4 text-center text-3xl font-bold">{bmi}</div>}
      </Card>
    )
  };

  const DecisionRoulette = () => {
    const [options, setOptions] = useState('');
    const [result, setResult] = useState('');
    const spin = () => {
      const opts = options.split(',').map(s => s.trim()).filter(s => s);
      if(opts.length > 0) setResult(opts[Math.floor(Math.random() * opts.length)]);
    }
    return (
      <Card theme={theme} title="Decision Maker">
        <Input theme={theme} placeholder="Option 1, Option 2, Option 3..." value={options} onChange={e=>setOptions(e.target.value)} />
        <Button theme={theme} onClick={spin} className="w-full" icon={RefreshCw}>Spin</Button>
        {result && <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl text-center font-bold text-xl animate-in zoom-in">{result}</div>}
      </Card>
    )
  };

  const PasswordGenerator = () => {
    const [pass, setPass] = useState('');
    const generate = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let p = "";
      for(let i=0; i<12; i++) p += chars.charAt(Math.floor(Math.random() * chars.length));
      setPass(p);
    }
    return (
      <Card theme={theme} title="Password Gen">
        <div className="p-3 bg-gray-100 rounded mb-2 font-mono break-all text-center select-all">{pass || 'Click Generate'}</div>
        <Button theme={theme} onClick={generate} className="w-full" icon={Lock}>Generate Secure Pass</Button>
      </Card>
    )
  };

  const BillSplitter = () => {
    const [total, setTotal] = useState('');
    const [people, setPeople] = useState('');
    return (
      <Card theme={theme} title="Bill Splitter">
        <Input theme={theme} type="number" placeholder="Total Amount" value={total} onChange={e=>setTotal(e.target.value)} />
        <Input theme={theme} type="number" placeholder="Number of People" value={people} onChange={e=>setPeople(e.target.value)} />
        <div className="text-center font-bold text-xl mt-2">
           ${((parseFloat(total)||0) / (parseInt(people)||1)).toFixed(2)} per person
        </div>
      </Card>
    )
  };

  const UnitConverter = () => {
    const [val, setVal] = useState('');
    // Simple Km to Miles for demo
    return (
      <Card theme={theme} title="Converter (Km → Mi)">
         <Input theme={theme} type="number" placeholder="Kilometers" value={val} onChange={e=>setVal(e.target.value)} />
         <div className="text-center font-bold">{(val * 0.621371).toFixed(2)} Miles</div>
      </Card>
    )
  };

  const BreathingBox = () => {
    const [phase, setPhase] = useState('Inhale');
    useEffect(() => {
      const interval = setInterval(() => {
        setPhase(p => p === 'Inhale' ? 'Hold' : p === 'Hold' ? 'Exhale' : 'Inhale');
      }, 4000);
      return () => clearInterval(interval);
    }, []);
    return (
      <Card theme={theme} title="Zen Breath">
        <div className={`h-40 w-40 mx-auto rounded-full flex items-center justify-center transition-all duration-[4000ms] border-4 ${phase === 'Inhale' ? 'bg-blue-100 scale-110 border-blue-500' : 'bg-white scale-90 border-gray-200'}`}>
          <span className="font-bold text-lg">{phase}</span>
        </div>
      </Card>
    )
  };

  const SimpleListTool = ({ title, storageKey, icon: Icon }) => {
    const [items, setItems] = useToolState(storageKey, []);
    const [input, setInput] = useState('');
    const add = () => { if(input) { setItems([...items, {id: Date.now(), text: input}]); setInput(''); }};
    return (
      <Card theme={theme} title={title}>
        <div className="flex gap-2 mb-2">
          <Input theme={theme} value={input} onChange={e=>setInput(e.target.value)} placeholder="Add item..." className="mb-0 flex-1"/>
          <Button theme={theme} onClick={add} icon={Plus}></Button>
        </div>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {items.map(i => (
            <div key={i.id} className="p-2 border rounded flex justify-between items-center text-sm">
              {i.text}
              <button onClick={() => setItems(items.filter(x => x.id !== i.id))}><X size={14}/></button>
            </div>
          ))}
        </div>
      </Card>
    )
  };

  const tools = [
    { id: 'bmi', label: 'BMI Calc', icon: Activity, comp: <BMICalculator/> },
    { id: 'decision', label: 'Decide', icon: RefreshCw, comp: <DecisionRoulette/> },
    { id: 'pass', label: 'Passwords', icon: Lock, comp: <PasswordGenerator/> },
    { id: 'split', label: 'Split Bill', icon: Scissors, comp: <BillSplitter/> },
    { id: 'convert', label: 'Converter', icon: RefreshCw, comp: <UnitConverter/> },
    { id: 'breath', label: 'Breathe', icon: Wind, comp: <BreathingBox/> },
    { id: 'movies', label: 'Movies', icon: Film, comp: <SimpleListTool title="Watchlist" storageKey="movies" icon={Film}/> },
    { id: 'books', label: 'Books', icon: Book, comp: <SimpleListTool title="Reading List" storageKey="books" icon={Book}/> },
    { id: 'bucket', label: 'Bucket', icon: Target, comp: <SimpleListTool title="Bucket List" storageKey="bucket" icon={Target}/> },
    { id: 'recipes', label: 'Recipes', icon: Utensils, comp: <SimpleListTool title="Recipe Ideas" storageKey="recipes" icon={Utensils}/> },
    { id: 'goals', label: 'Goals', icon: Star, comp: <SimpleListTool title="Goals 2025" storageKey="goals" icon={Star}/> },
    { id: 'ideas', label: 'Ideas', icon: Zap, comp: <SimpleListTool title="Bright Ideas" storageKey="ideas" icon={Zap}/> },
    { id: 'subs', label: 'Subs', icon: CreditCard, comp: <SimpleListTool title="Subscriptions" storageKey="subs" icon={CreditCard}/> },
    { id: 'ref', label: 'Links', icon: LinkIcon, comp: <SimpleListTool title="Reference Links" storageKey="links" icon={LinkIcon}/> },
  ];

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-4 gap-2">
         {tools.map(t => (
           <button key={t.id} onClick={() => setActiveTool(activeTool === t.id ? null : t.id)} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${theme.border} ${activeTool === t.id ? theme.primary + ' text-white' : theme.card} transition-all`}>
             <t.icon size={20} />
             <span className="text-[10px] mt-1 font-bold truncate w-full text-center">{t.label}</span>
           </button>
         ))}
       </div>
       {activeTool && (
         <div className="animate-in fade-in slide-in-from-bottom-4">
           {tools.find(t => t.id === activeTool)?.comp}
         </div>
       )}
    </div>
  )
}

// --- Schedule Module (Fixed Import) ---
const ScheduleModule = ({ user, theme }) => {
  const [classes, setClasses] = useState([]);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [toast, setToast] = useState(null);
  const [manualData, setManualData] = useState({ name: '', day: 'Monday', startTime: '', endTime: '', room: '', code: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user || user.isDemo) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'schedule'), orderBy('startTime'));
    return onSnapshot(q, (snap) => setClasses(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const processImportData = async (data) => {
    try {
      const batch = writeBatch(db);
      let count = 0;
      Object.keys(data).forEach(day => {
        if(!Array.isArray(data[day])) return;
        data[day].forEach(item => {
          const isBreak = !!item.break;
          const name = isBreak ? item.break : item.subject;
          const room = item.room || (isBreak ? 'Break' : 'TBA');
          const code = item.code || '';
          const times = parseTimeRange(item.time);
          if (!times.start) return;
          const docRef = doc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'schedule'));
          batch.set(docRef, { name, code, day, startTime: times.start, endTime: times.end, room, isBreak, createdAt: new Date().toISOString() });
          count++;
        });
      });
      if (count > 0) { await batch.commit(); setToast(`Success! Imported ${count} items.`); setShowImport(false); setJsonInput(''); } 
      else { setToast('No valid items found.'); }
    } catch (e) { setToast('Import failed. Check JSON format.'); }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if(user.isDemo) return;
    await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'schedule'), {
      ...manualData, isBreak: false, createdAt: new Date().toISOString()
    });
    setToast('Class added!');
    setManualData({ name: '', day: 'Monday', startTime: '', endTime: '', room: '', code: '' });
    setShowManual(false);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="flex gap-2">
        <Button theme={theme} className="flex-1" icon={Upload} onClick={() => { setShowImport(!showImport); setShowManual(false); }}>Import JSON</Button>
        <Button theme={theme} variant="secondary" icon={Plus} onClick={() => { setShowManual(!showManual); setShowImport(false); }}>Manual Add</Button>
      </div>

      {showManual && (
        <Card theme={theme} title="Add Class">
           <form onSubmit={handleManualAdd}>
             <Input theme={theme} label="Subject" value={manualData.name} onChange={e => setManualData({...manualData, name: e.target.value})} required />
             <div className="grid grid-cols-2 gap-4">
               <Input theme={theme} label="Code" value={manualData.code} onChange={e => setManualData({...manualData, code: e.target.value})} />
               <div>
                  <label className={`block text-xs font-bold mb-1 opacity-70 ${theme.text}`}>Day</label>
                  <select className={`w-full p-3.5 rounded-xl border ${theme.border} bg-white mb-4`} value={manualData.day} onChange={e => setManualData({...manualData, day: e.target.value})}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <Input theme={theme} type="time" label="Start" value={manualData.startTime} onChange={e => setManualData({...manualData, startTime: e.target.value})} required/>
               <Input theme={theme} type="time" label="End" value={manualData.endTime} onChange={e => setManualData({...manualData, endTime: e.target.value})} required/>
             </div>
             <Input theme={theme} label="Room" value={manualData.room} onChange={e => setManualData({...manualData, room: e.target.value})} />
             <Button theme={theme} type="submit" className="w-full">Save Class</Button>
           </form>
        </Card>
      )}

      {showImport && (
        <Card theme={theme} title="Import">
          <textarea className={`w-full p-3 text-xs font-mono border rounded-xl mb-3 ${theme.card} ${theme.text} ${theme.border}`} rows={8} value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='Paste JSON...' />
          <Button theme={theme} onClick={() => processImportData(JSON.parse(jsonInput))}>Process</Button>
        </Card>
      )}

      <div className="space-y-8 pb-10">
        {days.map(day => {
          const dayClasses = classes.filter(c => c.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
          if (dayClasses.length === 0) return null;
          return (
            <div key={day}>
               <h4 className={`font-bold text-lg ${theme.text} mb-3 border-b pb-2 ${theme.border}`}>{day}</h4>
               <div className="space-y-3">
                 {dayClasses.map(c => (
                   <div key={c.id} className={`${theme.card} p-4 rounded-xl border ${c.isBreak ? 'border-dashed bg-gray-50' : theme.border} shadow-sm relative group`}>
                      <button onClick={() => deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'schedule', c.id))} className="absolute top-3 right-3 text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center min-w-[60px] border-r pr-4 border-gray-100">
                          <span className="text-sm font-bold">{formatTime12h(c.startTime).split(' ')[0]}</span>
                          <span className="text-[10px] text-gray-400">{formatTime12h(c.startTime).split(' ')[1]}</span>
                          <div className="h-4 w-[1px] bg-gray-200 my-1"></div>
                          <span className="text-xs text-gray-400">{formatTime12h(c.endTime).split(' ')[0]}</span>
                        </div>
                        <div>
                           <h3 className={`font-bold ${theme.text}`}>{c.name}</h3>
                           {!c.isBreak && <div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span className="bg-gray-100 px-2 py-0.5 rounded">{c.code}</span><span className="flex items-center gap-1"><MapPin size={12}/> {c.room}</span></div>}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// --- Wallet Module (Fixed Adding) ---
const WalletModule = ({ user, theme }) => {
  const [activeTab, setActiveTab] = useState('bought');
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', cost: '', image: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.isDemo) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, activeTab), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setItems(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user, activeTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if(user.isDemo) return;
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, activeTab), { ...newItem, createdAt: new Date().toISOString() });
      setNewItem({ name: '', cost: '', image: '' });
      setToast('Item Added!');
    } catch(err) { setToast('Error adding item', 'error'); }
  };

  const total = items.reduce((acc, curr) => acc + (parseFloat(curr.cost) || 0), 0);

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
        {[{id: 'bought', label: 'Bought', icon: ShoppingBag}, {id: 'expenses', label: 'Expenses', icon: CreditCard}, {id: 'wishlist', label: 'Wishlist', icon: Gift}].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white shadow text-black' : 'text-gray-500'}`}>
            <tab.icon size={16} className="mb-1"/>{tab.label}
          </button>
        ))}
      </div>
      <Card theme={theme} className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
         <div className="opacity-70 text-xs font-medium uppercase tracking-wider">Total {activeTab}</div>
         <div className="text-3xl font-bold mt-1">${total.toFixed(2)}</div>
      </Card>
      <Card theme={theme}>
        <form onSubmit={handleAdd}>
          <Input theme={theme} placeholder="Item Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} required />
          <Input theme={theme} type="number" placeholder="Cost ($)" value={newItem.cost} onChange={e => setNewItem({...newItem, cost: e.target.value})} required />
          <ImageUploader theme={theme} onImageSelected={img => setNewItem({...newItem, image: img})} />
          {newItem.image && <img src={newItem.image} className="h-20 w-20 object-cover rounded mb-4" />}
          <Button theme={theme} type="submit" className="w-full">Add Item</Button>
        </form>
      </Card>
      <div className="space-y-3 pb-10">
        {items.map(item => (
          <div key={item.id} className={`${theme.card} p-3 rounded-xl border ${theme.border} flex items-center gap-3 shadow-sm`}>
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
               {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <DollarSign className="w-full h-full p-3 text-gray-400"/>}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{item.name}</div>
              <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
            </div>
            <div className="font-mono font-bold">${item.cost}</div>
            <button onClick={() => deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, activeTab, item.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Diary Module ---
const DiaryModule = ({ user, theme }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ title: '', content: '' });

  useEffect(() => {
    if (!user || user.isDemo) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'diary'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => setEntries(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const addEntry = async (e) => {
    e.preventDefault();
    if(user.isDemo) return;
    await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'diary'), { ...newEntry, createdAt: new Date().toISOString() });
    setNewEntry({ title: '', content: '' });
  };

  return (
    <div className="space-y-6">
      <Card theme={theme} title="New Entry">
        <form onSubmit={addEntry}>
          <Input theme={theme} placeholder="Title" value={newEntry.title} onChange={e=>setNewEntry({...newEntry, title: e.target.value})} required/>
          <Input theme={theme} textarea placeholder="How was your day?" value={newEntry.content} onChange={e=>setNewEntry({...newEntry, content: e.target.value})} required/>
          <Button theme={theme} type="submit" className="w-full">Save Entry</Button>
        </form>
      </Card>
      <div className="space-y-4">
        {entries.map(e => (
          <div key={e.id} className={`${theme.card} p-5 rounded-2xl border ${theme.border} shadow-sm`}>
             <div className="flex justify-between items-start mb-2">
               <h3 className="font-bold text-lg">{e.title}</h3>
               <button onClick={() => deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'diary', e.id))}><Trash2 size={16} className="text-gray-300 hover:text-red-500"/></button>
             </div>
             <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{e.content}</p>
             <div className="mt-3 text-xs text-gray-400 font-medium">{formatDate(e.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Reminders Module (Fixed Adding) ---
const RemindersModule = ({ user, theme }) => {
  const [reminders, setReminders] = useState([]);
  const [newRem, setNewRem] = useState({ title: '', date: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user || user.isDemo) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'reminders'), orderBy('date'));
    return onSnapshot(q, (snap) => setReminders(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  const addReminder = async () => {
    if(!newRem.title || !newRem.date || user.isDemo) return;
    try {
      await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'reminders'), newRem);
      setNewRem({ title: '', date: '' });
      setToast('Reminder Set!');
    } catch(e) { setToast('Error setting reminder', 'error'); }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      <Card theme={theme} title="Add Long Term Reminder">
        <div className="flex gap-2 mb-4">
           <Input theme={theme} placeholder="Title (e.g. Birthday)" value={newRem.title} onChange={e => setNewRem({...newRem, title: e.target.value})} className="flex-1 mb-0"/>
           <Input theme={theme} type="date" value={newRem.date} onChange={e => setNewRem({...newRem, date: e.target.value})} className="mb-0"/>
        </div>
        <Button theme={theme} onClick={addReminder} className="w-full">Set Reminder</Button>
      </Card>
      
      <div className="space-y-3">
        {reminders.map(r => (
          <div key={r.id} className={`${theme.card} p-4 rounded-xl border ${theme.border} flex justify-between items-center shadow-sm`}>
            <div>
              <div className="font-bold text-lg">{r.title}</div>
              <div className="text-sm text-gray-500">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              {/* Countdown logic */}
              <div className="text-xs text-blue-500 font-bold mt-1">
                 {Math.ceil((new Date(r.date) - new Date()) / (1000 * 60 * 60 * 24))} days left
              </div>
            </div>
            <button onClick={() => deleteDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'reminders', r.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Global Feed (Wide) ---
const GlobalFeed = ({ user, theme }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: '', image: '' });

  useEffect(() => {
    const q = query(collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setPosts(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const handlePost = async () => {
    if(!newPost.content && !newPost.image) return;
    await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'posts'), {
      ...newPost, authorId: user.uid, authorName: user.displayName || 'Anonymous', authorPic: user.photoURL || null, createdAt: new Date().toISOString(), likes: []
    });
    setNewPost({ content: '', image: '' });
  };

  const handleLike = async (post) => {
    const ref = doc(db, 'artifacts', APP_ID, 'public', 'data', 'posts', post.id);
    if (post.likes?.includes(user.uid)) await updateDoc(ref, { likes: arrayRemove(user.uid) });
    else await updateDoc(ref, { likes: arrayUnion(user.uid) });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20">
      <Card theme={theme} className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100"><h3 className="font-bold text-gray-500 uppercase text-xs tracking-wider">Share to Community</h3></div>
        <div className="p-4">
           <textarea className="w-full p-2 resize-none focus:outline-none" placeholder="What's on your mind?" rows={3} value={newPost.content} onChange={e=>setNewPost({...newPost, content: e.target.value})} />
           {newPost.image && <img src={newPost.image} className="h-32 rounded-lg object-cover mb-2"/>}
           <div className="flex justify-between items-center mt-2">
             <ImageUploader theme={theme} onImageSelected={img=>setNewPost({...newPost, image: img})}/>
             <Button theme={theme} onClick={handlePost} size="sm">Post</Button>
           </div>
        </div>
      </Card>
      <div className="columns-1 md:columns-2 gap-4 space-y-4">
        {posts.map(post => (
          <div key={post.id} className="break-inside-avoid mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-3 flex items-center gap-2 border-b border-gray-50">
               <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                 {post.authorPic ? <img src={post.authorPic} className="w-full h-full object-cover"/> : <User className="p-1 text-gray-400"/>}
               </div>
               <div><div className="font-bold text-xs">{post.authorName}</div><div className="text-[10px] text-gray-400">{formatDate(post.createdAt)}</div></div>
             </div>
             {post.image && <img src={post.image} className="w-full object-cover max-h-80"/>}
             <div className="p-3">
               <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
             </div>
             <div className="px-3 py-2 bg-gray-50 flex gap-4">
               <button onClick={()=>handleLike(post)} className={`flex items-center gap-1 text-xs font-bold ${post.likes?.includes(user.uid) ? 'text-red-500' : 'text-gray-500'}`}><Heart size={16} fill={post.likes?.includes(user.uid)?"currentColor":"none"}/> {post.likes?.length||0}</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Auth & Main ---
const AuthView = ({ theme, onDemo }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
        await res.user.reload(); // Force refresh to get name
      }
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <Card theme={theme} className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        <form onSubmit={handleAuth}>
          {!isLogin && <Input theme={theme} label="Full Name" value={name} onChange={e=>setName(e.target.value)} required/>}
          <Input theme={theme} label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
          <Input theme={theme} label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          <Button theme={theme} type="submit" className="w-full">{isLogin ? 'Log In' : 'Sign Up'}</Button>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-blue-500 hover:underline">{isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}</button>
        </div>
        <div className="border-t mt-4 pt-4">
           <Button theme={theme} variant="secondary" onClick={onDemo} className="w-full text-xs">Try Demo Mode</Button>
        </div>
      </Card>
    </div>
  );
};

export default function LifeOS() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(THEMES[0]);
  const [view, setView] = useState('home');

  useEffect(() => {
    const init = async () => {
      if (typeof __initial_auth_token !== 'undefined') {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch(e){}
      }
      onAuthStateChanged(auth, u => {
        setUser(u || { uid: 'demo', displayName: 'Demo User', isDemo: true });
        setLoading(false);
      });
    };
    init();
  }, []);

  // --- Exam Prep (Defined inside to access user/theme easily) ---
  const ExamModule = () => {
    const [courses, setCourses] = useState([]);
    const [selCourse, setSelCourse] = useState(null);
    const [newSub, setNewSub] = useState('');
    const [newTopic, setNewTopic] = useState('');

    useEffect(() => {
      if(!user || user.isDemo) return;
      return onSnapshot(query(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'exam_prep')), s => setCourses(s.docs.map(d=>({id:d.id, ...d.data()}))));
    }, []);

    const addSub = async () => {
       if(!newSub || user.isDemo) return;
       await addDoc(collection(db, 'artifacts', APP_ID, 'users', user.uid, 'exam_prep'), { name: newSub, topics: [] });
       setNewSub('');
    };

    const addTopic = async () => {
       if(!selCourse || !newTopic || user.isDemo) return;
       await updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'exam_prep', selCourse.id), {
         topics: arrayUnion({ id: Date.now(), name: newTopic, status: 'pending' })
       });
       setNewTopic('');
    };

    if (selCourse) {
      const live = courses.find(c => c.id === selCourse.id) || selCourse;
      return (
        <div className="space-y-4">
          <button onClick={()=>setSelCourse(null)} className="flex items-center gap-2 font-bold text-gray-500"><ArrowLeft size={16}/> Back</button>
          <h2 className="text-2xl font-bold">{live.name}</h2>
          <div className="flex gap-2">
            <Input theme={theme} value={newTopic} onChange={e=>setNewTopic(e.target.value)} placeholder="New Topic..." className="flex-1 mb-0"/>
            <Button theme={theme} onClick={addTopic} icon={Plus}></Button>
          </div>
          <div className="space-y-2">
            {live.topics?.map(t => (
              <div key={t.id} className={`${theme.card} p-3 rounded-xl border ${theme.border} flex justify-between`}>
                <span className={t.status === 'done' ? 'line-through text-gray-400' : ''}>{t.name}</span>
                <button onClick={() => {
                   if(confirm(`Mark as ${t.status === 'done' ? 'pending' : 'done'}?`)) {
                     const newTopics = live.topics.map(x => x.id === t.id ? {...x, status: x.status === 'done' ? 'pending' : 'done'} : x);
                     updateDoc(doc(db, 'artifacts', APP_ID, 'users', user.uid, 'exam_prep', live.id), { topics: newTopics });
                   }
                }}>{t.status === 'done' ? <RotateCcw size={16}/> : <Check size={16}/>}</button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
           <Input theme={theme} value={newSub} onChange={e=>setNewSub(e.target.value)} placeholder="New Subject" className="flex-1 mb-0"/>
           <Button theme={theme} onClick={addSub}>Add</Button>
        </div>
        <div className="grid gap-3">
          {courses.map(c => (
            <button key={c.id} onClick={()=>setSelCourse(c)} className={`${theme.card} p-4 rounded-xl border ${theme.border} text-left font-bold hover:shadow-md transition-all`}>
              {c.name} <span className="text-xs font-normal text-gray-400 block">{c.topics?.length||0} topics</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // --- Profile Module ---
  const ProfileModule = () => {
    const exportData = async () => {
       const data = { schedule: [], wallet: [], diary: [] };
       // In a real app we would fetch all collections here
       alert("Data Export Started... (Simulation)");
    }
    return (
      <div className="space-y-6">
        <div className="text-center">
           <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg">
             {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover"/> : <User className="w-full h-full p-6 text-gray-400"/>}
           </div>
           <h2 className={`text-2xl font-bold ${theme.text}`}>{user.displayName || 'User'}</h2>
           <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <Card theme={theme} title="Theme & Appearance">
           <div className="flex gap-2 overflow-x-auto pb-2">
             {THEMES.map(t => (
               <button key={t.id} onClick={()=>setTheme(t)} className={`w-10 h-10 rounded-full flex-shrink-0 ${t.primary} ${theme.id === t.id ? 'ring-2 ring-offset-2 ring-black' : ''}`}/>
             ))}
           </div>
        </Card>
        <Card theme={theme} title="Data & Privacy">
           <Button theme={theme} variant="secondary" className="w-full mb-2" onClick={exportData} icon={Download}>Backup Data (JSON)</Button>
           <Button theme={theme} variant="danger" className="w-full" onClick={()=>signOut(auth)} icon={Shield}>Secure Sign Out</Button>
        </Card>
      </div>
    )
  }

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-gray-400"/></div>;
  if (!user) return <AuthView theme={theme} onDemo={() => setUser({uid:'demo', displayName:'Demo User', isDemo:true})}/>;

  const renderView = () => {
    switch(view) {
      case 'home': return (
        <div className="grid grid-cols-2 gap-4 pb-24">
           <div className={`col-span-2 p-8 rounded-3xl bg-gradient-to-br ${theme.gradient} text-white shadow-xl relative overflow-hidden`}>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold">Hi, {user.displayName?.split(' ')[0] || 'Friend'}</h1>
                <p className="opacity-80">Ready to conquer the day?</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
           </div>
           {[{id:'schedule', l:'Schedule', i:Calendar}, {id:'wallet', l:'Wallet', i:CreditCard}, {id:'diary', l:'Diary', i:Book}, {id:'feed', l:'Social', i:Globe}, {id:'exam', l:'Review', i:Check}, {id:'hub', l:'Hub', i:Grid}, {id:'reminders', l:'Reminders', i:Bell}].map(b => (
             <button key={b.id} onClick={()=>setView(b.id)} className={`${theme.card} p-4 rounded-2xl border ${theme.border} shadow-sm flex flex-col items-center justify-center gap-2 h-24 hover:scale-[1.02] transition-transform`}>
               <b.i className={theme.text} size={24}/> <span className={`text-xs font-bold ${theme.text}`}>{b.l}</span>
             </button>
           ))}
        </div>
      );
      case 'schedule': return <ScheduleModule user={user} theme={theme}/>;
      case 'wallet': return <WalletModule user={user} theme={theme}/>;
      case 'diary': return <DiaryModule user={user} theme={theme}/>;
      case 'feed': return <GlobalFeed user={user} theme={theme}/>;
      case 'reminders': return <RemindersModule user={user} theme={theme}/>;
      case 'exam': return <ExamModule/>;
      case 'hub': return <HubModule user={user} theme={theme}/>;
      case 'profile': return <ProfileModule/>;
      default: return null;
    }
  }

  return (
    <div className={`min-h-screen ${theme.bg} font-sans transition-colors duration-300 pb-24`}>
       <div className={`sticky top-0 z-40 ${theme.card}/90 backdrop-blur-md border-b ${theme.border} px-5 py-4 flex justify-between items-center shadow-sm`}>
          {view !== 'home' ? <button onClick={()=>setView('home')}><ArrowLeft className={theme.text}/></button> : <div className={`font-bold text-lg ${theme.text}`}>LifeOS Ultimate</div>}
          <button onClick={()=>setView('profile')}><Settings className={theme.text}/></button>
       </div>
       <div className={`max-w-xl mx-auto p-5 ${view === 'feed' ? 'max-w-4xl' : ''}`}>
         {renderView()}
       </div>
       <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm">
          <div className={`${theme.card} border ${theme.border} shadow-xl shadow-black/5 rounded-2xl p-2 flex justify-between items-center px-6`}>
             <button onClick={()=>setView('home')} className={`p-3 rounded-xl ${view==='home'?theme.primary+' text-white':'text-gray-400'}`}><Home size={22}/></button>
             <button onClick={()=>setView('schedule')} className={`p-3 rounded-xl ${view==='schedule'?theme.primary+' text-white':'text-gray-400'}`}><Calendar size={22}/></button>
             <button onClick={()=>setView('hub')} className={`p-3 rounded-xl ${view==='hub'?theme.primary+' text-white':'text-gray-400'}`}><Grid size={22}/></button>
             <button onClick={()=>setView('feed')} className={`p-3 rounded-xl ${view==='feed'?theme.primary+' text-white':'text-gray-400'}`}><Globe size={22}/></button>
          </div>
       </div>
    </div>
  )
}