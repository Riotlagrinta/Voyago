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
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const { user, token } = response.data.data;
      setAuth(user, token);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
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
          <h1 className="text-2xl font-bold mb-2">Bon retour !</h1>
          <p className="text-foreground/60">
            Connectez-vous pour gérer vos voyages.
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
            label="Email"
            type="email"
            placeholder="votre@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
            {...register("email")}
            error={errors.email?.message}
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-sm font-medium text-foreground/80">Mot de passe</label>
              <Link href="#" className="text-xs text-primary hover:underline">Oublié ?</Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register("password")}
              error={errors.password?.message}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-lg mt-4" 
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-foreground/60">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Créer un compte
          </Link>
        </div>
      </Card>
    </div>
  );
}
