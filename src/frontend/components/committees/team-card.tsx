"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CommitteeMember } from "@/shared/types";

export function TeamCard({ member }: { member: CommitteeMember }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group bg-white border border-ink/8 rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-gold/30 transition-all duration-300"
    >
      <div className="relative aspect-square bg-cream-dark overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-teal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-ink font-heading group-hover:text-brand-dark-teal transition-colors duration-300">
          {member.name}
        </h3>
        <p className="mt-1 text-sm text-brand-dark-teal font-medium">
          {member.title}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{member.institution}</p>
      </div>
    </motion.div>
  );
}
