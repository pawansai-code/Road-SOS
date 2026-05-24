import { useState } from "react";

const tables = {
  users: {
    label: "USERS",
    color: "#0f4c81",
    accent: "#1a6db5",
    x: 320,
    y: 60,
    fields: [
      { name: "id", type: "BIGINT", pk: true, note: "auto-increment (1→∞)" },
      { name: "firebase_uid", type: "VARCHAR(128)", unique: true },
      { name: "full_name", type: "VARCHAR(255)" },
      { name: "phone_number", type: "VARCHAR(20)", unique: true },
      { name: "blood_group", type: "VARCHAR(10)" },
      { name: "medical_notes", type: "TEXT" },
      { name: "profile_image", type: "TEXT" },
      { name: "is_verified", type: "BOOLEAN" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  emergency_contacts: {
    label: "EMERGENCY_CONTACTS",
    color: "#7b2d8b",
    accent: "#a83dbd",
    x: 20,
    y: 420,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "BIGINT", fk: "users" },
      { name: "contact_name", type: "VARCHAR(255)" },
      { name: "relationship", type: "VARCHAR(100)" },
      { name: "phone_number", type: "VARCHAR(20)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  govt_emergency: {
    label: "GOVT_EMERGENCY",
    color: "#8b1a1a",
    accent: "#c42e2e",
    x: 680,
    y: 60,
    fields: [
      { name: "id", type: "SERIAL", pk: true },
      { name: "service_name", type: "VARCHAR(255)", unique: true },
      { name: "service_number", type: "VARCHAR(20)" },
    ],
    seeded: [
      { name: "Police", number: "100" },
      { name: "Fire & Rescue", number: "101" },
      { name: "Ambulance", number: "108" },
      { name: "Women Helpline", number: "1091" },
      { name: "Child Line", number: "1098" },
    ],
  },
  emergency_services: {
    label: "EMERGENCY_SERVICES",
    color: "#1a6b4a",
    accent: "#27a06e",
    x: 640,
    y: 380,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "service_name", type: "VARCHAR(255)" },
      { name: "service_type", type: "ENUM(POLICE,MEDICAL)" },
      { name: "phone_number", type: "VARCHAR(20)" },
      { name: "latitude", type: "NUMERIC(10,7)" },
      { name: "longitude", type: "NUMERIC(10,7)" },
      { name: "address", type: "TEXT" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  sos_incidents: {
    label: "SOS_INCIDENTS",
    color: "#7a4a00",
    accent: "#c07800",
    x: 290,
    y: 390,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "BIGINT", fk: "users" },
      { name: "incident_type", type: "ENUM(MEDICAL,POLICE)" },
      { name: "latitude", type: "NUMERIC(10,7)" },
      { name: "longitude", type: "NUMERIC(10,7)" },
      { name: "maps_link", type: "TEXT" },
      { name: "routed_service_id", type: "UUID", fk: "emergency_services" },
      { name: "routed_phone_number", type: "VARCHAR(20)" },
      { name: "incident_status", type: "ENUM(PENDING…COMPLETED)" },
      { name: "device_battery", type: "SMALLINT" },
      { name: "network_type", type: "VARCHAR(20)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  sos_event_logs: {
    label: "SOS_EVENT_LOGS",
    color: "#2d4a7a",
    accent: "#4a78c4",
    x: 290,
    y: 730,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "incident_id", type: "UUID", fk: "sos_incidents" },
      { name: "event_type", type: "ENUM(SOS_CREATED…)" },
      { name: "event_message", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
};

const ROW_H = 22;
const HEADER_H = 34;
const PAD = 12;
const COL_W = 240;

function tableHeight(t) {
  return HEADER_H + PAD + t.fields.length * ROW_H + PAD + (t.seeded ? t.seeded.length * 18 + 28 : 0);
}

const relationships = [
  { from: "emergency_contacts", fromField: "user_id", to: "users", toField: "id", type: "N:1" },
  { from: "sos_incidents", fromField: "user_id", to: "users", toField: "id", type: "N:1" },
  { from: "sos_incidents", fromField: "routed_service_id", to: "emergency_services", toField: "id", type: "N:1" },
  { from: "sos_event_logs", fromField: "incident_id", to: "sos_incidents", toField: "id", type: "N:1" },
];

function fieldY(tableKey, fieldName, side) {
  const t = tables[tableKey];
  const idx = t.fields.findIndex((f) => f.name === fieldName);
  return t.y + HEADER_H + PAD + idx * ROW_H + ROW_H / 2;
}

function fieldX(tableKey, side) {
  const t = tables[tableKey];
  return side === "left" ? t.x : t.x + COL_W;
}

function getConnectorPoints(rel) {
  const fromT = tables[rel.from];
  const toT = tables[rel.to];

  const fy = fieldY(rel.from, rel.fromField);
  const ty = fieldY(rel.to, rel.toField);

  const fromRight = fromT.x + COL_W;
  const fromLeft = fromT.x;
  const toRight = toT.x + COL_W;
  const toLeft = toT.x;

  let fx, tx, side;
  if (fromT.x > toT.x + COL_W) {
    fx = fromLeft; tx = toRight; side = "left-right";
  } else if (toT.x > fromT.x + COL_W) {
    fx = fromRight; tx = toLeft; side = "right-left";
  } else if (fromT.x < toT.x) {
    fx = fromRight; tx = toLeft; side = "right-left";
  } else {
    fx = fromLeft; tx = toRight; side = "left-right";
  }

  const midX = (fx + tx) / 2;
  return `M ${fx} ${fy} C ${midX} ${fy}, ${midX} ${ty}, ${tx} ${ty}`;
}

function Table({ tableKey, onHover, hovered }) {
  const t = tables[tableKey];
  const h = tableHeight(t);
  const isHov = hovered === tableKey;

  return (
    <g transform={`translate(${t.x}, ${t.y})`} style={{ filter: isHov ? `drop-shadow(0 0 10px ${t.accent}88)` : "none" }}>
      {/* Shadow */}
      <rect x={4} y={4} width={COL_W} height={h} rx={8} fill="#00000066" />
      {/* Body */}
      <rect width={COL_W} height={h} rx={8} fill="#0d1117" stroke={t.accent} strokeWidth={isHov ? 2 : 1.5} />
      {/* Header */}
      <rect width={COL_W} height={HEADER_H} rx={8} fill={t.color} />
      <rect y={HEADER_H - 8} width={COL_W} height={8} fill={t.color} />

      <text x={COL_W / 2} y={HEADER_H / 2 + 6} textAnchor="middle" fill="white" fontFamily="'Courier New', monospace" fontWeight="bold" fontSize={11} letterSpacing="1">
        {t.label}
      </text>

      {t.fields.map((f, i) => {
        const y = HEADER_H + PAD + i * ROW_H;
        const isFk = !!f.fk;
        const isPk = !!f.pk;
        return (
          <g key={f.name} transform={`translate(0, ${y})`}>
            {(isPk || isFk) && (
              <rect x={6} y={2} width={COL_W - 12} height={ROW_H - 4} rx={3} fill={isPk ? `${t.color}55` : `${t.color}30`} />
            )}
            <text x={10} y={ROW_H / 2 + 5} fill={isPk ? "#ffd700" : isFk ? "#88ccff" : "#b0bec5"} fontFamily="'Courier New', monospace" fontSize={10} fontWeight={isPk || isFk ? "bold" : "normal"}>
              {isPk ? "🔑 " : isFk ? "🔗 " : "   "}{f.name}
            </text>
            <text x={COL_W - 8} y={ROW_H / 2 + 5} textAnchor="end" fill={t.accent} fontFamily="'Courier New', monospace" fontSize={9} opacity={0.8}>
              {f.type}
            </text>
            {f.note && (
              <text x={10} y={ROW_H} fill="#aaaaaa" fontFamily="'Courier New', monospace" fontSize={8} fontStyle="italic">
                ↳ {f.note}
              </text>
            )}
          </g>
        );
      })}

      {t.seeded && (
        <>
          <line x1={8} y1={HEADER_H + PAD + t.fields.length * ROW_H + 6} x2={COL_W - 8} y2={HEADER_H + PAD + t.fields.length * ROW_H + 6} stroke={t.accent} strokeWidth={0.5} strokeDasharray="3,3" />
          <text x={COL_W / 2} y={HEADER_H + PAD + t.fields.length * ROW_H + 20} textAnchor="middle" fill={t.accent} fontFamily="'Courier New', monospace" fontSize={9} opacity={0.7}>
            — SEEDED DATA —
          </text>
          {t.seeded.map((s, i) => (
            <g key={s.name} transform={`translate(0, ${HEADER_H + PAD + t.fields.length * ROW_H + 28 + i * 18})`}>
              <text x={14} y={12} fill="#b0bec5" fontFamily="'Courier New', monospace" fontSize={9}>
                {s.name}
              </text>
              <text x={COL_W - 8} y={12} textAnchor="end" fill={t.accent} fontFamily="'Courier New', monospace" fontSize={9} fontWeight="bold">
                {s.number}
              </text>
            </g>
          ))}
        </>
      )}

      {/* Hover target */}
      <rect width={COL_W} height={h} rx={8} fill="transparent" onMouseEnter={() => onHover(tableKey)} onMouseLeave={() => onHover(null)} style={{ cursor: "pointer" }} />
    </g>
  );
}

export default function ERDiagram() {
  const [hovered, setHovered] = useState(null);
  const [hovRel, setHovRel] = useState(null);

  const SVG_W = 980;
  const SVG_H = 1000;

  const relColors = ["#4a78c4", "#a83dbd", "#c07800", "#27a06e"];

  return (
    <div style={{ background: "#060a0f", minHeight: "100vh", padding: "24px", fontFamily: "'Courier New', monospace" }}>
      <div style={{ maxWidth: 1020, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#4a78c4", textTransform: "uppercase", marginBottom: 6 }}>
            Emergency SOS Application
          </div>
          <h1 style={{ color: "white", margin: 0, fontSize: 26, fontWeight: "bold", letterSpacing: 2 }}>
            Entity Relationship Diagram
          </h1>
          <div style={{ color: "#555", fontSize: 10, marginTop: 8, letterSpacing: 2 }}>
            PostgreSQL Schema · 5 Tables · Sequential User IDs
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { icon: "🔑", label: "Primary Key", color: "#ffd700" },
            { icon: "🔗", label: "Foreign Key", color: "#88ccff" },
            { icon: "→", label: "N:1 Relationship", color: "#4a78c4" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: l.color, background: "#0d1117", border: `1px solid ${l.color}44`, borderRadius: 4, padding: "4px 10px" }}>
              <span>{l.icon}</span><span>{l.label}</span>
            </div>
          ))}
        </div>

        {/* SVG Canvas */}
        <div style={{ background: "#0d1117", borderRadius: 12, border: "1px solid #1e2a3a", overflow: "auto" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", minWidth: 780 }}>
            <defs>
              {relColors.map((c, i) => (
                <marker key={i} id={`arrow-${i}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L8,3 z" fill={c} opacity={0.9} />
                </marker>
              ))}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Grid dots */}
            {Array.from({ length: 40 }, (_, r) =>
              Array.from({ length: 50 }, (_, c) => (
                <circle key={`${r}-${c}`} cx={c * 20} cy={r * 25} r={0.5} fill="#1e2a3a" />
              ))
            )}

            {/* Relationship lines */}
            {relationships.map((rel, i) => {
              const isHov = hovRel === i;
              const c = relColors[i % relColors.length];
              return (
                <g key={i}>
                  <path d={getConnectorPoints(rel)} fill="none" stroke={c} strokeWidth={isHov ? 2.5 : 1.5}
                    strokeDasharray={isHov ? "none" : "6,3"} opacity={isHov ? 1 : 0.6}
                    markerEnd={`url(#arrow-${i % relColors.length})`}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={() => setHovRel(i)} onMouseLeave={() => setHovRel(null)} />
                  {isHov && (
                    <text fontSize={10} fill={c} fontFamily="'Courier New', monospace">
                      <textPath href={`#rel-path-${i}`} startOffset="50%">
                        {rel.type}
                      </textPath>
                    </text>
                  )}
                </g>
              );
            })}

            {/* Relationship type labels */}
            {relationships.map((rel, i) => {
              const fromT = tables[rel.from];
              const toT = tables[rel.to];
              const fy = fieldY(rel.from, rel.fromField);
              const ty = fieldY(rel.to, rel.toField);
              const midY = (fy + ty) / 2;
              const fromRight = fromT.x + COL_W;
              const toLeft = toT.x;
              const midX = (fromRight + toLeft) / 2;
              return (
                <g key={`lbl-${i}`}>
                  <rect x={midX - 16} y={midY - 9} width={32} height={14} rx={3} fill="#060a0f" stroke={relColors[i % relColors.length]} strokeWidth={0.5} opacity={0.9} />
                  <text x={midX} y={midY + 2} textAnchor="middle" fill={relColors[i % relColors.length]} fontSize={9} fontFamily="'Courier New', monospace" opacity={0.9}>
                    {rel.type}
                  </text>
                </g>
              );
            })}

            {/* Tables */}
            {Object.keys(tables).map((key) => (
              <Table key={key} tableKey={key} onHover={setHovered} hovered={hovered} />
            ))}
          </svg>
        </div>

        {/* Summary */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Total Tables", value: "5", color: "#4a78c4" },
            { label: "User ID Strategy", value: "BIGINT SEQUENCE", color: "#ffd700" },
            { label: "Seeded Records", value: "5 Govt Numbers", color: "#c42e2e" },
            { label: "Relationships", value: "4 FK Constraints", color: "#27a06e" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#0d1117", border: `1px solid ${s.color}33`, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
              <div style={{ color: s.color, fontSize: 18, fontWeight: "bold", letterSpacing: 1 }}>{s.value}</div>
              <div style={{ color: "#555", fontSize: 10, marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
