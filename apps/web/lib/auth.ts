import GoogleProvider from "next-auth/providers/google"
import { DefaultSession, SessionStrategy } from "next-auth"
import { prisma } from "@repo/database"
declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      userId?: string;
      workflows?: { id: string; name: string; description?: string; createdAt:Date; enabled:true }[];
    };
  }

  interface User {
    id: string;
  }

  interface JWT {
    userId?: string;
  }
}
export const authOptions = {
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       authorization: {
    params: {
      access_type: "offline",
      prompt: "consent",
    },
  },
    }),
    
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user ,account}: any) {
            try {
        console.log("reached here 1")
        console.log(account)
        if (user) {
           console.log("reached here 2")
          const exsistingUser = await prisma.user.findUnique({
            where: { email: user.email }, include: {
              createdWorkflows:
                { select: { id: true,name:true,description:true,createdAt:true,isPublished:true } }
            }
          });
          let userId;
          let workflows :any = [];
          console.log("reached here 3")
          const expiresAt = new Date(account.expires_at * 1000);
          if (!exsistingUser) {
            const newUser = await prisma.user.create({
              data: {
                name: token.name,
                email: token.email, googleID: token.sub, tokenExpiry: expiresAt, image: token.picture,accessToken: account.access_token,refreshToken:account.refresh_token
              }
            });
            userId = newUser.userId;
            console.log("reached here 4")
          } else {
            console.log("reached here 5")
            await prisma.user.update({
              where: { email: user.email },
              data: {
                googleID: token.sub, tokenExpiry: expiresAt, accessToken: account.access_token
              },
            })
            userId = exsistingUser.userId;
            workflows= exsistingUser.createdWorkflows.map(workflow => ({ id: workflow.id, name: workflow.name, description: workflow.description ,enabled:workflow.isPublished,createdAt:workflow.createdAt  }));
            console.log("reached here 6")
          }
          token.id = user.sub ?? token.sub;
          token.name = user.name;
          token.email = user.email;
          token.userId = userId;
          token.workflows = workflows;
          console.log("reached here 7")
        }
        return token
      } catch (error) {
        console.log("Error while signing in:", error);
        throw new Error("Error while signing in : Error " + error);
      }

    },
    async session({ session, token }: any) {
      try {
        
        session.user = {
          ...session.user,
          userId: token.userId,
          workflows: token.workflows,
        };
        console.log("Session created:", session);
        return session;
      } catch (error) {
        console.log("Error while creating session:", error);
        throw new Error("Error while creating session : Error " + error);
        
      }
    },
    
  },pages: {
    signIn: '/signin',
    error: '/signin', 
  },
}