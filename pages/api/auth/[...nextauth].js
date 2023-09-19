import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // For now, we just mock a user. In a real-world scenario, 
        // you would verify the credentials against your database here.
        const user = { id: 1, name: credentials.username, email: credentials.email }

        if (user) {
          return Promise.resolve(user)
        } else {
          return Promise.reject(new Error('Invalid username or password'))
        }
      }
    })
  ]
}

export default NextAuth(authOptions)
