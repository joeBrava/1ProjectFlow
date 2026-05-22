import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

/* ═══════════════════════════════════════════════════════════════════════
   PALETTE
   ═══════════════════════════════════════════════════════════════════════ */
const colors = {
  bg: '#0f1117',
  surface: '#1a1d27',
  surfaceHover: '#222633',
  border: '#2a2e3d',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  blue: '#3b82f6',
  blueGlow: 'rgba(59, 130, 246, 0.15)',
  green: '#22c55e',
  greenGlow: 'rgba(34, 197, 94, 0.15)',
  orange: '#f59e0b',
  orangeGlow: 'rgba(245, 158, 11, 0.15)',
  purple: '#a855f7',
  purpleGlow: 'rgba(168, 85, 247, 0.15)',
  cyan: '#06b6d4',
  cyanGlow: 'rgba(6, 182, 212, 0.15)',
  rose: '#f43f5e',
  roseGlow: 'rgba(244, 63, 94, 0.15)',
  amber: '#d97706',
  amberGlow: 'rgba(217, 119, 6, 0.15)',
  indigo: '#6366f1',
  indigoGlow: 'rgba(99, 102, 241, 0.15)',
  emerald: '#10b981',
  emeraldGlow: 'rgba(16, 185, 129, 0.15)',
  sky: '#0ea5e9',
  skyGlow: 'rgba(14, 165, 233, 0.15)',
  pink: '#ec4899',
  pinkGlow: 'rgba(236, 72, 153, 0.15)',
  lime: '#84cc16',
  limeGlow: 'rgba(132, 204, 22, 0.15)',
};

/* ═══════════════════════════════════════════════════════════════════════
   ICONS (inline SVG)
   ═══════════════════════════════════════════════════════════════════════ */
const mkIcon = (stroke, paths) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);

