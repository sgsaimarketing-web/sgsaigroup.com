import React from 'react';
import { useSiteContent, EditorTab } from '../../context/ContentContext.tsx';
import { Edit3 } from 'lucide-react';

interface EditableBlockProps {
  section: EditorTab;
  label?: string;
  projectId?: string;
  children: React.ReactNode;
  className?: string;
}

export const EditableBlock: React.FC<EditableBlockProps> = ({
  section,
  label,
  projectId,
  children,
  className = '',
}) => {
  const { isAuthorized, isEditorOpen, isClickToEditActive, openEditor } = useSiteContent();

  if (!isAuthorized || !isEditorOpen || !isClickToEditActive) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditor(section, projectId);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative outline outline-1 outline-dashed outline-[#2563EB]/40 hover:outline-2 hover:outline-solid hover:outline-[#2563EB] cursor-pointer transition-all duration-200 ${className}`}
      title={`Click to edit ${label || section}`}
    >
      {/* Floating Edit Pill */}
      <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        <span className="flex items-center gap-1 rounded-full bg-[#2563EB] text-white px-2.5 py-1 text-[11px] font-bold shadow-lg">
          <Edit3 className="size-3" />
          <span>Edit {label || section}</span>
        </span>
      </div>
      {children}
    </div>
  );
};
