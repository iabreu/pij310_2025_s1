import { DropdownMenu } from "@/components";
import { Button } from "@/components/ui/button";
import { Patient } from "@/services/api";
import { statusColor } from "@/utils/functions";
import { useMemo } from "react";

type RowProps = {
  patientData: Patient;
  rowColor: string;
  refetch: Function;
};

const Row = ({ patientData, rowColor, refetch }: RowProps) => {
  return (
    <tr
      className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-neutral-700/10 ${rowColor}`}
    >
      <td className="py-3 px-4">
        <div className="flex items-center">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center font-medium mr-3 ${statusColor(
              patientData.status
            )} `}
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
        <div className="text-sm flex justify-center items-center p-2 rounded-md hover:bg-slate-700 cursor-pointer">
          <DropdownMenu id={Number(patientData?.id)} refetch={refetch} />
        </div>
      </td>
    </tr>
  );
};

export default Row;