const icons = {
  trigger: mkIcon('#f59e0b', <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />),
  api: mkIcon('#3b82f6', <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5V19A9 3 0 0 0 21 19V5" /><path d="M3 12A9 3 0 0 0 21 12" /></>),
  rotation: mkIcon('#a855f7', <><path d="M21.5 2v6h-6M2.5 22v-6h6" /><path d="M2.5 11.5a10 10 0 0 1 18.8-4.3M21.5 12.5a10 10 0 0 1-18.8 4.2" /></>),
  project: mkIcon('#22c55e', <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />),
  tasks: mkIcon('#06b6d4', <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>),
  writeback: mkIcon('#f43f5e', <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>),
  designBrief: mkIcon('#d97706', <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="12" y1="6" x2="12" y2="12" /></>),
  handoff: mkIcon('#f59e0b', <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 1-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  // Business overview icons
  form: mkIcon('#3b82f6', <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>),
  stage: mkIcon('#f59e0b', <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  design: mkIcon('#a855f7', <><circle cx="13.5" cy="6.5" r="2.5" /><path d="M17 22H2l4.3-10.7a2 2 0 0 1 3.7 0L17 22z" /><path d="M22 22l-4.8-12a2 2 0 0 0-3.7 0" /></>),
  check: mkIcon('#22c55e', <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>),
  docusign: mkIcon('#6366f1', <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 15l2 2 4-4" /></>),
  signed: mkIcon('#10b981', <><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></>),
  invoice: mkIcon('#0ea5e9', <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>),
  dataEntry: mkIcon('#ec4899', <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>),
  production: mkIcon('#84cc16', <><path d="M2 20h20" /><path d="M5 20V8l7-5 7 5v12" /><path d="M9 20v-4h6v4" /></>),
  // Production flow icons
  quotes: mkIcon('#0ea5e9', <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>),
  testBuild: mkIcon('#a855f7', <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>),
  sticker: mkIcon('#f59e0b', <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18" /><path d="M12 3v18" /></>),
  render: mkIcon('#ec4899', <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>),
  box: mkIcon('#3b82f6', <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>),
  book: mkIcon('#06b6d4', <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>),
  coverArt: mkIcon('#6366f1', <><circle cx="13.5" cy="6.5" r="2.5" /><path d="M17 22H2l4.3-10.7a2 2 0 0 1 3.7 0L17 22z" /><path d="M22 22l-4.8-12a2 2 0 0 0-3.7 0" /></>),
  send: mkIcon('#22c55e', <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>),
  factory: mkIcon('#94a3b8', <><path d="M2 20h20" /><path d="M17 20V4l-5 4-5-4v16" /><path d="M2 20l5-12v12" /><path d="M22 20l-5-12v12" /></>),
  truck: mkIcon('#f59e0b', <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>),
  clipboard: mkIcon('#10b981', <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></>),
};

/* ═══════════════════════════════════════════════════════════════════════
   ICON & COLOR KEYS — for Add Node modal and persistence
   ═══════════════════════════════════════════════════════════════════════ */
const ICON_KEYS = Object.keys(icons);

const COLOR_PRESETS = [
  { color: colors.blue, glow: colors.blueGlow, label: 'Blue' },
  { color: colors.orange, glow: colors.orangeGlow, label: 'Orange' },
  { color: colors.green, glow: colors.greenGlow, label: 'Green' },
  { color: colors.purple, glow: colors.purpleGlow, label: 'Purple' },
  { color: colors.cyan, glow: colors.cyanGlow, label: 'Cyan' },
  { color: colors.rose, glow: colors.roseGlow, label: 'Rose' },
  { color: colors.amber, glow: colors.amberGlow, label: 'Amber' },
  { color: colors.indigo, glow: colors.indigoGlow, label: 'Indigo' },
  { color: colors.emerald, glow: colors.emeraldGlow, label: 'Emerald' },
  { color: colors.sky, glow: colors.skyGlow, label: 'Sky' },
  { color: colors.pink, glow: colors.pinkGlow, label: 'Pink' },
  { color: colors.lime, glow: colors.limeGlow, label: 'Lime' },
];

/* ═══════════════════════════════════════════════════════════════════════
   INLINE NOTES — editable notes section within each node
   ═══════════════════════════════════════════════════════════════════════ */
function InlineNotes({ nodeId, notes, editMode, onNotesChange, accentColor }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(notes);

  // Sync draft when notes prop changes from outside
  React.useEffect(() => { setDraft(notes); }, [notes]);

  const handleSave = useCallback(() => {
    setEditing(false);
    if (onNotesChange) onNotesChange(nodeId, draft);
  }, [nodeId, draft, onNotesChange]);

  // If no notes and not in edit mode, show nothing
  if (!notes && !editMode) return null;

  return (
    <div
      className="nodrag nopan"
      onClick={(e) => e.stopPropagation()}
      style={{
        borderTop: `1px solid ${colors.border}`,
        padding: '8px 18px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${accentColor}99` }}>
          Notes
        </span>
        {editMode && !editing && (
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 10, color: colors.textDim, padding: '0 2px',
            }}
          >
            ✎
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Escape') handleSave(); }}
          style={{
            width: '100%', minHeight: 50, maxHeight: 150, background: `${colors.bg}88`,
            border: `1px solid ${colors.border}`, borderRadius: 6,
            outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif",
            fontSize: 11, lineHeight: 1.5, color: colors.text, padding: '6px 8px',
          }}
          placeholder="Add notes..."
        />
      ) : (
        <div
          onDoubleClick={(e) => { if (editMode) { e.stopPropagation(); setEditing(true); } }}
          style={{
            fontSize: 11, lineHeight: 1.5, color: colors.textMuted,
            whiteSpace: 'pre-wrap', minHeight: editMode ? 20 : undefined,
            cursor: editMode ? 'text' : 'default',
            fontStyle: notes ? 'normal' : 'italic',
          }}
        >
          {notes || (editMode ? 'Double-click to add notes...' : '')}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOM NODE — shared by both tabs
   ═══════════════════════════════════════════════════════════════════════ */
function StageNode({ id, data }) {
  const accentColor = data.accentColor || colors.blue;
  const glowColor = data.glowColor || colors.blueGlow;
  const expanded = data._expanded || false;
  const onToggle = data._onToggle;
  const [hovered, setHovered] = useState(false);

  const hasExpandableContent = data.nodes || data.apis || data.keyData || data.details;
  const resolvedIcon = data.icon || (data.iconKey && icons[data.iconKey]) || null;
  const nodeHeight = data._customHeight || data._spanHeight;
  const nodeWidth = data._customWidth || 360;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => hasExpandableContent && onToggle && onToggle(id)}
      style={{
        background: colors.surface,
        border: `1px solid ${expanded ? accentColor : colors.border}`,
        borderRadius: 12,
        padding: 0,
        width: nodeWidth,
        height: nodeHeight || undefined,
        overflow: nodeHeight ? 'hidden' : 'visible',
        cursor: hasExpandableContent ? 'pointer' : 'default',
        boxShadow: expanded
          ? `0 0 20px ${glowColor}, 0 4px 24px rgba(0,0,0,0.4)`
          : '0 2px 12px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
      }}
    >
      {/* delete button (visible on hover) */}
      {hovered && data._onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); data._onDelete(id); }}
          onMouseEnter={() => setHovered(true)}
          style={{
            position: 'absolute', top: -8, right: -8, zIndex: 10,
            width: 24, height: 24, borderRadius: '50%',
            background: colors.rose, border: `2px solid ${colors.surface}`,
            color: '#fff', fontSize: 12, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            lineHeight: 1, padding: 0,
          }}
          title="Delete this step"
        >✕</button>
      )}

      {/* resize handle — bottom edge (visible on hover) */}
      {hovered && data._onResize && (
        <div
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startY = e.clientY;
            const startH = nodeHeight || data._baseHeight || 140;
            const handleMove = (me) => {
              const delta = me.clientY - startY;
              const nh = Math.max(100, Math.round((startH + delta) / 50) * 50);
              data._onResize(id, nh);
            };
            const handleUp = () => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
          style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 50, height: 12, borderRadius: 6, zIndex: 10,
            background: `${accentColor}66`, cursor: 'ns-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 24, height: 2, borderRadius: 1, background: accentColor }} />
        </div>
      )}

      {/* horizontal resize handle — right edge (visible on hover) */}
      {hovered && data._onResizeWidth && (
        <div
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startX = e.clientX;
            const startW = nodeWidth;
            const handleMove = (me) => {
              const delta = me.clientX - startX;
              const nw = Math.max(200, Math.round((startW + delta) / 50) * 50);
              data._onResizeWidth(id, nw);
            };
            const handleUp = () => {
              window.removeEventListener('pointermove', handleMove);
              window.removeEventListener('pointerup', handleUp);
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
          }}
          style={{
            position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
            width: 12, height: 50, borderRadius: 6, zIndex: 10,
            background: `${accentColor}66`, cursor: 'ew-resize',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 2, height: 24, borderRadius: 1, background: accentColor }} />
        </div>
      )}

      {/* accent bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, transparent)`, borderRadius: '12px 12px 0 0' }} />

      {/* header */}
      <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: glowColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {resolvedIcon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor }}>
              {data.stageLabel}
            </span>
            {data.badge && (
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: `${accentColor}22`, color: accentColor, letterSpacing: '0.05em' }}>
                {data.badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginTop: 2 }}>{data.title}</div>
        </div>
        {hasExpandableContent && (
          <div style={{ fontSize: 11, color: colors.textDim, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            ▼
          </div>
        )}
      </div>

      {/* summary */}
      <div style={{ padding: '0 18px 12px', fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>
        {data.summary}
      </div>

      {/* expanded: technical details (tab 1) */}
      {expanded && (data.nodes || data.apis || data.keyData) && (
        <div style={{ borderTop: `1px solid ${colors.border}`, padding: '12px 18px 14px', fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
          {data.nodes && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textDim, marginBottom: 6 }}>n8n Nodes</div>
              {data.nodes.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4, paddingLeft: 4 }}>
                  <span style={{ color: accentColor, fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
                  <span><span style={{ color: colors.text, fontWeight: 500 }}>{n.name}</span>{n.detail && <span style={{ color: colors.textDim }}> — {n.detail}</span>}</span>
                </div>
              ))}
            </div>
          )}
          {data.apis && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textDim, marginBottom: 6 }}>API Calls</div>
              {data.apis.map((a, i) => (
                <div key={i} style={{ background: '#0d0f15', borderRadius: 6, padding: '6px 10px', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: colors.textMuted, overflowX: 'auto' }}>
                  <span style={{ color: a.method === 'GET' ? '#22c55e' : a.method === 'POST' ? '#3b82f6' : a.method === 'PATCH' ? '#f59e0b' : '#06b6d4', fontWeight: 700 }}>{a.method}</span>{' '}{a.endpoint}
                </div>
              ))}
            </div>
          )}
          {data.keyData && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textDim, marginBottom: 6 }}>Key Data</div>
              {data.keyData.map((kv, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                  <span style={{ color: colors.textDim, minWidth: 100 }}>{kv.label}:</span>
                  <span style={{ color: colors.text, fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{kv.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* expanded: business details (tab 2) */}
      {expanded && data.details && (
        <div style={{ borderTop: `1px solid ${colors.border}`, padding: '12px 18px 14px', fontSize: 11, color: colors.textMuted, lineHeight: 1.7 }}>
          {data.details.map((section, si) => (
            <div key={si} style={{ marginBottom: si < data.details.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textDim, marginBottom: 6 }}>{section.heading}</div>
              {section.items.map((item, ii) => (
                <div key={ii} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4, paddingLeft: 4 }}>
                  <span style={{ color: accentColor, fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
                  <span style={{ color: colors.text }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* inline notes section */}
      {(data._notes || data._editMode) && (
        <InlineNotes
          nodeId={id}
          notes={data._notes || ''}
          editMode={data._editMode || false}
          onNotesChange={data._onNotesChange}
          accentColor={accentColor}
        />
      )}

      {/* handles — inside inner card div for positioning relative to card */}
      {data.handleTop !== false && <Handle type="target" position={Position.Top} style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
      {data.handleBottom !== false && <Handle type="source" position={Position.Bottom} style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
      {data.handleRight && <Handle type="source" position={Position.Right} id="right" style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
      {data.handleLeft && <Handle type="target" position={Position.Left} id="left" style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
      {data.handleLeftSource && <Handle type="source" position={Position.Left} id="left-source" style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
      {data.handleRightTarget && <Handle type="target" position={Position.Right} id="right" style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   STICKY NOTE NODE — draggable, editable notes for presentations
   ═══════════════════════════════════════════════════════════════════════ */
const NOTE_COLORS = [
  { bg: '#fef3c7', border: '#f59e0b', text: '#78350f', label: 'Yellow' },
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e3a5f', label: 'Blue' },
  { bg: '#dcfce7', border: '#22c55e', text: '#14532d', label: 'Green' },
  { bg: '#fce7f3', border: '#ec4899', text: '#831843', label: 'Pink' },
  { bg: '#f3e8ff', border: '#a855f7', text: '#581c87', label: 'Purple' },
];

function StickyNote({ id, data }) {
  const colorScheme = NOTE_COLORS[data.colorIndex || 0];
  const [text, setText] = useState(data.text || '');
  const [editing, setEditing] = useState(!data.text);

  const handleSave = useCallback(() => {
    setEditing(false);
    if (data.onUpdate) data.onUpdate(id, text);
  }, [id, text, data]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (data.onDelete) data.onDelete(id);
  }, [id, data]);

  const cycleColor = useCallback((e) => {
    e.stopPropagation();
    if (data.onCycleColor) data.onCycleColor(id);
  }, [id, data]);

  return (
    <div
      style={{
        background: colorScheme.bg,
        border: `2px solid ${colorScheme.border}`,
        borderRadius: 4,
        padding: 0,
        width: data.width || 200,
        minHeight: 80,
        boxShadow: '3px 3px 8px rgba(0,0,0,0.3)',
        fontFamily: "'Inter', sans-serif",
        cursor: 'grab',
        transform: `rotate(${data.rotation || 0}deg)`,
      }}
    >
      {/* toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: `1px solid ${colorScheme.border}40`, cursor: data._editMode ? 'grab' : 'default' }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: `${colorScheme.text}99` }}>Note</span>
        {data._editMode && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={cycleColor} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '0 2px', color: colorScheme.text, opacity: 0.6 }} title="Change color">
              🎨
            </button>
            <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: '0 2px', color: colorScheme.text, opacity: 0.6 }} title="Delete note">
              ✕
            </button>
          </div>
        )}
      </div>
      {/* body */}
      <div style={{ padding: '6px 10px 10px' }}>
        {editing ? (
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Escape') handleSave(); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', minHeight: 50, background: 'transparent', border: 'none',
              outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif",
              fontSize: 12, lineHeight: 1.5, color: colorScheme.text,
            }}
            placeholder="Type your note..."
          />
        ) : (
          <div
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            style={{
              fontSize: 12, lineHeight: 1.5, color: colorScheme.text,
              whiteSpace: 'pre-wrap', minHeight: 30, cursor: 'text',
            }}
          >
            {text || 'Double-click to edit...'}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   THOUGHT BUBBLE NODE — for callouts and annotations
   ═══════════════════════════════════════════════════════════════════════ */
function ThoughtBubble({ data }) {
  const accentColor = data.accentColor || colors.purple;
  return (
    <div style={{ position: 'relative', width: 280 }}>
      <div
        style={{
          background: `${accentColor}15`,
          border: `1px dashed ${accentColor}66`,
          borderRadius: 16,
          padding: '12px 16px',
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          lineHeight: 1.6,
          color: colors.text,
        }}
      >
        {data.title && (
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, marginBottom: 6 }}>
            {data.title}
          </div>
        )}
        <div style={{ color: colors.textMuted }}>{data.content}</div>
      </div>
      {/* thought dots */}
      <div style={{ position: 'absolute', bottom: -10, left: 24 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: `${accentColor}30`, border: `1px dashed ${accentColor}44` }} />
      </div>
      <div style={{ position: 'absolute', bottom: -20, left: 16 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${accentColor}20`, border: `1px dashed ${accentColor}33` }} />
      </div>
      {data.handleBottom !== false && <Handle type="target" position={Position.Bottom} style={{ background: accentColor, width: 6, height: 6, border: `2px solid ${colors.surface}`, opacity: 0.5 }} />}
      <Handle type="target" position={Position.Left} id="left" style={{ background: accentColor, width: 6, height: 6, border: `2px solid ${colors.surface}`, opacity: 0.3 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SPAN BAR NODE — tall vertical bar for background processes
   ═══════════════════════════════════════════════════════════════════════ */
function SpanBar({ data }) {
  const accentColor = data.accentColor || '#94a3b8';
  const resolvedIcon = data.icon || (data.iconKey && icons[data.iconKey]) || null;
  return (
    <div
      style={{
        width: 180,
        height: data.spanHeight || 400,
        background: `linear-gradient(180deg, ${accentColor}12, ${accentColor}04)`,
        border: `1px dashed ${accentColor}35`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: 10,
        padding: '14px 14px',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 6, background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {resolvedIcon}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor }}>
            {data.stageLabel}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{data.title}</div>
        </div>
      </div>
      {data.badge && (
        <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: `${accentColor}22`, color: accentColor, marginBottom: 8 }}>
          {data.badge}
        </span>
      )}
      <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.5 }}>
        {data.summary}
      </div>
      {/* vertical flow indicator */}
      <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ flex: 1, height: 1, background: `${accentColor}30` }} />
        <span style={{ fontSize: 9, color: `${accentColor}80`, fontWeight: 600 }}>ONGOING</span>
        <div style={{ flex: 1, height: 1, background: `${accentColor}30` }} />
      </div>
      {/* handles */}
      <Handle type="target" position={Position.Right} id="right" style={{ background: accentColor, width: 8, height: 8, border: `2px solid ${colors.surface}` }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TIMELINE PHASE — tall banner node showing a phase label, week range, etc.
   ═══════════════════════════════════════════════════════════════════════ */
const TIMELINE_COLORS = [
  { color: colors.blue, label: 'Blue' },
  { color: colors.orange, label: 'Orange' },
  { color: colors.green, label: 'Green' },
  { color: colors.purple, label: 'Purple' },
  { color: colors.cyan, label: 'Cyan' },
  { color: colors.rose, label: 'Rose' },
  { color: colors.pink, label: 'Pink' },
  { color: colors.emerald, label: 'Emerald' },
  { color: colors.lime, label: 'Lime' },
  { color: '#94a3b8', label: 'Slate' },
];

function TimelinePhase({ id, data }) {
  const accent = data.accentColor || colors.blue;
  const height = data.phaseHeight || 200;
  const width = data.phaseWidth || 120;
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(data.title);
  const [editWeek, setEditWeek] = useState(data.weekLabel);
  const [editDuration, setEditDuration] = useState(data.duration || '');

  // Sync local state when data changes (e.g. reset)
  useEffect(() => {
    if (!editing) {
      setEditTitle(data.title);
      setEditWeek(data.weekLabel);
      setEditDuration(data.duration || '');
    }
  }, [data.title, data.weekLabel, data.duration, editing]);

  const handleSave = () => {
    if (data._onUpdate) {
      data._onUpdate(id, { title: editTitle, weekLabel: editWeek, duration: editDuration });
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditing(false);
  };

  const handleColorPick = (c) => {
    if (data._onUpdate) data._onUpdate(id, { accentColor: c });
  };

  const editInputSt = {
    width: '100%', padding: '3px 5px', borderRadius: 4,
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, fontSize: 10, fontFamily: "'Inter', sans-serif",
    outline: 'none', boxSizing: 'border-box', marginBottom: 4,
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width,
        height,
        background: `linear-gradient(180deg, ${accent}14, ${accent}06)`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: '12px 10px',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      }}
    >
      {/* Delete button */}
      {hovered && !editing && data._onDelete && (
        <div
          onMouseEnter={() => setHovered(true)}
          onClick={(e) => { e.stopPropagation(); data._onDelete(id); }}
          style={{
            position: 'absolute', top: -8, right: -8, width: 18, height: 18,
            borderRadius: '50%', background: colors.rose, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', zIndex: 10,
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          }}
        >
          ×
        </div>
      )}

      {/* Vertical resize handle — bottom edge */}
      {hovered && !editing && (
        <div
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startY = e.clientY;
            const startH = height;
            const onMove = (ev) => {
              const delta = ev.clientY - startY;
              const snapped = Math.round((startH + delta) / 50) * 50;
              const newH = Math.max(60, snapped);
              if (data._onUpdate) data._onUpdate(id, { _heightOverride: newH });
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
          style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            width: 40, height: 10, borderRadius: 5,
            background: `${accent}66`, cursor: 'ns-resize', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 20, height: 2, borderRadius: 1, background: accent }} />
        </div>
      )}

      {/* Horizontal resize handle — right edge */}
      {hovered && !editing && (
        <div
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startX = e.clientX;
            const startW = width;
            const onMove = (ev) => {
              const delta = ev.clientX - startX;
              const snapped = Math.round((startW + delta) / 50) * 50;
              const newW = Math.max(80, snapped);
              if (data._onUpdate) data._onUpdate(id, { _widthOverride: newW });
            };
            const onUp = () => {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
            };
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
          }}
          style={{
            position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)',
            width: 10, height: 40, borderRadius: 5,
            background: `${accent}66`, cursor: 'ew-resize', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 2, height: 20, borderRadius: 1, background: accent }} />
        </div>
      )}

      {editing ? (
        <>
          <input value={editWeek} onChange={(e) => setEditWeek(e.target.value)} onKeyDown={handleKeyDown} style={editInputSt} placeholder="Wk 1-2" autoFocus />
          <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={handleKeyDown} style={editInputSt} placeholder="Phase title" />
          <input value={editDuration} onChange={(e) => setEditDuration(e.target.value)} onKeyDown={handleKeyDown} style={editInputSt} placeholder="~1 week" />
          {/* Color swatches */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
            {TIMELINE_COLORS.map((tc) => (
              <div
                key={tc.color}
                onClick={() => handleColorPick(tc.color)}
                style={{
                  width: 14, height: 14, borderRadius: 3, cursor: 'pointer',
                  background: tc.color, border: tc.color === accent ? '2px solid #fff' : '1px solid transparent',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 4, border: 'none',
                background: accent, color: '#fff', fontSize: 9, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                flex: 1, padding: '3px 0', borderRadius: 4,
                border: `1px solid ${colors.border}`, background: 'transparent',
                color: colors.textMuted, fontSize: 9, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <div onDoubleClick={() => setEditing(true)} style={{ cursor: 'default', flex: 1 }}>
          {/* Week range badge at top */}
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            color: accent, textTransform: 'uppercase', marginBottom: 6, display: 'block',
          }}>
            {data.weekLabel}
          </span>
          {/* Phase title */}
          <div style={{
            fontSize: 12, fontWeight: 600, color: colors.text,
            lineHeight: 1.3, marginBottom: 6,
          }}>
            {data.title}
          </div>
          {/* Duration tag */}
          {data.duration && (
            <span style={{
              display: 'inline-block', fontSize: 8, fontWeight: 600,
              padding: '2px 5px', borderRadius: 3,
              background: `${accent}22`, color: accent,
            }}>
              {data.duration}
            </span>
          )}
          {/* Hover hint */}
          {hovered && (
            <div style={{ fontSize: 8, color: colors.textDim, marginTop: 6, fontStyle: 'italic' }}>
              Double-click to edit
            </div>
          )}
        </div>
      )}

      {/* Vertical line indicator at the bottom */}
      {!editing && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 3, background: `${accent}40`, borderRadius: '0 0 8px 8px',
        }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   WEEK GRID — background node showing numbered week rows
   ═══════════════════════════════════════════════════════════════════════ */
function WeekGrid({ data }) {
  const weeks = data.weeks || 14;
  const rowH = data.rowHeight || 150;
  const gridWidth = data.gridWidth || 1200;
  return (
    <div style={{
      width: gridWidth,
      height: weeks * rowH,
      position: 'relative',
      pointerEvents: 'none',
      fontFamily: "'Inter', sans-serif",
    }}>
      {Array.from({ length: weeks }, (_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: i * rowH,
          left: 0,
          width: '100%',
          height: rowH,
          display: 'flex',
          alignItems: 'flex-start',
          borderBottom: `1px solid ${colors.border}44`,
          background: i % 2 === 0 ? 'transparent' : `${colors.surface}40`,
        }}>
          {/* Week label */}
          <div style={{
            width: 64,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 10,
            borderRight: `1px solid ${colors.border}44`,
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: colors.textDim, marginBottom: 2,
            }}>
              Wk
            </span>
            <span style={{
              fontSize: 18, fontWeight: 700, color: colors.textMuted,
            }}>
              {i + 1}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const nodeTypes = { stage: StageNode, stickyNote: StickyNote, thoughtBubble: ThoughtBubble, spanBar: SpanBar, timelinePhase: TimelinePhase, weekGrid: WeekGrid };

/* ═══════════════════════════════════════════════════════════════════════
   EDGE DEFAULTS
   ═══════════════════════════════════════════════════════════════════════ */
const edgeDefaults = {
  style: { stroke: colors.textDim, strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: colors.textDim, width: 16, height: 16 },
  animated: true,
};
const labelStyle = { fill: colors.textDim, fontSize: 10, fontFamily: 'monospace' };
const labelBgStyle = { fill: colors.bg, fillOpacity: 0.9 };

/* ═══════════════════════════════════════════════════════════════════════
   FLOW EDITOR HOOK — persists add/delete/resize edits per view
   ═══════════════════════════════════════════════════════════════════════ */
function useFlowEditor(viewId, defaultNodes, defaultEdges) {
  const key = `flow-editor-${viewId}`;

  const [edits, setEdits] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (edits) localStorage.setItem(key, JSON.stringify(edits));
    else localStorage.removeItem(key);
  }, [edits, key]);

  const nodes = useMemo(() => {
    if (!edits) return defaultNodes;
    let result = defaultNodes.filter((n) => !(edits.deletedNodeIds || []).includes(n.id));
    result = result.map((n) => {
      const ov = (edits.nodeOverrides || {})[n.id];
      if (!ov) return n;
      return { ...n, baseHeight: ov.baseHeight ?? n.baseHeight, baseWidth: ov.baseWidth ?? n.baseWidth, _originalBaseHeight: n.baseHeight };
    });
    for (const added of edits.addedNodes || []) {
      const node = { ...added, data: { ...added.data, icon: icons[added.data.iconKey] || icons.stage } };
      const idx = added.insertAfter ? result.findIndex((n) => n.id === added.insertAfter) : -1;
      if (idx >= 0) result.splice(idx + 1, 0, node);
      else result.push(node);
    }
    return result;
  }, [defaultNodes, edits]);

  const edges = useMemo(() => {
    if (!edits) return defaultEdges;
    let result = defaultEdges.filter((e) => !(edits.deletedEdgeIds || []).includes(e.id));
    for (const added of edits.addedEdges || []) {
      result.push({
        ...added,
        ...edgeDefaults,
        labelStyle: { fill: colors.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif" },
        labelBgStyle,
        labelBgPadding: [6, 3],
        labelBgBorderRadius: 4,
      });
    }
    return result;
  }, [defaultEdges, edits]);

  const addNode = useCallback((nodeData, insertAfterId, newEdges, removeEdgeId) => {
    setEdits((prev) => {
      const s = prev || { addedNodes: [], deletedNodeIds: [], nodeOverrides: {}, addedEdges: [], deletedEdgeIds: [] };
      return {
        ...s,
        addedNodes: [...(s.addedNodes || []), { ...nodeData, insertAfter: insertAfterId }],
        addedEdges: [...(s.addedEdges || []), ...newEdges],
        deletedEdgeIds: removeEdgeId ? [...(s.deletedEdgeIds || []), removeEdgeId] : s.deletedEdgeIds || [],
      };
    });
  }, []);

  const deleteNode = useCallback(
    (nodeId) => {
      setEdits((prev) => {
        const s = prev || { addedNodes: [], deletedNodeIds: [], nodeOverrides: {}, addedEdges: [], deletedEdgeIds: [] };
        const curDefault = defaultEdges.filter((e) => !(s.deletedEdgeIds || []).includes(e.id));
        const curAdded = s.addedEdges || [];
        const all = [...curDefault, ...curAdded];
        const inE = all.filter((e) => e.target === nodeId);
        const outE = all.filter((e) => e.source === nodeId);
        const connected = all.filter((e) => e.source === nodeId || e.target === nodeId).map((e) => e.id);
        const reconnect = [];
        if (inE.length === 1 && outE.length === 1) {
          reconnect.push({
            id: `re-${Date.now()}`,
            source: inE[0].source,
            sourceHandle: inE[0].sourceHandle || undefined,
            target: outE[0].target,
            targetHandle: outE[0].targetHandle || undefined,
            label: inE[0].label,
          });
        }
        return {
          ...s,
          deletedNodeIds: [...(s.deletedNodeIds || []), nodeId],
          addedNodes: (s.addedNodes || []).filter((n) => n.id !== nodeId),
          deletedEdgeIds: [...(s.deletedEdgeIds || []), ...connected],
          addedEdges: [...(s.addedEdges || []).filter((e) => e.source !== nodeId && e.target !== nodeId), ...reconnect],
        };
      });
    },
    [defaultEdges],
  );

  const updateNodeHeight = useCallback((nodeId, baseHeight) => {
    setEdits((prev) => {
      const s = prev || { addedNodes: [], deletedNodeIds: [], nodeOverrides: {}, addedEdges: [], deletedEdgeIds: [] };
      const addedIdx = (s.addedNodes || []).findIndex((n) => n.id === nodeId);
      if (addedIdx >= 0) {
        const updated = [...s.addedNodes];
        updated[addedIdx] = { ...updated[addedIdx], baseHeight };
        return { ...s, addedNodes: updated };
      }
      return {
        ...s,
        nodeOverrides: { ...(s.nodeOverrides || {}), [nodeId]: { ...(s.nodeOverrides || {})[nodeId], baseHeight } },
      };
    });
  }, []);

  const updateNodeWidth = useCallback((nodeId, baseWidth) => {
    setEdits((prev) => {
      const s = prev || { addedNodes: [], deletedNodeIds: [], nodeOverrides: {}, addedEdges: [], deletedEdgeIds: [] };
      const addedIdx = (s.addedNodes || []).findIndex((n) => n.id === nodeId);
      if (addedIdx >= 0) {
        const updated = [...s.addedNodes];
        updated[addedIdx] = { ...updated[addedIdx], baseWidth };
        return { ...s, addedNodes: updated };
      }
      return {
        ...s,
        nodeOverrides: { ...(s.nodeOverrides || {}), [nodeId]: { ...(s.nodeOverrides || {})[nodeId], baseWidth } },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setEdits(null);
  }, []);

  const hasEdits = edits !== null;

  return { nodes, edges, addNode, deleteNode, updateNodeHeight, updateNodeWidth, resetAll, hasEdits };
}

/* ═══════════════════════════════════════════════════════════════════════
   TIMELINE EDITOR HOOK — persists phase edits per view
   ═══════════════════════════════════════════════════════════════════════ */
function useTimelineEditor(viewId, defaultPhases) {
  const key = `timeline-editor-${viewId}`;

  const [edits, setEdits] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    if (edits) localStorage.setItem(key, JSON.stringify(edits));
    else localStorage.removeItem(key);
  }, [edits, key]);

  // Merge defaults + edits into final phases array
  const phases = useMemo(() => {
    if (!edits) return defaultPhases || [];
    const defaults = defaultPhases || [];
    // Filter deleted defaults
    let result = defaults.filter((p) => !(edits.deletedIds || []).includes(p.id));
    // Apply overrides to remaining defaults
    result = result.map((p) => {
      const ov = (edits.overrides || {})[p.id];
      if (!ov) return p;
      return { ...p, ...ov };
    });
    // Append added phases
    for (const added of edits.addedPhases || []) {
      result.push(added);
    }
    return result;
  }, [defaultPhases, edits]);

  const updatePhase = useCallback((phaseId, updates) => {
    setEdits((prev) => {
      const s = prev || { overrides: {}, deletedIds: [], addedPhases: [] };
      // Check if it's an added phase
      const addedIdx = (s.addedPhases || []).findIndex((p) => p.id === phaseId);
      if (addedIdx >= 0) {
        const updated = [...s.addedPhases];
        updated[addedIdx] = { ...updated[addedIdx], ...updates };
        return { ...s, addedPhases: updated };
      }
      return {
        ...s,
        overrides: { ...(s.overrides || {}), [phaseId]: { ...(s.overrides || {})[phaseId], ...updates } },
      };
    });
  }, []);

  const deletePhase = useCallback((phaseId) => {
    setEdits((prev) => {
      const s = prev || { overrides: {}, deletedIds: [], addedPhases: [] };
      // If it's an added phase, just remove it
      const addedIdx = (s.addedPhases || []).findIndex((p) => p.id === phaseId);
      if (addedIdx >= 0) {
        const updated = [...s.addedPhases];
        updated.splice(addedIdx, 1);
        return { ...s, addedPhases: updated };
      }
      // Otherwise mark default as deleted
      return { ...s, deletedIds: [...(s.deletedIds || []), phaseId] };
    });
  }, []);

  const addPhase = useCallback((phaseData) => {
    setEdits((prev) => {
      const s = prev || { overrides: {}, deletedIds: [], addedPhases: [] };
      return { ...s, addedPhases: [...(s.addedPhases || []), phaseData] };
    });
  }, []);

  const resetAll = useCallback(() => {
    setEdits(null);
  }, []);

  const hasEdits = edits !== null;

  return { phases, updatePhase, deletePhase, addPhase, resetAll, hasEdits };
}

/* ═══════════════════════════════════════════════════════════════════════
   ADD NODE MODAL — form for creating new flow steps
   ═══════════════════════════════════════════════════════════════════════ */
const modalLabelSt = { fontSize: 11, fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 };
const modalInputSt = { width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' };

function AddNodeModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [stageLabel, setStageLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [badge, setBadge] = useState('');
  const [iconKey, setIconKey] = useState('stage');
  const [colorIdx, setColorIdx] = useState(0);

  const handleSave = () => {
    if (!title.trim()) return;
    const cp = COLOR_PRESETS[colorIdx];
    onSave({
      id: `custom-${Date.now()}`,
      baseHeight: 140,
      expandedExtra: 0,
      data: {
        stageLabel: stageLabel || 'Step',
        title: title.trim(),
        summary: summary.trim(),
        badge: badge.trim() || undefined,
        iconKey,
        accentColor: cp.color,
        glowColor: cp.glow,
        handleTop: true,
        handleBottom: true,
      },
    });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 16,
          padding: 24, width: 460, maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)', fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.text, marginBottom: 20 }}>Add New Step</div>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={modalLabelSt}>Title *</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Quality Check" style={modalInputSt} />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={modalLabelSt}>Stage Label</span>
          <input value={stageLabel} onChange={(e) => setStageLabel(e.target.value)} placeholder="e.g., Step 5" style={modalInputSt} />
        </label>

        <label style={{ display: 'block', marginBottom: 12 }}>
          <span style={modalLabelSt}>Summary</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Brief description of this step..." rows={3} style={{ ...modalInputSt, resize: 'vertical' }} />
        </label>

        <label style={{ display: 'block', marginBottom: 16 }}>
          <span style={modalLabelSt}>Badge</span>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="e.g., MANUAL, AUTO, ~1 WEEK" style={modalInputSt} />
        </label>

        <div style={{ marginBottom: 16 }}>
          <span style={modalLabelSt}>Icon</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {ICON_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setIconKey(k)}
                style={{
                  width: 36, height: 36, borderRadius: 6,
                  background: iconKey === k ? `${colors.blue}22` : 'transparent',
                  border: `1px solid ${iconKey === k ? colors.blue : colors.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
                title={k}
              >
                {icons[k]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <span style={modalLabelSt}>Color</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {COLOR_PRESETS.map((cp, i) => (
              <button
                key={i}
                onClick={() => setColorIdx(i)}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: cp.color, border: `2px solid ${colorIdx === i ? colors.text : 'transparent'}`,
                  cursor: 'pointer', boxShadow: colorIdx === i ? `0 0 8px ${cp.color}` : 'none',
                }}
                title={cp.label}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.border}`,
              background: 'transparent', color: colors.textMuted, fontSize: 13,
              fontFamily: "'Inter', sans-serif", cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: colors.blue, color: '#fff', fontSize: 13, fontWeight: 600,
              fontFamily: "'Inter', sans-serif", cursor: title.trim() ? 'pointer' : 'not-allowed',
              opacity: title.trim() ? 1 : 0.5,
            }}
          >
            Add Step
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 1 — TECHNICAL FLOW (Stage 2 n8n workflow)
   ═══════════════════════════════════════════════════════════════════════ */
const GAP = 50;
const WEEK_HEIGHT = 300;
const PROD_WEEKS = 14;

function buildTechnicalNodeData() {
  return [
    {
      id: 'trigger', baseHeight: 140, expandedExtra: 320,
      data: {
        stageLabel: 'Stage 1', title: 'Trigger & Gate', icon: icons.trigger,
        accentColor: colors.orange, glowColor: colors.orangeGlow, badge: 'ENTRY',
        summary: 'HubSpot Developer App fires on any dealstage change. IF gate filters to Wholesale stage 2 + test deal only.',
        handleTop: false, handleBottom: true,
        nodes: [
          { name: 'HubSpot Trigger', detail: 'hubspotTrigger v1 — deal.propertyChange on dealstage' },
          { name: 'Gate: stage 2 + test deal', detail: 'IF v2.3 — propertyValue == stage2Id AND dealId == testDealId' },
        ],
        keyData: [
          { label: 'Event', value: 'deal.propertyChange' },
          { label: 'Property', value: 'dealstage' },
          { label: 'Credential', value: 'HubSpot Developer App (Brava)' },
          { label: 'Stage 2 ID', value: '1207761221 (Wholesale)' },
          { label: 'Test Deal', value: '60177845163 (sandbox)' },
          { label: 'Passes', value: 'objectId (dealId) downstream' },
        ],
      },
    },
    {
      id: 'readDeal', baseHeight: 140, expandedExtra: 250,
      data: {
        stageLabel: 'Stage 2', title: 'Read HubSpot Deal', icon: icons.api,
        accentColor: colors.blue, glowColor: colors.blueGlow,
        summary: 'Fetch deal properties from sandbox HubSpot. Pulls dealname, project_due_date, and design_description for downstream use.',
        handleTop: true, handleBottom: true,
        nodes: [{ name: 'Read HubSpot Deal', detail: 'httpRequest v4.4 — Header Auth (sandbox token)' }],
        apis: [{ method: 'GET', endpoint: '/crm/v3/objects/deals/{objectId}?properties=project_due_date,dealname,design_description' }],
        keyData: [
          { label: 'Credential', value: 'HubSpot Sandbox (Brava)' },
          { label: 'Output', value: '{ dealname, project_due_date, design_description }' },
          { label: 'Date format', value: 'ISO yyyy-mm-dd (no coercion needed)' },
        ],
      },
    },
    {
      id: 'rotation', baseHeight: 150, expandedExtra: 380,
      data: {
        stageLabel: 'Stage 3', title: 'Brick Designer Rotation', icon: icons.rotation,
        accentColor: colors.purple, glowColor: colors.purpleGlow, badge: 'LRU',
        summary: 'Fetch all Brick Designers from Teamwork (role 3544), read LRU state from n8n Data Table, pick the designer with the oldest last_assigned_at, update rotation state.',
        handleTop: true, handleBottom: true,
        nodes: [
          { name: 'Get Brick Designers', detail: 'httpRequest — TW /people.json?jobRoleIds=3544' },
          { name: 'Get Rotation State', detail: 'Data Table — designer_rotation (all rows)' },
          { name: 'Pick Next Designer', detail: 'Code v2 — LRU sort, userId tiebreak, auto-bootstrap for new designers' },
          { name: 'Upsert Rotation State', detail: 'Data Table — update last_assigned_at + lifetime_count' },
        ],
        apis: [{ method: 'GET', endpoint: '/projects/api/v3/people.json?jobRoleIds=3544&pageSize=50' }],
        keyData: [
          { label: 'Designers', value: '5 (Adam, Brian, Christian, Eli, Patrick)' },
          { label: 'Sort key', value: 'last_assigned_at ASC' },
          { label: 'Tiebreak', value: 'userId ASC (Adam first)' },
          { label: 'Auto-bootstrap', value: 'New role member → epoch → wins next pick' },
          { label: 'Output', value: '{ chosenUserId, chosenUserName }' },
        ],
      },
    },
    {
      id: 'createProject', baseHeight: 150, expandedExtra: 340,
      data: {
        stageLabel: 'Stage 4', title: 'Clone Design Request Project', icon: icons.project,
        accentColor: colors.green, glowColor: colors.greenGlow, badge: 'FORK',
        summary: 'Clone project from Design Request template (1130997) via v1 API. Includes Joe + chosen designer in peopleIds. Output forks to Task Assignment and HubSpot Writeback in parallel.',
        handleTop: true, handleBottom: true, handleRight: true,
        nodes: [{ name: 'Clone Project', detail: 'httpRequest v4.4 — POST /projects/template.json (v1)' }],
        apis: [{ method: 'POST', endpoint: '/projects/template.json' }],
        keyData: [
          { label: 'Template ID', value: '1130997 (Design Request)' },
          { label: 'Owner', value: '623921 (Joe Zink)' },
          { label: 'peopleIds', value: '623921,{chosenUserId}' },
          { label: 'Name', value: 'MVP TEST — {dealname}' },
          { label: 'Response', value: '{ STATUS, projectId } (flat)' },
          { label: 'Category', value: '48851 (Design) — set but ignored by endpoint' },
        ],
      },
    },
    {
      id: 'taskAssignment', baseHeight: 150, expandedExtra: 380,
      data: {
        stageLabel: 'Stage 5', title: 'Brick Designer Task Assignment', icon: icons.tasks,
        accentColor: colors.cyan, glowColor: colors.cyanGlow, badge: 'FAN-OUT',
        summary: 'Fetch all tasks in the new project, split into items, filter to [Brick Designer]-prefixed tasks (~2), assign chosen designer to each via PUT.',
        handleTop: true, handleBottom: true,
        nodes: [
          { name: 'Get Project Tasks', detail: 'httpRequest — GET /projects/{id}/tasks.json' },
          { name: 'Split Tasks Into Items', detail: 'splitOut v1 — fieldToSplitOut: tasks' },
          { name: 'Filter [Brick Designer]', detail: 'filter v2.3 — name contains "[Brick Designer]"' },
          { name: 'Assign Designer to Task', detail: 'httpRequest — PUT /tasks/{id}.json (fires per task)' },
        ],
        apis: [
          { method: 'GET', endpoint: '/projects/api/v3/projects/{id}/tasks.json?pageSize=50' },
          { method: 'PUT', endpoint: '/tasks/{taskId}.json' },
        ],
        keyData: [
          { label: 'Tasks matched', value: '~2 [Brick Designer] tasks' },
          { label: 'Body', value: '{"todo-item":{"responsible-party-id":"{userId}"}}' },
          { label: 'Reach-back', value: "$('Pick Next Designer').item.json.chosenUserId" },
          { label: 'API version', value: 'v3 for GET tasks, v1 for PUT assign' },
        ],
      },
    },
    {
      id: 'designBrief', baseHeight: 150, expandedExtra: 420,
      data: {
        stageLabel: 'Stage 6', title: 'Design Brief → Task Comment', icon: icons.designBrief,
        accentColor: colors.amber, glowColor: colors.amberGlow, badge: 'NEW',
        summary: 'Pull design description + reference images from the HubSpot deal, then post them as a comment on the [Salesman] Design Overview task in Teamwork.',
        handleTop: true, handleBottom: false,
        nodes: [
          { name: 'Get Deal Attachments', detail: 'httpRequest — GET /crm/v3/objects/deals/{id}/associations/notes + GET /engagements/{id}' },
          { name: 'Download Design References', detail: 'httpRequest — GET /files/v3/files/{fileId}/signed-url (per attachment)' },
          { name: 'Find Design Overview Task', detail: 'filter v2.3 — name contains "[Salesman] Design Overview" from project tasks' },
          { name: 'Post Comment with Brief', detail: 'httpRequest — POST /tasks/{taskId}/comments.json with description + image URLs' },
        ],
        apis: [
          { method: 'GET', endpoint: '/crm/v3/objects/deals/{id}/associations/notes' },
          { method: 'GET', endpoint: '/engagements/v1/engagements/{id}' },
          { method: 'GET', endpoint: '/files/v3/files/{fileId}/signed-url' },
          { method: 'POST', endpoint: '/tasks/{taskId}/comments.json' },
        ],
        keyData: [
          { label: 'Description src', value: 'deal.properties.design_description' },
          { label: 'Images src', value: 'Design References file attachments on deal' },
          { label: 'Target task', value: '[Salesman] Design Overview (first task)' },
          { label: 'Comment body', value: 'Design description text + embedded image URLs' },
          { label: 'TW API version', value: 'v1 for POST comment' },
          { label: 'HS file access', value: 'Signed URLs (temporary, expiring)' },
        ],
      },
    },
  ];
}

// Writeback is a side branch — positioned separately
const writebackNodeData = {
  id: 'writeback',
  data: {
    stageLabel: 'Stage 4b', title: 'HubSpot Writeback', icon: icons.writeback,
    accentColor: colors.rose, glowColor: colors.roseGlow, badge: 'PARALLEL',
    summary: 'Parallel branch from Clone: PATCH the HubSpot deal with the new Teamwork project URL. Establishes the join key for downstream workflows (stage 7, invoicing).',
    handleTop: false, handleBottom: false, handleLeft: true,
    nodes: [{ name: 'Writeback Project URL to Deal', detail: 'httpRequest v4.4 — PATCH deal, parallel terminal' }],
    apis: [{ method: 'PATCH', endpoint: '/crm/v3/objects/deals/{dealId}' }],
    keyData: [
      { label: 'Property', value: 'teamwork_project_url' },
      { label: 'Value', value: 'https://bravabrands.teamwork.com/projects/{projectId}' },
      { label: 'Credential', value: 'HubSpot Sandbox (Brava)' },
      { label: 'Scope req.', value: 'crm.objects.deals.write' },
      { label: 'Independence', value: 'Failure does not block task assignment' },
    ],
  },
};

const technicalEdges = [
  { id: 'e-trigger-read', source: 'trigger', target: 'readDeal', ...edgeDefaults, label: 'objectId (dealId)', labelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'e-read-rotation', source: 'readDeal', target: 'rotation', ...edgeDefaults, label: 'dealname, project_due_date', labelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'e-rotation-create', source: 'rotation', target: 'createProject', ...edgeDefaults, label: 'chosenUserId → peopleIds', labelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'e-create-tasks', source: 'createProject', target: 'taskAssignment', ...edgeDefaults, label: 'projectId', labelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'e-create-writeback', source: 'createProject', sourceHandle: 'right', target: 'writeback', targetHandle: 'left', ...edgeDefaults, style: { ...edgeDefaults.style, stroke: colors.rose, strokeDasharray: '6 3' }, markerEnd: { type: MarkerType.ArrowClosed, color: colors.rose, width: 16, height: 16 }, label: 'projectId → URL', labelStyle: { fill: colors.rose, fontSize: 10, fontFamily: 'monospace' }, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'e-tasks-designbrief', source: 'taskAssignment', target: 'designBrief', ...edgeDefaults, label: 'taskId + design_description', labelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
];

/* ═══════════════════════════════════════════════════════════════════════
   TAB 2 — BUSINESS OVERVIEW (Design → Production lifecycle)
   ═══════════════════════════════════════════════════════════════════════ */
function buildBusinessNodeData() {
  return [
    {
      id: 'b-form', baseHeight: 140, expandedExtra: 160,
      data: {
        stageLabel: 'Step 1', title: 'Design Form Entry', icon: icons.form,
        accentColor: colors.blue, glowColor: colors.blueGlow, badge: 'HUBSPOT',
        summary: 'Design form data entered in as HubSpot deal properties — design description, reference images, brick type, quantities, due dates.',
        handleTop: false, handleBottom: true,
        details: [{ heading: 'What Happens', items: [
          'Design form data entered into a HubSpot deal',
          'Design Description and Design References (photos) are attached to the deal',
          'Deal properties filled: brick type, kit quantities, in-hands due date',
        ]}],
      },
    },
    {
      id: 'b-firstrender', baseHeight: 150, expandedExtra: 260,
      data: {
        stageLabel: 'Step 2', title: 'Waiting on First Render', icon: icons.stage,
        accentColor: colors.orange, glowColor: colors.orangeGlow, badge: 'AUTO',
        summary: 'Deal stage moved to "Waiting on First Render." This automatically triggers design project creation in Teamwork.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Trigger', items: ['Deal stage changed to "Waiting on First Render" in HubSpot'] },
          { heading: 'What Fires Automatically', items: [
            'n8n workflow detects the stage change via webhook',
            'Teamwork project cloned from Design Request template',
            'Brick Designer auto-assigned via round-robin rotation',
            'Design brief + reference images posted to the design task',
            'Project URL written back to the HubSpot deal',
          ]},
        ],
      },
    },
    {
      id: 'b-designwork', baseHeight: 140, expandedExtra: 180,
      data: {
        stageLabel: 'Step 3', title: 'Design Work in Progress', icon: icons.design,
        accentColor: colors.purple, glowColor: colors.purpleGlow, badge: 'TEAMWORK',
        summary: 'The assigned Brick Designer works the project in Teamwork — creating renders, revisions, and getting client feedback until the design is approved.',
        handleTop: true, handleBottom: true, handleRight: true,
        details: [{ heading: 'What Happens', items: [
          'Brick Designer picks up the assigned tasks in Teamwork',
          'Design drafts created and revised based on client feedback',
          'All design work tracked in the Teamwork project',
          'Salesman communicates with client on approvals',
        ]}],
      },
    },
    {
      id: 'b-approved', baseHeight: 140, expandedExtra: 150,
      data: {
        stageLabel: 'Step 4', title: 'Design Approved', icon: icons.check,
        accentColor: colors.green, glowColor: colors.greenGlow, badge: 'MANUAL',
        summary: 'Client approves the design. Salesman manually moves the deal to "Design Approved" in HubSpot.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Happens', items: [
          'Client confirms design approval (via email, call, etc.)',
          'Salesman moves HubSpot deal stage to "Design Approved"',
          'Salesman now enters production data before agreement is sent',
        ]}],
      },
    },
    {
      id: 'b-proddata', baseHeight: 140, expandedExtra: 180,
      data: {
        stageLabel: 'Step 5', title: 'Production Data Entry', icon: icons.dataEntry,
        accentColor: colors.pink, glowColor: colors.pinkGlow, badge: 'MANUAL',
        summary: 'Salesman enters production-specific data into HubSpot deal properties — factory specs, quantities, shipping details, production timeline. This data populates the Production Agreement.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Happens', items: [
          'Salesman fills in production form fields on the HubSpot deal',
          'Data includes factory details, quantities, timelines, special requests',
          'This data populates the Production Agreement sent in the next step',
          'Data also flows into Teamwork when production kicks off later',
        ]}],
      },
    },
    {
      id: 'b-docusign', baseHeight: 140, expandedExtra: 170,
      data: {
        stageLabel: 'Step 6', title: 'Production Agreement Sent', icon: icons.docusign,
        accentColor: colors.indigo, glowColor: colors.indigoGlow, badge: 'AUTO',
        summary: 'HubSpot automatically sends a DocuSign Production Agreement to the client for signature. Agreement is pre-populated with production data from Step 5.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Fires Automatically', items: [
          'HubSpot workflow triggers once production data is complete',
          'DocuSign Production Agreement generated with deal properties',
          'Agreement includes factory specs, quantities, timeline, and pricing',
          'Client receives email with agreement to review and sign',
        ]}],
      },
    },
    {
      id: 'b-signed', baseHeight: 150, expandedExtra: 200,
      data: {
        stageLabel: 'Step 7', title: 'Agreement Signed', icon: icons.signed,
        accentColor: colors.emerald, glowColor: colors.emeraldGlow, badge: 'AUTO',
        summary: 'Client signs the agreement. Deal stage moves to "Agreement Signed," which triggers automated invoice creation and sending via QuickBooks Online.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Trigger', items: ['DocuSign completion → deal stage moves to "Agreement Signed"'] },
          { heading: 'What Fires Automatically', items: [
            'Invoice(s) created and sent via QBO integration',
            'Deal remains in "Agreement Signed" stage throughout',
          ]},
        ],
      },
    },
    {
      id: 'b-invoicepaid', baseHeight: 140, expandedExtra: 150,
      data: {
        stageLabel: 'Step 8', title: 'Invoice Paid', icon: icons.invoice,
        accentColor: colors.sky, glowColor: colors.skyGlow, badge: 'AUTO',
        summary: 'Once the invoice is paid, the deal stage moves to "Production." This triggers production tasks being added to the existing Teamwork project.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Fires Automatically', items: [
          'Payment confirmed → deal stage moves to "Production"',
          'n8n workflow detects the stage change',
          'Production tasks added to the existing Teamwork design project',
        ]}],
      },
    },
    {
      id: 'b-production', baseHeight: 150, expandedExtra: 240,
      data: {
        stageLabel: 'Step 9', title: 'Production Tasks Live', icon: icons.production,
        accentColor: colors.lime, glowColor: colors.limeGlow, badge: 'TEAMWORK',
        summary: 'Production task list applied to the existing project. Production Coordinator and Procurement Specialist auto-assigned via rotation. Project category updated.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'What Fires Automatically', items: [
            'Project Creation task list template applied to project',
            'Production Coordinator assigned via LRU rotation',
            'Procurement Specialist assigned via LRU rotation',
            'Project category changed from Design to Direct (production)',
          ]},
          { heading: 'Result', items: [
            'One unified project in Teamwork — design history + production tasks',
            'All roles assigned and ready to work',
          ]},
        ],
      },
    },
    {
      id: 'b-handoff', baseHeight: 150, expandedExtra: 220,
      data: {
        stageLabel: 'Step 10', title: 'Sales Handoff to Production Coordinator', icon: icons.handoff,
        accentColor: colors.orange, glowColor: colors.orangeGlow, badge: 'MANUAL',
        summary: 'Sales hands off the project to the assigned Production Coordinator via email or video call with the client. Covers all relevant project details, timeline, and special requests.',
        handleTop: true, handleBottom: false,
        details: [
          { heading: 'What Happens', items: [
            'Salesman schedules handoff with Production Coordinator and client',
            'Handoff conducted via email thread or video call',
            'Project details, design decisions, and client expectations communicated',
            'Timeline and in-hands date confirmed with Production Coordinator',
            'Special requests and client preferences passed along',
          ]},
          { heading: 'Result', items: [
            'Production Coordinator has full context to manage the project',
            'Client has a direct relationship with their production contact',
          ]},
        ],
      },
    },
  ];
}

const businessEdgeLabels = [
  'Deal properties filled',
  'Stage → "Waiting on First Render"',
  'Design tasks in Teamwork',
  'Stage → "Design Approved"',
  'Production specs entered',
  'Agreement auto-sent with specs',
  'Agreement signed → invoices sent',
  'Stage → "Production"',
  'PC assigned → handoff scheduled',
];

function buildBusinessEdges() {
  const ids = ['b-form', 'b-firstrender', 'b-designwork', 'b-approved', 'b-proddata', 'b-docusign', 'b-signed', 'b-invoicepaid', 'b-production', 'b-handoff'];
  return ids.slice(0, -1).map((src, i) => ({
    id: `be-${i}`, source: src, target: ids[i + 1], ...edgeDefaults,
    label: businessEdgeLabels[i],
    labelStyle: { fill: colors.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif" },
    labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4,
  }));
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 3 — PRODUCTION FLOW (post-handoff through shipping)
   ═══════════════════════════════════════════════════════════════════════ */
function buildProductionNodeData() {
  return [
    // ── Phase 1: Handoff & Quoting (Wk 1–2) ──
    {
      id: 'p-handoff', col: 'center-top', weekStart: 0, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 160,
      data: {
        stageLabel: 'Step 1', title: 'Handoff Completed', icon: icons.handoff,
        accentColor: colors.orange, glowColor: colors.orangeGlow, badge: 'ENTRY',
        summary: 'Sales has completed the handoff to the Production Coordinator. PC has full project context, timeline, and client relationship established.',
        handleTop: false, handleBottom: true,
        details: [{ heading: 'What Happened', items: [
          'Salesman briefed PC on project scope, timeline, and client expectations',
          'Client introduced to Production Coordinator via email or video call',
          'Special requests and design decisions communicated',
        ]}],
      },
    },
    {
      id: 'p-quotes', col: 'center-top', weekStart: 1, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 240,
      data: {
        stageLabel: 'Step 2', title: 'Procurement Quotes', icon: icons.quotes,
        accentColor: colors.sky, glowColor: colors.skyGlow, badge: 'PROCUREMENT',
        summary: 'Procurement receives parts list from Brick Designer, sends to 5 suppliers with timeline and quantity requirements. Best supplier chosen based on price and timeline.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Process', items: [
            'Parts list received from Brick Designer',
            'RFQ sent to all 5 suppliers with quantity and timeline',
            'Quotes received and per-brick cost calculated (total price ÷ total bricks)',
          ]},
          { heading: 'Decision Criteria', items: [
            'Best price per brick',
            'Supplier timeline availability vs. project due date',
          ]},
        ],
      },
    },
    // ── Phase 2: Test Build (Wk 3–4) ──
    {
      id: 'p-testbuild', col: 'center-top', weekStart: 2, weekSpan: 2,
      baseHeight: WEEK_HEIGHT * 2, expandedExtra: 240,
      data: {
        stageLabel: 'Step 3', title: 'Test Build', icon: icons.testBuild,
        accentColor: colors.purple, glowColor: colors.purpleGlow, badge: '1-2 WEEKS',
        summary: 'Rough instructions sent to chosen supplier. Test build requested to verify the set can be produced. Brick Designer must approve — revisions possible.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Process', items: [
            'Rough Instructions received from Brick Designer and sent to supplier',
            'Supplier builds a test set (1–2 weeks)',
            'Verification via video from supplier or physical shipment to Brick Designer',
          ]},
          { heading: 'Approval', items: [
            'Brick Designer reviews and approves the test build',
            'Revisions may be requested — can add time to the timeline',
            'Once approved, printables phase begins',
          ]},
        ],
      },
    },
    // ── Phase 3: Printables (Wk 5–8) ──
    {
      id: 'p-stickers', col: 'center-top', weekStart: 4, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 240,
      data: {
        stageLabel: 'Step 4', title: 'Sticker Design', icon: icons.sticker,
        accentColor: colors.amber, glowColor: colors.amberGlow, badge: '~1 WEEK',
        summary: 'Stickers designed based on client requests. Brick Designers measure available areas, Graphic Designers create the artwork. Up to 3 revisions. Client approval required.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Process', items: [
            'Brick Designer measures available sticker areas on the set',
            'Graphic Designer creates sticker artwork per client requests',
            'Up to 3 revisions allowed',
          ]},
          { heading: 'Approval', items: [
            'Client must approve final sticker designs',
            'Approved stickers move to Final Render',
          ]},
        ],
      },
    },
    // Printables left column
    {
      id: 'p-finalrender', col: 'left', weekStart: 5, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 160,
      data: {
        stageLabel: 'Step 5', title: 'Final Render', icon: icons.render,
        accentColor: colors.pink, glowColor: colors.pinkGlow, badge: 'CLIENT APPROVAL',
        summary: 'Final render created with approved stickers applied to the set. Client must approve before box design can begin.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Happens', items: [
          'Approved sticker designs applied to the set render',
          'Final render produced showing the complete product',
          'Client reviews and approves the final look',
        ]}],
      },
    },
    {
      id: 'p-boxes', col: 'left', weekStart: 6, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 220,
      data: {
        stageLabel: 'Step 6', title: 'Box Design', icon: icons.box,
        accentColor: colors.blue, glowColor: colors.blueGlow, badge: '~1 WEEK',
        summary: 'Box design created by Graphic Designer. Requires box template from supplier AND Packaging Design Brief from client. Up to 3 revisions. Client approval required.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Prerequisites', items: [
            'Box template received from supplier',
            'Client completes Packaging Design Brief',
            'Both must be received before design begins',
          ]},
          { heading: 'Process', items: [
            'Graphic Designer creates box artwork using template',
            'Up to 3 revisions allowed',
            'Client must approve final box design',
          ]},
        ],
      },
    },
    {
      id: 'p-coverart', col: 'left', weekStart: 7, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 180,
      data: {
        stageLabel: 'Step 7', title: 'Instruction Cover Art', icon: icons.coverArt,
        accentColor: colors.indigo, glowColor: colors.indigoGlow, badge: '~1 WEEK',
        summary: 'Cover art designed by Graphic Designer, based on the finalized box design. Client approval required.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'Process', items: [
          'Depends on finalized box design as visual reference',
          'Graphic Designer creates instruction booklet cover',
          'Usually based on box artwork and client branding',
          'Client must approve final cover art',
        ]}],
      },
    },
    // Printables right column (parallel)
    {
      id: 'p-instructions', col: 'right', weekStart: 5, weekSpan: 3,
      baseHeight: WEEK_HEIGHT * 3, expandedExtra: 200,
      data: {
        stageLabel: 'Step 6b', title: 'Instruction Steps', icon: icons.book,
        accentColor: colors.cyan, glowColor: colors.cyanGlow, badge: '~2 WEEKS',
        summary: 'Step-by-step build instructions created by Brick Designers. Runs in parallel with box design. No client input needed — purely technical.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'Process', items: [
          'Brick Designers create step-by-step build instructions',
          'Starts after stickers are completed',
          'Runs in parallel with Box Design and Cover Art (~2 weeks)',
          'No client involvement — internal Brick Designer work only',
        ]}],
      },
    },
    // Printables merge
    {
      id: 'p-printfiles', col: 'center-mid', weekStart: 8, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 160,
      data: {
        stageLabel: 'Step 8', title: 'Printables Sent to Supplier', icon: icons.send,
        accentColor: colors.green, glowColor: colors.greenGlow, badge: 'PROCUREMENT',
        summary: 'All finalized printable files — stickers, box design, instruction steps, and cover art — sent to the supplier as a complete package.',
        handleTop: true, handleBottom: true,
        details: [{ heading: 'What Happens', items: [
          'Procurement bundles all approved printable files',
          'Complete package sent to supplier for production application',
          'Stickers, box artwork, instruction booklet (steps + cover) included',
        ]}],
      },
    },
    // ── Phase 4: Final Production (Wk 9–12) + Payment ──
    {
      id: 'p-finalprod', col: 'parallel-left', weekStart: 9, weekSpan: 3,
      baseHeight: WEEK_HEIGHT * 3, expandedExtra: 240,
      data: {
        stageLabel: 'Step 9', title: 'Final Production', icon: icons.factory,
        accentColor: '#94a3b8', glowColor: 'rgba(148, 163, 184, 0.15)', badge: 'DEAD ZONE',
        summary: 'Final stages of production at the factory. Minimal client communication during this period. Procurement receives Factory Ready Date (FRD) from the supplier, which triggers payment scheduling and shipping preparation.',
        handleTop: true, handleBottom: true, handleRight: true,
        details: [
          { heading: 'What Happens', items: [
            'Supplier completes brick production with printables applied',
            'Limited updates to provide the client — communication dead zone',
            'Procurement receives FRD (Factory Ready Date) from supplier',
            'FRD indicates when project will be ready for pickup at factory',
          ]},
          { heading: 'FRD Triggers', items: [
            'Final 50% payment scheduled 2 weeks before FRD',
            'Shipping logistics planning begins',
            'PC collects shipping address and instructions from client',
          ]},
        ],
      },
    },
    {
      id: 'p-payment', col: 'parallel-right', weekStart: 10, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 200,
      data: {
        stageLabel: 'Step 10', title: 'Final 50% Payment', icon: icons.invoice,
        accentColor: colors.sky, glowColor: colors.skyGlow, badge: '2 WKS BEFORE FRD',
        summary: 'Final 50% payment invoice sent to client 2 weeks before FRD. PC collects shipping address and any special shipping instructions from client.',
        handleTop: false, handleBottom: true, handleLeft: true,
        details: [
          { heading: 'Triggered By', items: ['FRD received — payment scheduled 2 weeks before factory ready date'] },
          { heading: 'What Happens', items: [
            'Final 50% invoice sent to client',
            'PC collects shipping address from client',
            'Any special shipping instructions gathered',
          ]},
        ],
      },
    },
    // ── Phase 5: Shipping & Close (Wk 12–14) ──
    {
      id: 'p-shipping', col: 'center-final', weekStart: 12, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 260,
      data: {
        stageLabel: 'Step 11', title: 'Shipping & Delivery', icon: icons.truck,
        accentColor: colors.orange, glowColor: colors.orangeGlow, badge: 'LOGISTICS',
        summary: 'Freight Forwarder picks up from factory on FRD. Shipping quotes obtained, method chosen jointly by PC and Procurement (or client if shipping not included). Tracking relayed to client.',
        handleTop: true, handleBottom: true,
        details: [
          { heading: 'Pickup', items: ['Procurement arranges Freight Forwarder pickup on FRD'] },
          { heading: 'Shipping Method', items: [
            'Freight Forwarder provides shipping quotes',
            'If shipping included: PC + Procurement choose method jointly',
            'If not included: quotes presented to client for their choice',
          ]},
          { heading: 'Tracking', items: [
            'PC relays tracking number and shipping info to client',
            'PC stays with the project until shipment confirmed received',
          ]},
        ],
      },
    },
    {
      id: 'p-review', col: 'center-final', weekStart: 13, weekSpan: 1,
      baseHeight: WEEK_HEIGHT, expandedExtra: 160,
      data: {
        stageLabel: 'Step 12', title: 'After Action Review', icon: icons.clipboard,
        accentColor: colors.emerald, glowColor: colors.emeraldGlow, badge: 'CLOSE-OUT',
        summary: 'Production Coordinator notifies Salesman that project is shipped and received. Salesman follows up with client to close the loop.',
        handleTop: true, handleBottom: false,
        details: [{ heading: 'What Happens', items: [
          'PC confirms shipment received by client',
          'PC notifies Salesman that project is complete',
          'Salesman follows up with client for feedback and relationship maintenance',
        ]}],
      },
    },
    // ── Brick Production (was span bar, now regular stage node) ──
    {
      id: 'p-brickprod', col: 'span-left', weekStart: 4, weekSpan: 9,
      baseHeight: WEEK_HEIGHT * 9, expandedExtra: 0,
      data: {
        stageLabel: 'Background', title: 'Brick Production', icon: icons.factory,
        accentColor: '#94a3b8', glowColor: 'rgba(148, 163, 184, 0.08)', badge: 'SUPPLIER',
        summary: 'Bricks produced at supplier factory. Runs in parallel from test build approval through final production and shipping.',
        handleTop: false, handleBottom: false,
      },
    },
  ];
}

const prodEdgeLabelStyle = { fill: colors.textDim, fontSize: 10, fontFamily: "'Inter', sans-serif" };

const productionEdges = [
  // Linear top
  { id: 'pe-handoff-quotes', source: 'p-handoff', target: 'p-quotes', ...edgeDefaults, label: 'Parts list received', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-quotes-test', source: 'p-quotes', target: 'p-testbuild', ...edgeDefaults, label: 'Supplier chosen', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-test-stickers', source: 'p-testbuild', target: 'p-stickers', ...edgeDefaults, label: 'Test build approved', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Fork from stickers
  { id: 'pe-stickers-render', source: 'p-stickers', target: 'p-finalrender', ...edgeDefaults, label: 'Stickers approved', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-stickers-instructions', source: 'p-stickers', target: 'p-instructions', ...edgeDefaults, label: 'Start instruction steps', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Left column
  { id: 'pe-render-boxes', source: 'p-finalrender', target: 'p-boxes', ...edgeDefaults, label: 'Render approved', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-boxes-coverart', source: 'p-boxes', target: 'p-coverart', ...edgeDefaults, label: 'Box design finalized', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Merge into printfiles
  { id: 'pe-coverart-printfiles', source: 'p-coverart', target: 'p-printfiles', ...edgeDefaults, label: 'Cover art approved', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-instructions-printfiles', source: 'p-instructions', target: 'p-printfiles', ...edgeDefaults, label: 'Steps completed', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Printfiles → Final Production
  { id: 'pe-printfiles-finalprod', source: 'p-printfiles', target: 'p-finalprod', ...edgeDefaults, label: 'Files sent to supplier', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Final Production → Payment (parallel, FRD triggers payment)
  { id: 'pe-finalprod-payment', source: 'p-finalprod', sourceHandle: 'right', target: 'p-payment', targetHandle: 'left', ...edgeDefaults, label: 'FRD received', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Both merge into shipping
  { id: 'pe-finalprod-shipping', source: 'p-finalprod', target: 'p-shipping', ...edgeDefaults, label: 'Production complete', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  { id: 'pe-payment-shipping', source: 'p-payment', target: 'p-shipping', ...edgeDefaults, label: 'Payment confirmed', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
  // Final linear
  { id: 'pe-shipping-review', source: 'p-shipping', target: 'p-review', ...edgeDefaults, label: 'Shipment received', labelStyle: prodEdgeLabelStyle, labelBgStyle, labelBgPadding: [6, 3], labelBgBorderRadius: 4 },
];

/* ═══════════════════════════════════════════════════════════════════════
   TIMELINE PHASE CONFIGS — defines the phases for each view
   ═══════════════════════════════════════════════════════════════════════ */
const productionTimelinePhases = [
  { id: 'tl-prod-1', title: 'Handoff & Quoting', weekLabel: 'Wk 1–2', duration: '~2 weeks', accentColor: colors.orange, nodeIds: ['p-handoff', 'p-quotes'] },
  { id: 'tl-prod-2', title: 'Test Build', weekLabel: 'Wk 3–4', duration: '1–2 weeks', accentColor: colors.purple, nodeIds: ['p-testbuild'] },
  { id: 'tl-prod-3', title: 'Printables', weekLabel: 'Wk 5–9', duration: '~4 weeks', accentColor: colors.pink, nodeIds: ['p-stickers', 'p-finalrender', 'p-boxes', 'p-coverart', 'p-instructions', 'p-printfiles'] },
  { id: 'tl-prod-4', title: 'Final Production', weekLabel: 'Wk 10–12', duration: '3–4 weeks', accentColor: '#94a3b8', nodeIds: ['p-finalprod', 'p-payment'] },
  { id: 'tl-prod-5', title: 'Shipping & Close', weekLabel: 'Wk 13–14', duration: '~2 weeks', accentColor: colors.emerald, nodeIds: ['p-shipping', 'p-review'] },
];

const designTimelinePhases = [
  { id: 'tl-des-1', title: 'Form Entry', weekLabel: 'Day 1', duration: '1 day', accentColor: colors.blue, nodeIds: ['b-form'] },
  { id: 'tl-des-2', title: 'Automation & Assignment', weekLabel: 'Wk 1', duration: '~1 week', accentColor: colors.orange, nodeIds: ['b-firstrender'] },
  { id: 'tl-des-3', title: 'Design Work', weekLabel: 'Wk 2–5', duration: '3–4 weeks', accentColor: colors.purple, nodeIds: ['b-designwork'] },
  { id: 'tl-des-4', title: 'Approval & Production Data', weekLabel: 'Wk 5–6', duration: '~1 week', accentColor: colors.green, nodeIds: ['b-approved', 'b-proddata'] },
  { id: 'tl-des-5', title: 'Agreement & Payment', weekLabel: 'Wk 6–7', duration: '~1 week', accentColor: colors.indigo, nodeIds: ['b-docusign', 'b-signed', 'b-invoicepaid'] },
  { id: 'tl-des-6', title: 'Production Setup', weekLabel: 'Wk 7–8', duration: '~1 week', accentColor: colors.lime, nodeIds: ['b-production', 'b-handoff'] },
];

/**
 * Compute timeline phase node positions based on already-positioned flow nodes.
 * Accepts callbacks for editing. Phases with _heightOverride or _yOverride use those.
 */
function computeTimelineNodes(phases, positionedNodes, xOffset, callbacks) {
  const posMap = {};
  const hMap = {};
  for (const nd of positionedNodes) {
    posMap[nd.id] = nd.position;
    hMap[nd.id] = nd.baseHeight || 140;
  }

  // Find the last positioned node's bottom Y (for "added" phases without nodeIds)
  let maxFlowBottom = 0;
  for (const nd of positionedNodes) {
    const bottom = (nd.position?.y || 0) + (nd.baseHeight || 140);
    if (bottom > maxFlowBottom) maxFlowBottom = bottom;
  }

  return phases.map((phase) => {
    let minY = Infinity;
    let maxYBottom = -Infinity;

    if (phase.nodeIds && phase.nodeIds.length > 0) {
      for (const nid of phase.nodeIds) {
        const pos = posMap[nid];
        if (!pos) continue;
        if (pos.y < minY) minY = pos.y;
        const bottom = pos.y + (hMap[nid] || 140);
        if (bottom > maxYBottom) maxYBottom = bottom;
      }
    }

    // For added phases without valid nodeIds, position below the flow
    if (minY === Infinity) {
      if (phase._yOverride != null) {
        minY = phase._yOverride;
      } else {
        minY = maxFlowBottom + 50;
        maxFlowBottom = minY + 100;
      }
      maxYBottom = minY + (phase._heightOverride || 100);
    }

    const phaseHeight = phase._heightOverride || Math.max(maxYBottom - minY, 60);
    const yPos = phase._yOverride != null ? phase._yOverride : minY;

    return {
      id: phase.id,
      type: 'timelinePhase',
      position: { x: xOffset, y: yPos },
      data: {
        title: phase.title,
        weekLabel: phase.weekLabel,
        duration: phase.duration,
        accentColor: phase.accentColor,
        phaseHeight,
        phaseWidth: phase._widthOverride || undefined,
        _onUpdate: callbacks?.onUpdate,
        _onDelete: callbacks?.onDelete,
      },
      draggable: true,
      selectable: false,
    };
  }).filter(Boolean);
}

/* ═══════════════════════════════════════════════════════════════════════
   PRODUCTION LAYOUT — week-based grid (Y = weekStart × WEEK_HEIGHT)
   ═══════════════════════════════════════════════════════════════════════ */
function computeProductionPositions(nodeDataList, expandedSet, xCenter) {
  const leftX = xCenter - 210;
  const rightX = xCenter + 210;
  const spanLeftX = xCenter - 480;

  // Column X mapping
  const colX = {
    'center-top': xCenter,
    'left': leftX,
    'right': rightX,
    'center-mid': xCenter,
    'parallel-left': leftX,
    'parallel-right': rightX,
    'center-final': xCenter,
    'span-left': spanLeftX,
  };

  // Centering offset: nudge nodes toward the middle of their week row(s)
  const NODE_VISUAL_H = 150; // approximate rendered height of an unexpanded node
  const centerPad = (WEEK_HEIGHT - NODE_VISUAL_H) / 2;

  return nodeDataList.map((nd) => {
    if (nd.col === 'span-left') {
      const spanY = (nd.weekStart || 0) * WEEK_HEIGHT;
      const spanHeight = (nd.weekSpan || 9) * WEEK_HEIGHT;
      nd._spanHeight = spanHeight;
      return { ...nd, position: { x: colX['span-left'], y: spanY } };
    }

    const x = colX[nd.col] ?? xCenter;
    const y = (nd.weekStart || 0) * WEEK_HEIGHT + centerPad;
    return { ...nd, position: { x, y } };
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   DYNAMIC LAYOUT — computes Y positions based on expanded state
   ═══════════════════════════════════════════════════════════════════════ */
function computePositions(nodeDataList, expandedSet, xCenter) {
  let y = 0;
  return nodeDataList.map((nd) => {
    const isExpanded = expandedSet.has(nd.id);
    const height = nd.baseHeight + (isExpanded ? nd.expandedExtra : 0);
    const pos = { x: xCenter, y };
    y += height + GAP;
    return { ...nd, position: pos };
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   FLOW WRAPPER — handles expand/collapse with dynamic repositioning
   ═══════════════════════════════════════════════════════════════════════ */
function FlowView({ nodeDataList, edgeList, sideNode, sideNodeYIndex, xCenter, positionFn, extraNodes, extraEdges, viewId, weekGrid, snapGridY }) {
  const [expandedSet, setExpandedSet] = useState(new Set());

  // ── Drag offsets (restored from localStorage on mount) ──
  const dragKey = `flow-drag-${viewId || 'default'}`;
  const dragOffsets = useRef(() => {
    try { const s = localStorage.getItem(dragKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  // Initialize ref value from the factory on first render
  if (typeof dragOffsets.current === 'function') {
    dragOffsets.current = dragOffsets.current();
  }
  const [hasDragChanges, setHasDragChanges] = useState(() => {
    try { const s = localStorage.getItem(dragKey); return s ? Object.keys(JSON.parse(s)).length > 0 : false; } catch { return false; }
  });

  const handleSaveLayout = useCallback(() => {
    localStorage.setItem(dragKey, JSON.stringify(dragOffsets.current));
    setHasDragChanges(false);
  }, [dragKey]);

  // ── Editor state (persisted add/delete/resize) ──
  // Destructure to get stable refs — the object itself is recreated every render
  const editor = useFlowEditor(viewId, nodeDataList, edgeList);
  const { nodes: editorNodes, edges: editorEdges, addNode: editorAddNode, deleteNode: editorDeleteNode, updateNodeHeight: editorUpdateHeight, updateNodeWidth: editorUpdateWidth, resetAll: editorReset, hasEdits: editorHasEdits } = editor;
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertEdgeCtx, setInsertEdgeCtx] = useState(null); // { edgeId, sourceId, targetId }
  const [presenting, setPresenting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // ── Node notes (persisted in localStorage per viewId) ──
  const notesKey = `flowchart-notes-data-${viewId || 'default'}`;
  const [nodeNotes, setNodeNotes] = useState(() => {
    try { const s = localStorage.getItem(notesKey); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  useEffect(() => {
    localStorage.setItem(notesKey, JSON.stringify(nodeNotes));
  }, [nodeNotes, notesKey]);
  const handleNotesChange = useCallback((nodeId, text) => {
    setNodeNotes((prev) => ({ ...prev, [nodeId]: text }));
  }, []);

  // ── Sticky notes (persisted in localStorage per viewId) ──
  const storageKey = `flowchart-notes-${viewId || 'default'}`;
  const [stickyNotes, setStickyNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(stickyNotes));
  }, [stickyNotes, storageKey]);

  const addNote = useCallback(() => {
    const id = `note-${Date.now()}`;
    setStickyNotes((prev) => [...prev, {
      id, x: xCenter - 100 + Math.random() * 200, y: 100 + Math.random() * 200,
      text: '', colorIndex: prev.length % NOTE_COLORS.length,
      rotation: -2 + Math.random() * 4,
    }]);
  }, [xCenter]);

  const updateNoteText = useCallback((id, text) => {
    setStickyNotes((prev) => prev.map((n) => n.id === id ? { ...n, text } : n));
  }, []);

  const deleteNote = useCallback((id) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
    dragOffsets.current[id] = undefined;
  }, []);

  const cycleNoteColor = useCallback((id) => {
    setStickyNotes((prev) => prev.map((n) =>
      n.id === id ? { ...n, colorIndex: ((n.colorIndex || 0) + 1) % NOTE_COLORS.length } : n
    ));
  }, []);

  // ── Editor callbacks (use destructured stable refs to avoid re-render loops) ──
  const handleDeleteNode = useCallback((nodeId) => {
    editorDeleteNode(nodeId);
  }, [editorDeleteNode]);

  const handleResizeNode = useCallback((nodeId, newHeight) => {
    editorUpdateHeight(nodeId, newHeight);
  }, [editorUpdateHeight]);

  const handleResizeWidth = useCallback((nodeId, newWidth) => {
    editorUpdateWidth(nodeId, newWidth);
  }, [editorUpdateWidth]);

  // For addNodeSave we need editorNodes which changes — use a ref
  const editorNodesRef = useRef(editorNodes);
  editorNodesRef.current = editorNodes;

  const handleAddNodeSave = useCallback((nodeData) => {
    if (insertEdgeCtx) {
      const ts = Date.now();
      const newEdges = [
        { id: `ae-in-${ts}`, source: insertEdgeCtx.sourceId, target: nodeData.id, label: '' },
        { id: `ae-out-${ts}`, source: nodeData.id, target: insertEdgeCtx.targetId, label: '' },
      ];
      editorAddNode(nodeData, insertEdgeCtx.sourceId, newEdges, insertEdgeCtx.edgeId);
    } else {
      const lastNode = editorNodesRef.current[editorNodesRef.current.length - 1];
      const newEdges = lastNode && lastNode.col !== 'span-left'
        ? [{ id: `ae-${Date.now()}`, source: lastNode.id, target: nodeData.id, label: '' }]
        : [];
      editorAddNode(nodeData, lastNode?.id || null, newEdges, null);
    }
    setShowAddModal(false);
    setInsertEdgeCtx(null);
  }, [editorAddNode, insertEdgeCtx]);

  const handleEdgeClick = useCallback((_event, edge) => {
    setInsertEdgeCtx({ edgeId: edge.id, sourceId: edge.source, targetId: edge.target });
    setShowAddModal(true);
  }, []);

  // ── Core flow logic ──
  const onToggle = useCallback((id) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const layoutFn = positionFn || computePositions;
  const positioned = useMemo(() => layoutFn(editorNodes, expandedSet, xCenter), [layoutFn, editorNodes, expandedSet, xCenter]);

  const buildNodes = useCallback(() => {
    const result = [];

    // Week grid background (rendered first = behind everything)
    if (weekGrid) {
      result.push({
        id: '__week-grid__',
        type: 'weekGrid',
        position: { x: weekGrid.x, y: 0 },
        data: { weeks: weekGrid.weeks, rowHeight: weekGrid.rowHeight, gridWidth: weekGrid.gridWidth },
        draggable: false,
        selectable: false,
        focusable: false,
        style: { zIndex: -1 },
      });
    }

    result.push(...positioned.map((nd) => {
      const saved = dragOffsets.current[nd.id];
      const pos = saved?.abs
        ? { x: saved.x, y: saved.y }
        : { x: nd.position.x + (saved?.x || 0), y: nd.position.y + (saved?.y || 0) };
      const nodeData = {
        ...nd.data,
        _expanded: expandedSet.has(nd.id),
        _onToggle: onToggle,
        ...(editMode ? { _onDelete: handleDeleteNode, _onResize: handleResizeNode, _onResizeWidth: handleResizeWidth } : {}),
        _customHeight: nd._originalBaseHeight ? nd.baseHeight : undefined,
        _baseHeight: nd.baseHeight || nd._spanHeight || 150,
        _customWidth: nd.baseWidth || undefined,
        _spanHeight: nd._spanHeight,
        _notes: nodeNotes[nd.id] || '',
        _editMode: editMode,
        _onNotesChange: handleNotesChange,
      };
      return {
        id: nd.id,
        type: 'stage',
        position: pos,
        data: nodeData,
        draggable: editMode,
      };
    }));

    // Side node (writeback, etc.)
    if (sideNode) {
      const anchorNode = positioned[sideNodeYIndex] || positioned[positioned.length - 1];
      const savedSide = dragOffsets.current[sideNode.id];
      const sidePos = savedSide?.abs
        ? { x: savedSide.x, y: savedSide.y }
        : { x: anchorNode.position.x + 470 + (savedSide?.x || 0), y: anchorNode.position.y + (savedSide?.y || 0) };
      result.push({
        id: sideNode.id,
        type: 'stage',
        position: sidePos,
        draggable: editMode,
        data: {
          ...sideNode.data,
          _expanded: expandedSet.has(sideNode.id),
          _onToggle: onToggle,
          ...(editMode ? { _onDelete: handleDeleteNode, _onResize: handleResizeNode, _onResizeWidth: handleResizeWidth } : {}),
          _baseHeight: 150,
          _notes: nodeNotes[sideNode.id] || '',
          _editMode: editMode,
          _onNotesChange: handleNotesChange,
        },
      });
    }

    // Extra static nodes (thought bubbles, etc.)
    if (extraNodes) {
      for (const en of extraNodes) {
        const anchorNode = positioned.find((n) => n.id === en.anchorId) || positioned[0];
        const savedExtra = dragOffsets.current[en.id];
        const extraPos = savedExtra?.abs
          ? { x: savedExtra.x, y: savedExtra.y }
          : {
              x: anchorNode.position.x + (en.offsetX || 420) + (savedExtra?.x || 0),
              y: anchorNode.position.y + (en.offsetY || 0) + (savedExtra?.y || 0),
            };
        result.push({
          id: en.id,
          type: en.type || 'thoughtBubble',
          position: extraPos,
          data: en.data,
          draggable: true,
        });
      }
    }

    // Sticky notes
    for (const note of stickyNotes) {
      const offset = dragOffsets.current[note.id] || { x: 0, y: 0 };
      result.push({
        id: note.id,
        type: 'stickyNote',
        position: { x: note.x + offset.x, y: note.y + offset.y },
        data: {
          text: note.text,
          colorIndex: note.colorIndex,
          rotation: note.rotation,
          _editMode: editMode,
          onUpdate: editMode ? updateNoteText : undefined,
          onDelete: editMode ? deleteNote : undefined,
          onCycleColor: editMode ? cycleNoteColor : undefined,
        },
        draggable: editMode,
      });
    }

    return result;
  }, [positioned, expandedSet, onToggle, handleDeleteNode, handleResizeNode, handleResizeWidth, sideNode, sideNodeYIndex, extraNodes, stickyNotes, updateNoteText, deleteNote, cycleNoteColor, weekGrid, editMode, nodeNotes, handleNotesChange]);

  const allEdges = useMemo(() => {
    const e = [...editorEdges];
    if (extraEdges) e.push(...extraEdges);
    return e;
  }, [editorEdges, extraEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(allEdges);

  // Sync nodes whenever expandedSet, positions, or notes change
  React.useEffect(() => {
    setNodes(buildNodes());
  }, [expandedSet, positioned, buildNodes, setNodes, stickyNotes]);

  // Sync edges when editor edges or extra edges change
  React.useEffect(() => {
    setEdges(allEdges);
  }, [allEdges, setEdges]);

  // Track which nodes the user is actively dragging (to ignore programmatic position changes)
  const activeDrags = useRef(new Set());

  // Capture drag offsets when user drags nodes
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);

    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        // Track when a real user drag starts
        if (change.dragging === true) {
          activeDrags.current.add(change.id);
        }
        // Only store offset on drag END for nodes the user actually dragged
        if (change.dragging === false && activeDrags.current.has(change.id)) {
          activeDrags.current.delete(change.id);

          const noteMatch = stickyNotes.find((n) => n.id === change.id);
          if (noteMatch) {
            setStickyNotes((prev) => prev.map((n) =>
              n.id === change.id ? { ...n, x: change.position.x, y: change.position.y } : n
            ));
            dragOffsets.current[change.id] = { x: 0, y: 0 };
            continue;
          }

          const nd = positioned.find((n) => n.id === change.id);
          if (nd || (sideNode && change.id === sideNode.id)) {
            dragOffsets.current[change.id] = {
              x: change.position.x,
              y: change.position.y,
              abs: true,
            };
            setHasDragChanges(true);
          } else {
            dragOffsets.current[change.id] = { x: 0, y: 0 };
          }
        }
      }
    }
  }, [onNodesChange, positioned, sideNode, sideNodeYIndex, stickyNotes]);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={editMode ? handleEdgeClick : undefined}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={snapGridY ? [20, 1] : [20, 50]}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: colors.bg }}
      >
        <Background color={colors.border} gap={50} size={1} />
        <Controls position="top-right" style={{ marginTop: 64 }} />
        <MiniMap nodeColor={() => colors.surface} maskColor={`${colors.bg}cc`} position="bottom-right" style={{ marginBottom: 48 }} />
      </ReactFlow>

      {/* View/Edit toolbar */}
      <div className="editor-toolbar">
        <button
          onClick={() => setEditMode((m) => !m)}
          className={`toolbar-btn ${editMode ? 'toolbar-btn-active' : ''}`}
          title={editMode ? 'Switch to view mode' : 'Switch to edit mode'}
          style={editMode ? { borderColor: colors.amber, color: colors.amber } : {}}
        >
          {editMode ? '✎ Editing' : '✎ Edit'}
        </button>
        <button onClick={() => setPresenting(true)} className="toolbar-btn" title="Start presentation walkthrough" style={{ borderColor: '#a78bfa', color: '#a78bfa' }}>&#9654; Present</button>
        {editMode && (
          <>
            <button onClick={addNote} className="toolbar-btn" title="Add a sticky note">+ Note</button>
            <button onClick={() => { setInsertEdgeCtx(null); setShowAddModal(true); }} className="toolbar-btn toolbar-btn-primary" title="Add a new step to the flow">+ Step</button>
            {hasDragChanges && (
              <button onClick={handleSaveLayout} className="toolbar-btn" title="Save current layout positions" style={{ borderColor: colors.emerald, color: colors.emerald }}>Save Layout</button>
            )}
            {(editorHasEdits || hasDragChanges) && (
              <button onClick={() => { editorReset(); localStorage.removeItem(dragKey); dragOffsets.current = {}; setHasDragChanges(false); }} className="toolbar-btn toolbar-btn-danger" title="Reset all edits back to defaults">Reset All</button>
            )}
          </>
        )}
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <AddNodeModal
          onSave={handleAddNodeSave}
          onCancel={() => { setShowAddModal(false); setInsertEdgeCtx(null); }}
        />
      )}

      {/* Presentation Mode Overlay */}
      {presenting && <PresentationMode nodes={nodes} onExit={() => setPresenting(false)} nodeNotes={nodeNotes} onNotesChange={handleNotesChange} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PRESENTATION MODE — spotlight walkthrough of flow steps
   ═══════════════════════════════════════════════════════════════════════ */
function PresentationMode({ nodes, onExit, nodeNotes, onNotesChange }) {
  // Filter to only stage-type nodes (skip grid, notes, bubbles)
  const steps = useMemo(() => nodes.filter((n) => n.type === 'stage'), [nodes]);
  const [editingNotes, setEditingNotes] = useState(false);
  const [idx, setIdx] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(8);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  const step = steps[idx] || {};
  const prevStep = steps[idx - 1];
  const nextStep = steps[idx + 1];
  const currentNotes = (nodeNotes && step.id) ? (nodeNotes[step.id] || '') : '';

  // Reset editing state when navigating
  useEffect(() => { setEditingNotes(false); }, [idx]);

  // Auto-play timer
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setIdx((i) => (i < steps.length - 1 ? i + 1 : (setAutoPlay(false), i)));
    }, speed * 1000);
    return () => clearInterval(timer);
  }, [autoPlay, speed, steps.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      // Don't intercept keys when typing in notes textarea
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, steps.length - 1)); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === ' ') { e.preventDefault(); setAutoPlay((p) => !p); }
      else if (e.key === 'Escape') { if (isFullscreen) { document.exitFullscreen?.(); setIsFullscreen(false); } else onExit(); }
      else if (e.key === 'f' || e.key === 'F') {
        if (!isFullscreen) { containerRef.current?.requestFullscreen?.(); setIsFullscreen(true); }
        else { document.exitFullscreen?.(); setIsFullscreen(false); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [steps.length, onExit, isFullscreen]);

  // Listen for fullscreen exit via ESC (browser native)
  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const renderCard = (nodeData, scale, opacity) => {
    if (!nodeData) return null;
    const d = nodeData.data || {};
    const accent = d.accentColor || colors.blue;
    const glow = d.glowColor || `${accent}15`;
    return (
      <div style={{
        width: scale > 0.9 ? 340 : 220, transform: `scale(${scale})`, opacity,
        background: colors.surface, border: `1.5px solid ${scale > 0.9 ? accent : colors.border}`,
        borderRadius: 14, overflow: 'hidden', transition: 'all 0.4s ease',
        boxShadow: scale > 0.9 ? `0 0 40px ${glow}, 0 8px 32px rgba(0,0,0,0.4)` : '0 2px 12px rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        <div style={{ padding: scale > 0.9 ? '20px 22px' : '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: scale > 0.9 ? 12 : 6 }}>
            <div style={{ width: scale > 0.9 ? 40 : 28, height: scale > 0.9 ? 40 : 28, borderRadius: 8, background: glow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {d.icon || d.iconKey && icons[d.iconKey] || null}
            </div>
            <div>
              <div style={{ fontSize: scale > 0.9 ? 11 : 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
                {d.stageLabel}
              </div>
              <div style={{ fontSize: scale > 0.9 ? 18 : 11, fontWeight: 600, color: colors.text, marginTop: 2 }}>
                {d.title}
              </div>
            </div>
          </div>
          {d.badge && scale > 0.9 && (
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: `${accent}22`, color: accent, marginBottom: 8 }}>
              {d.badge}
            </span>
          )}
          {d.summary && scale > 0.9 && (
            <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginTop: 8 }}>
              {d.summary}
            </div>
          )}
        </div>
      </div>
    );
  };

  const d = step.data || {};

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: colors.bg,
      display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Top bar: progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px', gap: 12 }}>
        <span style={{ fontSize: 12, color: colors.textDim }}>
          {idx + 1} of {steps.length}
        </span>
        <div style={{ width: 200, height: 4, background: colors.border, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${((idx + 1) / steps.length) * 100}%`, height: '100%', background: colors.blue, borderRadius: 2, transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Controls: top-right */}
      <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', gap: 6, zIndex: 10 }}>
        <button onClick={() => setAutoPlay((p) => !p)} style={{
          width: 34, height: 34, borderRadius: 8, background: autoPlay ? `${colors.blue}22` : colors.surfaceHover,
          border: `1px solid ${autoPlay ? colors.blue + '55' : colors.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: autoPlay ? colors.blue : colors.textMuted, fontSize: 16,
        }} title={autoPlay ? 'Pause auto-play (Space)' : 'Start auto-play (Space)'}>
          {autoPlay ? '⏸' : '▶'}
        </button>
        {autoPlay && (
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} style={{
            height: 34, borderRadius: 8, background: colors.surfaceHover, border: `1px solid ${colors.border}`,
            color: colors.textMuted, fontSize: 11, padding: '0 8px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
          }}>
            <option value={5}>5s</option>
            <option value={8}>8s</option>
            <option value={12}>12s</option>
            <option value={20}>20s</option>
            <option value={30}>30s</option>
          </select>
        )}
        <button onClick={() => {
          if (!isFullscreen) { containerRef.current?.requestFullscreen?.(); setIsFullscreen(true); }
          else { document.exitFullscreen?.(); setIsFullscreen(false); }
        }} style={{
          width: 34, height: 34, borderRadius: 8, background: colors.surfaceHover,
          border: `1px solid ${colors.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.textMuted, fontSize: 14,
        }} title="Toggle fullscreen (F)">
          {isFullscreen ? '⊡' : '⛶'}
        </button>
        <button onClick={onExit} style={{
          width: 34, height: 34, borderRadius: 8, background: colors.surfaceHover,
          border: `1px solid ${colors.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.rose, fontSize: 16, fontWeight: 700,
        }} title="Exit presentation (Esc)">
          ✕
        </button>
      </div>

      {/* Spotlight area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, padding: '0 40px', minHeight: 0 }}>
        {renderCard(prevStep, 0.8, 0.25)}
        {renderCard(step, 1.05, 1)}
        {renderCard(nextStep, 0.8, 0.25)}
      </div>

      {/* Speaker notes + editable notes */}
      <div style={{ padding: '16px 40px 20px', maxHeight: '35vh', overflow: 'auto' }}>
        <div style={{
          background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 12,
          padding: '16px 24px', maxWidth: 700, margin: '0 auto',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: colors.textDim, marginBottom: 8 }}>
            Speaker notes
          </div>
          <div style={{ fontSize: 14, color: colors.text, lineHeight: 1.7 }}>
            {d.summary || 'No notes for this step.'}
          </div>
          {d.details && d.details.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
              {d.details.map((detail, di) => (
                <div key={di} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, color: colors.text }}>{detail.heading}: </span>
                  {detail.items ? detail.items.join(' · ') : ''}
                </div>
              ))}
            </div>
          )}

          {/* Editable notes */}
          {onNotesChange && (
            <div style={{ marginTop: 14, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${d.accentColor || colors.blue}99` }}>
                  Your Notes
                </span>
                {!editingNotes && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    style={{
                      background: 'none', border: `1px solid ${colors.border}`, borderRadius: 6,
                      cursor: 'pointer', fontSize: 11, color: colors.textDim, padding: '3px 10px',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {currentNotes ? '✎ Edit' : '+ Add Note'}
                  </button>
                )}
              </div>
              {editingNotes ? (
                <div>
                  <textarea
                    autoFocus
                    defaultValue={currentNotes}
                    onBlur={(e) => { onNotesChange(step.id, e.target.value); setEditingNotes(false); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') { onNotesChange(step.id, e.target.value); setEditingNotes(false); }
                    }}
                    style={{
                      width: '100%', minHeight: 70, maxHeight: 150, background: `${colors.bg}88`,
                      border: `1px solid ${colors.border}`, borderRadius: 8,
                      outline: 'none', resize: 'vertical', fontFamily: "'Inter', sans-serif",
                      fontSize: 13, lineHeight: 1.6, color: colors.text, padding: '8px 12px',
                    }}
                    placeholder="Add notes for this step..."
                  />
                  <div style={{ fontSize: 10, color: colors.textDim, marginTop: 4 }}>
                    Click outside or press Esc to save
                  </div>
                </div>
              ) : currentNotes ? (
                <div
                  onDoubleClick={() => setEditingNotes(true)}
                  style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, whiteSpace: 'pre-wrap', cursor: 'text' }}
                >
                  {currentNotes}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      <div style={{ position: 'absolute', bottom: '50%', left: 16, transform: 'translateY(50%)' }}>
        <button onClick={() => setIdx((i) => Math.max(i - 1, 0))} disabled={idx === 0} style={{
          width: 44, height: 44, borderRadius: '50%', background: colors.surfaceHover,
          border: `1px solid ${colors.border}`, cursor: idx === 0 ? 'default' : 'pointer',
          opacity: idx === 0 ? 0.3 : 1, color: colors.textMuted, fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>◂</button>
      </div>
      <div style={{ position: 'absolute', bottom: '50%', right: 16, transform: 'translateY(50%)' }}>
        <button onClick={() => setIdx((i) => Math.min(i + 1, steps.length - 1))} disabled={idx >= steps.length - 1} style={{
          width: 44, height: 44, borderRadius: '50%', background: colors.surfaceHover,
          border: `1px solid ${colors.border}`, cursor: idx >= steps.length - 1 ? 'default' : 'pointer',
          opacity: idx >= steps.length - 1 ? 0.3 : 1, color: colors.textMuted, fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>▸</button>
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: 'absolute', bottom: 8, right: 16, fontSize: 10, color: colors.textDim,
        display: 'flex', gap: 12,
      }}>
        <span>← → navigate</span>
        <span>Space pause/play</span>
        <span>F fullscreen</span>
        <span>Esc exit</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   GLOBAL CSS
   ═══════════════════════════════════════════════════════════════════════ */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .react-flow__attribution { display: none !important; }
  .react-flow__controls { background: ${colors.surface} !important; border: 1px solid ${colors.border} !important; border-radius: 8px !important; overflow: hidden; }
  .react-flow__controls-button { background: ${colors.surface} !important; fill: ${colors.textMuted} !important; border-bottom: 1px solid ${colors.border} !important; }
  .react-flow__controls-button:hover { background: ${colors.surfaceHover} !important; fill: ${colors.text} !important; }
  .react-flow__minimap { background: ${colors.surface} !important; border: 1px solid ${colors.border} !important; border-radius: 8px !important; }

  .header-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: ${colors.surface}ee; backdrop-filter: blur(12px);
    border-bottom: 1px solid ${colors.border};
    padding: 12px 24px; display: flex; align-items: center; gap: 16px;
    font-family: 'Inter', sans-serif;
  }
  .header-bar h1 { font-size: 16px; font-weight: 700; color: ${colors.text}; margin: 0; }
  .header-bar .subtitle { font-size: 12px; color: ${colors.textMuted}; margin: 0; }

  .tab-bar {
    display: flex; gap: 4px; margin-left: auto; align-items: center;
  }
  .tab-btn {
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
    padding: 6px 14px; border-radius: 6px; border: 1px solid ${colors.border};
    background: transparent; color: ${colors.textMuted}; cursor: pointer;
    transition: all 0.15s ease;
  }
  .tab-btn:hover { background: ${colors.surfaceHover}; color: ${colors.text}; }
  .tab-btn.active { background: ${colors.blue}22; color: ${colors.blue}; border-color: ${colors.blue}55; }

  .dropdown-wrap {
    position: relative;
  }
  .dropdown-menu {
    position: absolute; top: calc(100% + 4px); left: 0; z-index: 200;
    background: ${colors.surface}; border: 1px solid ${colors.border}; border-radius: 8px;
    padding: 4px; min-width: 220; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    font-family: 'Inter', sans-serif;
  }
  .dropdown-item {
    display: block; width: 100%; text-align: left;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    padding: 8px 12px; border-radius: 6px; border: none;
    background: transparent; color: ${colors.textMuted}; cursor: pointer;
    transition: all 0.12s ease;
  }
  .dropdown-item:hover { background: ${colors.surfaceHover}; color: ${colors.text}; }
  .dropdown-item.active { color: ${colors.blue}; background: ${colors.blue}11; }
  .dropdown-item.disabled { opacity: 0.4; cursor: not-allowed; }
  .dropdown-item.disabled:hover { background: transparent; color: ${colors.textMuted}; }

  .legend {
    position: fixed; bottom: 16px; left: 16px; z-index: 100;
    background: ${colors.surface}ee; backdrop-filter: blur(12px);
    border: 1px solid ${colors.border}; border-radius: 10px;
    padding: 12px 16px; font-family: 'Inter', sans-serif; font-size: 11px; color: ${colors.textMuted};
  }
  .legend-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${colors.textDim}; margin-bottom: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .info-hint {
    position: fixed; bottom: 16px; right: 16px; z-index: 100;
    background: ${colors.surface}cc; backdrop-filter: blur(12px);
    border: 1px solid ${colors.border}; border-radius: 8px;
    padding: 8px 14px; font-family: 'Inter', sans-serif; font-size: 11px; color: ${colors.textDim};
  }

  .editor-toolbar {
    position: fixed; top: 60px; right: 60px; z-index: 100;
    display: flex; flex-direction: column; gap: 6px; align-items: flex-end;
  }
  .toolbar-btn {
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
    padding: 8px 16px; border-radius: 8px;
    border: 1px solid ${colors.border};
    background: ${colors.surface}ee; backdrop-filter: blur(12px);
    color: ${colors.textMuted}; cursor: pointer;
    transition: all 0.15s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .toolbar-btn:hover {
    background: ${colors.surfaceHover}; color: ${colors.text}; border-color: ${colors.textDim};
  }
  .toolbar-btn-primary {
    background: ${colors.blue}22; color: ${colors.blue}; border-color: ${colors.blue}55;
  }
  .toolbar-btn-primary:hover {
    background: ${colors.blue}33; color: ${colors.blue}; border-color: ${colors.blue};
  }
  .toolbar-btn-danger {
    color: ${colors.rose}; border-color: ${colors.rose}44;
  }
  .toolbar-btn-danger:hover {
    background: ${colors.rose}22; color: ${colors.rose}; border-color: ${colors.rose};
  }
  .toolbar-btn-active {
    background: ${colors.amber}18; box-shadow: 0 0 12px ${colors.amber}33, 0 2px 8px rgba(0,0,0,0.3);
  }
  .react-flow__edge { cursor: pointer; }
  .react-flow__edge:hover .react-flow__edge-path { stroke-width: 4 !important; }
`;

/* ═══════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════
   THOUGHT BUBBLES — static callout nodes anchored to flow nodes
   ═══════════════════════════════════════════════════════════════════════ */
const designThoughtBubbles = [
  {
    id: 'thought-revisions',
    anchorId: 'b-designwork',
    offsetX: 420,
    offsetY: -10,
    type: 'thoughtBubble',
    data: {
      title: 'Design Revisions',
      accentColor: colors.purple,
      content: 'Client may request revisions during this phase. Multiple rounds of feedback are common — each revision cycle adds ~3–5 business days. The design is not locked until the client explicitly approves and the deal moves to "Design Approved."',
      handleBottom: false,
    },
  },
  {
    id: 'thought-handoff-automation',
    anchorId: 'b-handoff',
    offsetX: 420,
    offsetY: -10,
    type: 'thoughtBubble',
    data: {
      title: 'Automation Opportunity',
      accentColor: colors.emerald,
      content: 'Streamline the handoff with a predrafted client intro email. When the Production Coordinator is assigned (Step 9), n8n auto-generates an email introducing the PC to the client — pre-populated with project details, timeline, and PC contact info. Salesman reviews and sends, or it fires automatically. Eliminates scheduling delays and ensures consistent handoff communication.',
      handleBottom: false,
    },
  },
];

const designThoughtEdges = [
  {
    id: 'te-revisions',
    source: 'b-designwork',
    sourceHandle: 'right',
    target: 'thought-revisions',
    targetHandle: 'left',
    style: { stroke: `${colors.purple}44`, strokeWidth: 1.5, strokeDasharray: '4 4' },
    markerEnd: { type: MarkerType.ArrowClosed, color: `${colors.purple}44`, width: 12, height: 12 },
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   PROJECT TYPE DECISION TREE — static data
   ═══════════════════════════════════════════════════════════════════════ */

// 15 project type leaves. `weeks` values are placeholders; edit later via the UI.
const PROJECT_TYPES = [
  // Minifig-only branch (3)
  { id: 'mf-only-std', code: 'MF-STD', name: 'Minifig-Only · Standard',  weeks: 6,
    axes: { minifigOnly: true, brand: null, timeframe: 'std', minifigs: null } },
  { id: 'mf-only-exp', code: 'MF-EXP', name: 'Minifig-Only · Expedited', weeks: 4,
    axes: { minifigOnly: true, brand: null, timeframe: 'exp', minifigs: null } },
  { id: 'mf-only-ext', code: 'MF-EXT', name: 'Minifig-Only · Extended',  weeks: 8,
    axes: { minifigOnly: true, brand: null, timeframe: 'ext', minifigs: null } },

  // LEGO branch (6)
  { id: 'lego-std-none', code: 'LEGO-STD',    name: 'LEGO · Standard',                weeks: 14,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'std', minifigs: 'none' } },
  { id: 'lego-std-mf',   code: 'LEGO-STD-MF', name: 'LEGO · Standard · w/ Minifigs',  weeks: 14,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'std', minifigs: 'incl' } },
  { id: 'lego-exp-none', code: 'LEGO-EXP',    name: 'LEGO · Expedited',               weeks: 8,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'exp', minifigs: 'none' } },
  { id: 'lego-exp-mf',   code: 'LEGO-EXP-MF', name: 'LEGO · Expedited · w/ Minifigs', weeks: 8,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'exp', minifigs: 'incl' } },
  { id: 'lego-ext-none', code: 'LEGO-EXT',    name: 'LEGO · Extended',                weeks: 20,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'ext', minifigs: 'none' } },
  { id: 'lego-ext-mf',   code: 'LEGO-EXT-MF', name: 'LEGO · Extended · w/ Minifigs',  weeks: 20,
    axes: { minifigOnly: false, brand: 'lego', timeframe: 'ext', minifigs: 'incl' } },

  // Compatible branch (6)
  { id: 'compat-std-none', code: 'CMP-STD',    name: 'Compatible · Standard',                weeks: 14,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'std', minifigs: 'none' } },
  { id: 'compat-std-mf',   code: 'CMP-STD-MF', name: 'Compatible · Standard · w/ Minifigs',  weeks: 14,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'std', minifigs: 'incl' } },
  { id: 'compat-exp-none', code: 'CMP-EXP',    name: 'Compatible · Expedited',               weeks: 8,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'exp', minifigs: 'none' } },
  { id: 'compat-exp-mf',   code: 'CMP-EXP-MF', name: 'Compatible · Expedited · w/ Minifigs', weeks: 8,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'exp', minifigs: 'incl' } },
  { id: 'compat-ext-none', code: 'CMP-EXT',    name: 'Compatible · Extended',                weeks: 20,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'ext', minifigs: 'none' } },
  { id: 'compat-ext-mf',   code: 'CMP-EXT-MF', name: 'Compatible · Extended · w/ Minifigs',  weeks: 20,
    axes: { minifigOnly: false, brand: 'compat', timeframe: 'ext', minifigs: 'incl' } },
];

const PROJECT_TYPES_BY_ID = Object.fromEntries(PROJECT_TYPES.map((p) => [p.id, p]));

// Decision tree. Each non-leaf is { id, question, answers[] }.
// Each answer.next is either another node id (continue) or { leaf: '<project-type-id>' } (terminate).
const DECISION_TREE = {
  'q-mfonly': {
    id: 'q-mfonly',
    question: 'Is this a minifig-only project?',
    answers: [
      { label: 'Yes', value: 'yes', next: 'q-mfonly-time' },
      { label: 'No',  value: 'no',  next: 'q-brand' },
    ],
  },
  'q-mfonly-time': {
    id: 'q-mfonly-time',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: { leaf: 'mf-only-std' } },
      { label: 'Expedited', value: 'exp', next: { leaf: 'mf-only-exp' } },
      { label: 'Extended',  value: 'ext', next: { leaf: 'mf-only-ext' } },
    ],
  },
  'q-brand': {
    id: 'q-brand',
    question: 'Which brand?',
    answers: [
      { label: 'LEGO',       value: 'lego',   next: 'q-time-lego' },
      { label: 'Compatible', value: 'compat', next: 'q-time-compat' },
    ],
  },
  'q-time-lego': {
    id: 'q-time-lego',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: 'q-mf-lego-std' },
      { label: 'Expedited', value: 'exp', next: 'q-mf-lego-exp' },
      { label: 'Extended',  value: 'ext', next: 'q-mf-lego-ext' },
    ],
  },
  'q-time-compat': {
    id: 'q-time-compat',
    question: 'What timeframe?',
    answers: [
      { label: 'Standard',  value: 'std', next: 'q-mf-compat-std' },
      { label: 'Expedited', value: 'exp', next: 'q-mf-compat-exp' },
      { label: 'Extended',  value: 'ext', next: 'q-mf-compat-ext' },
    ],
  },
  'q-mf-lego-std':   { id: 'q-mf-lego-std',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-std-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-std-mf' } } ] },
  'q-mf-lego-exp':   { id: 'q-mf-lego-exp',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-exp-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-exp-mf' } } ] },
  'q-mf-lego-ext':   { id: 'q-mf-lego-ext',   question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'lego-ext-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'lego-ext-mf' } } ] },
  'q-mf-compat-std': { id: 'q-mf-compat-std', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-std-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-std-mf' } } ] },
  'q-mf-compat-exp': { id: 'q-mf-compat-exp', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-exp-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-exp-mf' } } ] },
  'q-mf-compat-ext': { id: 'q-mf-compat-ext', question: 'Will the project include minifigs?',
    answers: [ { label: 'No minifigs', value: 'none', next: { leaf: 'compat-ext-none' } },
               { label: 'With minifigs', value: 'incl', next: { leaf: 'compat-ext-mf' } } ] },
};

const DECISION_TREE_ROOT = 'q-mfonly';

/**
 * Walk the decision tree along the given answer path.
 * Returns:
 *   - { kind: 'question', node, depth, chain }   when the path stops at a question waiting to be answered
 *   - { kind: 'leaf',     leaf,  depth, chain }  when the path ends at a project-type leaf
 * `chain` is the ordered list of { node, answeredValue } entries traversed (including the active one).
 */
function walkTree(tree, root, path) {
  const chain = [];
  let currentId = root;
  let depth = 0;
  while (currentId) {
    const node = tree[currentId];
    const answerValue = path[depth];
    chain.push({ node, answeredValue: answerValue });
    if (answerValue === undefined) {
      return { kind: 'question', node, depth, chain };
    }
    const answer = node.answers.find((a) => a.value === answerValue);
    if (!answer) {
      // Stale path (e.g., catalog changed) — treat as if not yet answered.
      chain[chain.length - 1].answeredValue = undefined;
      return { kind: 'question', node, depth, chain };
    }
    if (typeof answer.next === 'string') {
      currentId = answer.next;
      depth += 1;
    } else if (answer.next && answer.next.leaf) {
      const leaf = PROJECT_TYPES_BY_ID[answer.next.leaf];
      return { kind: 'leaf', leaf, depth: depth + 1, chain };
    } else {
      // Defensive: malformed tree.
      return { kind: 'question', node, depth, chain };
    }
  }
  return { kind: 'question', node: tree[root], depth: 0, chain };
}

/**
 * Owns the wizard path (array of answer values) and persists it to localStorage.
 * Returns { path, appendAnswer, rewindTo, reset }.
 */
function useProjectTypeWizard(viewId) {
  const key = `project-type-wizard-${viewId || 'default'}`;
  const [path, setPath] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      const parsed = s ? JSON.parse(s) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(path));
  }, [key, path]);

  const appendAnswer = useCallback((value) => {
    setPath((prev) => [...prev, value]);
  }, []);

  const rewindTo = useCallback((depth) => {
    // depth = number of answers to keep (0 = reset, 1 = keep Q1's answer, etc.)
    setPath((prev) => prev.slice(0, depth));
  }, []);

  const reset = useCallback(() => setPath([]), []);

  return { path, appendAnswer, rewindTo, reset };
}

const VIEW_CONFIG = {
  'design-production': {
    title: 'Design → Production Workflow',
    subtitle: 'Full lifecycle from design request to production',
    dropdownLabel: 'Design → Production',
  },
  production: {
    title: 'Production Workflow',
    subtitle: 'Post-handoff through shipping and delivery',
    dropdownLabel: 'Production',
  },
  technical: {
    title: 'Stage 2: n8n Technical Flow',
    subtitle: 'HubSpot Deal → Teamwork Project Sync (Automation A)',
  },
};

export default function App() {
  const [activeView, setActiveView] = useState('design-production');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const technicalNodes = useMemo(() => buildTechnicalNodeData(), []);
  const businessNodes = useMemo(() => buildBusinessNodeData(), []);
  const businessEdges = useMemo(() => buildBusinessEdges(), []);
  const prodNodes = useMemo(() => buildProductionNodeData(), []);

  const isBusiness = activeView === 'design-production' || activeView === 'production';
  const cfg = VIEW_CONFIG[activeView];

  return (
    <div style={{ width: '100%', height: '100%', background: colors.bg }}>
      <style>{globalCSS}</style>

      {/* header */}
      <div className="header-bar">
        <div>
          <h1>Brava Brands — {cfg.title}</h1>
          <p className="subtitle">{cfg.subtitle}</p>
        </div>
        <div className="tab-bar">
          {/* Business Overview dropdown */}
          <div className="dropdown-wrap" ref={dropdownRef}>
            <button
              className={`tab-btn ${isBusiness ? 'active' : ''}`}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              Business Overview
              <span style={{ marginLeft: 6, fontSize: 9, opacity: 0.7 }}>▼</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <button
                  className={`dropdown-item ${activeView === 'design-production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('design-production'); setDropdownOpen(false); }}
                >
                  Design → Production
                </button>
                <button
                  className={`dropdown-item ${activeView === 'production' ? 'active' : ''}`}
                  onClick={() => { setActiveView('production'); setDropdownOpen(false); }}
                >
                  Production
                </button>
              </div>
            )}
          </div>
          <button className={`tab-btn ${activeView === 'technical' ? 'active' : ''}`} onClick={() => { setActiveView('technical'); setDropdownOpen(false); }}>
            Technical Flow
          </button>
        </div>
      </div>

      {/* flow views */}
      <div style={{ width: '100%', height: '100%' }}>
        {activeView === 'technical' ? (
          <FlowView
            key="technical"
            viewId="technical"
            nodeDataList={technicalNodes}
            edgeList={technicalEdges}
            sideNode={writebackNodeData}
            sideNodeYIndex={3}
            xCenter={400}
          />
        ) : activeView === 'design-production' ? (
          <FlowView
            key="design-production"
            viewId="design-production"
            nodeDataList={businessNodes}
            edgeList={businessEdges}
            sideNode={null}
            sideNodeYIndex={0}
            xCenter={400}
            extraNodes={designThoughtBubbles}
            extraEdges={designThoughtEdges}
          />
        ) : (
          <FlowView
            key="production"
            viewId="production"
            nodeDataList={prodNodes}
            edgeList={productionEdges}
            sideNode={null}
            sideNodeYIndex={0}
            xCenter={400}
            positionFn={computeProductionPositions}
            snapGridY={WEEK_HEIGHT}
            weekGrid={{ x: -550, weeks: PROD_WEEKS, rowHeight: WEEK_HEIGHT, gridWidth: 1300 }}
          />
        )}
      </div>

      {/* legend */}
      {activeView === 'technical' ? (
        <div className="legend">
          <div className="legend-title">Stage Colors</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.orange }} />Trigger & Gate</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.blue }} />HubSpot API Read</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.purple }} />Designer Rotation (LRU)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.green }} />Project Creation (TW)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.cyan }} />Task Assignment (fan-out)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.rose }} />HubSpot Writeback (parallel)</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.amber }} />Design Brief Comment</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item"><div style={{ width: 20, height: 2, background: colors.textDim, flexShrink: 0 }} />Sequential flow</div>
            <div className="legend-item"><div style={{ width: 20, height: 0, borderTop: `2px dashed ${colors.rose}`, flexShrink: 0 }} />Parallel branch</div>
          </div>
        </div>
      ) : activeView === 'production' ? (
        <div className="legend">
          <div className="legend-title">Roles</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.sky }} />Procurement</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.amber }} />Brick Designer</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.pink }} />Graphic Designer</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.orange }} />Production Coordinator</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: '#94a3b8' }} />Supplier / Factory</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item"><div style={{ width: 20, height: 2, background: colors.textDim, flexShrink: 0 }} />Sequential flow</div>
            <div className="legend-item"><div style={{ width: 20, height: 0, borderTop: `2px dashed #94a3b8`, flexShrink: 0 }} />Background process</div>
          </div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.pink}22`, color: colors.pink }}>CLIENT APPROVAL</span>
              Requires client sign-off
            </div>
          </div>
        </div>
      ) : (
        <div className="legend">
          <div className="legend-title">Step Types</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.blue }} />HubSpot</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.purple }} />Teamwork</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.indigo }} />DocuSign</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.sky }} />QuickBooks</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.green }} />Approval / Manual</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.pink }} />Data Entry</div>
          <div className="legend-item"><div className="legend-dot" style={{ background: colors.lime }} />Production</div>
          <div style={{ marginTop: 8, borderTop: `1px solid ${colors.border}`, paddingTop: 8 }}>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.orange}22`, color: colors.orange }}>AUTO</span>
              Automated step
            </div>
            <div className="legend-item">
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${colors.green}22`, color: colors.green }}>MANUAL</span>
              Human action required
            </div>
          </div>
        </div>
      )}

      {/* hint */}
      <div className="info-hint">Click any stage to expand details</div>
    </div>
  );
}
