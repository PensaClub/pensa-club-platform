// src/components/AdminNewsletters/NewsletterEditor/NewsletterEditorRichText/NewsletterEditorRichText.jsx
// Prefix: anert- (AdminNewsletters → Editor → RichText)

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  uploadFileWithProgress,
  compressImage,
  allowedImageTypes,
} from '../../../Articles/articleUtils/file-utils';
import { deleteFileFromStorage } from '../../../Articles/articleUtils/file-delete-utils';
import { notify } from '../../../../utils/notify.jsx';

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
  ImagePlus,
  ImageOff,
  Loader2,
  Undo2,
  Redo2,
} from 'lucide-react';
import './newsletterEditorRichText.css';

const FIREBASE_HOST_MARK = 'firebasestorage.googleapis.com';

const collectImageUrls = (editor) => {
  const urls = new Set();
  if (!editor) return urls;
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'image' && node.attrs?.src) {
      urls.add(node.attrs.src);
    }
  });
  return urls;
};

export const NewsletterEditorRichText = forwardRef(({ value = '', onChange, placeholder = '' }, ref) => {
  const { t } = useTranslation('adminNewsletters');
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [, setTick] = useState(0);
  const prevImageUrlsRef = useRef(new Set());

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
      const current = collectImageUrls(ed);
      const prev = prevImageUrlsRef.current;
      prev.forEach((url) => {
        if (!current.has(url) && typeof url === 'string' && url.includes(FIREBASE_HOST_MARK)) {
          deleteFileFromStorage(url).catch(() => {});
        }
      });
      prevImageUrlsRef.current = current;
      const html = ed.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
    onSelectionUpdate: () => setTick((n) => n + 1),
  });

  // Sync external changes (e.g. loading an existing draft)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (current !== incoming && !(current === '<p></p>' && !incoming)) {
      editor.commands.setContent(incoming, false);
      prevImageUrlsRef.current = collectImageUrls(editor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  // Seed the image-url ref once the editor is ready, so uploads followed by
  // a later Backspace correctly detect the removal.
  useEffect(() => {
    if (!editor) return;
    prevImageUrlsRef.current = collectImageUrls(editor);
  }, [editor]);

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

  const triggerImagePick = () => {
    if (isUploadingImage) return;
    fileInputRef.current?.click();
  };

  const removeSelectedImage = () => {
    if (!editor || !editor.isActive('image')) return;
    editor.chain().focus().deleteSelection().run();
  };

  const handleImageFile = async (event) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = '';
    if (!file) return;
    if (!allowedImageTypes.includes(file.type)) {
      notify('error', null, t('imageUploader.invalidType'));
      return;
    }
    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file);
      const url = await uploadFileWithProgress(compressed, 'newsletters/inline');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch {
      notify('error', null, t('imageUploader.uploadError'));
    } finally {
      setIsUploadingImage(false);
    }
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
          <Btn
            onClick={triggerImagePick}
            disabled={isUploadingImage}
            title={t('editor.toolbar.imageUpload')}
          >
            {isUploadingImage ? <Loader2 className="anert-spin" /> : <ImagePlus />}
          </Btn>
          <Btn
            onClick={removeSelectedImage}
            disabled={!editor.isActive('image')}
            title={t('editor.toolbar.imageRemove')}
          >
            <ImageOff />
          </Btn>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={allowedImageTypes.join(',')}
          className="anert-file-input"
          onChange={handleImageFile}
        />

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
