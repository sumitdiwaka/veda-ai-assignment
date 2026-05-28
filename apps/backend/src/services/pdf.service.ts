import {
  PDFDocument,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fs from "fs";
import path from "path";
import type { IQuestionPaper, ISection, IQuestion } from "../models/QuestionPaper";
import { env } from "../config/env";

// ─── Colours ────────────────────────────────────────────────────────────────
const COLOR = {
  black:      rgb(0,    0,    0),
  darkGray:   rgb(0.2,  0.2,  0.2),
  midGray:    rgb(0.45, 0.45, 0.45),
  lightGray:  rgb(0.85, 0.85, 0.85),
  white:      rgb(1,    1,    1),
  easy:       rgb(0.18, 0.63, 0.34),   // green
  medium:     rgb(0.95, 0.61, 0.07),   // amber
  hard:       rgb(0.86, 0.21, 0.27),   // red
  accent:     rgb(0.24, 0.35, 0.82),   // indigo
  headerBg:   rgb(0.13, 0.13, 0.20),   // near-black
};

// ─── Layout constants ────────────────────────────────────────────────────────
const PAGE_W   = 595.28;   // A4 width  (pt)
const PAGE_H   = 841.89;   // A4 height (pt)
const MARGIN_X = 50;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// ─── Types ───────────────────────────────────────────────────────────────────
interface Fonts {
  regular: PDFFont;
  bold:    PDFFont;
  italic:  PDFFont;
}

interface Cursor {
  page:  PDFPage;
  y:     number;
  pages: PDFPage[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function newPage(doc: PDFDocument, cursor: Cursor): void {
  const page = doc.addPage([PAGE_W, PAGE_H]);
  cursor.pages.push(page);
  cursor.page = page;
  cursor.y = PAGE_H - 50;
}

function ensureSpace(
  doc: PDFDocument,
  cursor: Cursor,
  needed: number
): void {
  if (cursor.y - needed < 60) newPage(doc, cursor);
}

/** Word-wrap text into lines that fit within maxWidth. */
function wrapText(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const probe = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(probe, fontSize) <= maxWidth) {
      current = probe;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Draw a filled rectangle. */
function fillRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  color: ReturnType<typeof rgb>
): void {
  page.drawRectangle({ x, y: y - h, width: w, height: h, color });
}

/** Draw a horizontal rule. */
function hRule(
  page: PDFPage,
  y: number,
  color = COLOR.lightGray,
  thickness = 0.5
): void {
  page.drawLine({
    start: { x: MARGIN_X, y },
    end:   { x: PAGE_W - MARGIN_X, y },
    thickness,
    color,
  });
}

// ─── Section: PDF header ─────────────────────────────────────────────────────
function drawHeader(
  doc: PDFDocument,
  cursor: Cursor,
  fonts: Fonts,
  paper: IQuestionPaper
): void {
  const { page } = cursor;

  // Dark top band
  fillRect(page, 0, PAGE_H, PAGE_W, 72, COLOR.headerBg);

  // Institution placeholder
  page.drawText("EXAMINATION PAPER", {
    x: MARGIN_X,
    y: PAGE_H - 20,
    size: 8,
    font: fonts.regular,
    color: COLOR.midGray,
  });

  // Title
  const titleLines = wrapText(paper.title, fonts.bold, 16, CONTENT_W - 140);
  titleLines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X,
      y: PAGE_H - 38 - i * 20,
      size: 16,
      font: fonts.bold,
      color: COLOR.white,
    });
  });

  // Right column: subject / grade
  page.drawText(`Subject: ${paper.subject}`, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 34,
    size: 9,
    font: fonts.regular,
    color: COLOR.lightGray,
  });
  page.drawText(`Grade: ${paper.grade}`, {
    x: PAGE_W - MARGIN_X - 130,
    y: PAGE_H - 47,
    size: 9,
    font: fonts.regular,
    color: COLOR.lightGray,
  });
  if (paper.duration) {
    page.drawText(`Duration: ${paper.duration} min`, {
      x: PAGE_W - MARGIN_X - 130,
      y: PAGE_H - 60,
      size: 9,
      font: fonts.regular,
      color: COLOR.lightGray,
    });
  }

  cursor.y = PAGE_H - 80;

  // ── Meta bar (marks / questions / date) ───────────────────────────────────
  const barH = 28;
  fillRect(page, MARGIN_X, cursor.y, CONTENT_W, barH, COLOR.lightGray);

  const metaItems = [
    `Total Marks: ${paper.totalMarks}`,
    `Total Questions: ${paper.totalQuestions}`,
    `Due: ${new Date(paper.dueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`,
  ];
  const colW = CONTENT_W / metaItems.length;
  metaItems.forEach((item, i) => {
    page.drawText(item, {
      x: MARGIN_X + 10 + i * colW,
      y: cursor.y - 18,
      size: 9,
      font: fonts.bold,
      color: COLOR.darkGray,
    });
  });

  cursor.y -= barH + 14;
}

