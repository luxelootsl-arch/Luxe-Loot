import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "SMM & Management",
    desc: "Targeted ads, content creation, and daily posts for FB/Insta.",
    icon: "📱"
  },
  {
    title: "Hotel Management",
    desc: "Booking.com/Airbnb sync, guest comms, and price optimization.",
    icon: "🏨"
  },
  {
    title: "Photo & Video",
    desc: "Real estate photography, drone shots, and viral reels.",
    icon: "📸"
  },
  {
    title: "Web & SEO",
    desc: "High-ranking websites, Google Maps listings & Local SEO.",
    icon: "🌐"
  },
  {
    title: "AI Powerhouse",
    desc: "Custom prompts, automated replies, and AI content generation.",
    icon: "🤖"
  }
];

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-900 text-white">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Elevate Your Business<br />
            <span className="text-brand-500">With Digital Solutions</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl">
            Perfect for hotels, travel agencies, villas, and small businesses looking for more sales, bookings, and visibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/consultant" className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-lg font-semibold text-center transition">
              Get AI Advice
            </Link>
            <Link to="/creative" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 px-8 py-3 rounded-lg font-semibold text-center transition">
              Create Content
            </Link>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Our Professional Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-slate-900">{s.title}</h3>
              <p className="text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-brand-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-brand-900 mb-4">Ready to boost your bookings?</h2>
          <p className="text-brand-700 mb-8">Contact Gayan Chathuranga today via WhatsApp or Email.</p>
          <a href="https://wa.me/c/94777549720" className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;