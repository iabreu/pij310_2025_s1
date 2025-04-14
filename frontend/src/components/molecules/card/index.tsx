import { Button } from "@/components/ui/button";
import { Card as CardComponent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

type CardProps = {
  title: string
  description: string
  onClick: () => void
}
const Card = ({ title, description, onClick }: CardProps) => {
  return (
    <CardComponent className="p-6 shadow-lg hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-8">
        {description}
      </p>
      <div className="mt-auto self-end">
        <Button
          variant="link"
          className="text-purple-600 dark:text-purple-400 p-0 flex items-center"
          onClick={onClick}
        >
          VER <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </CardComponent>)
}
export default Card