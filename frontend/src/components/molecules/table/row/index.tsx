import { DropdownMenu } from "@/components";
import { Button } from "@/components/ui/button";
import { Patient } from "@/services/api";
import { statusColor } from "@/utils/functions";
import { useMemo } from "react";

type RowProps = {
  patientData: Patient;
  rowColor: string;
};
const Row = ({ patientData, rowColor }: RowProps) => {
  const colorVariants = [
    {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-600 dark:text-red-400",
    },
    {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-600 dark:text-green-400",
    },
    {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      text: "text-yellow-600 dark:text-yellow-400",
    },
    {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-600 dark:text-purple-400",
    },
    {
      bg: "bg-pink-100 dark:bg-pink-900/30",
      text: "text-pink-600 dark:text-pink-400",
    },
  ];

  const color = useMemo(() => {
    const index = Math.floor(Math.random() * colorVariants.length);
    return colorVariants[index];
  }, []);

  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10 ${rowColor}`}
    >
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center font-medium mr-3 ${color.bg} ${color.text}`}
          >
            {patientData.id}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {patientData.medical_record_number}
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {patientData.first_exam_date}
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {patientData.last_exam_date}
      </td>
      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
        {patientData.last_case_date}
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
            patientData.status
          )}`}
        >
          {patientData.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <Button variant="ghost" size="sm" className="text-sm">
          {/* @ts-ignore */}
          <DropdownMenu id={patientData?.id} />
        </Button>
      </td>
    </tr>
  );
};

export default Row;
