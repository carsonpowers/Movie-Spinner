import Wheel from '../components/Wheel'
import UI from '../components/UI'

export default async function Thing({ movies }) {
  return (
    <>
      <UI movies={movies}></UI>
      <Wheel movies={movies} />
    </>
  )
}
