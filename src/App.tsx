import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, User, UserCircle2, Instagram, MapPin, Trophy, MessageCircle, PartyPopper, ChevronRight, Star, ArrowRight, Phone, Facebook, Youtube, Shield, Heart } from 'lucide-react';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  isOptions?: boolean;
};

type UserData = {
  name: string;
  phone: string;
  gender: string;
  category: string;
  service: string;
  visit_id: string;
  pin: string;
  timestamp: string;
  device_id: string;
  status: string;
  notes?: string;
};

type Step =
  | 'INIT'
  | 'ASK_NAME'
  | 'ASK_PHONE'
  | 'ASK_GENDER'
  | 'ASK_CATEGORY'
  | 'ASK_SERVICE'
  | 'ASK_ACTIVATE'
  | 'GENERATING_PASS'
  | 'COMPLETED'
  | 'DUPLICATE';

const generateDeviceId = () => {
  const existingId = localStorage.getItem('redeemly_device_id');
  if (existingId) return existingId;
  const newId = 'dev_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('redeemly_device_id', newId);
  return newId;
};

const sendToGoogleSheets = async (data: UserData) => {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbxllT8a0aScWaJ9IN6HpR6pE0QU1eRvbGgadiQ1zosmIZcslboKBJvoyKOr-MdtxXd_/exec';
  if (!scriptUrl || scriptUrl === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
    console.log('Would send to Google Sheets:', data);
    return;
  }
  
  try {
    // We send as plain text to avoid CORS preflight, but stringify JSON body
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
  }
};

