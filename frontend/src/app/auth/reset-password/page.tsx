"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
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

const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormFields = z.infer<typeof schema>;

const ResetPasswordPage = () => {
  const form = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword: SubmitHandler<FormFields> = async (data) => {
    try {
      setIsResetting(true);
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        form.setError("root", {
          message: error.message || "Erro ao redefinir a senha",
        });
        setIsResetting(false);
      } else {
        // Show success toast
        toast({
          title: "Senha redefinida com sucesso!",
          description:
            "Sua senha foi alterada e você foi autenticado automaticamente.",
          duration: 5000,
        });

        // Redirect immediately to dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      form.setError("root", {
        message: "Erro inesperado. Por favor, tente novamente.",
      });
      setIsResetting(false);
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
        <h2 className="text-2xl font-bold text-center mb-8">Redefinir Senha</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleResetPassword)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Nova senha"
                        type={showPassword ? "text" : "password"}
                        className="w-full py-6 px-4 border border-gray-300 dark:border-gray-600 rounded-lg pr-10"
                        {...field}
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="relative">
                    <FormControl>
                      <Input
                        placeholder="Confirmar nova senha"
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full py-6 px-4 border border-gray-300 dark:border-gray-600 rounded-lg pr-10"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
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
              disabled={isResetting}
              className="w-full py-6 text-white bg-purple-600 hover:bg-purple-700"
            >
              {isResetting ? "PROCESSANDO..." : "REDEFINIR SENHA"}
            </Button>

            {form.formState.errors.root && (
              <div className="mt-4 text-center text-red-600 dark:text-red-400 text-sm">
                {form.formState.errors.root.message}
              </div>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
