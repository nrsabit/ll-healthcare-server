import { UserRole } from "@prisma/client";
import { prisma } from "../src/app/shared/prisma";
import bcrypt from "bcrypt";

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (isSuperAdminExists) {
      console.log("Super Admin Already Exists");
      return;
    }

    // TODO: we will have to set teh data inside the env file from here.

    const hashedPassword = await bcrypt.hash("superAdmin", 12);

    const superAdminData = await prisma.user.create({
      data: {
        email: "mailbox.mdnaeem@gmail.com",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        admin: {
          create: {
            name: "Web Owner",
            contactNumber: "01234567907",
          },
        },
      },
    });

    console.log("Super Admin Created Successfully", superAdminData);
  } catch (err) {
    console.log(err);
  } finally {
    await prisma.$disconnect();
  }
};

seedSuperAdmin();
