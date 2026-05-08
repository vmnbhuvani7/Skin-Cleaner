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
  Linkedin,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/Select';

import { useQuery } from '@apollo/client';
import { GET_SERVICES } from '@/graphql/queries/service';
import { testimonials, faqs } from '@/constants/page-data';
import { DEFAULT_SERVICES } from '@/utils/constants';

const iconMap = {
  Zap,
  Droplets,
  Scissors,
  Smile,
  Heart
};

export default function LandingPage() {
  const [page, setPage] = React.useState(1);
  // const { data, loading } = useQuery(GET_SERVICES, {
  //   variables: { page, limit: 6, isActive: true },
  //   fetchPolicy: 'cache-and-network'
  // });

  // const services = data?.getServices?.services || [];
  // const totalPages = data?.getServices?.totalPages || 1;

  const services = DEFAULT_SERVICES;
  const totalPages = 1;

  return (
    <div className="bg-[var(--background)] min-h-screen selection:bg-teal-100 dark:selection:bg-teal-500/30 selection:text-teal-900 dark:selection:text-teal-200 transition-colors duration-300">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[10%] -right-[5%] w-[60%] h-[80%] bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[60%] bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-[100px]"></div>
          
          <img
            src="/dermatology_clinic_hero_1777282738062.png"
            alt="Clinic Interior"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[60%] h-[70%] object-cover opacity-10 lg:opacity-20 mask-image-linear-to-l"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50/80 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20 text-teal-700 dark:text-teal-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></div>
              Next-Gen Hair & Skin Analysis
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white leading-[1] tracking-tight mb-8">
              Precision <br />
              <span className="text-gradient">Hair Care</span> <br />
              Redefined.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed max-w-xl">
              Stop guessing and start growing. Our AI-driven diagnosis provides a deep analysis of your scalp health for a 100% personalized treatment plan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Button onClick={() => window.location.href = '#diagnosis'} size="lg" className="w-full sm:w-auto px-12 py-6 text-base group">
                Start Free Diagnosis
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <button className="flex items-center gap-3 text-gray-600 dark:text-gray-300 font-bold hover:text-teal-600 dark:hover:text-teal-400 transition-all group px-4 py-2">
                <span className="w-10 h-10 rounded-full border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/10 transition-colors">
                  <ArrowRight size={18} />
                </span>
                View Treatments
              </button>
            </div>

            <div className="mt-16 flex items-center gap-12 border-t border-gray-100 dark:border-white/5 pt-12">
              {[
                { label: "Success Rate", value: "98%" },
                { label: "Active Patients", value: "12k+" },
                { label: "Expert Doctors", value: "24" }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[3.5rem] overflow-hidden border-[12px] border-white dark:border-[#0f172a] shadow-[0_40px_100px_-20px_rgba(13,148,136,0.3)] aspect-[4/5] max-w-[480px] ml-auto">
              <img 
                src="/dermatology_treatment_visual_1777282762115.png" 
                alt="Hair Analysis" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent"></div>
              
              {/* Floating Cards */}
              <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl shadow-2xl border-white/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/40">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Scalp Analysis</h4>
                    <p className="text-teal-50 text-xs font-medium">AI-Powered Detection</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="h-full bg-white"
                  ></motion.div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-teal-600/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 bg-stone-50/50 dark:bg-[#060a14] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">World-Class <span className="text-gradient">Specializations</span></h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg">We combine clinical excellence with state-of-the-art technology to provide solutions that work.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-full">Skin Care</Button>
              <Button variant="primary" size="sm" className="rounded-full">Hair Growth</Button>
              <Button variant="outline" size="sm" className="rounded-full">Aesthetics</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const IconComponent = iconMap[service.icon] || Zap;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-teal-500/10 dark:hover:shadow-teal-500/5 transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-8 group-hover:scale-110 transition-transform duration-500">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-10 line-clamp-3">{service.desc}</p>
                  <button className="flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:gap-4 transition-all uppercase tracking-widest">
                    Explore Treatment <ArrowRight size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diagnosis Quiz Section */}
      <section id="diagnosis" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="glass-card rounded-[4rem] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center text-white mb-8 shadow-xl shadow-teal-500/30">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                  Start Your <br />
                  <span className="text-gradient">Scalp Diagnosis</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 leading-relaxed">
                  Our interactive diagnosis tool uses clinical markers to identify the root cause of your hair concerns. It takes less than 2 minutes.
                </p>
                
                <div className="space-y-6 mb-12">
                  {[
                    "Instant Scalp Health Score",
                    "Root Cause Identification",
                    "Custom Serum Formulation",
                    "Dietary & Lifestyle Advice"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <CheckCircle2 size={14} />
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="w-full md:w-auto shadow-2xl">
                  Take The Hair Quiz
                </Button>
              </div>
              <div className="relative h-[400px] lg:h-auto min-h-[500px]">
                <img 
                  src="/dermatology_clinic_hero_1777282738062.png" 
                  alt="Diagnosis Tool" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-teal-900/20 backdrop-blur-[2px]"></div>
                
                {/* Interactive Elements Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass p-8 rounded-3xl max-w-sm w-full mx-6 shadow-2xl animate-bounce-slow">
                    <p className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-[10px] mb-4">Diagnosis Preview</p>
                    <h4 className="text-white font-bold text-xl mb-6">Density Analysis</h4>
                    <div className="space-y-4">
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 w-[70%]"></div>
                      </div>
                      <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[45%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Treatment Section */}
      <section className="py-32 bg-teal-950 dark:bg-[#020617] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">Your Personalized Roadmap</h2>
            <p className="text-teal-100/60 text-lg">Every scalp is unique. Your treatment plan should be too. Here's how we build your transformation journey.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { step: "01", title: "Visual Scan", desc: "High-definition follicle mapping." },
                { step: "02", title: "Medical Review", desc: "Expert dermatologist verification." },
                { step: "03", title: "Plan Design", desc: "Multi-modal growth strategy." },
                { step: "04", title: "Ongoing Care", desc: "Bi-weekly progress monitoring." }
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-sm">
                  <div className="text-3xl font-bold text-teal-400 mb-4">{item.step}</div>
                  <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                  <p className="text-teal-100/40 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/10 aspect-[4/5]">
                <img 
                  src="/dermatology_treatment_visual_1777282762115.png" 
                  alt="Personalized Treatment" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 glass p-10 rounded-[3rem] shadow-2xl max-w-[320px] hidden md:block">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h5 className="font-bold text-lg">Growth Plan</h5>
                    <p className="text-teal-400/60 text-[10px] font-bold uppercase tracking-widest">Active Phase</p>
                  </div>
                </div>
                <p className="text-sm text-teal-100/60 leading-relaxed italic">"The personalized serum formulated after my diagnosis showed results in just 4 weeks."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="w-full aspect-square rounded-[3rem] bg-teal-50 dark:bg-teal-500/5 overflow-hidden relative">
                <img src="/dermatology_clinic_hero_1777282738062.png" alt="Why Choose Us" className="w-full h-full object-cover opacity-90 dark:opacity-70" />
                <div className="absolute inset-0 bg-teal-600/10 dark:bg-teal-900/40"></div>
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
                    <div className="w-6 h-6 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
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
      <section id="testimonials" className="py-32 bg-teal-50/30 dark:bg-[#060a14] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">Real <span className="text-gradient">Transformations</span></h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Hear from our clients who have regained their confidence through our personalized clinical care.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#0f172a] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-8">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-teal-500 text-teal-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-10 leading-relaxed italic text-lg">"{t.text}"</p>
                <div className="flex items-center gap-4 border-t border-gray-50 dark:border-white/5 pt-8">
                  <div className="relative">
                    <img src={t.image} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-teal-500 border-2 border-white dark:border-[#0f172a] flex items-center justify-center text-white">
                      <CheckCircle2 size={12} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{t.name}</h4>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Common Inquiries</h2>
            <p className="text-gray-500 dark:text-gray-400">Everything you need to know about our clinical process.</p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <details key={idx} className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 cursor-pointer group open:ring-2 open:ring-teal-500/20 transition-all overflow-hidden">
                <summary className="font-bold text-xl text-gray-900 dark:text-white flex items-center justify-between list-none">
                  {faq.q}
                  <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 group-open:rotate-180 transition-transform">
                    <ChevronDown size={18} />
                  </div>
                </summary>
                <div className="mt-6 text-gray-500 dark:text-gray-400 text-lg leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment CTA */}
      <section id="appointment" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-teal-900 dark:bg-[#0a0c10] rounded-[5rem] p-8 md:p-24 shadow-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-400/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-10 leading-tight">Secure Your <br />Expert Review</h2>
                <p className="text-teal-100/60 text-xl mb-12 leading-relaxed">
                  Join 10,000+ satisfied patients who started their journey with a single consultation. Our slots fill up fast.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 mb-2">
                      <Phone size={24} />
                    </div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Call Us</p>
                    <span className="font-bold text-xl text-white">+1 (234) 567-890</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-teal-400 mb-2">
                      <Mail size={24} />
                    </div>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Email Us</p>
                    <span className="font-bold text-xl text-white">hello@skincleaner.com</span>
                  </div>
                </div>
              </div>

              <form className="space-y-6 bg-white dark:bg-[#0f172a] p-10 md:p-14 rounded-[3.5rem] shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input label="Full Name" placeholder="John Doe" className="bg-gray-50 dark:bg-[#030712]" />
                  <Input label="Phone" placeholder="+91 98765 43210" className="bg-gray-50 dark:bg-[#030712]" />
                </div>
                <Input label="Email Address" placeholder="john@example.com" className="bg-gray-50 dark:bg-[#030712]" />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Select Specialization</label>
                  <Select>
                    <SelectTrigger className="h-14 bg-gray-50 dark:bg-[#030712] border-transparent rounded-2xl">
                      <SelectValue placeholder="Choose Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full py-6 text-lg mt-6 shadow-2xl shadow-teal-600/20">
                  Book Consultation Now
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--background)] pt-32 pb-16 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                  <Zap size={24} fill="white" />
                </div>
                <div>
                  <span className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">Skin Cleaner</span>
                  <p className="text-[10px] text-teal-600 font-bold uppercase tracking-[0.2em] leading-none">Aesthetic Clinic</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed mb-10">
                Redefining aesthetic excellence through clinical precision and personalized care pathways for hair and skin.
              </p>
              <div className="flex gap-4">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white transition-all duration-300">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-10 uppercase text-xs tracking-[0.2em]">Services</h4>
              <ul className="space-y-5">
                {["Hair Diagnosis", "Follicle Mapping", "Custom Serums", "Laser Therapy", "Growth Factors"].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 text-sm hover:text-teal-600 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-10 uppercase text-xs tracking-[0.2em]">Patient Portal</h4>
              <ul className="space-y-5">
                {["My Diagnosis", "Treatment Plan", "Success Stories", "Book Visit", "Member Support"].map(item => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 dark:text-gray-400 text-sm hover:text-teal-600 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-10 uppercase text-xs tracking-[0.2em]">Our Clinic</h4>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-teal-600 shrink-0 mt-1" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    123 Aesthetics Drive, Suite 400 <br />
                    Medical Square, NY 10001
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-[#0f172a] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">Status: Open Now</p>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-2 font-bold flex justify-between">MON - FRI <span className="dark:text-gray-300">09:00 - 20:00</span></p>
                  <p className="text-[10px] text-gray-500 font-bold flex justify-between">SAT - SUN <span className="dark:text-gray-300">10:00 - 18:00</span></p>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 dark:border-white/5 text-center">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.3em]">
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
        .mask-image-linear-to-l {
          mask-image: linear-gradient(to left, black 40%, transparent 100%);
          -webkit-mask-image: linear-gradient(to left, black 40%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
