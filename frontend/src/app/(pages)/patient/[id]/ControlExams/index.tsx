import { PatientDataProps } from "@/services/api";

type ExameControlProps = {
  patientData?: PatientDataProps | null | undefined
}

const ExameControl = ({ patientData }: ExameControlProps) => {
  return (
    <div className="w-full flex flex-col justify-center text-center pb-10 md:pb-0">
      <h1 className='font-bold text-lg p-2'>Exames de controle</h1>
      <table className='text-center rounded-lg overflow-hidden'>
        <thead className='bg-zinc-700 w-full h-ull'>
          <tr>
            <th className='p-1 md:p-4'>Data</th>
            <th className='p-1 md:p-4'>Titulação</th>
            <th className='p-1 md:p-4'>Estatus</th>
          </tr>
        </thead>
        <tbody>
          {patientData && patientData.case_histories.map((historie, index: number) => {
            const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
            const rowColor = colors[index % colors.length];

            return (
              <tr key={index} className={`border-gray-100 ${rowColor}`}>
                <td className='p-1 md:p-4'>{historie.diagnosis_date}</td>
                <td className='p-1 md:p-4'>{historie.titer_result}</td>
                <td className='p-1 md:p-4'>{historie.status}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ExameControl