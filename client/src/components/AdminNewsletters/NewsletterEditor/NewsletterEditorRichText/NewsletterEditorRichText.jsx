// src/components/AdminNewsletters/NewsletterEditor/NewsletterEditorRichText/NewsletterEditorRichText.jsx
// Prefix: anert- (AdminNewsletters → Editor → RichText)

import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

// Extend Link to preserve the `class` attribute — so our nl-cta links survive
// tiptap's round-trip and can be styled as buttons by server-side beautifier.
const CtaLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (el) => el.getAttribute('class') || null,
        renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
});
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Image as ImageIcon,
  Undo2,
  Redo2,
} from 'lucide-react';
import './newsletterEditorRichText.css';

export const NewsletterEditorRichText = forwardRef(({ value = '', onChange, placeholder = '' }, ref) => {
  const { t } = useTranslation('adminNewsletters');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      CtaLink.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
  });

  // Sync external changes (e.g. loading an existing draft)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (current !== incoming && !(current === '<p></p>' && !incoming)) {
      editor.commands.setContent(incoming, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  useImperativeHandle(ref, () => ({
    insertContent: (html) => {
      if (!editor || !html) return;
      editor.chain().focus().insertContent(html).run();
    },
    focus: () => editor?.commands.focus(),
  }), [editor]);

  if (!editor) return null;

  const addLink = () => {
    const existing = editor.getAttributes('link').href || '';
    // eslint-disable-next-line no-alert
    const url = window.prompt(t('editor.toolbar.linkPrompt'), existing);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    // eslint-disable-next-line no-alert
    const url = window.prompt(t('editor.toolbar.imagePrompt'));
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const Btn = ({ onClick, active, disabled, title, children }) => (
    <button
      type="button"
      className={`anert-btn ${active ? 'anert-btn--active' : ''}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      <span className="anert-btn-icon">{children}</span>
    </button>
  );

  return (
    <div className="anert-root">
      <div className="anert-toolbar">
        <div className="anert-group">
          <Btn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title={t('editor.toolbar.bold')}
          >
            <Bold />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title={t('editor.toolbar.italic')}
          >
            <Italic />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title={t('editor.toolbar.strike')}
          >
            <Strikethrough />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title={t('editor.toolbar.code')}
          >
            <Code />
          </Btn>
        </div>

        <span className="anert-divider" />

        <div className="anert-group">
          <Btn
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
            title={t('editor.toolbar.paragraph')}
          >
            <Pilcrow />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title={t('editor.toolbar.heading2')}
          >
            <Heading2 />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title={t('editor.toolbar.heading3')}
          >
            <Heading3 />
          </Btn>
        </div>

        <span className="anert-divider" />

        <div className="anert-group">
          <Btn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title={t('editor.toolbar.bulletList')}
          >
            <List />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title={t('editor.toolbar.orderedList')}
          >
            <ListOrdered />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title={t('editor.toolbar.blockquote')}
          >
            <Quote />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title={t('editor.toolbar.hr')}
          >
            <Minus />
          </Btn>
        </div>

        <span className="anert-divider" />

        <div className="anert-group">
          <Btn
            onClick={addLink}
            active={editor.isActive('link')}
            title={t('editor.toolbar.link')}
          >
            <Link2 />
          </Btn>
          <Btn onClick={addImage} title={t('editor.toolbar.image')}>
            <ImageIcon />
          </Btn>
        </div>

        <span className="anert-divider" />

        <div className="anert-group">
          <Btn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title={t('editor.toolbar.undo')}
          >
            <Undo2 />
          </Btn>
          <Btn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title={t('editor.toolbar.redo')}
          >
            <Redo2 />
          </Btn>
        </div>
      </div>

      <EditorContent className="anert-content" editor={editor} />
    </div>
  );
});

NewsletterEditorRichText.displayName = 'NewsletterEditorRichText';