// ─── Section: student info ────────────────────────────────────────────────────
function drawStudentInfo(
  doc: PDFDocument,
  cursor: Cursor,
  fonts: Fonts
): void {
  const { page } = cursor;

  ensureSpace(doc, cursor, 60);

  const fields = ["Name", "Roll Number", "Section"];
  const fieldW  = CONTENT_W / fields.length - 10;

  fields.forEach((label, i) => {
    const x = MARGIN_X + i * (fieldW + 10);
    page.drawText(`${label}:`, {
      x,
      y: cursor.y,
      size: 8,
      font: fonts.bold,
      color: COLOR.darkGray,
    });
    // Underline input area
    page.drawLine({
      start: { x: x + 50, y: cursor.y - 1 },
      end:   { x: x + fieldW, y: cursor.y - 1 },
      thickness: 0.8,
      color: COLOR.darkGray,
    });
  });

  cursor.y -= 20;
  hRule(cursor.page, cursor.y);
  cursor.y -= 12;
}

// ─── Section: general instructions ───────────────────────────────────────────
function drawInstructions(
  doc: PDFDocument,
  cursor: Cursor,
  fonts: Fonts,
  instructions: string[]
): void {
  if (!instructions.length) return;

  ensureSpace(doc, cursor, 30 + instructions.length * 14);

  cursor.page.drawText("General Instructions:", {
    x: MARGIN_X,
    y: cursor.y,
    size: 9,
    font: fonts.bold,
    color: COLOR.accent,
  });
  cursor.y -= 14;

  instructions.forEach((inst, i) => {
    const lines = wrapText(`${i + 1}. ${inst}`, fonts.regular, 8, CONTENT_W - 10);
    lines.forEach((line) => {
      ensureSpace(doc, cursor, 12);
      cursor.page.drawText(line, {
        x: MARGIN_X + 8,
        y: cursor.y,
        size: 8,
        font: fonts.regular,
        color: COLOR.darkGray,
      });
      cursor.y -= 12;
    });
  });

  cursor.y -= 8;
  hRule(cursor.page, cursor.y, COLOR.lightGray, 0.5);
  cursor.y -= 14;
}

// ─── Section: difficulty badge ────────────────────────────────────────────────
function drawDifficultyBadge(
  page: PDFPage,
  fonts: Fonts,
  difficulty: string,
  x: number,
  y: number
): void {
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const badgeW = 38;
  const badgeH = 11;
  const color =
    difficulty === "easy"   ? COLOR.easy   :
    difficulty === "hard"   ? COLOR.hard   : COLOR.medium;

  fillRect(page, x, y + 2, badgeW, badgeH, color);
  page.drawText(label, {
    x: x + 4,
    y: y - 6,
    size: 7,
    font: fonts.bold,
    color: COLOR.white,
  });
}

// ─── Section: question ────────────────────────────────────────────────────────
function drawQuestion(
  doc: PDFDocument,
  cursor: Cursor,
  fonts: Fonts,
  question: IQuestion,
  qNumber: number
): void {
  const marksLabel  = `[${question.marks} mark${question.marks > 1 ? "s" : ""}]`;
  const numberLabel = `Q${qNumber}.`;
  const indent      = 30;
  const textMaxW    = CONTENT_W - indent - 90; // leave room for marks

  const lines = wrapText(question.text, fonts.regular, 10, textMaxW);
  const blockH = lines.length * 13 + 10 +
    (question.options ? question.options.length * 13 + 4 : 0);

  ensureSpace(doc, cursor, blockH + 8);

  const { page, y } = cursor;

  // Question number
  page.drawText(numberLabel, {
    x: MARGIN_X,
    y,
    size: 10,
    font: fonts.bold,
    color: COLOR.black,
  });

  // Question text
  lines.forEach((line, i) => {
    page.drawText(line, {
      x: MARGIN_X + indent,
      y: y - i * 13,
      size: 10,
      font: fonts.regular,
      color: COLOR.black,
    });
  });

  // Marks (right-aligned)
  const marksW = fonts.bold.widthOfTextAtSize(marksLabel, 9);
  page.drawText(marksLabel, {
    x: PAGE_W - MARGIN_X - marksW,
    y,
    size: 9,
    font: fonts.bold,
    color: COLOR.accent,
  });

  // Difficulty badge
  drawDifficultyBadge(
    page,
    fonts,
    question.difficulty,
    PAGE_W - MARGIN_X - marksW - 50,
    y
  );

  cursor.y -= lines.length * 13 + 4;

  // MCQ options
  if (question.options && question.options.length) {
    const optCols = 2;
    const optW    = (CONTENT_W - indent) / optCols;

    question.options.forEach((opt, oi) => {
      const col  = oi % optCols;
      const row  = Math.floor(oi / optCols);
      const optX = MARGIN_X + indent + col * optW;
      const optY = cursor.y - row * 13;

      ensureSpace(doc, cursor, 13);

      const optLines = wrapText(opt, fonts.regular, 9, optW - 10);
      optLines.forEach((l, li) => {
        cursor.page.drawText(l, {
          x: optX,
          y: optY - li * 11,
          size: 9,
          font: fonts.regular,
          color: COLOR.darkGray,
        });
      });
    });

    const rows = Math.ceil(question.options.length / optCols);
    cursor.y -= rows * 13 + 4;
  }

  // Answer line for short/long/fill
  if (
    question.type === "short_answer" ||
    question.type === "fill_blank"   ||
    question.type === "true_false"
  ) {
    ensureSpace(doc, cursor, 18);
    cursor.page.drawText("Answer: ", {
      x: MARGIN_X + indent,
      y: cursor.y,
      size: 9,
      font: fonts.italic,
      color: COLOR.midGray,
    });
    cursor.page.drawLine({
      start: { x: MARGIN_X + indent + 52, y: cursor.y - 1 },
      end:   { x: PAGE_W - MARGIN_X,      y: cursor.y - 1 },
      thickness: 0.5,
      color: COLOR.lightGray,
    });
    cursor.y -= 14;
  }

  if (question.type === "long_answer") {
    // 4 blank lines
    for (let ln = 0; ln < 4; ln++) {
      ensureSpace(doc, cursor, 16);
      cursor.page.drawLine({
        start: { x: MARGIN_X + indent, y: cursor.y - 1 },
        end:   { x: PAGE_W - MARGIN_X, y: cursor.y - 1 },
        thickness: 0.4,
        color: COLOR.lightGray,
      });
      cursor.y -= 16;
    }
  }

  cursor.y -= 8;
}

