import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4">Digital Boost Pro</h3>
          <p className="text-slate-400 text-sm">
            Based in Unawatuna / Galle, Sri Lanka.
            Helping businesses grow worldwide.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Contact</h4>
          <div className="text-slate-400 text-sm space-y-1">
            <p>
              WhatsApp: <a href="https://wa.me/c/94777549720" className="hover:text-brand-500 transition-colors" target="_blank" rel="noopener noreferrer">+94 777 549 720</a>
            </p>
            <p>
              Email: <a href="mailto:gayan.chathuranga@vk.com" className="hover:text-brand-500 transition-colors">gayan.chathuranga@vk.com</a>
            </p>
            <p>
              Backup: <a href="mailto:digitalboostpro3@gmail.com" className="hover:text-brand-500 transition-colors">digitalboostpro3@gmail.com</a>
            </p>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold mb-4">Services</h4>
          <ul className="text-slate-400 text-sm space-y-2">
            <li>Social Media Marketing</li>
            <li>Hotel Management</li>
            <li>Web & SEO</li>
            <li>AI Solutions</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
        © {new Date().getFullYear()} Digital Boost Pro. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;