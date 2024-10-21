import { MongoDBAdapter } from "@auth/mongodb-adapter"
import type { Adapter, AdapterAccount, AdapterSession, AdapterUser as BaseAdapterUser } from "next-auth/adapters"
import clientPromise from "./lib/db"
import { ObjectId } from "mongodb"

type Role = "USER" | "ADMIN" | "VENDOR"

interface AdapterUser extends BaseAdapterUser {
  role: Role;
  storeId: string;
}

export function CustomMongoDBAdapter(): Adapter {
  const baseAdapter = MongoDBAdapter(clientPromise) as Adapter

  return {
    ...baseAdapter,
    
    async createUser(user) {
      const client = await clientPromise
      const db = client.db()
      
      const newUser = {
        ...user,
        role: "USER" as Role,
        storeId: "",
        _id: new ObjectId(),
        emailVerified: null,
      }

      await db.collection("users").insertOne(newUser)

      return {
        ...newUser,
        id: newUser._id.toHexString(),
        emailVerified: null,
      }
    },

    async getUser(id) {
      const client = await clientPromise
      const db = client.db()
      
      const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
      
      if (!user) return null

      return {
        id: user._id.toHexString(),
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role as Role,
        storeId: user.storeId,
      }
    },

    async getUserByEmail(email) {
      const client = await clientPromise
      const db = client.db()
      
      const user = await db.collection("users").findOne({ email })
      
      if (!user) return null

      return {
        id: user._id.toHexString(),
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role as Role,
        storeId: user.storeId,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const client = await clientPromise
      const db = client.db()
      
      const account = await db.collection("accounts").findOne({ 
        providerAccountId, 
        provider 
      })

      if (!account) return null

      const user = await db.collection("users").findOne({ 
        _id: new ObjectId(account.userId)
      })
      
      if (!user) return null

      return {
        id: user._id.toHexString(),
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role as Role,
        storeId: user.storeId,
      }
    },

    async updateUser(user) {
      const client = await clientPromise
      const db = client.db()
      
      const { id, ...data } = user
      
      const result = await db.collection("users").findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: data },
        { returnDocument: "after" }
      )

      const updatedUser = result?.value

      if (!updatedUser) throw new Error("User not found")

      return {
        id: updatedUser._id.toHexString(),
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        name: updatedUser.name,
        image: updatedUser.image,
        role: updatedUser.role as Role,
        storeId: updatedUser.storeId,
      }
    },

    async getSessionAndUser(sessionToken: string) {
      const client = await clientPromise
      const db = client.db()

      const session = await db.collection("sessions").findOne({ sessionToken })
      if (!session) return null

      const user = await db.collection("users").findOne({ 
        _id: new ObjectId(session.userId) 
      })
      if (!user) return null

      return {
        session: {
          id: session._id.toHexString(),
          sessionToken: session.sessionToken,
          userId: session.userId.toHexString(),
          expires: session.expires,
        },
        user: {
          id: user._id.toHexString(),
          email: user.email,
          emailVerified: user.emailVerified,
          name: user.name,
          image: user.image,
          role: user.role as Role,
          storeId: user.storeId,
        },
      }
    },

    // Include other methods from your original code...
  }
}