import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ThemeModeToggle from "@/components/ThemeModeToggle";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-neutral-100 to-neutral-300 dark:from-neutral-900 dark:to-neutral-800 text-neutral-900 dark:text-neutral-100 overflow-y-none">
      <header className="w-full py-4 px-4 md:px-6 bg-transparent">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <h1 className="text-xl md:text-3xl font-bold">Boilerplate</h1>
          <ThemeModeToggle />
        </div>
      </header>

      <main className="container mx-auto flex flex-col lg:flex-row lg:space-x-8 items-center justify-center text-left min-h-[calc(100vh-72px)] overflow-y-auto pb-8 px-4 md:px-8">
        <div className="flex-1 space-y-6 w-full lg:max-w-lg px-4 pt-2">
          <div className="flex flex-col space-y-4 mt-4">
            <Button
              className="md:text-lg py-4 md:py-6 bg-blue-500 hover:bg-blue-600 text-neutral-100 dark:bg-blue-500 hover:dark:bg-blue-400 dark:text-neutral-100"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              className="md:text-lg py-4 md:py-6 dark:bg-neutral-900 text-blue-500 hover:bg-blue-500 hover:text-white dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-neutral-100"
              onClick={() => router.push("/login")}
            >
              Log In
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
