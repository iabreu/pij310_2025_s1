export const statusColor = (status: string) => {
  switch (status) {
    case 'Infecção Ativa':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Reinfecção':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'Em Tratamento':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Tratamento Completo':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'Monitoramento (Pós-Tratamento)':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
    case 'Curado':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400';
    case 'Falha no tratamento':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'Unknown':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  }
};

