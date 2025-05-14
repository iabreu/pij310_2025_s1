import { Card as CardComponent } from "@/components/ui/card";

type CardProps = {
  title: string;
  description: string;
  contentClass?: any;
};
const Card = ({ title, description, contentClass }: CardProps) => {
  return (
    <CardComponent className="p-6 shadow-lg w-full md:w-72 h-28 hover:shadow-xl transition-shadow bg-white dark:bg-neutral-800 relative flex flex-col">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p
        className={`${contentClass} text-gray-600 dark:text-gray-300 text-sm mb-8`}
      >
        {description}
      </p>
    </CardComponent>
  );
};
export default Card;
