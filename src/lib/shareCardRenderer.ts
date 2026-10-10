import { Resource, ShareCardStyle, UserProfile } from './types';
import { formatSavesCount, formatViewsCount } from './formatters';
import { getSubjectColor } from './academicColors';

export interface RenderCardOptions {
  resource: Resource;
  cardStyle: ShareCardStyle;
  format: 'story' | 'square';
}

export interface RenderProfileCardOptions {
  user: UserProfile;
  format: 'story' | 'square';
}

/**
 * High-DPI HTML5 Canvas Share Card Renderer.
 * Follows the canonical Syllabi design language:
 * - Crisp Figtree typography
 * - Canonical Syllabi wordmark and dot
 * - Zero decorative emojis or fake numbers
 * - High-density clean editorial geometry
 */
export function renderShareCardToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderCardOptions
) {
  const { resource, cardStyle, format } = options;

  const width = format === 'story' ? 1080 : 1080;
  const height = format === 'story' ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background: warm editorial canvas
  ctx.fillStyle = '#F5F5F4';
  ctx.fillRect(0, 0, width, height);

  // Main Card surface
  const cardMargin = format === 'story' ? 72 : 64;
  const cardTop = format === 'story' ? 140 : 64;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - (format === 'story' ? 320 : 128);

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, cardMargin, cardTop, cardWidth, cardHeight, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Hairline border
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardMargin, cardTop, cardWidth, cardHeight, 24);
  ctx.stroke();

  // Canonical Syllabi Wordmark (exactly matching SyllabiLogo.tsx)
  const logoX = cardMargin + 56;
  const logoY = cardTop + 76;
  ctx.fillStyle = '#171717';
  ctx.font = '700 36px Figtree, -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Syllabi', logoX, logoY);

  const brandWidth = ctx.measureText('Syllabi').width;
  // Canonical dot (5.5px diameter, #171717, baseline aligned)
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.arc(logoX + brandWidth + 7, logoY - 11, 4.5, 0, Math.PI * 2);
  ctx.fill();

  const subjectStyle = getSubjectColor(resource.subjectName);

  // Top color accent band at top of card (Requirement 38)
  ctx.fillStyle = subjectStyle.paperStripeHex;
  roundRect(ctx, cardMargin, cardTop, cardWidth, 8, 4);
  ctx.fill();

  // Category Badge with vibrant subject styling
  let badgeText = `${resource.subjectName.toUpperCase()} · ORIGINAL NOTES`;
  let badgeBg = subjectStyle.lightBgHex;
  let badgeColor = subjectStyle.accentHex;

  if (cardStyle === 'resource_stats') {
    badgeText = `${resource.subjectName.toUpperCase()} · OVERVIEW`;
  } else if (cardStyle === 'study_achievement') {
    badgeText = `${resource.subjectName.toUpperCase()} · STUDENT CREATOR`;
  } else if (cardStyle === 'popular_resource') {
    if (resource.savesCount > 0) {
      badgeText = `${resource.savesCount} STUDENT SAVES`;
    } else {
      badgeText = `${resource.subjectName.toUpperCase()} · VERIFIED RESOURCE`;
    }
  }

  ctx.font = '700 18px Figtree, sans-serif';
  const badgeWidth = ctx.measureText(badgeText).width + 36;
  const badgeHeight = 38;
  const badgeX = cardMargin + cardWidth - badgeWidth - 56;
  const badgeY = cardTop + 48;

  ctx.fillStyle = badgeBg;
  roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 19);
  ctx.fill();

  ctx.strokeStyle = subjectStyle.accentHex + '50';
  ctx.lineWidth = 1.5;
  roundRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 19);
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, badgeX + badgeWidth / 2, badgeY + 25);

  // Specification Hierarchy Stamp with Subject Accent
  const metaY = cardTop + 155;
  ctx.textAlign = 'left';
  ctx.fillStyle = subjectStyle.accentHex;
  ctx.font = '700 22px Figtree, sans-serif';
  const metaLine = `${resource.qualificationName.toUpperCase()} · ${resource.examBoardName.toUpperCase()} · ${resource.subjectName.toUpperCase()}`;
  ctx.fillText(metaLine, cardMargin + 56, metaY);

  // Resource Title (Multi-line wrap)
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 50px Figtree, sans-serif';
  const titleY = metaY + 60;
  wrapText(ctx, resource.title, cardMargin + 56, titleY, cardWidth - 112, 64, 3);

  // Details Pill (Resource Type + Page Count)
  const detailsY = titleY + 160;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardMargin + 56, detailsY, cardWidth - 112, 80, 14);
  ctx.fill();
  ctx.strokeStyle = subjectStyle.accentHex + '40';
  roundRect(ctx, cardMargin + 56, detailsY, cardWidth - 112, 80, 14);
  ctx.stroke();

  ctx.font = '700 24px Figtree, sans-serif';
  ctx.fillStyle = subjectStyle.accentHex;
  ctx.fillText(resource.resourceType, cardMargin + 80, detailsY + 48);

  ctx.textAlign = 'right';
  ctx.font = '500 24px Figtree, sans-serif';
  ctx.fillStyle = '#57534E';
  ctx.fillText(`${resource.pageCount} pages · PDF Document`, cardMargin + cardWidth - 80, detailsY + 48);

  // Stats Grid (Honest Metrics)
  const statsY = detailsY + 120;
  ctx.textAlign = 'left';

  const statBoxWidth = (cardWidth - 112 - 32) / 3;
  const statBoxHeight = 100;

  // Box 1: Views
  drawStatBox(
    ctx,
    cardMargin + 56,
    statsY,
    statBoxWidth,
    statBoxHeight,
    resource.viewsCount.toLocaleString(),
    'VIEWS'
  );

  // Box 2: Saves
  drawStatBox(
    ctx,
    cardMargin + 56 + statBoxWidth + 16,
    statsY,
    statBoxWidth,
    statBoxHeight,
    resource.savesCount > 0 ? resource.savesCount.toLocaleString() : '0',
    'SAVES'
  );

  // Box 3: Rating (Clean, no emoji)
  const ratingText = resource.ratingCount > 0 ? `${resource.ratingAvg.toFixed(1)}/5.0` : 'New';
  const ratingSubtext = resource.ratingCount > 0 ? `${resource.ratingCount} RATINGS` : 'NO REVIEWS';
  drawStatBox(
    ctx,
    cardMargin + 56 + (statBoxWidth + 16) * 2,
    statsY,
    statBoxWidth,
    statBoxHeight,
    ratingText,
    ratingSubtext
  );

  // Actual Note Sheet Preview Box (Requirement 37 & 38)
  const noteY = statsY + 125;
  const noteHeight = format === 'story' ? 380 : 130;
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;
  roundRect(ctx, cardMargin + 56, noteY, cardWidth - 112, noteHeight, 14);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Note Sheet Top Color Accent Stripe
  ctx.fillStyle = subjectStyle.paperStripeHex;
  roundRect(ctx, cardMargin + 56, noteY, cardWidth - 112, 6, 3);
  ctx.fill();

  ctx.font = '700 18px Figtree, sans-serif';
  ctx.fillStyle = subjectStyle.accentHex;
  ctx.textAlign = 'left';
  ctx.fillText(`${resource.examBoardName.toUpperCase()} · ${resource.qualificationName.toUpperCase()} ${resource.subjectName.toUpperCase()}`, cardMargin + 76, noteY + 36);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#78716C';
  ctx.font = '600 16px Figtree, sans-serif';
  ctx.fillText(`Page 1 of ${resource.pageCount}`, cardMargin + cardWidth - 76, noteY + 36);

  if (format === 'story') {
    ctx.fillStyle = subjectStyle.lightBgHex;
    roundRect(ctx, cardMargin + 76, noteY + 54, cardWidth - 152, 64, 8);
    ctx.fill();
    ctx.strokeStyle = subjectStyle.accentHex + '40';
    roundRect(ctx, cardMargin + 76, noteY + 54, cardWidth - 152, 64, 8);
    ctx.stroke();

    ctx.font = '700 20px Figtree, sans-serif';
    ctx.fillStyle = subjectStyle.accentHex;
    ctx.textAlign = 'left';
    ctx.fillText('Original Student Revision Material', cardMargin + 96, noteY + 92);

    ctx.fillStyle = '#292524';
    ctx.font = '400 21px Figtree, sans-serif';
    wrapText(ctx, resource.description, cardMargin + 76, noteY + 155, cardWidth - 152, 34, 4);

    ctx.font = '600 16px Figtree, sans-serif';
    ctx.fillStyle = '#A8A29E';
    ctx.textAlign = 'right';
    ctx.fillText('STUDENT REVISION NOTES · VERIFIED', cardMargin + cardWidth - 76, noteY + noteHeight - 20);
  } else {
    ctx.fillStyle = '#57534E';
    ctx.font = '400 20px Figtree, sans-serif';
    ctx.textAlign = 'left';
    wrapText(ctx, resource.description, cardMargin + 76, noteY + 70, cardWidth - 152, 28, 2);
  }

  // Creator Attribution Footer (inside card)
  const creatorY = cardTop + cardHeight - 64;
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 26px Figtree, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`@${resource.creatorUsername}`, cardMargin + 56, creatorY);

  ctx.textAlign = 'right';
  ctx.font = '500 22px Figtree, sans-serif';
  ctx.fillStyle = '#78716C';
  ctx.fillText('syllabi.app', cardMargin + cardWidth - 56, creatorY);

  // Outer Story Footer (for 9:16 layout)
  if (format === 'story') {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#78716C';
    ctx.font = '600 26px Figtree, sans-serif';
    ctx.fillText('Study resources, made by students.', width / 2, height - 120);

    ctx.fillStyle = '#A8A29E';
    ctx.font = '400 20px Figtree, sans-serif';
    ctx.fillText(`syllabi.app/resource/${resource.slug}`, width / 2, height - 80);
  }
}

