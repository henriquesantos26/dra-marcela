import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, Share2, Facebook, Twitter, Linkedin, ArrowRight, MessageCircle, Instagram, List } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<typeof blogPosts[0] | null>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  useEffect(() => {
    const foundPost = blogPosts.find(p => p.id === id);
    if (foundPost) {
      setPost(foundPost);
      document.title = `${foundPost.titulo} | Dra. Marcela Bernardi`;
      
      // Atualizando meta tags para SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute("content", foundPost.resumo.substring(0, 160));
      }

      // Extrair headings para o Sumário (ToC)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = foundPost.conteudo;
      const hTags = tempDiv.querySelectorAll('h2, h3');
      const extractedHeadings = Array.from(hTags).map((tag, index) => {
        const text = tag.textContent || '';
        const id = `heading-${index}`;
        return { id, text, level: parseInt(tag.tagName.substring(1)) };
      });
      setHeadings(extractedHeadings);
      
      // Adicionando Open Graph tags para redes sociais
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', foundPost.titulo);

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', foundPost.imagem);
      
    } else {
      navigate('/blog');
    }
    window.scrollTo(0, 0);
  }, [id, navigate]);

  // JSON-LD Structured Data
  const jsonLd = useMemo(() => {
    if (!post) return null;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.titulo,
      "image": [post.imagem],
      "datePublished": "2026-03-15T08:00:00+08:00", // Idealmente viria do objeto post
      "dateModified": "2026-03-15T09:20:00+08:00",
      "author": [{
          "@type": "Person",
          "name": post.autor,
          "url": "https://ais-dev-4hayluts4louvyzshgipcn-155391308111.us-east1.run.app/#sobre"
        }]
    };
  }, [post]);

  const recommendedPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter(p => p.id !== post.id && p.categoria === post.categoria)
      .slice(0, 3);
  }, [post]);

  const recentPosts = useMemo(() => {
    if (!post) return [];
    return blogPosts
      .filter(p => p.id !== post.id)
      .slice(0, 4);
  }, [post]);

  const getCTA = (category: string) => {
    switch (category) {
      case 'Obstetrícia':
        return {
          title: 'Acompanhamento Pré-natal Humanizado',
          description: 'Garanta uma gestação tranquila e um parto respeitoso com acompanhamento especializado.',
          button: 'Agendar Consulta de Pré-natal'
        };
      case 'Ginecologia':
        return {
          title: 'Ginecologia Integrativa e Preventiva',
          description: 'Cuide da sua saúde feminina de forma completa, desde a adolescência até a menopausa.',
          button: 'Marcar Avaliação Ginecológica'
        };
      case 'Sustentabilidade':
        return {
          title: 'Ginecologia Natural e Acupuntura',
          description: 'Equilibre seu corpo e mente com abordagens naturais e milenares para a saúde da mulher.',
          button: 'Conhecer Abordagem Natural'
        };
      default:
        return {
          title: 'Atendimento Personalizado',
          description: 'Agende uma consulta para conversarmos sobre sua saúde e bem-estar.',
          button: 'Agendar Agora'
        };
    }
  };

  if (!post) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  const cta = getCTA(post.categoria);

  // Function to inject IDs into headings and CTA in the middle
  const renderContentWithEnhancements = (content: string) => {
    let enhancedContent = content;
    
    // Injetar IDs nos headings para o ToC funcionar
    headings.forEach((h, index) => {
      const tag = `<h${h.level}>${h.text}</h${h.level}>`;
      const replacement = `<h${h.level} id="${h.id}">${h.text}</h${h.level}>`;
      enhancedContent = enhancedContent.replace(tag, replacement);
    });

    const paragraphs = enhancedContent.split('</p>');
    if (paragraphs.length <= 3) return <div className="prose prose-lg prose-stone max-w-none" dangerouslySetInnerHTML={{ __html: enhancedContent }} />;
    
    const middleIndex = Math.floor(paragraphs.length / 2);
    const firstHalf = paragraphs.slice(0, middleIndex).join('</p>') + '</p>';
    const secondHalf = paragraphs.slice(middleIndex).join('</p>');

    return (
      <div className="prose prose-lg prose-stone max-w-none prose-headings:font-medium prose-headings:text-[#4A5550] prose-headings:scroll-mt-32 prose-a:text-[#82B596] hover:prose-a:text-[#5a8a6a] prose-img:rounded-2xl text-[#4A5550] font-light">
        <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
        
        {/* In-content CTA */}
        <div className="my-12 p-8 bg-[#B5D8C3]/30 rounded-3xl border border-[#B5D8C3] not-prose shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-xl font-medium text-[#2C3E35] mb-2">{cta.title}</h4>
              <p className="text-[#4A5550] font-light text-sm leading-relaxed">{cta.description}</p>
            </div>
            <button className="whitespace-nowrap bg-[#82B596] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#6a9a7a] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
              {cta.button}
            </button>
          </div>
        </div>

        <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#82B596] selection:text-white">
      <Header />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-16">
          
          {/* Main Content Area */}
          <article className="w-full lg:w-2/3">
            {/* Breadcrumb & Voltar */}
            <nav className="mb-8 flex items-center justify-between" aria-label="Breadcrumb">
              <Link to="/blog" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#82B596] transition-colors group">
                <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                Voltar para o Blog
              </Link>
              <div className="flex items-center gap-2 text-[10px] font-medium text-[#82B596] bg-[#82B596]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                <Tag className="w-3 h-3" />
                {post.categoria}
              </div>
            </nav>

            {/* Cabeçalho do Post */}
            <header className="mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl md:text-5xl font-medium text-[#4A5550] leading-tight mb-8 tracking-tight"
              >
                {post.titulo}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-8 text-xs text-[#4A5550] font-medium uppercase tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#82B596]" />
                  <time dateTime="2026-03-15">{post.data}</time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#82B596]" />
                  <span>{post.autor}</span>
                </div>
              </motion.div>
            </header>

            {/* Sumário (Table of Contents) */}
            {headings.length > 0 && (
              <motion.nav 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-12 p-8 bg-gray-50 rounded-3xl border border-gray-100"
              >
                <h2 className="text-lg font-medium text-[#4A5550] mb-6 flex items-center gap-2">
                  <List className="w-5 h-5 text-[#82B596]" /> Neste artigo:
                </h2>
                <ul className="space-y-3">
                  {headings.map(h => (
                    <li key={h.id} style={{ paddingLeft: h.level === 3 ? '1.5rem' : '0' }}>
                      <a 
                        href={`#${h.id}`} 
                        className="text-sm text-[#4A5550] hover:text-[#82B596] transition-colors font-light flex items-center gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <div className="w-1 h-1 rounded-full bg-[#82B596]"></div>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.nav>
            )}

            {/* Imagem Principal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-16 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 aspect-video"
            >
              <img 
                src={post.imagem} 
                alt={post.titulo} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Conteúdo do Post */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {renderContentWithEnhancements(post.conteudo)}
            </motion.div>

            {/* Bio do Autor (E-E-A-T) */}
            <section className="mt-20 p-10 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#82B596]/20">
                <img 
                  src="https://marcelabernardi.com.br/wp-content/uploads/2024/02/marcela-bernardi.png" 
                  alt="Dra. Marcela Bernardi" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-medium text-[#4A5550] mb-2">Sobre a Autora</h3>
                <p className="text-sm text-[#4A5550] font-light leading-relaxed mb-4">
                  Dra. Marcela Bernardi é médica ginecologista e obstetra formada pela USP, com foco em atendimento humanizado e integrativo. Atua no Hospital das Clínicas e em seu consultório particular em São Paulo.
                </p>
                <Link to="/#sobre" className="text-xs font-medium text-[#82B596] uppercase tracking-widest hover:underline">
                  Conhecer trajetória completa
                </Link>
              </div>
            </section>

            {/* Rodapé do Post (Compartilhar) */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Compartilhar:
                </span>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1877F2] hover:text-white transition-colors" aria-label="Compartilhar no Facebook">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-colors" aria-label="Compartilhar no Twitter">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[#0A66C2] hover:text-white transition-colors" aria-label="Compartilhar no LinkedIn">
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Posts Section */}
            {recommendedPosts.length > 0 && (
              <section className="mt-24">
                <h3 className="text-2xl font-medium text-[#4A5550] mb-10 flex items-center gap-3">
                  <div className="w-8 h-[1px] bg-[#82B596]"></div>
                  Postagens Recomendadas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recommendedPosts.map(p => (
                    <Link key={p.id} to={`/blog/${p.id}`} className="group">
                      <div className="aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm">
                        <img src={p.imagem} alt={p.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                      </div>
                      <h4 className="text-base font-medium text-[#4A5550] group-hover:text-[#82B596] transition-colors line-clamp-2 leading-snug">
                        {p.titulo}
                      </h4>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3">
            <div className="sticky top-32 space-y-12">
              
              {/* Lateral CTA Card */}
              <div className="bg-[#2C3E35] rounded-3xl p-10 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                  <MessageCircle className="w-10 h-10 text-[#82B596] mb-6" />
                  <h3 className="text-2xl font-medium mb-4 leading-tight">
                    {cta.title}
                  </h3>
                  <p className="text-white/70 font-light text-sm leading-relaxed mb-8">
                    {cta.description}
                  </p>
                  <button className="w-full bg-[#82B596] text-white py-4 rounded-full font-medium hover:bg-[#6a9a7a] transition-all shadow-lg hover:-translate-y-1">
                    {cta.button}
                  </button>
                </div>
              </div>

              {/* Recent Posts Widget */}
              <div>
                <h3 className="text-lg font-medium text-[#4A5550] mb-8 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#82B596]" /> Mais lidos recentemente
                </h3>
                <div className="space-y-8">
                  {recentPosts.map(p => (
                    <Link key={p.id} to={`/blog/${p.id}`} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-50">
                        <img src={p.imagem} alt={p.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-medium text-[#4A5550] line-clamp-2 group-hover:text-[#82B596] transition-colors leading-snug">
                          {p.titulo}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-[#82B596] font-medium uppercase tracking-wider">{p.categoria}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{p.data}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter or Social Widget */}
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="text-lg font-medium text-[#4A5550] mb-4">Siga nas redes sociais</h3>
                <p className="text-sm text-gray-500 font-light mb-6">Acompanhe dicas diárias e bastidores no Instagram.</p>
                <div className="flex gap-3">
                  <button className="flex-grow bg-white border border-gray-200 py-3 rounded-xl text-sm font-medium text-[#4A5550] hover:border-[#82B596] hover:text-[#82B596] transition-all flex items-center justify-center gap-2">
                    <Instagram className="w-4 h-4" /> @dra.marcela
                  </button>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
