/**
 * @system DO NOT EDIT - Core system file
 * @description Floating edit button for authenticated admins
 */
import { PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useInlineEdit } from '@/contexts/InlineEditContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FloatingEditButton = () => {
  const { isAdmin } = useAuth();
  const { editMode } = useInlineEdit();
  const navigate = useNavigate();

  if (!isAdmin || editMode) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => navigate('/?edit=true')}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-[9990] p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 hover:bg-black/80 hover:border-white/25 hover:scale-110 transition-all duration-200 group shadow-lg"
          >
            <PenTool className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Editar Site</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FloatingEditButton;
