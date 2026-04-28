'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import Button from '../ui/Button';

export default function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Results', href: '#results' },
    { label: 'Reviews', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={twMerge(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Zap size={22} className="text-white fill-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight transition-colors text-gray-900">
              Skin Cleaner
            </span>
            <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest leading-none">Aesthetic Clinic</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold transition-colors hover:text-indigo-500 text-gray-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold transition-colors text-gray-600 hover:text-indigo-500">
            Login
          </Link>
          <Button onClick={() => window.location.href = '#appointment'} size="sm">
            Book Now
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-lg font-bold text-gray-900"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <hr className="border-gray-100" />
          <Link href="/login" className="text-lg font-bold text-indigo-500">
            Login
          </Link>
          <Button onClick={() => { setIsMobileMenuOpen(false); window.location.href = '#appointment'; }}>
            Book Appointment
          </Button>
        </div>
      )}
    </header>
  );
}
