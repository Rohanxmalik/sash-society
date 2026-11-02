"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import type { z } from "zod";
import { sendContactMessageAction } from "@/backend/contact/actions";
import { Button } from "@/frontend/components/ui/button";
import { FormAlert } from "@/frontend/components/ui/form-alert";
import { FormField, TextAreaField } from "@/frontend/components/ui/form-field";
import { contactSchema } from "@/shared/validation/contact";

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    const result = await sendContactMessageAction(data);
    setProblem(result.ok ? null : result.message);
    setSubmitted(result.ok);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {problem && <FormAlert>{problem}</FormAlert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          {...register("firstName")}
          label="First Name *"
          autoComplete="given-name"
          error={errors.firstName?.message}
        />
        <FormField
          {...register("lastName")}
          label="Last Name *"
          autoComplete="family-name"
          error={errors.lastName?.message}
        />
      </div>

      <FormField
        {...register("email")}
        label="Email *"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <FormField
        {...register("subject")}
        label="Subject *"
        error={errors.subject?.message}
      />
      <TextAreaField
        {...register("message")}
        label="Message *"
        rows={5}
        error={errors.message?.message}
      />

      {/* Hidden from people. Bots fill it in. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          {...register("website")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
