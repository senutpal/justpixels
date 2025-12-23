"use client";

import { Eye, Shield } from "lucide-react";
import Link from "next/link";
import { FAQSection, ProcessingModes } from "@/components/about";
import { MetadataDetails } from "@/components/about/metadata-details";
import { Footer, Header } from "@/components/layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

/**
 * About page component for the justpixels application.
 *
 * @description
 * This page provides comprehensive information about the justpixels
 * privacy-focused image metadata stripping tool. It educates users about:
 * - The privacy risks of image metadata (EXIF data)
 * - How justpixels solves these problems
 * - The two processing modes (Strip and Re-encode)
 * - Frequently asked questions
 *
 * @features
 * - Collapsible accordions for detailed information
 * - Clear explanations of metadata privacy risks
 * - Technical details for advanced users
 * - Theme toggle (light/dark mode)
 * - Call-to-action to start using the app
 *
 * @returns The rendered About page component
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen w-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Header showBackButton />

        {/* Main Content */}
        <main className="py-8 space-y-12">
          {/* Hero Section */}
          <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Protect Your Privacy
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every photo you take carries hidden data i.e. your location,
              device info, and even the time it was taken.{" "}
              <strong>justpixels</strong> removes this invisible fingerprint,
              giving you back control over what you share.
            </p>
          </section>

          {/* The Problem Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                The Problem
              </h2>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Every photo carries invisible data like your location, device
              info, timestamps, and more. This <strong>metadata</strong> (EXIF
              data) travels with your images when you share them, creating
              serious privacy risks. Anyone with basic tools can extract it in
              seconds.
            </p>

            {/* Expandable details */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="metadata-details"
                className="border rounded-md px-4 !border-b"
              >
                <AccordionTrigger className="text-sm font-medium">
                  Learn more about metadata and privacy risks
                </AccordionTrigger>
                <AccordionContent>
                  <MetadataDetails />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* How We Solve It */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold uppercase tracking-wide">
                How We Solve It
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              justpixels offers two powerful methods to clean your images. Both
              run <strong>entirely in your browser</strong>, so your photos
              never leave your device.
            </p>

            <ProcessingModes />
          </section>

          {/* FAQ Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wide">
              Frequently Asked Questions
            </h2>

            <FAQSection />
          </section>

          {/* CTA */}
          <section className="text-center py-8 space-y-4">
            <Link href="/">
              <Button size="lg" className="uppercase tracking-widest font-bold">
                Start Cleaning Images
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">
              100% free • No sign-up • Works offline
            </p>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
