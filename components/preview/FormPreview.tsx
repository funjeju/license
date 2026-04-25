'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getClientDb } from '@/lib/firebase/client';
import { Copy, Pencil, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SECTIONS_BY_TYPE, DOC_TITLES } from '@/lib/schemas/fieldDefs';
import type { IPType } from '@/lib/agents/classifier';

interface FormPreviewProps {
  registrationId: string;
  ipType: IPType;
  fieldRefs?: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

function FieldCell({
  fieldKey,
  label,
  value,
  isNew,
  isEditing,
  onEdit,
  fieldRef,
}: {
  fieldKey: string;
  label: string;
  value: unknown;
  isNew: boolean;
  isEditing: boolean;
  onEdit: (key: string, val: string) => void;
  fieldRef?: (el: HTMLDivElement | null) => void;
}) {
  const [editVal, setEditVal] = useState('');
  const [copied, setCopied] = useState(false);
  const displayVal = Array.isArray(value) ? value.join(', ') : typeof value === 'boolean' ? (value ? '예' : '아니오') : String(value ?? '');

  useEffect(() => { setEditVal(displayVal); }, [displayVal]);

  function handleCopy() {
    navigator.clipboard.writeText(displayVal).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      ref={fieldRef}
      className={cn(
        'mb-6 group relative',
        isNew && 'animate-field-flash rounded-md'
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-caption text-neutral-500 font-medium">{label}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isNew && (
            <span className="text-caption px-1.5 py-0.5 rounded bg-royal-100 text-royal text-[10px] font-medium">
              AI 초안
            </span>
          )}
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
            aria-label="복사"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-jade" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      <div className="border border-neutral-200 rounded-md px-3 py-2 min-h-[36px] bg-white">
        {isEditing ? (
          <textarea
            className="w-full resize-none bg-transparent text-body text-neutral-900 focus:outline-none min-h-[32px]"
            value={editVal}
            rows={displayVal.length > 60 ? 3 : 1}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={() => onEdit(fieldKey, editVal)}
          />
        ) : (
          <p className={cn('text-body', displayVal ? 'text-neutral-900' : 'text-neutral-400')}>
            {displayVal || '—'}
          </p>
        )}
      </div>
    </div>
  );
}

export default function FormPreview({ registrationId, ipType, fieldRefs }: FormPreviewProps) {
  const [fields, setFields] = useState<Record<string, unknown>>({});
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [newKeys, setNewKeys] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const prevFieldsRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    const db = getClientDb();
    const unsub = onSnapshot(doc(db, 'registrations', registrationId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      const extracted = (data.extractedFields ?? {}) as Record<string, unknown>;

      // 새로 추가된 키 감지 → flash 애니메이션
      const prev = prevFieldsRef.current;
      const added = new Set<string>();
      for (const key of Object.keys(extracted)) {
        if (prev[key] === undefined && extracted[key] !== undefined) {
          added.add(key);
        }
      }
      if (added.size > 0) {
        setNewKeys(added);
        setTimeout(() => setNewKeys(new Set()), 600);
      }

      prevFieldsRef.current = extracted;
      setFields(extracted);
    });
    return () => unsub();
  }, [registrationId]);

  const handleEdit = useCallback((key: string, val: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: val }));
  }, []);

  const mergedFields = { ...fields, ...localEdits };
  const sections = SECTIONS_BY_TYPE[ipType] ?? [];
  const docTitle = DOC_TITLES[ipType];

  return (
    <div className="flex flex-col h-full bg-neutral-50">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200 flex-shrink-0 bg-white">
        <span className="text-body font-medium text-neutral-700">
          {docTitle.replace(/ /g, '​')} <span className="text-neutral-400 font-normal">(미리보기)</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-caption transition-colors',
              isEditing
                ? 'border-royal bg-royal text-white'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
            )}
          >
            <Pencil className="w-3.5 h-3.5" />
            {isEditing ? '편집 완료' : '필드 편집'}
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-[840px] mx-auto bg-white rounded-xl border border-neutral-200 px-8 py-8">
          {/* Document title */}
          <h1 className="text-h2 text-center font-bold text-ink mb-8 tracking-[0.25em]">
            {docTitle}
          </h1>

          {sections.map((section, si) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-h4 text-ink border-b border-neutral-200 pb-2 mb-4">
                {si + 1}. {section.title}
              </h2>
              {section.fields.map((field) => (
                <FieldCell
                  key={field.key}
                  fieldKey={field.key}
                  label={field.label}
                  value={mergedFields[field.key]}
                  isNew={newKeys.has(field.key)}
                  isEditing={isEditing}
                  onEdit={handleEdit}
                  fieldRef={fieldRefs ? (el) => {
                    if (el) fieldRefs.current.set(field.key, el);
                    else fieldRefs.current.delete(field.key);
                  } : undefined}
                />
              ))}
            </div>
          ))}

          {Object.keys(mergedFields).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-body text-neutral-400">
                대화를 시작하면<br />자동으로 양식이 채워집니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
