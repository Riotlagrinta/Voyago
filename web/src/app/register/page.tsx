"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Bus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import axios from "axios";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const togolesePhoneRegex = /^(\+228)?\d{8}$/;

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
  email: z.string().email("Adresse email invalide."),
  phone: z.string().regex(togolesePhoneRegex, "Format invalide (ex: +228XXXXXXXX ou XXXXXXXX)."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  confirmPassword: z.string().min(8, "Veuillez confirmer votre mot de passe."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone.startsWith("+228") ? data.phone : `+228${data.phone}`,
        password: data.password,
        role: "passenger",
      });

      const { user, token } = response.data.data;
      setAuth(user, token);
      router.push("/");
    } catch (err) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="bg-primary p-2 rounded-xl group-hover:scale-110 transition-transform">
          <Bus className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-primary">
          Voyago
        </span>
      </Link>

      <Card className="w-full max-w-md p-8 shadow-voyago border-none rounded-3xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
          <p className="text-foreground/60">
            Rejoignez-nous pour simplifier vos voyages.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nom complet"
            placeholder="Kofi Mensah"
            leftIcon={<User className="w-4 h-4" />}
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="kofi@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Téléphone (+228)"
            placeholder="90123456"
            leftIcon={<Phone className="w-4 h-4" />}
            {...register("phone")}
            error={errors.phone?.message}
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-lg mt-4" 
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            S'inscrire
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-foreground/60">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Se connecter
          </Link>
        </div>
      </Card>
      
      <p className="mt-8 text-xs text-foreground/40 max-w-xs text-center">
        En vous inscrivant, vous acceptez nos Conditions Générales d'Utilisation et notre Politique de Confidentialité.
      </p>
    </div>
  );
}
