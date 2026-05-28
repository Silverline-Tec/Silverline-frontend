'use client';

import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* Footer */}
      <footer className="border-t border-cyan-400/20 bg-black/20 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-cyan-300 font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/dashboard" className="hover:text-cyan-300 transition">Dashboard</a></li>
                <li><a href="https://sentinel-software.vercel.app/docs" className="hover:text-cyan-300 transition">Docs</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-300 font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-300 transition">About</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-300 font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://sentinel-software.vercel.app/docs" className="hover:text-cyan-300 transition">Docs</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Support</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-cyan-300 font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-cyan-300 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-300 transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-400/20 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
            <p>&copy; 2026 Silverline Sentinel. All rights reserved.</p>
            <p>Resilient field intelligence for central operations</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
