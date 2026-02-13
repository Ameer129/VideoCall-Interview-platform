import { requireAuth, getAuth, clerkClient } from "@clerk/express";
import User from "../models/User.js";

export const protectRoute = [
  requireAuth(),
  async (req, res, next) => {
    try {
      const auth = getAuth(req);
      const clerkId = auth.userId;

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      let user = await User.findOne({ clerkId });

      // 🔥 AUTO-CREATE USER IF NOT EXISTS
      if (!user) {
        // ✅ FETCH USER FROM CLERK (THIS IS THE KEY)
        const clerkUser = await clerkClient.users.getUser(clerkId);

        const email =
          clerkUser.emailAddresses?.[0]?.emailAddress;

        if (!email) {
          return res.status(400).json({
            message: "Email not found from Clerk user profile",
          });
        }

        user = await User.create({
          clerkId,
          email,
          name: clerkUser.firstName || "User",
          profileImage: clerkUser.imageUrl || "",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Error in protectRoute middleware", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
