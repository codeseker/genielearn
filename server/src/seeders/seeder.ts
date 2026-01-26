import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import permissionModel from "../models/permission";
import roleWithPermissionModel from "../models/roleWithPermission";
import userModel from "../models/user";
import roleModel from "../models/role";
import { connectDB } from "../db/db";

export const permissionsList = [
  // USER permissions
  { name: "create", module: "user" },
  { name: "read", module: "user" },
  { name: "update", module: "user" },
  { name: "delete", module: "user" },

  // COURSE permissions
  { name: "create", module: "course" },
  { name: "read", module: "course" },
  { name: "update", module: "course" },
  { name: "delete", module: "course" },

  // MODULE permissions
  { name: "create", module: "module" },
  { name: "read", module: "module" },
  { name: "update", module: "module" },
  { name: "delete", module: "module" },

  // LESSON permissions
  { name: "create", module: "lesson" },
  { name: "read", module: "lesson" },
  { name: "update", module: "lesson" },
  { name: "delete", module: "lesson" },
  { name: "generate", module: "lesson" }, // AI special

  // PROGRESS permissions
  { name: "read", module: "progress" },
  { name: "update", module: "progress" },
];

export const rolesList = [
  {
    name: "system_user",
    module: "system",
  },
  {
    name: "regular_user",
    module: "system",
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log("📌 Connected to MongoDB");

    // 1️⃣ Seed Permissions
    await permissionModel.deleteMany({});
    const permissions = await permissionModel.insertMany(permissionsList);
    console.log("✔ Permissions seeded");

    // 2️⃣ Seed Roles
    await roleModel.deleteMany({});
    const roles = await roleModel.insertMany(rolesList);
    console.log("✔ Roles seeded");

    const systemRole = roles.find((r) => r.name === "system_user");
    const regularRole = roles.find((r) => r.name === "regular_user");

    // Filter permissions for regular users (read-only + lesson generate access)
    const regularAllowed = permissions.filter(
      (p) =>
        p.name === "read" || (p.module === "lesson" && p.name === "generate"),
    );

    // 3️⃣ Seed Role-Permissions Mapping
    await roleWithPermissionModel.deleteMany({});

    const rolePermissionsData = [
      // System user → all permissions
      ...permissions.map((p) => ({
        roleId: systemRole?._id,
        permissions: p._id,
      })),

      // Regular user → limited permissions
      ...regularAllowed.map((p) => ({
        roleId: regularRole?._id,
        permissions: p._id,
      })),
    ];

    await roleWithPermissionModel.insertMany(rolePermissionsData);
    console.log("✔ Role-Permission mapping seeded");

    // 4️⃣ Seed Users
    await userModel.deleteMany({});

    const hashedAdminPass = await bcrypt.hash("Admin@123", 10);
    const hashedRegularPass = await bcrypt.hash("User@123", 10);

    await userModel.insertMany([
      {
        username: "systemadmin",
        first_name: "System",
        last_name: "User",
        email: "system@admin.com",
        password: hashedAdminPass,
        status: "active",
      },
      {
        username: "john",
        first_name: "Regular",
        last_name: "User",
        email: "regular@user.com",
        password: hashedRegularPass,
        status: "active",
      },
    ]);

    console.log("✔ Users seeded");

    console.log("🎯 Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seed();
