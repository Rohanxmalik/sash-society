"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // For now, just show success. In production, send to API route.
    console.log("Form submitted:", data);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-sm p-8 text-center">
        <h3 className="text-xl font-bold text-ink font-heading">
          Thank you for your message!
        </h3>
        <p className="mt-2 text-ink-light">
          We will get back to you as soon as possible.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            First Name *
          </label>
          <input
            {...register("firstName")}
            className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
            placeholder="Your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Last Name *
          </label>
          <input
            {...register("lastName")}
            className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
            placeholder="Your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Email *
        </label>
        <input
          {...register("email")}
          type="email"
          className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Subject *
        </label>
        <input
          {...register("subject")}
          className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors"
          placeholder="Subject of your inquiry"
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Message *
        </label>
        <textarea
          {...register("message")}
          rows={5}
          className="w-full border border-ink/20 rounded-sm px-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal transition-colors resize-none"
          placeholder="Your message..."
        />
        {errors.message && (
          <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Submit Brief"}
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
