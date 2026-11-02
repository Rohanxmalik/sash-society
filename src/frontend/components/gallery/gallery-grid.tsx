"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type GalleryConference = {
  id: string;
  label: string;
  images: { src: string; alt: string }[];
};

export function GalleryGrid({
  conferences,
}: {
  conferences: GalleryConference[];
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const filters = [
    { id: "all", label: "All" },
    ...conferences.map((c) => ({ id: c.id, label: c.label })),
  ];

  const filteredImages =
    activeFilter === "all"
      ? conferences.flatMap((c) => c.images)
      : conferences.find((c) => c.id === activeFilter)?.images || [];

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 ${
              activeFilter === filter.id
                ? "bg-brand-dark-teal text-white border-brand-dark-teal shadow-md"
                : "bg-white text-ink-light border-ink/15 hover:border-brand-dark-teal hover:text-brand-dark-teal hover:shadow-sm"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.button
              key={image.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              onClick={() => setLightboxIndex(index)}
              className="relative aspect-square bg-cream-dark rounded-lg overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Hover overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-teal/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* View icon on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-brand-dark-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={filteredImages.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </>
  );
}
