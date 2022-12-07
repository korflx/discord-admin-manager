import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

const ADMIN_CANDIDATE_ROLES_NAMES: string[][] = [
  ["IT", "Coordenação"],
  ["sudoer"],
];

const ADMIN_ROLE_NAME: string = "Admin";

/**
 * Check if a member is a valid candidate for the Administrator permission.
 * @async
 * @param {GuildMember} member - The member whose permissions to be an administrator are to be checked for.
 * @returns {Promise<boolean>} True if a member is a valid candidate for the Administrator permission.
 */
const isValidCandidate = async (member: GuildMember): Promise<boolean> => {
  return (
    ADMIN_CANDIDATE_ROLES_NAMES.some((roleCombination) =>
      roleCombination.every((roleName) =>
        member.roles.cache.some((role) => role.name === roleName)
      )
    ) || (await member.guild.fetchOwner()) === member
  );
};

const setAdmin = async (member: GuildMember) => {
  if (!(await isValidCandidate(member))) {
    throw new Error(
      `${member.user.tag} tried to grant himself Administrator permissions in ${member.guild.name}#${member.guild.id}.`
    );
  }
  const role = member.guild.roles.cache.find(
    (role) => role.name === ADMIN_ROLE_NAME
  );
  if (role) {
    await member.roles.add(role);
    return;
  }
  throw new Error(
    `Role "${ADMIN_ROLE_NAME}" doesn't exist in ${member.guild.name}#${member.guild.id}.`
  );
};

const removeAdmin = async (member: GuildMember) => {
  const adminRole = member.guild.roles.cache.find(
    (role) => role.name === ADMIN_ROLE_NAME
  );
  if (!adminRole)
    throw new Error(
      `Role "${ADMIN_ROLE_NAME}" doesn't exist in ${member.guild.name}#${member.guild.id}.`
    );
  await member.roles.remove(adminRole);
};

const handleSudo = async (interaction: ChatInputCommandInteraction) => {
  const member = interaction.member as GuildMember;

  await setAdmin(member).then(
    () => {
      interaction.reply({
        content: `You've been temporarily promoted to ${ADMIN_ROLE_NAME}.`,
        ephemeral: true,
      });
      console.log(
        `${member.user.tag} has been granted Administrator privileges in ${member.guild.name}#${member.guild.id}.`
      );
      setTimeout(async () => {
        await removeAdmin(member).then(
          async () => {
            console.log(
              `${member.user.tag} has been demoted from the ${ADMIN_ROLE_NAME} role in ${member.guild.name}#${member.guild.id}.`
            );

            await interaction.followUp({
              content: `Times up! Your ${ADMIN_ROLE_NAME} role has expired.`,
              ephemeral: true,
            });
          },
          async (error) => {
            console.error(error);
            await interaction.followUp({
              content: `An error ocurred while trying to demote you.`,
              ephemeral: true,
            });
          }
        );
      }, 300000); // 300000ms = 5min
    },
    (error) => {
      interaction.reply({
        content: `You don't have permissions to execute this command.`,
      });
      console.error(error);
    }
  );
};

export default handleSudo;
