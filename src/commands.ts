import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";

dotenv.config();

const APPLICATION_ID = "879404208384782396";

const commands = [
  {
    name: "sudo",
    description: "Gives the user temporary Administrator permissions.",
    // options: [
    //   {
    //     type: 6,
    //     name: "-u",
    //     description: "The user to be granted Administrator privileges.",
    //   },
    // ],
  },
];

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN || "");

export const updateCommands = async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(APPLICATION_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};
