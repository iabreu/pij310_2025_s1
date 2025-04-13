"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
});

type FormFields = z.infer<typeof schema>;

const SignUp = () => {
  const form = useForm<FormFields>({ resolver: zodResolver(schema) });
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp: SubmitHandler<FormFields> = async (data) => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    const { email, password } = data;
    const supabase = createClient();

    try {
      // 1. First try to sign up the user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        // Handle signup errors
        if (
          signUpError.message.includes("already") ||
          signUpError.message.includes("User already registered")
        ) {
          form.setError("email", {
            message: "Este email já está registrado. Tente fazer login.",
          });
        } else {
          form.setError("root", {
            message: signUpError.message || "Erro ao criar conta",
          });
        }
        setIsSubmitting(false);
        return;
      }

      // 2. If signup successful, sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If there's an error signing in, redirect to login
        toast({
          title: "Conta criada com sucesso!",
          description: "Por favor, faça login para continuar.",
          duration: 5000,
        });
        router.push("/login");
      } else {
        // Successfully signed up and signed in, redirect immediately
        toast({
          title: "Conta criada com sucesso!",
          description:
            "Bem-vindo ao sistema de monitoramento de tratamento da sífilis",
          duration: 5000,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error during signup process:", err);
      form.setError("root", {
        message: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-neutral-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">
          Monitoramento do Tratamento da Sífilis
        </h1>
      </div>

      <Card className="w-full max-w-md p-6 bg-white dark:bg-neutral-800 shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-8">Cadastre-se</h2>

        <div className="space-y-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignUp)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        type="email"
                        className="w-full py-6 px-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                        {...field}
                        value={field.value || ""}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Senha"
                          type={showPassword ? "text" : "password"}
                          className="w-full py-6 px-4 border border-gray-300 dark:border-gray-600 rounded-lg pr-10"
                          {...field}
                          value={field.value || ""}
                          required
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isSubmitting}
                className="w-full py-6 text-white bg-purple-600 hover:bg-purple-700"
              >
                {form.formState.isSubmitting || isSubmitting
                  ? "CARREGANDO..."
                  : "CADASTRAR"}
              </Button>

              {form.formState.errors.root && (
                <FormMessage className="mt-2 text-center">
                  {form.formState.errors.root.message}
                </FormMessage>
              )}
            </form>
          </Form>

          <div className="mt-2 text-center text-sm">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Entrar
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;
