'use client'
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PatientDataProps, patientService } from '@/services/api'
import { Spinner } from '@/components';
import PageLayout from '@/components/PageLayout';


const PatientPage = () => {
  const [isPatientLoading, setIsPatientiLoading] = useState<boolean>(false)
  const [patientData, setPatientData] = useState<PatientDataProps | null>(null)
  const params = useParams();
  const route = useRouter()
  const id = params.id;

  useEffect(() => {
    if (id) {
      setIsPatientiLoading(true)
      try {
        patientService.getPatient(Number(id))
          .then((res) => setPatientData(res))
      } catch (err) {
        console.error(err)
      } finally {
        setIsPatientiLoading(false)
      }
    }
  }, [id])

  const handleBackHome = () => {
    route.push('/home')
  }

  const refetch = () => {
    setIsPatientiLoading(true)

    try {
      patientService.getPatient(Number(id))
        .then((res) => setPatientData(res))
    } catch (err) {
      console.error(err)
    } finally {
      setIsPatientiLoading(false)
    }
  }

  if (isPatientLoading) {
    return <Spinner />;
  }

  if (!patientData && !isPatientLoading) {
    return (
      <PageLayout>
        <section className='flex justify-center items-center m-auto w-full h-full'>
          <button onClick={refetch}>Recarregar</button>
        </section>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <section className="w-full">
        <button onClick={handleBackHome}>voltar</button>
        <section className='flex justify-center items-center m-auto w-full h-full gap-5 flex-wrap'>
          <div>
            <h1>Acompanhamento individual</h1>
            <table>
              <tbody>
                <tr>
                  <td>Proturario</td>
                  <td>{patientData?.medical_record_number}</td>
                </tr>
                <tr>
                  <td>Data exame Inicial</td>
                  <td>{patientData?.diagnosis_date}</td>
                </tr>
                <tr>
                  <td>Titulação Inicial</td>
                  <td>{patientData?.case_histories[0].titer_result}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h1>Estatus atual</h1>
            <span>{patientData?.status}</span>
          </div>
          <div>
            <h1>Tratamento</h1>
            <table>
              <tbody>
                <tr>
                  {patientData?.case_histories.map((historie) => (
                    <td>{historie.diagnosis_date}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h1>Exames de controle</h1>
            <table>
              <tbody>
                {patientData?.case_histories.map((historie) => (
                  <tr>
                    <td>{historie.diagnosis_date}</td>
                    <td>{historie.status}</td>
                    <td>{historie.titer_result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </PageLayout>
  );
}
export default PatientPage