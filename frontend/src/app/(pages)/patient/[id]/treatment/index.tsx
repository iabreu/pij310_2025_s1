import { PatientDataProps } from "@/services/api";

type TreatmentProps = {
  patientData?: PatientDataProps | null | undefined;
};

const Treatment = ({ patientData }: TreatmentProps) => {
  const length = patientData?.case_histories?.length ?? 0;

  return (
    <div className="w-full flex flex-col justify-center">
      <h1 className="font-bold text-lg p-2">Tratamento</h1>
      <div className="flex justify-around bg-zinc-700">
        <h2>Data</h2>
        <h2>Notas</h2>
      </div>
      {length > 0 ? (
        <div className="max-h-52 overflow-y-auto w-full">
          <table className="w-full text-center">
            <tbody>
              {patientData?.case_histories
                .sort((a, b) => Number(a.id) - Number(b.id))
                .map((historie, index: number) => {
                  const colors = ["bg-neutral-700/10", "bg-neutral-700/30"];
                  const rowColor = colors[index % colors.length];
                  return (
                    <tr key={index} className={rowColor}>
                      <td className="p-2">{historie.diagnosis_date}</td>
                      <td className="p-2">{historie.notes}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="justify-center flex w-full text-center p-2">
          <h1>Sem dados</h1>
        </div>
      )}
    </div>
  );
};

export default Treatment;
