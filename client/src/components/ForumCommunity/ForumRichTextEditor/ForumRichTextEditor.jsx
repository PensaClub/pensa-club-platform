import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Strikethrough, Code, List, ListOrdered,
  Quote, Minus, Link2, Image as ImageIcon, Youtube as YTIcon,
  Undo2, Redo2,
} from 'lucide-react';
import './forumRichTextEditor.css';

const ForumRichTextEditor = ({ content = '', onChange, placeholder = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({ inline: false, width: '100%', height: 320 }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = prompt('URL на изображение:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt('URL на линк:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addYoutube = () => {
    const url = prompt('YouTube URL:');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  const ToolBtn = ({ onClick, active, children, title }) => (
    <button
      type="button"
      className={`frte-btn ${active ? 'frte-btn-active' : ''}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="frte-container">
      {/* Toolbar */}
      <div className="frte-toolbar">
        <div className="frte-group">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
            <Strikethrough size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code">
            <Code size={15} />
          </ToolBtn>
        </div>

        <div className="frte-divider" />

        <div className="frte-group">
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <List size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
            <ListOrdered size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
            <Quote size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={15} />
          </ToolBtn>
        </div>

        <div className="frte-divider" />

        <div className="frte-group">
          <ToolBtn onClick={addLink} active={editor.isActive('link')} title="Link">
            <Link2 size={15} />
          </ToolBtn>
          <ToolBtn onClick={addImage} title="Image">
            <ImageIcon size={15} />
          </ToolBtn>
          <ToolBtn onClick={addYoutube} title="YouTube">
            <YTIcon size={15} />
          </ToolBtn>
        </div>

        <div className="frte-divider" />

        <div className="frte-group">
          <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
            <Undo2 size={15} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
            <Redo2 size={15} />
          </ToolBtn>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="frte-editor" />
    </div>
  );
};

export default ForumRichTextEditor;
