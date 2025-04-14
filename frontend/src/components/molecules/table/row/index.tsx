import { Button } from "@/components/ui/button"
import { useMemo } from "react"

type RowProps = {
  nick: string | number
  name: string
  time?: string | null | undefined
  status: string
  actions: string
}
const Row = ({ nick, name, time, status, actions }: RowProps) => {
  const statusColor = (status: string) => {
    switch (status) {
      case 'Tratamento concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'Em tratamento':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'Novo caso':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const colorVariants = [
    {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
    },
    {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-600 dark:text-green-400',
    },
    {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
    },
    {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
    },
    {
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-600 dark:text-pink-400',
    },
  ];

  const color = useMemo(() => {
    const index = Math.floor(Math.random() * colorVariants.length);
    return colorVariants[index];
  }, []);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10">
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-medium mr-3 ${color.bg} ${color.text}`} >
            {nick}
          </div>
          <span>{name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {time}
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(status)}`} >
          {status}
        </span>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="sm" className="text-sm">
          {actions}
        </Button>
      </td>
    </tr >
  )
}

export default Row