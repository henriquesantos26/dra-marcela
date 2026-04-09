import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import Header from '../components/Header';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

function Counter({ from, to, duration = 2 }: { from: number, to: number, duration?: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      const node = nodeRef.current;
      if (node) {
        const controls = animate(from, to, {
          duration,
          ease: "easeOut",
          onUpdate(value) {
            node.textContent = Math.round(value).toString() + "+";
          },
        });
        return () => controls.stop();
      }
    }
  }, [from, to, duration, inView]);

  return <span ref={nodeRef}>{from}+</span>;
}

import { 
  Stethoscope, 
  ClipboardPlus, 
  Baby, 
  Hourglass, 
  ShieldCheck, 
  Heart, 
  Users, 
  Activity, 
  Leaf,
  Star,
  ArrowRight,
  Instagram,
  Youtube,
  Globe
} from 'lucide-react';

export default function Home() {
  const [currentDepoimento, setCurrentDepoimento] = useState(0);
  const [currentConsultorioImage, setCurrentConsultorioImage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const { scrollY } = useScroll();
  
  const servicosRef = useRef<HTMLElement>(null);
  const colunaFixaRef = useRef<HTMLDivElement>(null);
  const colunaRolagemRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Only apply on desktop where layout is side-by-side
    if (windowWidth >= 1024 && servicosRef.current && colunaFixaRef.current && colunaRolagemRef.current) {
      ScrollTrigger.create({
        trigger: servicosRef.current,
        start: "top top+=120", // Adjust based on header height and padding
        endTrigger: colunaRolagemRef.current,
        end: "bottom bottom",
        pin: colunaFixaRef.current,
        pinSpacing: false,
      });
    }
  }, { dependencies: [windowWidth], revertOnUpdate: true });

  const y1 = useTransform(scrollY, [0, 2000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -200]);
  const y3 = useTransform(scrollY, [0, 4000], [0, 200]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const servicos = [
    { icon: Stethoscope, title: 'Rotina Ginecológica' },
    { icon: ClipboardPlus, title: 'Exames preventivos' },
    { icon: Baby, title: 'Gravidez' },
    { icon: Hourglass, title: 'Menopausa' },
    { icon: ShieldCheck, title: 'Métodos Contraceptivos' },
    { icon: Heart, title: 'Sexualidade' },
    { icon: Users, title: 'Adolescente' },
    { icon: Activity, title: 'Saúde da atleta' },
    { icon: Leaf, title: 'Bem estar e saúde' },
  ];

  const depoimentos = [
    {
      texto: "Sou paciente da dra. Marcela há quatro anos e recomendo pra todas as minhas amigas. Atendimento humanizado e sem pedido de exames desnecessários como muitos médicos fazem. Estou muito satisfeita!",
      autor: "Gislene Vieira"
    },
    {
      texto: "A melhor ginecologista que já fui na vida! Dra. Marcela é cuidadosa, atenciosa e muito gentil. Me senti super acolhida desde a primeira consulta.",
      autor: "Camila Paulin"
    },
    {
      texto: "A Clínica Bernardi é excelente. Fui atendida pela Dra. Marcela que é simplesmente ótima! Muito atenciosa, cuidadosa e transmite muita tranquilidade e segurança durante a consulta. Com certeza indico!",
      autor: "Camile Rossetto"
    },
    {
      texto: "Profissional maravilhosa! Esclareceu todas as minhas dúvidas com muita paciência. O consultório é lindo e muito bem localizado. Indico de olhos fechados.",
      autor: "Mariana Silva"
    },
    {
      texto: "Fiz meu pré-natal com a Dra. Marcela e não poderia ter escolhido profissional melhor. Sempre muito disponível e empática. O parto foi incrível!",
      autor: "Juliana Costa"
    }
  ];

  const consultorioImages = [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504439468489-c8920d786a2b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=1000&auto=format&fit=crop"
  ];

  const nextConsultorioImage = () => {
    setCurrentConsultorioImage((prev) => (prev + 1) % consultorioImages.length);
  };

  const prevConsultorioImage = () => {
    setCurrentConsultorioImage((prev) => (prev - 1 + consultorioImages.length) % consultorioImages.length);
  };

  const depoimentosItemsPerView = windowWidth >= 768 ? 3 : 1;
  const maxDepoimentoIndex = Math.max(0, depoimentos.length - depoimentosItemsPerView);

  useEffect(() => {
    if (currentDepoimento > maxDepoimentoIndex) {
      setCurrentDepoimento(maxDepoimentoIndex);
    }
  }, [maxDepoimentoIndex, currentDepoimento]);

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#A6D9B9] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row items-center relative z-10 min-h-[600px] lg:min-h-[650px]">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-3/5 pt-16 pb-20 md:py-24 z-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-[64px] font-medium mb-6 leading-tight bg-gradient-to-r from-[#2C3E35] via-[#4A7559] to-[#2C3E35] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              Dra. Marcela Bernardi
            </h2>
            
            <p className="text-lg md:text-xl lg:text-2xl text-[#2C3E35] mb-2 font-normal">
              Ginecologista e Obstetra em São Paulo | Especialista em Acupuntura
            </p>
            
            <p className="text-xs md:text-sm text-[#2C3E35] mb-6 opacity-80">
              CRM 175546
            </p>
            
            <p className="text-base md:text-lg lg:text-xl text-[#2C3E35] mb-10 max-w-lg font-light">
              Um espaço para descomplicar o cuidado com a saúde da mulher
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                
                
                className="bg-white text-[#78B48D] px-8 py-3.5 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm w-full sm:w-auto text-center text-lg hover:shadow-md hover:-translate-y-1"
              >
                Agende sua consulta
              </button>
              <button 
                
                
                className="bg-white text-[#78B48D] px-8 py-3.5 rounded-full font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm w-full sm:w-auto text-center text-lg hover:shadow-md hover:-translate-y-1"
              >
                Ligue agora
              </button>
            </div>
          </motion.div>
          
          {/* Image */}
          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full md:w-1/2 absolute right-0 bottom-0 h-full flex justify-end items-end z-10 hidden md:flex pr-4 lg:pr-16"
          >
            <img 
              src="https://marcelabernardi.com.br/wp-content/uploads/2024/02/marcela-bernardi.png" 
              alt="Dra. Marcela Bernardi" 
              referrerPolicy="no-referrer"
              className="object-contain object-bottom h-[95%] max-h-[600px] w-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Sobre Section */}
      <section id="sobre" className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[#78B48D] tracking-[0.25em] text-sm font-medium uppercase mb-4">
              Sobre
            </p>
            <h2 className="text-4xl md:text-5xl text-[#4A5550] font-light">
              Marcela Bernardi
            </h2>
          </motion.div>
          
          {/* Content */}
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center">
            {/* Image */}
            <motion.div 
              style={{ y: useTransform(scrollY, [0, 2000], [0, -100]) }}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="w-full md:w-2/5 flex justify-center md:justify-end"
            >
              <img 
                src="https://marcelabernardi.com.br/wp-content/uploads/2024/02/2-scaled.jpg" 
                alt="Dra. Marcela Bernardi no consultório" 
                className="rounded-[2rem] w-full max-w-[380px] object-cover shadow-sm aspect-[3/4]"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {/* Text */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full md:w-3/5 text-[#4A5550] text-lg leading-relaxed font-light"
            >
              <p className="mb-6">
                Formada em medicina pela <span className="text-[#78B48D] font-medium">Faculdade de Medicina da Universidade de São Paulo</span> (FMUSP), Marcela fez residência em <span className="text-[#78B48D] font-medium">Ginecologia e Obstetrícia no Hospital das Clínicas</span> (HC-FMUSP). Hoje, ela atua como médica-assistente do Departamento de Obstetrícia do HC-FMUSP e também atende em seu <span className="text-[#78B48D] font-medium">consultório em São Paulo</span>.
              </p>
              <p className="mb-10">
                Por acreditar que a saúde da mulher tem relação direta com todos os aspectos sociais de sua vida, Marcela fez sua pós-graduação em <span className="text-[#78B48D] font-medium">Acupuntura pelo Instituto de Ortopedia e Traumatologia</span> (HC-FMUSP).
              </p>
              <button 
                
                
                className="bg-[#78B48D] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#6a9a7a] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                Agende sua consulta
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Propósito Section */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 md:px-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl text-[#78B48D] font-normal mb-8">
            Meu propósito
          </h3>
          <p className="text-xl md:text-2xl text-[#4A5550] font-light italic leading-relaxed">
            "Acredito em um atendimento humanizado que priorize uma escuta ativa do que a paciente diz e sente, ao mesmo tempo em que é baseado no conhecimento científico."
          </p>
        </motion.div>
      </section>

      {/* Serviços Section */}
      <section id="especialidades" ref={servicosRef} className="py-20 md:py-32 bg-[#B5D8C3] relative">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col lg:flex-row items-center lg:items-start gap-16 relative z-10">
          
          {/* Text Content */}
          <div ref={colunaFixaRef} className="w-full lg:w-1/3">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <p className="text-[#5a8a6a] tracking-[0.25em] text-sm font-medium uppercase mb-4">
                Serviços
              </p>
              <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight bg-gradient-to-r from-[#2C3E35] via-[#4A7559] to-[#2C3E35] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                Como posso te ajudar?
              </h2>
              <p className="text-lg text-[#2C3E35] font-light mb-10 leading-relaxed">
                Você pode agendar consulta presencial ou telemedicina para ter um atendimento personalizado.
              </p>
              <button 
                
                
                className="bg-[#82B596] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#6a9a7a] transition-colors shadow-sm"
              >
                Agende sua consulta
              </button>
            </motion.div>
          </div>
          
          {/* Bento Grid */}
          <div ref={colunaRolagemRef} className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {servicos.map((servico, index) => {
              const Icon = servico.icon;
              // Create a bento grid effect by making some items span more columns/rows
              const isLarge = index === 0 || index === 3;
              
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  
                  
                  className={`flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] group cursor-pointer hover:bg-white/60 transition-all duration-500 ${isLarge ? 'md:col-span-2 md:row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
                >
                  <div className={`rounded-full bg-[#82B596]/20 flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${isLarge ? 'w-20 h-20 md:w-24 md:h-24' : 'w-16 h-16 md:w-20 md:h-20'}`}>
                    <Icon className={`text-[#2C3E35] opacity-80 ${isLarge ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'}`} strokeWidth={1.5} />
                  </div>
                  <span className={`text-[#2C3E35] text-center font-medium px-2 ${isLarge ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
                    {servico.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
          
        </div>
      </section>

      {/* Depoimentos Section */}
      <section id="depoimentos" className="py-20 md:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-[#78B48D] tracking-[0.25em] text-sm font-medium uppercase mb-4">
              Depoimentos
            </p>
            <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight bg-gradient-to-r from-[#2C3E35] via-[#4A7559] to-[#2C3E35] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              O que dizem as pacientes
            </h2>
          </motion.div>
          
          {/* Cards Container */}
          <div className="relative mb-16 px-4 py-4 group">
            <div className="overflow-hidden">
              <motion.div 
                className="flex gap-8"
                animate={{ x: `calc(-${currentDepoimento * 100}% - ${currentDepoimento * 2}rem)` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {depoimentos.map((depoimento, index) => (
                  <div 
                    key={index} 
                    
                    
                    className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col items-center text-center border border-gray-100 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500 cursor-pointer min-w-full md:min-w-[calc(33.333%-1.333rem)]"
                  >
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#78B48D] text-[#78B48D]" />
                      ))}
                    </div>
                    
                    {/* Text */}
                    <p className="text-[#4A5550] font-light leading-relaxed mb-8 flex-grow italic">
                      "{depoimento.texto}"
                    </p>
                    
                    {/* Author */}
                    <p className="text-[#2C3E35] font-medium">
                      {depoimento.autor}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentDepoimento(prev => Math.max(0, prev - 1))}
              disabled={currentDepoimento === 0}
              
              
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-[#78B48D] hover:bg-gray-50 transition-all z-10 ${currentDepoimento === 0 ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button 
              onClick={() => setCurrentDepoimento(prev => Math.min(maxDepoimentoIndex, prev + 1))}
              disabled={currentDepoimento === maxDepoimentoIndex}
              
              
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-[#78B48D] hover:bg-gray-50 transition-all z-10 ${currentDepoimento === maxDepoimentoIndex ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          
          {/* Pagination Dots */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center gap-2 mb-12"
          >
            {[...Array(maxDepoimentoIndex + 1)].map((_, i) => (
              <div 
                key={i} 
                onClick={() => setCurrentDepoimento(i)}
                
                
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === currentDepoimento ? 'bg-[#78B48D] scale-125' : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'}`}
              ></div>
            ))}
          </motion.div>
          
          {/* Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <button 
              
              
              className="bg-[#82B596] text-white px-10 py-3.5 rounded-full font-medium hover:bg-[#6a9a7a] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              Agende sua consulta
            </button>
          </motion.div>
        </div>
      </section>

      {/* Estatísticas Section */}
      <section className="py-20 bg-[#82B596] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl py-16 px-8 flex flex-col md:flex-row justify-around items-center gap-12 md:gap-4 text-white text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
          >
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-medium mb-2 drop-shadow-sm"><Counter from={0} to={9} duration={2} /></span>
              <span className="text-lg font-light tracking-wide uppercase text-white/90">anos de experiência</span>
            </div>
            
            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-medium mb-2 drop-shadow-sm"><Counter from={0} to={1000} duration={2.5} /></span>
              <span className="text-lg font-light tracking-wide uppercase text-white/90">pacientes atendidas</span>
            </div>
            
            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <span className="text-6xl md:text-7xl font-medium mb-2 drop-shadow-sm"><Counter from={0} to={150} duration={2.2} /></span>
              <span className="text-lg font-light tracking-wide uppercase text-white/90">partos realizados</span>
            </div>
            
          </motion.div>
        </div>
      </section>

      {/* Consultório Section */}
      <section id="contato" className="py-20 md:py-32 bg-[#B5D8C3] relative">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="bg-white rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-white/50">
            
            {/* Left Column - Info & Map */}
            <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center text-center md:sticky md:top-24 self-start">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-[#78B48D] tracking-[0.25em] text-sm font-medium uppercase mb-4">
                  Mais informações
                </p>
                <h2 className="text-4xl md:text-5xl text-[#2C3E35] font-normal mb-8">
                  Nosso consultório
                </h2>
                
                <p className="text-[#4A5550] font-light leading-relaxed mb-6">
                  Nossa estrutura oferece conforto, pontualidade e atendimento personalizado, com exames ginecológicos no próprio consultório.
                </p>
                
                <p className="text-[#4A5550] font-light leading-relaxed mb-10">
                  Av. Angélica, 2.466, Conj. 252 – Higienópolis, São Paulo<br/>
                  (SP) – CEP:01228-200
                </p>
                
                <button 
                  
                  
                  className="bg-[#82B596] text-white px-10 py-3.5 rounded-full font-medium hover:bg-[#6a9a7a] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 mb-12"
                >
                  Agende sua consulta
                </button>
              </motion.div>
              
              {/* Map */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-full h-48 md:h-64 bg-gray-200 relative overflow-hidden rounded-2xl shadow-inner"
              >
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.776015081373!2d-46.66191302376186!3d-23.54055706082496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5832a5e40e85%3A0x6a059c251d530182!2sAv.%20Ang%C3%A9lica%2C%202466%20-%20Higien%C3%B3polis%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001228-200!5e0!3m2!1spt-BR!2sbr!4v1710780000000!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa do Consultório"
                  className="absolute inset-0"
                ></iframe>
              </motion.div>
            </div>
            
            {/* Right Column - Image Carousel */}
            <div className="w-full md:w-1/2 relative min-h-[500px] md:min-h-[800px] overflow-hidden">
              <motion.img 
                key={currentConsultorioImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{ y: useTransform(scrollY, [0, 4000], [0, 200]) }}
                src={consultorioImages[currentConsultorioImage]} 
                alt="Interior do consultório" 
                className="absolute inset-0 w-full h-[120%] object-cover -top-[10%]"
                referrerPolicy="no-referrer"
              />
              
              {/* Glassmorphism Carousel Controls */}
              <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button 
                  onClick={prevConsultorioImage}
                  
                  
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all pointer-events-auto shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button 
                  onClick={nextConsultorioImage}
                  
                  
                  className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all pointer-events-auto shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
              
              {/* Carousel Dots */}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                {consultorioImages.map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setCurrentConsultorioImage(i)}
                    
                    
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${i === currentConsultorioImage ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80 cursor-pointer'}`}
                  ></div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-white relative overflow-hidden">
        {/* Wavy Top Border */}
        <div className="absolute top-0 left-0 right-0 -translate-y-[99%] w-full overflow-hidden leading-none z-10">
          <svg className="relative block w-full h-[30px] md:h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#B5D8C3"></path>
          </svg>
        </div>

        <div className="py-20 md:py-24 max-w-7xl mx-auto px-4 md:px-12">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-gray-400 tracking-[0.25em] text-xs font-medium uppercase mb-4">
              Blog
            </p>
            <h2 className="text-3xl md:text-4xl font-medium mb-6 leading-tight bg-gradient-to-r from-[#2C3E35] via-[#4A7559] to-[#2C3E35] bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              Confira o nosso conteúdo sobre saúde da mulher
            </h2>
          </motion.div>
          
          {/* Blog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {blogPosts.slice(0, 3).map((post, index) => (
              <Link to={`/blog/${post.id}`} key={index}>
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group cursor-pointer hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 h-full"
                >
                  <div className="h-48 md:h-56 overflow-hidden p-4 pb-0">
                    <img 
                      src={post.imagem} 
                      alt={post.titulo} 
                      className="w-full h-full object-cover rounded-t-xl transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-lg text-[#78B48D] font-medium mb-4 leading-snug group-hover:text-[#5a8a6a] transition-colors">
                      {post.titulo}
                    </h3>
                    <p className="text-[#4A5550] font-light text-sm leading-relaxed mb-8 flex-grow">
                      {post.resumo}
                    </p>
                    <div className="flex items-center text-[#78B48D] text-sm font-medium group-hover:text-[#5a8a6a] transition-colors">
                      Leia mais <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12 mb-8">
            <Link to="/blog" className="inline-flex items-center justify-center px-8 py-3 border border-[#78B48D] text-[#78B48D] rounded-full font-medium hover:bg-[#78B48D] hover:text-white transition-colors duration-300">
              Ver todos os artigos
            </Link>
          </div>
          
          {/* Pagination Dots */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center gap-2"
          >
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                
                
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i === 0 ? 'bg-[#78B48D] scale-125' : 'bg-gray-200 hover:bg-gray-300 cursor-pointer'}`}
              ></div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
