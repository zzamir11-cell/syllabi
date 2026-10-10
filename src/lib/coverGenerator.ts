/**
 * Dynamic Academic Note Cover Image Generator
 * Generates crisp, authentic vector note cover images (as data URLs or SVG markup)
 * featuring subject accent stripes, ruled paper lines, authentic spec formulas,
 * topic diagrams, high-yield summary callouts, and clean academic typography.
 */

import { getSubjectColor } from './academicColors';

export interface GenerateCoverOptions {
  title: string;
  subjectName: string;
  qualificationName: string;
  examBoardName: string;
  resourceType: string;
  topicName?: string;
  creatorUsername?: string;
}

export function generateNoteCoverSvg({
  title,
  subjectName,
  qualificationName,
  examBoardName,
  resourceType,
  topicName,
  creatorUsername,
}: GenerateCoverOptions): string {
  const color = getSubjectColor(subjectName);
  const safeTitle = escapeXml(title);
  const safeSubject = escapeXml(subjectName.toUpperCase());
  const safeSpec = escapeXml(`${qualificationName} • ${examBoardName}`);
  const safeType = escapeXml(resourceType.toUpperCase());
  const safeTopic = escapeXml(topicName || subjectName);
  const safeCreator = escapeXml(creatorUsername ? `@${creatorUsername}` : 'Student Notes');

  // Generate subject-specific formula or diagram preview
  const s = subjectName.toLowerCase();
  let diagramMarkup = '';

  if (s.includes('chem')) {
    diagramMarkup = `
      <!-- Chemical reaction callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="#fffbeb" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#92400e">ELECTROLYTIC CELL HALF-EQUATIONS</text>
      <text x="52" y="288" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#1c1917">Anode: 2Cl⁻(aq) → Cl₂(g) + 2e⁻  |  Cathode: Cu²⁺ + 2e⁻ → Cu(s)</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Oxidation occurs at the positive anode (loss of electrons).</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Reduction occurs at the negative cathode (gain of electrons).</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Predicting products: Least reactive cation discharges at cathode.</text>
    `;
  } else if (s.includes('bio')) {
    diagramMarkup = `
      <!-- Biology callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="#f0fdf4" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#166534">HIGH-YIELD SPECIFICATION FORMULA</text>
      <text x="52" y="288" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#1c1917">Magnification (M) = Image Size (I) / Actual Size (A)</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Double phospholipid bilayer: hydrophilic phosphate heads, hydrophobic tails.</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Active transport requires carrier proteins and hydrolysis of cellular ATP.</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Osmosis: Net movement from high water potential (Ψ) to low water potential.</text>
    `;
  } else if (s.includes('phys')) {
    diagramMarkup = `
      <!-- Physics callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="#eff6ff" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#1e40af">GOVERNING DYNAMICS &amp; SUVAT</text>
      <text x="52" y="288" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#1c1917">v² = u² + 2as  |  F = ma  |  W = Fs cos θ</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Kirchhoff's First Law: Conservation of electric charge (Σ I_in = Σ I_out).</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Resolving vectors: Horizontal F_x = F cos θ, Vertical F_y = F sin θ.</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Conservation of momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.</text>
    `;
  } else if (s.includes('math')) {
    diagramMarkup = `
      <!-- Maths callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="#f5f3ff" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#6d28d9">INTEGRATION &amp; DIFFERENTIATION RULES</text>
      <text x="52" y="288" font-family="ui-monospace, monospace" font-size="14" font-weight="600" fill="#1c1917">∫ u (dv/dx) dx = uv - ∫ v (du/dx) dx  [Parts]</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Product rule: d/dx(uv) = u(dv/dx) + v(du/dx).</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Quotient rule: d/dx(u/v) = [v(du/dx) - u(dv/dx)] / v².</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Stationary points: Solve f'(x) = 0; nature from sign of f''(x).</text>
    `;
  } else if (s.includes('lit') || s.includes('eng')) {
    diagramMarkup = `
      <!-- English Literature callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="#fff1f2" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="#9f1239">THESIS &amp; DRAMATIC CONTEXT</text>
      <text x="52" y="288" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-style="italic" fill="#1c1917">"Look like the innocent flower, but be the serpent under't."</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Hamartia: Unchecked ambition overrides moral code and natural order.</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Jacobean Context: Divine Right of Kings &amp; the Gunpowder Plot of 1605.</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Motifs: Blood as guilt ("Will all great Neptune's ocean wash this blood?").</text>
    `;
  } else {
    diagramMarkup = `
      <!-- Standard Academic callout -->
      <rect x="36" y="240" width="408" height="64" rx="8" fill="${color.lightBgHex}" stroke="${color.accentHex}40" stroke-width="1.5"/>
      <text x="52" y="264" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" font-weight="700" fill="${color.accentHex}">CORE REVISION CONCEPTS</text>
      <text x="52" y="288" font-family="ui-sans-serif, system-ui, sans-serif" font-size="14" font-weight="600" fill="#1c1917">${safeTopic} • Complete Syllabus Coverage</text>
      
      <!-- Key bullet notes -->
      <circle cx="44" cy="336" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="340" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">High-yield revision framework structured for top exam band marks.</text>
      <circle cx="44" cy="364" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="368" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Examiner tips, common marking pitfalls, and step-by-step model points.</text>
      <circle cx="44" cy="392" r="3.5" fill="${color.accentHex}"/>
      <text x="56" y="396" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" fill="#44403c">Concise summary cards optimized for active recall and revision spaced practice.</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 440" width="100%" height="100%">
  <defs>
    <!-- Paper texture pattern -->
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" stroke-width="0.75" stroke-opacity="0.6"/>
    </pattern>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Sheet background with clean ivory finish -->
  <rect width="480" height="440" fill="#ffffff" />
  <rect width="480" height="440" fill="url(#grid)" />

  <!-- Left margin red line (traditional student binder note paper) -->
  <line x1="28" y1="0" x2="28" y2="440" stroke="#fca5a5" stroke-width="1.5" stroke-opacity="0.7" />

  <!-- Top accent stripe for subject -->
  <rect x="0" y="0" width="480" height="8" fill="${color.accentHex}" />

  <!-- Header Section -->
  <!-- Category & Spec pill badges -->
  <rect x="36" y="24" width="auto" height="24" rx="6" fill="${color.lightBgHex}" stroke="${color.accentHex}40" stroke-width="1" />
  
  <g transform="translate(36, 26)">
    <!-- Category Pill -->
    <rect x="0" y="0" width="110" height="22" rx="4" fill="${color.lightBgHex}" stroke="${color.accentHex}" stroke-width="1"/>
    <text x="55" y="15" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700" fill="${color.accentHex}" letter-spacing="0.5">${safeType}</text>

    <!-- Spec Pill -->
    <rect x="116" y="0" width="95" height="22" rx="4" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="1"/>
    <text x="163" y="15" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="600" fill="#3f3f46">${safeSpec}</text>

    <!-- Subject Pill -->
    <rect x="217" y="0" width="105" height="22" rx="4" fill="${color.accentHex}" />
    <text x="269" y="15" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${safeSubject}</text>
  </g>

  <!-- Title (Wrap across two lines if long) -->
  <text x="36" y="82" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="800" fill="#18181b" letter-spacing="-0.02em">
    ${safeTitle.length > 42 ? safeTitle.slice(0, 40) + '...' : safeTitle}
  </text>
  <text x="36" y="104" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="500" fill="#71717a">
    ${safeTopic} • By ${safeCreator} • Verified Student Revision Notes
  </text>

  <!-- Horizontal divider -->
  <line x1="36" y1="120" x2="444" y2="120" stroke="#e4e4e7" stroke-width="1.5" />

  <!-- Ruled notebook lines -->
  <line x1="36" y1="145" x2="444" y2="145" stroke="#e4e4e7" stroke-width="1" stroke-dasharray="4 2" />
  <line x1="36" y1="170" x2="444" y2="170" stroke="#e4e4e7" stroke-width="1" stroke-dasharray="4 2" />
  <line x1="36" y1="195" x2="444" y2="195" stroke="#e4e4e7" stroke-width="1" stroke-dasharray="4 2" />
  <line x1="36" y1="220" x2="444" y2="220" stroke="#e4e4e7" stroke-width="1" stroke-dasharray="4 2" />

  <!-- Topic Overview Header inside lined area -->
  <text x="36" y="140" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13" font-weight="700" fill="#27272a">
    1.0 Specification Overview &amp; Learning Objectives:
  </text>
  <text x="36" y="165" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#52525b">
    Targeting Level 8/9 / Grade A* criteria. Complete worked examples, key terms and common mistakes.
  </text>
  <text x="36" y="190" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12" fill="#52525b">
    Mastery of foundational theory, step-by-step methods and exam-board specific mark scheme phrases.
  </text>

  <!-- Dynamic Subject Callout Block & Bullet points -->
  ${diagramMarkup}

  <!-- Footer Watermark / Verified tag -->
  <g transform="translate(36, 415)">
    <text x="0" y="12" font-family="ui-sans-serif, system-ui, sans-serif" font-size="10" font-weight="700" fill="#a1a1aa" letter-spacing="0.05em">
      SYLLABI ACADEMIC RESOURCE • PAGE 1 OF COMPLETE NOTES
    </text>
  </g>
</svg>
  `.trim();
}

export function generateCoverDataUrl(options: GenerateCoverOptions): string {
  const svg = generateNoteCoverSvg(options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
