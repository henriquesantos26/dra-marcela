import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSiteContent, SiteContent } from './SiteContentContext';
import { useAuth } from './AuthContext';

export interface CustomStyle {
  color?: string;
  fontSize?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: string;
  letterSpacing?: string;
  motionEffect?: string;
  motionTrigger?: string;
  motionStrength?: number;
  linkUrl?: string;
  linkTarget?: string;
}

export interface SectionStyle {
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientAngle?: number;
  backgroundImage?: string;
  backgroundOverlayOpacity?: number;
  paddingY?: string;
  motionEffect?: string;
}

interface PendingChange {
  text?: string;
  style?: CustomStyle;
}

interface InlineEditContextType {
  editMode: boolean;
  activeField: string | null;
  setActiveField: (field: string | null) => void;
  pendingChanges: Record<string, PendingChange>;
  updateField: (fieldPath: string, change: PendingChange) => void;
  saveAll: () => Promise<void>;
  discardAll: () => void;
  exitEditMode: () => void;
  saving: boolean;
  getFieldText: (fieldPath: string, original: string) => string;
  getFieldStyle: (fieldPath: string) => CustomStyle;
  // New sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedSection: string | null;
  setSelectedSection: (id: string | null) => void;
  selectedSectionType: string | null;
  setSelectedSectionType: (type: string | null) => void;
  selectedElement: 'section' | 'text' | 'element' | null;
  setSelectedElement: (el: 'section' | 'text' | 'element' | null) => void;
  // Section styles
  sectionStyles: Record<string, SectionStyle>;
  updateSectionStyle: (sectionId: string, style: Partial<SectionStyle>) => void;
  getSectionStyle: (sectionId: string) => SectionStyle;
  // Blank section element selection
  selectedBlankElementId: string | null;
  setSelectedBlankElementId: (id: string | null) => void;
}

const defaultSectionStyle: SectionStyle = {
  backgroundType: 'solid',
  backgroundColor: '',
  gradientFrom: '',
  gradientTo: '',
  gradientAngle: 135,
  backgroundImage: '',
  backgroundOverlayOpacity: 50,
  paddingY: '',
};

const InlineEditContext = createContext<InlineEditContextType>({
  editMode: false,
  activeField: null,
  setActiveField: () => {},
  pendingChanges: {},
  updateField: () => {},
  saveAll: async () => {},
  discardAll: () => {},
  exitEditMode: () => {},
  saving: false,
  getFieldText: (_, original) => original,
  getFieldStyle: () => ({}),
  sidebarOpen: false,
  setSidebarOpen: () => {},
  selectedSection: null,
  setSelectedSection: () => {},
  selectedSectionType: null,
  setSelectedSectionType: () => {},
  selectedElement: null,
  setSelectedElement: () => {},
  sectionStyles: {},
  updateSectionStyle: () => {},
  getSectionStyle: () => defaultSectionStyle,
  selectedBlankElementId: null,
  setSelectedBlankElementId: () => {},
});

export const useInlineEdit = () => useContext(InlineEditContext);

// Helper to get nested value by dot path
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
};

// Helper to set nested value by dot path
const setNestedValue = (obj: any, path: string, value: any): any => {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split('.');
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
  return clone;
};

export const InlineEditProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { content, updateContent, saving: contentSaving } = useSiteContent();
  
  const isEditParam = searchParams.get('edit') === 'true';
  const [editMode, setEditMode] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({});
  const [saving, setSaving] = useState(false);

  // New sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSectionType, setSelectedSectionType] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<'section' | 'text' | 'element' | null>(null);
  const [pendingSectionStyles, setPendingSectionStyles] = useState<Record<string, SectionStyle>>({});
  const [selectedBlankElementId, setSelectedBlankElementId] = useState<string | null>(null);

  useEffect(() => {
    if (isEditParam && user) {
      setEditMode(true);
      setSidebarOpen(true);
    }
  }, [isEditParam, user]);

  const updateField = useCallback((fieldPath: string, change: PendingChange) => {
    setPendingChanges(prev => ({
      ...prev,
      [fieldPath]: { ...prev[fieldPath], ...change },
    }));
  }, []);

  const getFieldText = useCallback((fieldPath: string, original: string): string => {
    return pendingChanges[fieldPath]?.text ?? original;
  }, [pendingChanges]);

  const getFieldStyle = useCallback((fieldPath: string): CustomStyle => {
    const savedStyle = (content as any).customStyles?.[fieldPath] || {};
    const pendingStyle = pendingChanges[fieldPath]?.style || {};
    return { ...savedStyle, ...pendingStyle };
  }, [content, pendingChanges]);

  const updateSectionStyle = useCallback((sectionId: string, style: Partial<SectionStyle>) => {
    setPendingSectionStyles(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] || defaultSectionStyle), ...style },
    }));
  }, []);

  const getSectionStyle = useCallback((sectionId: string): SectionStyle => {
    const saved = (content as any).sectionStyles?.[sectionId] || {};
    const pending = pendingSectionStyles[sectionId] || {};
    return { ...defaultSectionStyle, ...saved, ...pending };
  }, [content, pendingSectionStyles]);

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      let updated: SiteContent = JSON.parse(JSON.stringify(content));

      // Merge text changes
      for (const [fieldPath, change] of Object.entries(pendingChanges)) {
        if (change.text !== undefined) {
          updated = setNestedValue(updated, fieldPath, change.text);
        }
        if (change.style) {
          if (!updated.customStyles) updated.customStyles = {};
          updated.customStyles[fieldPath] = {
            ...(updated.customStyles[fieldPath] || {}),
            ...change.style,
          };
        }
      }

      // Merge section styles
      if (Object.keys(pendingSectionStyles).length > 0) {
        if (!(updated as any).sectionStyles) (updated as any).sectionStyles = {};
        for (const [sectionId, style] of Object.entries(pendingSectionStyles)) {
          (updated as any).sectionStyles[sectionId] = {
            ...((updated as any).sectionStyles[sectionId] || {}),
            ...style,
          };
        }
      }

      await updateContent(updated);
      setPendingChanges({});
      setPendingSectionStyles({});
    } finally {
      setSaving(false);
    }
  }, [content, pendingChanges, pendingSectionStyles, updateContent]);

  const discardAll = useCallback(() => {
    setPendingChanges({});
    setPendingSectionStyles({});
    setActiveField(null);
    setSelectedSection(null);
    setSelectedSectionType(null);
    setSelectedElement(null);
    setSelectedBlankElementId(null);
  }, []);

  const exitEditMode = useCallback(() => {
    discardAll();
    setEditMode(false);
    setSidebarOpen(false);
    navigate('/', { replace: true });
  }, [discardAll, navigate]);

  const hasPendingChanges = Object.keys(pendingChanges).length > 0 || Object.keys(pendingSectionStyles).length > 0;

  return (
    <InlineEditContext.Provider value={{
      editMode,
      activeField,
      setActiveField,
      pendingChanges: hasPendingChanges ? { ...pendingChanges, __sectionStyles: {} as any } : pendingChanges,
      updateField,
      saveAll,
      discardAll,
      exitEditMode,
      saving: saving || contentSaving,
      getFieldText,
      getFieldStyle,
      sidebarOpen,
      setSidebarOpen,
      selectedSection,
      setSelectedSection,
      selectedSectionType,
      setSelectedSectionType,
      selectedElement,
      setSelectedElement,
      sectionStyles: pendingSectionStyles,
      updateSectionStyle,
      getSectionStyle,
      selectedBlankElementId,
      setSelectedBlankElementId,
    }}>
      {children}
    </InlineEditContext.Provider>
  );
};
