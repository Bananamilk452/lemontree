import "dotenv/config";

import { Command } from "commander";

import { auth } from "~/lib/auth";

const program = new Command();

program
  .requiredOption("-e, --email <email>", "user email address")
  .requiredOption("-n, --name [name]", "user name")
  .requiredOption("-p, --password [password]", "user password")
  .option("--admin", "set user as admin");

program.parse();
const options = program.opts();

async function createUser() {
  await auth.api.createUser({
    body: {
      email: options.email,
      name: options.name,
      password: options.password,
      role: options.admin ? "admin" : "user",
    },
  });

  console.log(`✅ User created: ${options.email}`);
}

createUser();
