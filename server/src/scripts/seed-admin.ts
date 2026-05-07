import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "../models/user.model.js";
import config from "../config/config.js";

const createAdmin = async () => {
  try {
    const { email, password, username } = config.admin;

    if (!email || !password) {
      throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env");
    }

    await mongoose.connect(config.mongoUri);
    console.log("✓ Connected to database");

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("✓ Admin already exists:", existingAdmin.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      nativeLanguage: "en",
      isBanned: false,
    });

    console.log("✓ Admin created successfully");
    console.log(`  Email: ${email}`);
    console.log(`  Username: ${username}`);
    console.log(`  ID: ${admin._id}`);
    console.log("\n⚠️  Make sure to change the password after first login!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Failed to create admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();