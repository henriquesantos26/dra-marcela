import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Bold, Italic, Strikethrough, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Quote, Undo, Redo, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#82b596] underline hover:text-[#5a8a6a] cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-border',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[500px] w-full p-6 text-foreground bg-secondary',
      },
    },
  });

  // Atualiza o conteúdo quando a prop external mudar e o editor não estiver focado (como quando recebe texto da IA gerado de uma vez)
  useEffect(() => {
    if (editor && content !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `editor/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao carregar imagem. Tente novamente.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addImage = useCallback(() => {
    const choice = window.confirm('Deseja fazer upload de uma imagem? (Cancelar para inserir via URL)');
    
    if (choice) {
      fileInputRef.current?.click();
    } else {
      const url = window.prompt('URL ou endereço da imagem:');
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL do link:', previousUrl);

    if (url === null || !editor) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden border border-border shadow-sm">
      {/* Barra de Ferramentas Fixa Superior */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-card border-b border-border">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Negrito"><Bold className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Itálico"><Italic className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('strike') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Tachado"><Strikethrough className="w-4 h-4" /></button>
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1.5 font-black text-xs rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Subtítulo H2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1.5 font-bold text-xs rounded-lg transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Tópico H3">H3</button>
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Lista Tópicos"><List className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Lista Numerada"><ListOrdered className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Citação"><Quote className="w-4 h-4" /></button>
        
        <div className="w-px h-5 bg-border mx-1" />
        
        <button type="button" onClick={setLink} className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-secondary'}`} title="Inserir Link"><LinkIcon className="w-4 h-4" /></button>
        <button 
          type="button" 
          onClick={addImage} 
          disabled={uploading}
          className={`p-2 rounded-lg transition-colors text-muted-foreground hover:bg-secondary flex items-center gap-1 ${uploading ? 'animate-pulse' : ''}`} 
          title="Inserir Imagem (Upload ou URL)"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </button>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        
        <div className="flex-grow" />
        
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 rounded-lg transition-colors text-muted-foreground disabled:opacity-30 hover:bg-secondary" title="Desfazer"><Undo className="w-4 h-4" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 rounded-lg transition-colors text-muted-foreground disabled:opacity-30 hover:bg-secondary" title="Refazer"><Redo className="w-4 h-4" /></button>
      </div>

      {/* Bubble Menu Dinâmico ao Selecionar Texto */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex items-center gap-1.5 bg-[#2C3E35] text-white shadow-xl rounded-xl p-2 shrink-0">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-white/20' : 'hover:bg-white/10'}`} title="Negrito">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-white/20' : 'hover:bg-white/10'}`} title="Itálico">
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1.5 font-bold text-xs rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1.5 font-bold text-xs rounded-lg transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-white/20' : 'hover:bg-white/10'}`}>
          H3
        </button>
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <button type="button" onClick={setLink} className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-white/20' : 'hover:bg-white/10'}`} title="Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/20 mx-0.5" />
        <div className="flex items-center mx-1">
          <input type="color" onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} title="Cor do Texto" className="w-6 h-6 rounded-md cursor-pointer border-0 p-0 bg-transparent overflow-hidden" />
        </div>
      </BubbleMenu>

      {/* Área do Editor */}
      <div className="bg-secondary/30 max-h-[800px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .ProseMirror p { margin-top: 1rem; margin-bottom: 1rem; font-size: 1rem; line-height: 1.6; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #333; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #444; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; }
        .ProseMirror blockquote { border-left: 4px solid #82b596; padding-left: 1rem; color: #555; font-style: italic; }
      `}} />
    </div>
  );
};

export default TipTapEditor;
