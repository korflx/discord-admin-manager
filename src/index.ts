import { Client, GuildMember, Intents } from "discord.js";
import { updateCommands } from "./commands";
import { Administrator } from "./Administrator";
import dotenv from "dotenv";

dotenv.config();

updateCommands();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.on("ready", () => {
  console.log("The bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case "sudo":
      await Administrator.setAdmin(interaction.member as GuildMember).then(
        () => {
          interaction.reply({
            content: `You've been temporarily promoted to ${Administrator.adminRoleName}.`,
            ephemeral: true,
          });
          console.log(
            `${interaction.member?.user.username} has been granted Administrator privileges through the ${Administrator.adminRoleName} role.`
          );
          setTimeout(async () => {
            await Administrator.removeAdmin(
              interaction.member as GuildMember
            ).catch((error) => console.error(error));
            console.log(
              `${interaction.member?.user.username} has been demoted from the ${Administrator.adminRoleName} role.`
            );

            await interaction.followUp({
              content: `Times up! Your ${Administrator.adminRoleName} role has expired.`,
              ephemeral: true,
            });
          }, 300000);
        },
        (error) => {
          interaction.reply({
            content: `You don't have permissions to execute this command.`,
          });
          console.error(error);
        }
      );
      break;
  }
});

client.login(process.env.TOKEN);
