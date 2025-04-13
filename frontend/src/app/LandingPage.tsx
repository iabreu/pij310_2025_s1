import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ThemeModeToggle from "@/components/ThemeModeToggle";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-neutral-100 flex flex-col items-center">
      <main className="container mx-auto flex flex-col lg:flex-row items-center justify-center text-center flex-1 px-4 md:px-8">
        <div className="max-w-3xl mx-auto mb-12 lg:mb-0 lg:mr-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sistema de acompanhamento de tratamento da Sífilis
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Plataforma para monitoramento e acompanhamento do tratamento de
            pacientes com sífilis, facilitando o controle médico e adesão ao
            tratamento.
          </p>
        </div>

        <div className="w-full max-w-md space-y-4">
          {!user ? (
            <>
              <Button
                className="w-full py-6 text-xl text-white bg-purple-600 hover:bg-purple-700"
                onClick={() => router.push("/login")}
              >
                ENTRAR
              </Button>

              <Button
                variant="outline"
                className="w-full py-6 text-xl border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                onClick={() => router.push("/signup")}
              >
                CADASTRE-SE
              </Button>
            </>
          ) : (
            <Button
              className="w-full py-6 text-xl text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push("/home")}
            >
              IR PARA A HOME
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
