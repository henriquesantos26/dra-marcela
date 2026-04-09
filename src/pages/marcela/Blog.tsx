import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Tag, Search, X } from 'lucide-react';
import Header from '@/components/marcela/Header';
import Footer from '@/components/marcela/Footer';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const Blog = () => {
  const { posts, loading } = useBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Blog - Dra. Marcela Bernardi | Obstetrícia e Ginecologia";
  }, []);

  const categories = useMemo(() => {
    if (!posts) return [];
    const cats = posts.map(post => post.category).filter(Boolean);
    return Array.from(new Set(cats));
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter(post => {
      const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  const recentPosts = useMemo(() => {
    if (!posts) return [];
    return [...posts].slice(0, 3);
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-marcela-theme marcela-theme selection:bg-[#82B596] selection:text-white">
      <Header />

      <main className="pt-32 pb-24">
        {/* Hero Section do Blog */}
        <section className="max-w-7xl mx-auto px-6 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-medium text-[#4A5550] mb-6 tracking-tight">
              Nosso <span className="text-[#82B596] italic">Blog</span>
            </h1>
            <p className="text-lg text-[#4A5550] max-w-2xl mx-auto font-light leading-relaxed">
              Dicas, novidades e informações sobre saúde feminina e bem-estar, escritos com carinho pela Dra. Marcela.
            </p>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
          {/* Sidebar - Mobile Top / Desktop Left */}
          <aside className="w-full lg:w-1/4 order-2 lg:order-1">
            <div className="sticky top-32 space-y-10">
              {/* Search */}
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Buscar no blog..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-light focus:outline-none focus:ring-2 focus:ring-[#82B596]/20 focus:border-[#82B596] transition-all shadow-sm"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[#82B596] transition-colors" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-[#4A5550] mb-6 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-[#82B596]" /> Categorias
                  </h3>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${!selectedCategory ? 'bg-[#82B596] text-white shadow-md' : 'bg-white text-[#4A5550] border border-gray-100 hover:border-[#82B596] hover:text-[#82B596]'}`}
                    >
                      Todas as postagens
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${selectedCategory === cat ? 'bg-[#82B596] text-white shadow-md' : 'bg-white text-[#4A5550] border border-gray-100 hover:border-[#82B596] hover:text-[#82B596]'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Posts Widget */}
              {recentPosts.length > 0 && (
                <div className="hidden lg:block">
                  <h3 className="text-lg font-medium text-[#4A5550] mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#82B596]" /> Postagens Recentes
                  </h3>
                  <div className="space-y-6">
                    {recentPosts.map(post => (
                      <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="flex gap-4 group">
                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-medium text-[#4A5550] line-clamp-2 group-hover:text-[#82B596] transition-colors leading-snug">
                            {post.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                            {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content - Posts Grid */}
          <div className="w-full lg:w-3/4 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#82B596]"></div>
                </div>
              ) : filteredPosts.length > 0 ? (
                <motion.div 
                  key={selectedCategory || 'all'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {filteredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500"
                    >
                      <Link to={`/blog/${post.slug || post.id}`} className="flex flex-col h-full">
                        <div className="h-56 overflow-hidden relative">
                          <img 
                            src={post.cover_image} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          {post.category && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-medium text-[#78B48D] flex items-center gap-1 shadow-sm uppercase tracking-wider">
                              <Tag className="w-3 h-3" />
                              {post.category}
                            </div>
                          )}
                        </div>
                        
                        <div className="p-8 flex flex-col flex-grow">
                          <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-4 font-medium uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {post.author_name || 'Dra. Marcela'}
                            </div>
                          </div>
                          
                          <h2 className="text-xl text-[#4A5550] font-medium mb-4 leading-snug group-hover:text-[#82B596] transition-colors">
                            {post.title}
                          </h2>
                          
                          <p className="text-[#4A5550] font-light text-sm leading-relaxed mb-8 flex-grow line-clamp-3">
                            {post.excerpt}
                          </p>
                          
                          <div className="flex items-center text-[#82B596] text-sm font-medium group-hover:text-[#5a8a6a] transition-colors mt-auto">
                            Ler artigo completo <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-2" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-8 h-8 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-medium text-[#4A5550] mb-2">Página de Blog vazia</h3>
                  <p className="text-gray-400 font-light">Em breve teremos novas postagens.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
