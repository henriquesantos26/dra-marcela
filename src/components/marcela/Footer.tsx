import React from 'react';
import { motion } from 'framer-motion';
import { Baby, Leaf, Heart, Users, Instagram, Youtube, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/contexts/SiteContentContext';
import EditableText from '@/components/inline-edit/EditableText';

const Footer = () => {
  const { content } = useSiteContent();
  const social = content.socialLinks || { facebook: '', instagram: '', whatsapp: '' };

  return (
    <footer className="w-full overflow-hidden marcela-theme font-marcela-theme ">
      {/* Main Footer */}
      <div className="bg-[#82B596] py-16">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-12 md:gap-8"
        >
          
          {/* Logo Area */}
          <div className="flex items-center gap-6">
            {/* Abstract Logo Representation */}
            <div className="grid grid-cols-2 gap-1.5 rotate-45 scale-90 md:scale-100">
              <div className="w-10 h-10 border-[1.5px] border-white rounded-md flex items-center justify-center -rotate-45">
                <Baby className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="w-10 h-10 border-[1.5px] border-white rounded-md flex items-center justify-center -rotate-45">
                <Leaf className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="w-10 h-10 border-[1.5px] border-white rounded-md flex items-center justify-center -rotate-45">
                <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="w-10 h-10 border-[1.5px] border-white rounded-md flex items-center justify-center -rotate-45">
                <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-white flex flex-col justify-center">
              <h2 className="text-2xl md:text-3xl tracking-[0.15em] font-light leading-none mb-2 uppercase">MARCELA BERNARDI</h2>
              <p className="text-[0.65rem] md:text-xs tracking-[0.3em] font-light">OBSTETRÍCIA E GINECOLOGIA</p>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex gap-4">
              <a 
                href={social.instagram || "#"} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#82B596] transition-all duration-300 hover:scale-110"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#82B596] transition-all duration-300 hover:scale-110"
              >
                <Youtube className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a 
                href={social.whatsapp || "#"} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-white flex items-center justify-center text-white hover:bg-white hover:text-[#82B596] transition-all duration-300 hover:scale-110"
              >
                <Globe className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-white/80 text-sm font-light">
              <a href="/#sobre" className="hover:text-white transition-colors">Sobre</a>
              <a href="/#especialidades" className="hover:text-white transition-colors">Especialidades</a>
              <a href="/#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
              <a href="/#contato" className="hover:text-white transition-colors">Contato</a>
              <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="text-white text-sm md:text-base font-light leading-relaxed text-center md:text-left">
            <p><EditableText fieldPath="marcela.contact.address">{content.marcela?.contact?.address || 'Av. Angélica, 2.466, Conj. 252 -'}</EditableText></p>
            <p>Higienópolis, São Paulo (SP) -</p>
            <p>CEP: 01228-200</p>
            <a 
              href={social.whatsapp || "#"} 
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-gray-100 transition-colors mt-2 inline-block"
            >
              <EditableText fieldPath="marcela.contact.ctaText">{content.marcela?.contact?.ctaText || 'Agende Sua Consulta'}</EditableText>
            </a>
          </div>
          
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#CBE4D4] py-5 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-12 text-center">
          <p className="text-[#5a8a6a] text-xs font-light">
            Copyright © 2026 <a href="#" className="underline hover:text-[#2C3E35] transition-colors">marcelabernardi.com.br</a> - Desenvolvido por <a href="https://hicreative.com.br" className="underline hover:text-[#2C3E35] transition-colors">Hi! Creative Lab</a>
          </p>
        </div>
        
        {/* Scroll to Top Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-[#82B596] text-white p-2.5 rounded-full shadow-sm hover:bg-[#6a9a7a] transition-all duration-300 hover:-translate-y-2 hover:shadow-md"
          aria-label="Voltar ao topo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
