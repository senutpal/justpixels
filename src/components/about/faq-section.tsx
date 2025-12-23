"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * FAQ item data structure.
 */
interface FAQItem {
  /** Unique identifier for the accordion item */
  id: string;
  /** Question text */
  question: string;
  /** Answer content (JSX) */
  answer: React.ReactNode;
}

/** FAQ data */
const faqItems: FAQItem[] = [
  {
    id: "item-1",
    question: "Do you store or upload my images anywhere ?",
    answer: (
      <p className="text-muted-foreground leading-relaxed">
        <strong>Absolutely not.</strong> Your images never leave your device.
        All processing happens directly in your web browser using JavaScript.
        There are no servers involved, no uploads, no cloud storage. When you
        close the tab, everything is gone.
      </p>
    ),
  },
  {
    id: "item-2",
    question: "How can I verify my data is safe ?",
    answer: (
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>You can verify this yourself in several ways:</p>
        <ul className="space-y-2 pl-4">
          <li>
            • <strong>Network tab:</strong> Open your browser&apos;s Developer
            Tools (F12), go to the Network tab, and process an image.
            You&apos;ll see zero upload requests.
          </li>
          <li>
            • <strong>Offline mode:</strong> Disconnect from the internet and
            try the app. It works perfectly because nothing requires a server.
          </li>
          <li>
            • <strong>Source code:</strong> Our code is open. You can inspect
            every line to confirm no data is transmitted.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "item-3",
    question: "What's the difference between Strip and Re-encode ?",
    answer: (
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>
          <strong>Strip</strong> is like removing a sticky note from a book. The
          note is gone but the book is unchanged. Fast, efficient, preserves
          exact quality.
        </p>
        <p>
          <strong>Re-encode</strong> is like photocopying the book&apos;s pages
          into a new book. Nothing from the original binding remains. More
          thorough but may slightly change file size.
        </p>
        <p>
          For most users, <strong>Strip mode is recommended</strong>. Use
          Re-encode when you want absolute certainty that no trace of original
          file structure exists.
        </p>
      </div>
    ),
  },
  {
    id: "item-4",
    question: "Will cleaning affect my image quality ?",
    answer: (
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>
          <strong>Strip mode:</strong> Zero quality loss. The image pixels
          remain completely untouched.
        </p>
        <p>
          <strong>Re-encode mode:</strong> Depends on your chosen format. PNG is
          lossless (no quality loss). JPEG uses the quality slider you set. WebP
          in our app uses lossless compression.
        </p>
      </div>
    ),
  },
  {
    id: "item-5",
    question: "Which image formats are supported ?",
    answer: (
      <p className="text-muted-foreground leading-relaxed">
        justpixels supports <strong>PNG</strong>, <strong>JPEG</strong>, and
        <strong> WebP</strong> images. These cover the vast majority of photos
        you&apos;ll encounter. In Re-encode mode, you can also convert between
        formats.
      </p>
    ),
  },
  {
    id: "item-6",
    question: "Is this really 100% private ?",
    answer: (
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <p>Yes. The architecture makes privacy a guarantee, not a promise:</p>
        <ul className="space-y-2 pl-4">
          <li>
            • <strong>Client-side only:</strong> All code runs in your browser
          </li>
          <li>
            • <strong>No backend:</strong> There&apos;s no server to upload to
          </li>
          <li>
            • <strong>No analytics:</strong> We don&apos;t track what you
            process
          </li>
          <li>
            • <strong>No cookies:</strong> Nothing is stored about your session
          </li>
        </ul>
        <p>
          Even if we wanted to see your images, we couldn&apos;t. Our
          infrastructure physically cannot receive them.
        </p>
      </div>
    ),
  },
  {
    id: "item-7",
    question: "Can I use this for multiple images at once ?",
    answer: (
      <p className="text-muted-foreground leading-relaxed">
        Yes! You can drag and drop or select multiple images at once. justpixels
        will process them all in batch.
      </p>
    ),
  },
  {
    id: "item-8",
    question: "How does the stripping actually work ?",
    answer: (
      <div className="space-y-3 text-muted-foreground leading-relaxed">
        <div className="bg-muted/50 rounded p-4 font-mono text-xs space-y-2">
          <p className="text-foreground font-bold">JPEG:</p>
          <p>• Read file as ArrayBuffer</p>
          <p>• Locate FFD8 (SOI) and FFD9 (EOI) markers</p>
          <p>• Skip APP1 (EXIF), APP13 (IPTC) segments</p>
          <p>• Reconstruct file without metadata segments</p>
          <p className="text-foreground font-bold mt-3">PNG:</p>
          <p>• Parse chunk structure (length + type + data + CRC)</p>
          <p>• Keep critical chunks: IHDR, PLTE, IDAT, IEND</p>
          <p>• Remove ancillary chunks: tEXt, iTXt, eXIf, etc.</p>
        </div>
        <p>
          The implementation uses typed arrays and DataView for binary
          manipulation, running entirely in the browser&apos;s JavaScript
          engine.
        </p>
      </div>
    ),
  },
];

/**
 * FAQ section component.
 *
 * @description
 * Displays frequently asked questions in an accordion format.
 * Each question expands to reveal its answer.
 *
 * @returns The rendered FAQSection component
 */
export function FAQSection() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
