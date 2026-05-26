import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { type AdminLanguage } from './AdminLanguageTabs'
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Heading2, Heading3,
  Quote, Link as LinkIcon, Minus,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  dir?: 'ltr' | 'rtl'
  error?: boolean
  compact?: boolean
  /** Optional node rendered at the right of the toolbar (e.g. lang tabs) */
  toolbarRight?: ReactNode
  minHeight?: number
}

type Loc = { en: string; ar?: string }

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar button
// ─────────────────────────────────────────────────────────────────────────────

function TBtn({
  active, title, onClick, children,
}: {
  active?: boolean; title: string; onClick: () => void; children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={`atf-rte__btn${active ? ' atf-rte__btn--active' : ''}`}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Core editor
// ─────────────────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value, onChange, placeholder, dir = 'ltr',
  error, compact, toolbarRight, minHeight,
}: RichTextEditorProps) {
  // Guard against emitting onChange when we programmatically set content
  const skipUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: { HTMLAttributes: { class: 'atf-rte-hr' } },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { target: '_blank', rel: 'noopener' } }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value || '',
    onUpdate: ({ editor: e }) => {
      if (skipUpdate.current) return
      const html = e.isEmpty ? '' : e.getHTML()
      onChange(html)
    },
  })

  // Sync content when value changes externally (e.g. language switch)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const current = editor.isEmpty ? '' : editor.getHTML()
    if (current !== (value || '')) {
      skipUpdate.current = true
      editor.commands.setContent(value || '')
      skipUpdate.current = false
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync dir on the editor DOM element
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const el = editor.view.dom as HTMLElement
    el.setAttribute('dir', dir)
  }, [editor, dir])

  const addLink = () => {
    const prev = editor?.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', prev ?? 'https://')
    if (!url) return
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }

  const cls = [
    'atf-rte',
    compact ? 'atf-rte--compact' : '',
    error  ? 'atf-rte--error'   : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={cls}>
      <div className="atf-rte__toolbar">
        {/* Block-level — hidden in compact mode */}
        {!compact && (
          <>
            <TBtn title="Heading 2" active={editor?.isActive('heading', { level: 2 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={13} />
            </TBtn>
            <TBtn title="Heading 3" active={editor?.isActive('heading', { level: 3 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 size={13} />
            </TBtn>
            <div className="atf-rte__sep" />
          </>
        )}

        {/* Inline marks */}
        <TBtn title="Bold (Ctrl+B)" active={editor?.isActive('bold')}
          onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </TBtn>
        <TBtn title="Italic (Ctrl+I)" active={editor?.isActive('italic')}
          onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </TBtn>
        <TBtn title="Underline (Ctrl+U)" active={editor?.isActive('underline')}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={13} />
        </TBtn>
        <TBtn title="Link" active={editor?.isActive('link')}
          onClick={addLink}>
          <LinkIcon size={13} />
        </TBtn>

        {/* Lists — hidden in compact mode */}
        {!compact && (
          <>
            <div className="atf-rte__sep" />
            <TBtn title="Bullet list" active={editor?.isActive('bulletList')}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              <List size={13} />
            </TBtn>
            <TBtn title="Ordered list" active={editor?.isActive('orderedList')}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={13} />
            </TBtn>
            <TBtn title="Blockquote" active={editor?.isActive('blockquote')}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              <Quote size={13} />
            </TBtn>
            <TBtn title="Horizontal rule"
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Minus size={13} />
            </TBtn>
          </>
        )}

        {/* Push lang tabs / extra controls to the right */}
        <div className="atf-rte__toolbar-spacer" />
        {toolbarRight}
      </div>

      <div
        className="atf-rte__body"
        style={minHeight ? { minHeight } : undefined}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Localized wrapper
// ─────────────────────────────────────────────────────────────────────────────

function FieldLangTabs({ lang, onChange }: { lang: AdminLanguage; onChange: (l: AdminLanguage) => void }) {
  return (
    <div className="atf-field-lang-tabs" aria-label="Field language">
      <button type="button"
        className={`atf-field-lang-tab${lang === 'en' ? ' atf-field-lang-tab--active' : ''}`}
        onMouseDown={e => { e.preventDefault(); onChange('en') }} aria-label="English">🇬🇧</button>
      <button type="button"
        className={`atf-field-lang-tab${lang === 'ar' ? ' atf-field-lang-tab--active' : ''}`}
        onMouseDown={e => { e.preventDefault(); onChange('ar') }} aria-label="Arabic">🇸🇦</button>
    </div>
  )
}

export interface LRichTextEditorProps {
  label: string
  value: Loc
  lang: AdminLanguage
  onChange: (v: Loc) => void
  placeholder?: string
  required?: boolean
  errorMsg?: string
  compact?: boolean
  minHeight?: number
  hint?: string
}

export function LRichTextEditor({
  label, value, lang, onChange,
  placeholder, required, errorMsg, compact, minHeight, hint,
}: LRichTextEditorProps) {
  const [activeLang, setActiveLang] = useState<AdminLanguage>(lang)
  const val = value[activeLang] ?? ''

  return (
    <div className="atf-field">
      <div className="atf-label-row">
        <label className="atf-label">
          {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
        </label>
      </div>
      <RichTextEditor
        value={val}
        onChange={html => onChange({ ...value, [activeLang]: html })}
        placeholder={placeholder}
        dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
        error={!!errorMsg}
        compact={compact}
        minHeight={minHeight}
        toolbarRight={<FieldLangTabs lang={activeLang} onChange={setActiveLang} />}
      />
      {hint && !errorMsg && (
        <p className="atf-hint" style={{ marginTop: 4, marginBottom: 0 }}>{hint}</p>
      )}
      {errorMsg && (
        <div className="atf-field-error">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {errorMsg}
        </div>
      )}
    </div>
  )
}