// ─── Section: exam section header ─────────────────────────────────────────────
function drawSectionHeader(
  doc: PDFDocument,
  cursor: Cursor,
  fonts: Fonts,
  section: ISection
): void {
  ensureSpace(doc, cursor, 44);

  const { page, y } = cursor;

  // Accent strip
  fillRect(page, MARGIN_X, y + 4, CONTENT_W, 24, COLOR.accent);

  page.drawText(section.title.toUpperCase(), {
    x: MARGIN_X + 10,
    y: y - 10,
    size: 11,
    font: fonts.bold,
    color: COLOR.white,
  });

  const marksText = `[${section.totalMarks} marks]`;
  const mW = fonts.regular.widthOfTextAtSize(marksText, 9);
  page.drawText(marksText, {
    x: PAGE_W - MARGIN_X - mW - 10,
    y: y - 10,
    size: 9,
    font: fonts.regular,
    color: COLOR.lightGray,
  });

  cursor.y = y - 28;

  // Instruction
  page.drawText(section.instruction, {
    x: MARGIN_X,
    y: cursor.y,
    size: 8,
    font: fonts.italic,
    color: COLOR.midGray,
  });

  cursor.y -= 16;
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function drawFooters(pages: PDFPage[], fonts: Fonts, total: number): void {
  pages.forEach((page, i) => {
    const label = `Page ${i + 1} of ${total}  •  Generated by VedaAI`;
    const lw    = fonts.regular.widthOfTextAtSize(label, 7);

    hRule(page, 40, COLOR.lightGray, 0.4);
    page.drawText(label, {
      x: (PAGE_W - lw) / 2,
      y: 26,
      size: 7,
      font: fonts.regular,
      color: COLOR.midGray,
    });
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generatePDF(paper: IQuestionPaper): Promise<string> {
  const doc = await PDFDocument.create();

  // Metadata
  doc.setTitle(paper.title);
  doc.setSubject(paper.subject);
  doc.setCreator("VedaAI");
  doc.setProducer("VedaAI Assessment Platform");
  doc.setCreationDate(new Date());

  // Embed fonts
  const [regular, bold, italic] = await Promise.all([
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
    doc.embedFont(StandardFonts.HelveticaOblique),
  ]);
  const fonts: Fonts = { regular, bold, italic };

  // First page
  const firstPage = doc.addPage([PAGE_W, PAGE_H]);
  const cursor: Cursor = {
    page: firstPage,
    y: PAGE_H - 50,
    pages: [firstPage],
  };

  // Draw sections
  drawHeader(doc, cursor, fonts, paper);
  drawStudentInfo(doc, cursor, fonts);
  drawInstructions(doc, cursor, fonts, paper.generalInstructions);

  let globalQ = 1;
  for (const section of paper.sections) {
    drawSectionHeader(doc, cursor, fonts, section);
    for (const question of section.questions) {
      drawQuestion(doc, cursor, fonts, question, globalQ++);
    }
    cursor.y -= 10;
    hRule(cursor.page, cursor.y, COLOR.lightGray);
    cursor.y -= 16;
  }

  drawFooters(cursor.pages, fonts, cursor.pages.length);

  // Save file
  const pdfBytes = await doc.save();
  const outputDir = path.resolve(env.UPLOAD_DIR, "papers");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `paper-${paper._id}-${Date.now()}.pdf`;
  const filePath = path.join(outputDir, fileName);
  fs.writeFileSync(filePath, pdfBytes);

  return filePath;
}