"use client";

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
});

const resetSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
});

type LoginFormFields = z.infer<typeof loginSchema>;
type ResetFormFields = z.infer<typeof resetSchema>;

const SignIn = () => {
  const loginForm = useForm<LoginFormFields>({
    resolver: zodResolver(loginSchema),
  });
  const resetForm = useForm<ResetFormFields>({
    resolver: zodResolver(resetSchema),
  });
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSignIn: SubmitHandler<LoginFormFields> = async (data) => {
    const { email, password } = data;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Invalid email or password")
      ) {
        loginForm.setError("password", {
          message: "Senha incorreta. Por favor, tente novamente.",
        });
      } else if (
        error.message.includes("user not found") ||
        error.message.includes("user is not found")
      ) {
        loginForm.setError("email", {
          message: "Email não encontrado. Verifique o email ou cadastre-se.",
        });
      } else {
        loginForm.setError("root", {
          message: "Erro ao fazer login. Por favor, tente novamente.",
        });
      }
    } else {
      window.location.href = "/home";
    }
  };

  const handleResetPassword = async (data: ResetFormFields) => {
    try {
      setResetLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + "/auth/reset-password",
      });

      if (error) {
        resetForm.setError("email", {
          message: error.message,
        });
      } else {
        setResetSent(true);
        toast({
          title: "Link de recuperação enviado!",
          description: "Verifique seu email para redefinir sua senha.",
          duration: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      resetForm.setError("email", {
        message: "Erro ao enviar email de recuperação.",
      });
    } finally {
      setResetLoading(false);
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
        <h2 className="text-2xl font-bold text-center mb-8">Entrar</h2>

        <div className="space-y-6">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleSignIn)}
              className="space-y-6"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          className="w-full py-6 px-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
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

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  className="text-sm text-purple-600 hover:underline dark:text-purple-400"
                >
                  Esqueceu sua senha?
                </button>
              </div>

              <Button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full py-6 text-white bg-purple-600 hover:bg-purple-700"
              >
                {loginForm.formState.isSubmitting ? "CARREGANDO..." : "ENTRAR"}
              </Button>

              {loginForm.formState.errors.root && (
                <div className="mt-4 text-center text-red-600 dark:text-red-400 text-sm">
                  {loginForm.formState.errors.root.message}
                </div>
              )}
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
              onClick={() => router.push("/signup")}
            >
              CADASTRE-SE
            </Button>
          </div>
        </div>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold mb-2">
              Recuperar Senha
            </DialogTitle>
            <DialogDescription>
              Digite seu email para receber um link de recuperação de senha.
            </DialogDescription>
          </DialogHeader>

          {resetSent ? (
            <div className="py-4 text-center">
              <div className="text-green-600 dark:text-green-400 font-medium mb-2">
                Email enviado com sucesso!
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifique sua caixa de entrada para acessar o link de
                recuperação de senha.
              </p>
              <DialogClose asChild>
                <Button className="mt-4 w-full" variant="outline">
                  Fechar
                </Button>
              </DialogClose>
            </div>
          ) : (
            <Form {...resetForm}>
              <form
                onSubmit={resetForm.handleSubmit(handleResetPassword)}
                className="space-y-4"
              >
                <FormField
                  control={resetForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email"
                          type="email"
                          className="w-full py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="flex gap-2 justify-end">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={resetLoading}
                  >
                    {resetLoading ? "Enviando..." : "Enviar Link"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignIn;
