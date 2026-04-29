'use client';

import React from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Zap, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Droplets,
  Scissors,
  Smile,
  Heart,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '@/graphql/queries/service';
import { testimonials, faqs } from '@/constants/page-data';

const iconMap = {
  Zap,
  Droplets,
  Scissors,
  Smile,
  Heart
};

export default function LandingPage() {
  const [page, setPage] = React.useState(1);
  const { data, loading } = useQuery(GET_SERVICES, {
    variables: { page, limit: 6, isActive: true },
    fetchPolicy: 'cache-and-network'
  });

  const services = data?.getServices?.services || [];
  const totalPages = data?.getServices?.totalPages || 1;

  return (
    <div className="bg-white dark:bg-[#030712] min-h-screen selection:bg-indigo-100 dark:selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 transition-colors duration-300">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/dermatology_clinic_hero_1777282738062.png" 
            alt="Clinic Interior" 
            className="w-full h-full object-cover opacity-20 md:opacity-40"
          />
          {/* Background top image */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#030712] via-white/80 dark:via-[#030712]/80 to-transparent"></div> */}
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Sparkles size={14} />
              Premier Dermatology & Aesthetics
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              Reveal Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Best Skin</span> & Hair
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Advanced laser and dermatology treatments with visible results. Experience the perfect blend of medical expertise and aesthetic beauty.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button onClick={() => window.location.href = '#appointment'} size="lg" className="w-full sm:w-auto px-10 py-5">
                Book Appointment
              </Button>
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-6">
                Free Consultation <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Floating Decor */}
        <div className="hidden lg:block absolute bottom-20 right-20 w-[400px] h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-[#0f1117] animate-bounce-slow">
          <img src="/dermatology_treatment_visual_1777282762115.png" alt="Treatment" className="w-full h-full object-cover" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-stone-50/50 dark:bg-[#060a14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Our Specialized Services</h2>
            <p className="text-gray-500 dark:text-gray-400">Comprehensive dermatological care using the latest technology to ensure the best results for your skin and hair health.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 mb-8"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-5/6 mb-8"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                </div>
              ))
            ) : services.length > 0 ? (
              services.map((service, idx) => {
                const IconComponent = iconMap[service.icon] || Zap;
                return (
                  <motion.div 
                    key={service.id}
                    whileHover={{ y: -10 }}
                    className="bg-white dark:bg-[#0f1117] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-8 group-hover:scale-110 transition-transform">
                      <IconComponent size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 line-clamp-3">{service.desc}</p>
                    <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all">
                      Learn More <ChevronRight size={16} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No services found.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 transition-all"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <span className="text-sm font-bold text-gray-900 dark:text-white">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:border-indigo-600 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-30 disabled:hover:text-gray-400 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="w-full aspect-square rounded-[3rem] bg-indigo-50 dark:bg-indigo-500/5 overflow-hidden relative">
                <img src="/dermatology_clinic_hero_1777282738062.png" alt="Why Choose Us" className="w-full h-full object-cover opacity-90 dark:opacity-70" />
                <div className="absolute inset-0 bg-indigo-600/10 dark:bg-indigo-900/40"></div>
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white dark:bg-[#0f1117] p-8 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 max-w-[280px] hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">100% Safe & Hygienic</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Our clinic maintains international standards of hygiene and patient safety.</p>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">Expert Care for Your <br />Beauty & Wellness</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                We believe in personalized treatments that combine medical expertise with aesthetic precision. Our team of certified dermatologists uses advanced technology to deliver visible, long-lasting results.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "Certified Dermatologists",
                  "Advanced Technology",
                  "Safe & Hygienic Environment",
                  "Personalized Treatments",
                  "Proven Visible Results",
                  "Post-Treatment Care"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-indigo-50/30 dark:bg-[#060a14]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Real Results, Real Reviews</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Hear from our clients who have transformed their skin and hair with our professional treatments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-[#0f1117] p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex gap-1 mb-6">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-8 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400">Your journey to beautiful skin in four simple steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-10 left-40 right-40 h-0.5 bg-dashed-border dark:opacity-20 -z-0"></div>
            
            {[
              { step: "01", title: "Book Consultation", desc: "Schedule a time that works for you online or via phone." },
              { step: "02", title: "Skin/Hair Analysis", desc: "Our experts perform a deep analysis of your unique needs." },
              { step: "03", title: "Personalized Plan", desc: "Get a treatment roadmap tailored exactly to your goals." },
              { step: "04", title: "Visible Results", desc: "Experience transformation with our expert medical care." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-white dark:bg-[#0f1117] border-2 border-indigo-50 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl mx-auto mb-8 shadow-lg">
                  {step.step}
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">{step.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-stone-50/50 dark:bg-[#060a14]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details key={idx} className="bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/5 rounded-[1.5rem] p-6 cursor-pointer group open:ring-2 open:ring-indigo-500/20 transition-all">
                <summary className="font-bold text-gray-900 dark:text-white flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronRight size={18} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 text-gray-500 dark:text-gray-400 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment CTA */}
      <section id="appointment" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900/40">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-white dark:bg-[#0a0c10] rounded-[4rem] p-8 md:p-20 shadow-2xl overflow-hidden relative border border-transparent dark:border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">Get Your Free Skin <br />Consultation Today</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                  Start your transformation today. Fill out the form and our specialist will reach out to schedule your comprehensive skin and hair analysis.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Phone size={18} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">+1 (234) 567-890</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Mail size={18} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-300">hello@skincleaner.com</span>
                  </div>
                </div>
              </div>

              <form className="space-y-6 bg-stone-50/50 dark:bg-[#0f1117] p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Full Name" placeholder="John Doe" />
                  <Input label="Phone" placeholder="+91 98765 43210" />
                </div>
                <Input label="Email Address" placeholder="john@example.com" />
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Interested Service</label>
                  <select className="w-full bg-white dark:bg-[#030712] border border-gray-100 dark:border-white/10 rounded-2xl py-3.5 px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 dark:focus:border-indigo-500/30 transition-all appearance-none cursor-pointer">
                    {services.map(s => (
                      <option key={s.id}>{s.title}</option>
                    ))}
                    {services.length === 0 && <option>No services available</option>}
                  </select>
                </div>
                <Button className="w-full py-5 text-base mt-4 shadow-xl shadow-indigo-600/20 dark:shadow-indigo-900/20">
                  Book Free Consultation
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#030712] pt-24 pb-12 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                  <Zap size={22} fill="white" />
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">Skin Cleaner</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
                Advanced dermatological and aesthetic clinic dedicated to providing visible results with the highest standards of safety and care.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-stone-50 dark:bg-[#0f1117] border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white hover:border-indigo-600 dark:hover:border-indigo-500 transition-all">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-8 uppercase text-xs tracking-widest">Our Services</h4>
              <ul className="space-y-4">
                {["Laser Hair Removal", "Acne Treatment", "Hair Restoration", "Chemical Peels", "Dermal Fillers", "Facial Care"].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-8 uppercase text-xs tracking-widest">Quick Links</h4>
              <ul className="space-y-4">
                {["About Our Clinic", "Meet Our Doctors", "Before & After", "Client Reviews", "Pricing Plans", "Contact Us"].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-8 uppercase text-xs tracking-widest">Location</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-1" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    123 Aesthetics Drive, Suite 400 <br />
                    Medical Square, NY 10001
                  </p>
                </div>
                <div className="bg-stone-50 dark:bg-[#0f1117] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-3 tracking-widest">Business Hours</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 font-bold flex justify-between">MON - FRI <span className="dark:text-gray-300">09:00 - 20:00</span></p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold flex justify-between">SAT - SUN <span className="dark:text-gray-300">10:00 - 18:00</span></p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
              © 2026 Skin Cleaner Aesthetic Clinic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Custom Styles */}
      <style jsx>{`
        .bg-dashed-border {
          background-image: linear-gradient(to right, #e2e8f0 33%, rgba(255,255,255,0) 0%);
          background-position: bottom;
          background-size: 15px 2px;
          background-repeat: repeat-x;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
