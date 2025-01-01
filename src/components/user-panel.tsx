import { auth, signIn, signOut } from 'auth'

export default async function UserPanel() {
  const { user } = (await auth()) || {}
  const buttonText = user ? 'Sign out' : 'Sign in with Google'
  console.log(user)
  return (
    <form
      action={async () => {
        'use server'
        if (user) await signOut()
        else await signIn('google')
      }}
    >
      {user && <img src={user.image} alt='user image' />}
      <button type='submit'>{buttonText}</button>
    </form>
  )
}
