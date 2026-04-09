import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between px-4 md:px-12 py-5 bg-white shadow-sm relative z-50">
      <Link 
        to="/"
        className="flex items-center gap-3 cursor-pointer"
      >
        {/* Logo Icon */}
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#78B48D] opacity-80 rotate-45 rounded-sm"></div>
          <div className="absolute inset-1 bg-[#A6D9B9] opacity-80 rotate-12 rounded-sm"></div>
          <svg className="relative z-10 w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21.5c-3.3-2.5-8-7.5-8-12.5A5.5 5.5 0 0 1 9.5 3.5c1.8 0 3.2 1.2 4.5 2.5 1.3-1.3 2.7-2.5 4.5-2.5A5.5 5.5 0 0 1 20 9c0 5-4.7 10-8 12.5z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl font-light tracking-[0.15em] text-[#78B48D] leading-none">
            MARCELA BERNARDI
          </h1>
          <p className="text-[8px] md:text-[9px] tracking-[0.3em] text-[#78B48D] uppercase mt-1">
            Obstetrícia e Ginecologia
          </p>
        </div>
      </Link>
      
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-8 text-[#78B48D] text-[15px]">
        <Link to="/" className="hover:text-[#5a8a6a] transition-colors">Home</Link>
        <a href="/#sobre" className="hover:text-[#5a8a6a] transition-colors">Sobre a Marcela</a>
        <a href="/#especialidades" className="hover:text-[#5a8a6a] transition-colors">Especialidades</a>
        <a href="/#depoimentos" className="hover:text-[#5a8a6a] transition-colors">Depoimentos</a>
        <a href="/#contato" className="hover:text-[#5a8a6a] transition-colors">Contato</a>
        <Link to="/blog" className="hover:text-[#5a8a6a] transition-colors">Blog</Link>
        <button 
          className="bg-[#78B48D] text-white px-7 py-2.5 rounded-full hover:bg-[#6a9a7a] transition-all duration-300 font-medium ml-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          Agendamento
        </button>
      </nav>

      {/* Mobile Menu Button */}
      <button className="lg:hidden text-[#78B48D]">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </header>
  );
};

export default Header;