/**
 * Profile Share Card Renderer.
 * Supports creator portfolio promotion across Instagram Stories and Posts.
 */
export function renderProfileShareCardToCanvas(
  canvas: HTMLCanvasElement,
  options: RenderProfileCardOptions
) {
  const { user, format } = options;

  const width = format === 'story' ? 1080 : 1080;
  const height = format === 'story' ? 1920 : 1080;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background
  ctx.fillStyle = '#F5F5F4';
  ctx.fillRect(0, 0, width, height);

  const cardMargin = format === 'story' ? 72 : 64;
  const cardTop = format === 'story' ? 180 : 64;
  const cardWidth = width - cardMargin * 2;
  const cardHeight = height - (format === 'story' ? 380 : 128);

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, cardMargin, cardTop, cardWidth, cardHeight, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 1.5;
  roundRect(ctx, cardMargin, cardTop, cardWidth, cardHeight, 24);
  ctx.stroke();

  // Canonical Syllabi Wordmark
  const logoX = cardMargin + 56;
  const logoY = cardTop + 76;
  ctx.fillStyle = '#171717';
  ctx.font = '700 36px Figtree, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Syllabi', logoX, logoY);

  const brandWidth = ctx.measureText('Syllabi').width;
  ctx.beginPath();
  ctx.arc(logoX + brandWidth + 7, logoY - 11, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Profile Heading
  const headerY = cardTop + 170;
  ctx.fillStyle = '#1C1917';
  ctx.font = '700 52px Figtree, sans-serif';
  ctx.fillText(`@${user.username}`, cardMargin + 56, headerY);

  ctx.font = '500 24px Figtree, sans-serif';
  ctx.fillStyle = '#78716C';
  const specText = `${user.qualification || 'GCSE'} · ${user.examBoard || 'AQA'}`;
  ctx.fillText(specText, cardMargin + 56, headerY + 44);

  // Bio
  if (user.bio) {
    ctx.font = '400 24px Figtree, sans-serif';
    ctx.fillStyle = '#44403C';
    wrapText(ctx, user.bio, cardMargin + 56, headerY + 100, cardWidth - 112, 36, 3);
  }

  // Stats Grid
  const statsY = headerY + 220;
  const statBoxWidth = (cardWidth - 112 - 32) / 3;
  const statBoxHeight = 110;

  drawStatBox(
    ctx,
    cardMargin + 56,
    statsY,
    statBoxWidth,
    statBoxHeight,
    user.resourcesCount.toString(),
    'RESOURCES'
  );

  drawStatBox(
    ctx,
    cardMargin + 56 + statBoxWidth + 16,
    statsY,
    statBoxWidth,
    statBoxHeight,
    user.totalViews > 0 ? user.totalViews.toLocaleString() : '0',
    'TOTAL VIEWS'
  );

  drawStatBox(
    ctx,
    cardMargin + 56 + (statBoxWidth + 16) * 2,
    statsY,
    statBoxWidth,
    statBoxHeight,
    user.totalSaves > 0 ? user.totalSaves.toLocaleString() : '0',
    'TOTAL SAVES'
  );

  // Subjects Studied
  const subjY = statsY + 160;
  ctx.fillStyle = '#1C1917';
  ctx.font = '600 22px Figtree, sans-serif';
  ctx.fillText('SUBJECTS', cardMargin + 56, subjY);

  ctx.font = '400 22px Figtree, sans-serif';
  ctx.fillStyle = '#57534E';
  ctx.fillText(user.subjects.join(' · '), cardMargin + 56, subjY + 36);

  // Card footer
  const footerY = cardTop + cardHeight - 64;
  ctx.fillStyle = '#78716C';
  ctx.font = '500 22px Figtree, sans-serif';
  ctx.fillText('Academic Resource Profile', cardMargin + 56, footerY);

  ctx.textAlign = 'right';
  ctx.fillText(`syllabi.app/creator/${user.username}`, cardMargin + cardWidth - 56, footerY);

  if (format === 'story') {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#78716C';
    ctx.font = '600 26px Figtree, sans-serif';
    ctx.fillText('Study resources, made by students.', width / 2, height - 120);

    ctx.fillStyle = '#A8A29E';
    ctx.font = '400 20px Figtree, sans-serif';
    ctx.fillText(`syllabi.app/creator/${user.username}`, width / 2, height - 80);
  }
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string
) {
  ctx.fillStyle = '#FAFAF9';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#E7E5E4';
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();

  ctx.fillStyle = '#1C1917';
  ctx.font = '700 32px Figtree, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(value, x + w / 2, y + 46);

  ctx.fillStyle = '#78716C';
  ctx.font = '600 15px Figtree, sans-serif';
  ctx.fillText(label, x + w / 2, y + 80);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let linesRendered = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      linesRendered++;
      if (linesRendered >= maxLines - 1) {
        let remainingWords = words.slice(n).join(' ');
        while (ctx.measureText(remainingWords + '...').width > maxWidth && remainingWords.length > 0) {
          remainingWords = remainingWords.slice(0, -1);
        }
        ctx.fillText((remainingWords + '...').trim(), x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}
