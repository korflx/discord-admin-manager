import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import dotenv from "dotenv";

import type { ApplicationCommandData } from "discord.js";
import handleSudo from "./sudo";

dotenv.config();

const commands: ApplicationCommandData[] = [
  {
    name: "sudo",
    description: "Gives the user temporary Administrator permissions.",
    // options: [
    //   {
    //     type: 6,
    //     name: "user",
    //     description: "The user to be granted Administrator privileges.",
    //   },
    // ],
  },
];

if (!process.env["DISCORD_BOT_TOKEN"])
  throw new Error("A Discord Token must be provided!");

const rest = new REST({ version: "10" }).setToken(
  process.env["DISCORD_BOT_TOKEN"]
);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    if (!process.env["DISCORD_CLIENT_ID"])
      throw new Error("An application ID must be provided!");
    await rest.put(
      Routes.applicationCommands(process.env["DISCORD_CLIENT_ID"]),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

try {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  if (!client) throw new Error("Client not created!");

  client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    switch (interaction.commandName) {
      case "sudo":
        await handleSudo(interaction);
        break;
    }
  });

  client.login(process.env["DISCORD_BOT_TOKEN"]);
} catch (error) {
  console.error(error);
}
