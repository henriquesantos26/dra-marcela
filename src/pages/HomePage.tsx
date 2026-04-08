/**
 * @system DO NOT EDIT - Core system file
 * @description Dynamic homepage with sections loaded from database
 * @module system
 */
import React from 'react';
import { Navbar, Footer } from '@/components/LandingSections';
import { usePageTracking } from '@/hooks/usePageTracking';
import BackgroundIdentity from '@/components/BackgroundIdentity';
import { InlineEditProvider } from '@/contexts/InlineEditContext';
import EditModeBar from '@/components/inline-edit/EditModeBar';
import FloatingEditButton from '@/components/FloatingEditButton';
import EditorSidebar from '@/components/inline-edit/EditorSidebar';
import DynamicSectionRenderer from '@/components/sections/DynamicSectionRenderer';
import { useSiteContent } from '@/contexts/SiteContentContext';

const HomePageContent = () => {
  const { sections, sectionsLoading } = useSiteContent();

  return (
    <InlineEditProvider>
      <div className="relative min-h-screen font-sans selection:bg-primary selection:text-primary-foreground" style={{ backgroundColor: 'black' }}>
        <EditModeBar />
        <FloatingEditButton />
        <EditorSidebar />
        <BackgroundIdentity />
        <div className="relative z-10">
          <Navbar />
          {sectionsLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            sections.map((section) => (
              <DynamicSectionRenderer key={section.id} section={section} />
            ))
          )}
          <Footer />
        </div>
      </div>
    </InlineEditProvider>
  );
};

const HomePage = () => {
  usePageTracking();
  return <HomePageContent />;
};

export default HomePage;