const VisitPass = ({ data }: { data: Partial<UserData> }) => {
  const safeData = data || {};
  
  const getExpiryDate = () => {
    let baseDate = new Date();
    if (safeData.timestamp) {
      // Fix for cross-browser parsing of "YYYY-MM-DD HH:mm:ss"
      const parsed = new Date(safeData.timestamp.replace(/-/g, '/'));
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }
    baseDate.setDate(baseDate.getDate() + 30);
    return baseDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg bg-[#111111] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] rounded-[32px] sm:rounded-[40px] border border-[#D4AF37]/30 p-6 sm:p-10 relative mt-6 mb-8 mx-auto"
    >
      <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-[#D4AF37] text-black text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]">
        Active Now
      </div>

      <div className="flex justify-between items-start mb-6 sm:mb-8 gap-4">
        <div>
          <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#D4AF37]/70 mb-1.5 sm:mb-2">Confirmed Service</h3>
          <p className="text-xl sm:text-2xl font-serif text-[#F3E5AB]">{safeData.service || 'Default Service'}</p>
        </div>
        <div className="text-right">
          <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#D4AF37]/70 mb-1.5 sm:mb-2">Client</h3>
          <p className="text-base sm:text-lg font-medium text-white pr-2 sm:pr-4">{safeData.name || 'Client Name'}</p>
        </div>
      </div>

      <div className="w-full h-px bg-[#D4AF37]/20 mb-6 sm:mb-8"></div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8 sm:mb-10">
        <div className="p-4 sm:p-6 bg-black rounded-3xl border border-[#D4AF37]/20 shadow-inner">
          <h4 className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500 mb-2 sm:mb-3">Visit ID</h4>
          <p className="text-lg sm:text-2xl lg:text-3xl font-mono tracking-tighter text-[#F3E5AB]">{safeData.visit_id || 'GS-XXXX'}</p>
        </div>
        <div className="p-4 sm:p-6 bg-black rounded-3xl border border-[#D4AF37]/20 shadow-inner">
          <h4 className="text-[9px] sm:text-[10px] uppercase tracking-widest text-stone-500 mb-2 sm:mb-3">Secret PIN</h4>
          <p className="text-lg sm:text-2xl lg:text-3xl font-mono tracking-tighter text-[#D4AF37]">{safeData.pin || 'XXXX'}</p>
        </div>
      </div>

      <div className="text-center space-y-3 sm:space-y-4">
        <p className="text-xs sm:text-sm text-[#F3E5AB] font-medium">
          ✨ Your beauty benefit is activated.
        </p>
        <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed px-2 sm:px-10">
          Please present this Visit Pass at the salon reception. Our team at Glow Sparkle Studio will verify your ID and PIN to begin your session.
        </p>
      </div>

      {/* Action / Instruction Bar */}
      <div className="mt-6 sm:mt-10 flex flex-col items-center gap-4 sm:gap-5">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse"></div>
              <span className="text-[9px] sm:text-[11px] uppercase tracking-widest text-white font-semibold">Verified</span>
            </div>
            <div className="h-4 w-px bg-stone-700"></div>
            <span className="text-[9px] sm:text-[11px] text-stone-400 font-medium italic">Valid for 30 days</span>
          </div>
          <p className="text-[10px] sm:text-xs text-[#D4AF37]/80">Expires: {getExpiryDate()}</p>
        </div>

        <a 
          href="tel:+918008385383"
          className="mt-1 flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#F3E5AB] text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-6 py-3.5 rounded-full hover:bg-[#D4AF37]/10 transition-colors w-full max-w-xs shadow-inner"
        >
          <Phone size={14} className="text-[#D4AF37]" />
          <span>Call Salon for Info</span>
        </a>

        <a 
          href="https://search.google.com/local/writereview?placeid=ChIJ_bi8CBFDOToRdeCICioy0ck"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs bg-white text-black font-bold text-[10px] sm:text-xs tracking-widest uppercase px-6 py-3.5 rounded-full inline-flex items-center justify-center gap-2 transition-transform hover:bg-stone-200 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
        >
          <span>Leave a Review</span>
          <Star size={14} className="fill-black" />
        </a>
      </div>
    </motion.div>
  );
};

const CampaignCredits = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-[10px] sm:text-xs text-stone-400 mb-6 leading-relaxed text-center">
        This campaign is powered by <span className="text-[#F3E5AB] font-semibold">Redeemly</span>,<br/>an initiative by Lume Branding.
      </p>
      
      <div className="w-full max-w-sm bg-black border border-[#D4AF37]/30 rounded-2xl overflow-hidden shadow-[inset_0_1px_rgba(255,255,255,0.05)] transition-all duration-500">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex items-center justify-between text-[#F3E5AB] hover:bg-stone-900 transition-colors"
        >
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase">Campaign Strategy & Credits</span>
          <ChevronRight size={16} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#0A0A0A] border-t border-[#D4AF37]/10"
            >
               <div className="p-6 flex flex-col items-center text-center">
                 <p className="text-[11px] sm:text-xs text-stone-400 leading-relaxed mb-6 italic px-2">
                   "We design high-converting, experiential campaigns that transform footfall into loyal community members for luxury brands."
                 </p>
                 <img src="/anup.png" alt="Anuroop Batta" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#D4AF37]/50 object-cover shadow-[0_0_15px_rgba(212,175,55,0.2)] mb-3 sm:mb-4" />
                 <h4 className="font-serif text-[#F3E5AB] text-lg sm:text-xl">Anuroop Batta</h4>
                 <p className="text-[9px] sm:text-[10px] text-stone-500 uppercase tracking-[0.2em] mt-1 font-bold mb-4 sm:mb-5">Founder, Lume Branding</p>
                 
                 <p className="text-[#D4AF37] text-[11px] sm:text-xs mb-3 font-medium">Wanna elevate your brand?</p>
                 <a 
                   href="https://www.instagram.com/lumebranding.in/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-900 to-black border border-[#D4AF37]/50 text-[#F3E5AB] text-[10px] uppercase font-bold tracking-widest px-6 py-3 rounded-full hover:border-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95 whitespace-nowrap"
                 >
                   <Instagram size={14} className="text-[#D4AF37]" />
                   DM ME ON IG
                 </a>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Carousel3D = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center my-6" style={{ perspective: '1000px' }}>
        {images.map((src, idx) => {
          let offset = idx - currentIndex;
          const half = Math.floor(images.length / 2);
          if (offset < -half) offset += images.length;
          if (offset > half) offset -= images.length;

          return (
            <motion.div
              key={idx}
              animate={{
                x: `${offset * 75}%`,
                scale: 1 - Math.abs(offset) * 0.15,
                rotateY: offset * -25,
                opacity: 1,
                zIndex: 10 - Math.abs(offset)
              }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
              className="absolute h-full aspect-[4/5] rounded-2xl p-[2px] bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] pointer-events-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-full h-full rounded-[calc(1rem-2px)] overflow-hidden bg-stone-900 border border-black/50">
                <img src={src} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          );
        })}
    </div>
  );
};

const HomePage = ({ onRedeem, hasClaimed }: { onRedeem: () => void; hasClaimed: boolean }) => {
  const images = [
    "https://lh3.googleusercontent.com/d/1eSGJ7TM37f2nieLJI0QVuAZ6rHci3BGy",
    "https://lh3.googleusercontent.com/d/10pFIuPv9w7xkn1e81C0moYQU08HcJ7Gv",
    "https://lh3.googleusercontent.com/d/1DIZ0zDHfRih6wdohDWcVCYy7394YJF2c",
    "https://lh3.googleusercontent.com/d/1Dhf7AatqknFUMc4kwGDpRGhc-i2YwcIF",
    "https://lh3.googleusercontent.com/d/1fT248cSVMtne18xCoq-0Maw6dQmXrjdy",
    "https://lh3.googleusercontent.com/d/1uZcPT17KrStfZkoHSIYssm_POxzNI7zX"
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Hero Welcome Text & Pass Button */}
      <div className="relative p-[1px] rounded-3xl bg-gradient-to-r from-[#D4AF37]/40 via-[#F3E5AB]/80 to-[#D4AF37]/40 animate-gradient-x shadow-[0_16px_32px_-12px_rgba(212,175,55,0.2)]">
        <div className="text-center bg-black rounded-[calc(1.5rem-1px)] p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-[0.05] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37] opacity-[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center mb-6">
              <span className="inline-block font-cursive text-4xl sm:text-5xl text-center bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent animate-gradient-x leading-tight py-1 px-4">
                Celebrating 1st Anniversary
              </span>
          </div>
          
          <div className="flex flex-col items-center gap-4 mb-4">
              <div className="relative inline-block">
                <img src="/logov.png" alt="Glow Sparkle Studio" className="h-32 sm:h-40 object-contain relative z-10" />
                <div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    WebkitMaskImage: 'url(/logov.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: 'url(/logov.png)',
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                  }}
                >
                  <div className="w-[150%] h-full bg-gradient-to-r from-transparent via-[#F3E5AB]/60 to-transparent animate-sweep-loop"></div>
                </div>
              </div>
          </div>
          <p className="text-stone-300 max-w-md mx-auto text-xs sm:text-sm leading-relaxed mb-8">
            Premium unisex salon delivering luxury beauty, grooming, and self-care in Vizag.
          </p>
          
          <button 
            onClick={onRedeem}
            className="group relative overflow-hidden bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-black font-bold text-[10px] sm:text-xs tracking-widest uppercase px-6 py-3 rounded-full inline-flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.3)] mx-auto whitespace-nowrap"
          >
            <span className="relative z-10">{hasClaimed ? 'View Your Pass' : 'Claim Anniversary Pass'}</span>
            <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3D Auto-Scrolling Carousel */}
      <Carousel3D images={images} />

      {/* Achievements / Highlights - Compressed */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
        {[
          { icon: Shield, label: "Sections", value: "Privacy" },
          { icon: Sparkles, label: "Ambience", value: "Pleasant" },
          { icon: Star, label: "Google", value: "4.9 Rated" },
          { icon: Heart, label: "Priority", value: "8k+ Family" }
        ].map((item, idx) => (
          <div key={idx} className="group relative flex flex-col items-center justify-center text-center p-3 sm:p-5 rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-[#D4AF37]/40 hover:bg-[#111] hover:shadow-[0_0_25px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(212,175,55,0.2)] transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <item.icon size={22} className="text-[#D4AF37] mb-2 sm:mb-3 group-hover:text-[#F3E5AB] group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_5px_rgba(212,175,55,0.3)] stroke-[1.5] relative z-10" />
            
            <div className="w-full relative z-10 flex flex-col items-center justify-center">
              <h4 className="text-[11px] sm:text-[15px] font-serif text-[#F3E5AB] leading-tight font-bold mb-1 tracking-wide">{item.value}</h4>
              <p className="text-[7px] sm:text-[9px] uppercase tracking-widest text-stone-500 font-medium group-hover:text-[#D4AF37] transition-colors">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact & Socials - Dark Glossy & Golden Icons - Full Width Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
         <a 
            href="https://www.instagram.com/glowsparklestudiovizag/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-stone-900 to-black p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors group shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0">
              <Instagram size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-serif text-[#F3E5AB] text-base mb-0.5">Instagram</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 truncate">@glowsparklestudiovizag</p>
            </div>
            <ChevronRight size={16} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform flex-shrink-0" />
         </a>

         <a 
            href="https://wa.me/918008385383" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-stone-900 to-black p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors group shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-serif text-[#F3E5AB] text-base mb-0.5">WhatsApp</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 truncate">+91 800 838 5383</p>
            </div>
            <ChevronRight size={16} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform flex-shrink-0" />
         </a>
         
         <a 
            href="https://www.facebook.com/glowsparklestudiovizag" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-stone-900 to-black p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors group shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0">
              <Facebook size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-serif text-[#F3E5AB] text-base mb-0.5">Facebook</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 truncate">@glowsparklestudiovizag</p>
            </div>
            <ChevronRight size={16} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform flex-shrink-0" />
         </a>
         
         <a 
            href="https://www.youtube.com/@GlowSparkleStudioVizag" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-gradient-to-b from-stone-900 to-black p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/20 flex items-center gap-4 hover:border-[#D4AF37]/60 transition-colors group shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-black border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)] flex-shrink-0">
              <Youtube size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="font-serif text-[#F3E5AB] text-base mb-0.5">YouTube</h4>
              <p className="text-[10px] sm:text-xs text-stone-400 truncate">@GlowSparkleStudioVizag</p>
            </div>
            <ChevronRight size={16} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform flex-shrink-0" />
         </a>
      </div>

      {/* Location */}
      <div className="bg-black rounded-3xl border border-[#D4AF37]/20 overflow-hidden shadow-lg flex flex-col">
        <div className="p-5 sm:p-6 flex items-start justify-between border-b border-[#D4AF37]/10 bg-gradient-to-b from-stone-900 to-black">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl text-[#F3E5AB] mb-1.5 flex items-center gap-2">
              <MapPin size={22} className="text-[#D4AF37]" /> Visit Us
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 max-w-sm leading-relaxed">
              Experience luxury self-care in Vizag. Come claim your beauty benefits today.
            </p>
          </div>
        </div>
        <div className="h-56 sm:h-72 w-full bg-stone-900 flex-none relative">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3800.2865912611937!2d83.32822967501167!3d17.731130492812007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a39431108bcb8fd%3A0xc9d1322a0a88e075!2sGlow%20Sparkle%20Studio%20(unisex%20salon)!5e0!3m2!1sen!2sin!4v1778151040744!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0, filter: 'grayscale(60%) invert(90%) hue-rotate(180deg) contrast(1.2)' }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
        </div>
      </div>

      {/* Footer / Credits */}
      <div className="mt-8 pt-8 border-t border-[#D4AF37]/10 flex flex-col items-center justify-center w-full px-4 sm:px-0 pb-4 sm:pb-8">
        <CampaignCredits />
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>('INIT');
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const scrollToBottom = () => {
    if (mainRef.current && view === 'chat') {
      mainRef.current.scrollTo({ top: mainRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (view === 'chat' && mainRef.current) {
      setTimeout(() => {
         if (step === 'COMPLETED' || step === 'DUPLICATE') {
           mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
         } else {
           scrollToBottom();
         }
      }, 50);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const addMessage = (role: 'assistant' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(), role, content },
    ]);
  };

  const simulateTyping = (content: string, nextStep?: Step) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage('assistant', content);
      setIsTyping(false);
      if (nextStep) setStep(nextStep);
    }, 1200);
  };

  const initDispatched = useRef(false);

  useEffect(() => {
    if (step === 'INIT') {
      if (initDispatched.current) return;
      initDispatched.current = true;
      const deviceId = generateDeviceId();
      const existingClaim = localStorage.getItem('redeemly_claim_data_v2');
      if (existingClaim) {
        try {
          const parsed = JSON.parse(existingClaim);
          setUserData(parsed);
          setStep('DUPLICATE');
          addMessage(
            'assistant',
            `You have already activated your benefit.\n\nPlease visit the salon to redeem it.`
          );
        } catch (e) {
          localStorage.removeItem('redeemly_claim_data_v2');
          setUserData({ device_id: deviceId });
          simulateTyping(
            '✨ Welcome to Glow Sparkle Studio.\n\nYou’ve unlocked an exclusive beauty benefit through Redeemly.\n\nLet’s activate your visit pass.\n\nMay I know your name?',
            'ASK_NAME'
          );
        }
      } else {
        setUserData({ device_id: deviceId });
        simulateTyping(
          '✨ Welcome to Glow Sparkle Studio.\n\nYou’ve unlocked an exclusive beauty benefit through Redeemly.\n\nLet’s activate your visit pass.\n\nMay I know your name?',
          'ASK_NAME'
        );
      }
    }
  }, [step]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    setInputValue('');
    addMessage('user', val);

    if (step === 'ASK_NAME') {
      setUserData((prev) => ({ ...prev, name: val }));
      simulateTyping(`Lovely, ${val} 💎\n\nPlease share your mobile number.`, 'ASK_PHONE');
    } else if (step === 'ASK_PHONE') {
      setUserData((prev) => ({ ...prev, phone: val }));
      simulateTyping(`Perfect ✨\n\nWho is this service for?`, 'ASK_GENDER');
    }
  };

  const handleOptionSelect = (option: string) => {
    addMessage('user', option);

    if (step === 'ASK_GENDER') {
      setUserData((prev) => ({ ...prev, gender: option }));
      simulateTyping('Please choose your interest:', 'ASK_CATEGORY');
    } else if (step === 'ASK_CATEGORY') {
      setUserData((prev) => ({ ...prev, category: option }));
      simulateTyping('Please choose your service:', 'ASK_SERVICE');
    } else if (step === 'ASK_SERVICE') {
      setUserData((prev) => ({ ...prev, service: option }));
      simulateTyping(
        `A fabulous choice for ${option}! ✨\n\nWould you like to activate your visit pass now?`,
        'ASK_ACTIVATE'
      );
    } else if (step === 'ASK_ACTIVATE') {
      if (option === 'Yes, activate now') {
        generatePass();
      }
    }
  };

  const generatePass = () => {
    setStep('GENERATING_PASS');
    setIsTyping(true);
    
    setTimeout(() => {
      const visit_id = 'VX-' + Math.floor(1000 + Math.random() * 9000).toString();
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      
      const finalData: UserData = {
        name: userData.name || '',
        phone: userData.phone || '',
        gender: userData.gender || '',
        category: userData.category || '',
        service: userData.service || '',
        visit_id,
        pin,
        timestamp,
        device_id: userData.device_id || '',
        status: 'CLAIMED',
        notes: `Gender: ${userData.gender || 'N/A'}, Category: ${userData.category || 'N/A'}`
      };
      
      setUserData(finalData);
      localStorage.setItem('redeemly_claim_data_v2', JSON.stringify(finalData));
      sendToGoogleSheets(finalData);

      setIsTyping(false);
      setStep('COMPLETED');
    }, 2000);
  };

  const getOptionsForStep = () => {
    if (step === 'ASK_GENDER') return ['Female', 'Male'];
    if (step === 'ASK_CATEGORY') {
      if (userData.gender === 'Female') {
        return ['Hair Care', 'Skin Care', 'Bridal', 'Nails', 'Body Care'];
      } else {
        return ['Hair Care', 'Skin Care', 'Grooming Packages', 'Body Care'];
      }
    }
    if (step === 'ASK_SERVICE') {
      const c = userData.category;
      if (c === 'Hair Care') return ['Hair Spa', 'Hair Botox', 'Keratin', 'Smoothening', 'Coloring'];
      if (c === 'Skin Care') return ['Facial', 'Clean-up', 'D-Tan', 'Brightening'];
      if (c === 'Bridal') return ['Makeup', 'Hair Styling', 'Bridal Package'];
      if (c === 'Nails') return ['Nail Extensions', 'Nail Art', 'Gel Polish'];
      if (c === 'Body Care') return ['Waxing', 'Polishing', 'Detan'];
      if (c === 'Grooming Packages') return ['Silver', 'Gold', 'Platinum'];
    }
    if (step === 'ASK_ACTIVATE') return ['Yes, activate now'];
    return [];
  };

  const options = getOptionsForStep();
  const showInput = step === 'ASK_NAME' || step === 'ASK_PHONE';

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] bg-[#0A0A0A] font-sans text-stone-200 overflow-hidden">
      {/* Sidebar / Branding Section */}
      <aside className="hidden md:flex w-[380px] h-full bg-black p-12 flex-col justify-between text-[#D4AF37] flex-shrink-0 relative z-20 shadow-2xl border-r border-[#D4AF37]/10">
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-80 mb-2">Redeemly presents</h1>
            <img src="/logoh.png" alt="Glow Sparkle Studio" className="w-48 object-contain" />
          </div>

          <div className="mt-24 relative z-10">
            <h2 className="text-5xl font-serif leading-[1.15] text-white tracking-wide">Activate<br/>Your<br/>Visit Pass.</h2>
            <div className="h-1 w-12 bg-[#D4AF37] mt-8"></div>
            <p className="text-sm text-stone-400 mt-8 leading-relaxed max-w-[280px]">
              Welcome to an exclusive beauty benefit curated by Lume Branding. Your personalized luxury experience awaits.
            </p>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-widest text-stone-500">
          &copy; {new Date().getFullYear()} Lume Branding &bull; Luxury Concierge
        </div>
        
        {/* Ambient detail */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <header className="md:hidden flex-none bg-[#0A0A0A]/90 backdrop-blur-md px-4 py-2 sm:py-3 shadow-sm border-b border-[#D4AF37]/10 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <img src="/logoh.png" alt="Glow Sparkle Studio" className="h-14 sm:h-16 object-contain py-1" />
            <div className="pl-3 sm:pl-4 border-l border-[#D4AF37]/20">
              <p className="text-[6px] sm:text-[7px] text-[#D4AF37]/50 uppercase tracking-[0.2em] font-semibold leading-tight">Powered by<br/><span className="text-[#D4AF37]/80 text-[7px] sm:text-[8px]">Redeemly</span></p>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 mb-safe pb-40 bg-[#0A0A0A] flex flex-col" style={{ WebkitOverflowScrolling: 'touch' }}>
          {view === 'home' ? (
            <HomePage 
              onRedeem={() => setView('chat')} 
              hasClaimed={step === 'DUPLICATE' || step === 'COMPLETED' || !!localStorage.getItem('redeemly_claim_data_v2')} 
            />
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col gap-6 w-full flex-1">
              <AnimatePresence initial={false}>
              {messages.map((m, idx) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex gap-3.5 w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'} ${idx === 0 ? 'mt-auto' : ''}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#F0E6DA] flex-shrink-0 flex items-center justify-center text-[#D4AF37] shadow-sm mt-1">
                      <Sparkles size={14} className="fill-[#D4AF37]" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 sm:px-6 sm:py-4 rounded-3xl shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)] leading-relaxed whitespace-pre-wrap text-[14px] sm:text-[15px] ${
                      m.role === 'user'
                        ? 'bg-[#D4AF37] text-black font-medium border border-[#D4AF37] rounded-br-[4px]'
                        : 'bg-[#1A1A1A] border border-[#D4AF37]/20 text-stone-200 rounded-bl-[4px]'
                    }`}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex gap-3.5 w-full justify-start ${messages.length === 0 ? 'mt-auto' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-black border border-[#D4AF37]/30 flex-shrink-0 flex items-center justify-center text-[#D4AF37] shadow-sm mt-1">
                    <Sparkles size={14} className="fill-[#D4AF37]" />
                  </div>
                  <div className="bg-[#1A1A1A] border border-[#D4AF37]/20 px-6 py-4 rounded-3xl rounded-bl-[4px] shadow-[0_16px_32px_-12px_rgba(0,0,0,0.5)] flex items-center space-x-1.5 h-[56px]">
                    <motion.div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-60" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full opacity-80" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {(step === 'COMPLETED' || step === 'DUPLICATE') && (
              <VisitPass data={userData} />
            )}

            <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        {view === 'chat' && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-xl border-t border-[#D4AF37]/10 p-3 sm:p-5 pb-safe">
          <div className="max-w-2xl mx-auto w-full">
              <AnimatePresence mode="popLayout">
                {options.length > 0 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex flex-wrap gap-2.5 justify-end mb-4"
                  >
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect(opt)}
                        className="px-5 py-2.5 bg-[#1A1A1A] border border-[#D4AF37]/30 text-[#F3E5AB] rounded-full text-[11px] uppercase tracking-[0.1em] font-bold hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all active:scale-95 whitespace-nowrap"
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {showInput && !isTyping && (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onSubmit={handleInputSubmit}
                  className="flex items-center gap-2 bg-[#1A1A1A] rounded-full p-1.5 shadow-lg shadow-black/20 border border-[#D4AF37]/20 focus-within:border-[#D4AF37]/80 focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all"
                >
                  <input
                    type={step === 'ASK_PHONE' ? 'tel' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => {
                        window.scrollTo(0, 0); // iOS defensive
                        setTimeout(scrollToBottom, 300); // Wait for keyboard animation
                    }}
                    placeholder={step === 'ASK_PHONE' ? 'Enter your mobile number...' : 'Type your name...'}
                    className="flex-1 bg-transparent px-5 py-2.5 outline-none text-[15px] placeholder:text-stone-500 text-stone-200 font-medium"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] text-black flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:from-stone-700 disabled:to-stone-700 disabled:text-stone-400 transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  >
                    <Send size={18} className="translate-x-[1px]" />
                  </button>
                </motion.form>
              )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
