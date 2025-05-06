import { PatientDataProps } from "@/services/api";

type ExameControlProps = {
  patientData?: PatientDataProps | null | undefined
}

const ExameControl = ({ patientData }: ExameControlProps) => {
  return (
    <div className="w-full flex flex-col text-center pb-10 md:pb-0 max-h-72 overflow-y-auto rounded-lg">
      {/* Título fixo no topo da div */}
      <h1 className="font-bold text-lg p-2 bg-white dark:bg-neutral-800 sticky top-0 z-20">
        Exames de controle
      </h1>

      <table className="w-full text-center border-collapse">
        {/* Cabeçalho fixo abaixo do título */}
        <thead className="bg-zinc-700 text-white sticky top-[2.7rem] z-10">
          <tr>
            <th className="p-1 md:p-4">Data</th>
            <th className="p-1 md:p-4">Titulação</th>
            <th className="p-1 md:p-4">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {patientData?.case_histories.map((historie, index: number) => {
            const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
            const rowColor = colors[index % colors.length];

            return (
              <tr key={index} className={`border-gray-100 ${rowColor}`}>
                <td className="p-1 md:p-4">{historie.diagnosis_date}</td>
                <td className="p-1 md:p-4">{historie.titer_result}</td>
                <td className="p-1 md:p-4">{historie.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ExameControl