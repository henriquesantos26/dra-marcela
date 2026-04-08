import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings2, FileText, Plus } from 'lucide-react';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnifiedPropertiesPanel from './UnifiedPropertiesPanel';
import AddSectionPanel from './AddSectionPanel';
import ContentControls from './ContentControls';
import FontLoader from './FontLoader';

const EditorSidebar = () => {
  const { editMode, sidebarOpen, setSidebarOpen, selectedElement, activeField } = useInlineEdit();

  if (!editMode) return null;

  const defaultTab = 'properties';

  return (
    <>
      <FontLoader />
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[360px] z-[9999] bg-zinc-950/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">Editor Visual</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs - simplified to 3 */}
            <Tabs defaultValue={defaultTab} key={`${activeField}-${selectedElement}`} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-4 bg-white/5 border border-white/10 h-auto">
                <TabsTrigger value="properties" className="flex-1 gap-1.5 text-xs font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 px-3 py-2">
                  <Settings2 className="w-3.5 h-3.5" />
                  Propriedades
                </TabsTrigger>
                <TabsTrigger value="content" className="flex-1 gap-1.5 text-xs font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 px-3 py-2">
                  <FileText className="w-3.5 h-3.5" />
                  Conteúdo
                </TabsTrigger>
                <TabsTrigger value="add" className="flex-1 gap-1.5 text-xs font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 px-3 py-2">
                  <Plus className="w-3.5 h-3.5" />
                  Novo
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <TabsContent value="properties" className="mt-0">
                  <UnifiedPropertiesPanel />
                </TabsContent>
                <TabsContent value="content" className="mt-0">
                  <ContentControls />
                </TabsContent>
                <TabsContent value="add" className="mt-0">
                  <AddSectionPanel />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorSidebar;
