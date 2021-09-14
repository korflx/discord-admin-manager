import { GuildMember } from "discord.js";
import { APIInteractionGuildMember } from "discord-api-types";

/**
 * @class
 * @hideconstructor
 */
export class Administrator {
  /** @private */
  static _adminCandidateRoles: string[][] = [["IT", "Coordenação"], ["sudoer"]];

  /** @private */
  static _adminRoleName: string = "Admin";

  /**
   * The current value defined as the name of the role with Administrator permissions.
   * @static
   */
  static get adminRoleName() {
    return this._adminRoleName;
  }

  /**
   * Set the name of the role that has Administrator permissions.
   * @param role
   */
  static set adminRoleName(role: string) {
    this._adminRoleName = role;
  }

  /**
   * Check if a member is a valid candidate for the Administrator permission.
   * @static
   * @async
   * @param {GuildMember} member - The member whose permissions to be an administrator are to be checked for.
   * @returns {boolean} If a member is a valid candidate for the Administrator permission.
   */
  static async isValidCandidate(member: GuildMember) {
    return (
      this._adminCandidateRoles.some((roleCombination) =>
        roleCombination.every((roleName) => {
          return member.roles.cache.find((role) => role.name === roleName);
        })
      ) || (await member.guild.fetchOwner()) === member
    );
  }

  /**
   * Sets a member as an Administrator.
   * @param {GuildMember} member
   * @throws Will throw an error if the member isn't a valid candidate for the Administrator permission.
   * @throws Will throw an error if the role set to be the Administrator role doesn't exist.
   */
  static async setAdmin(
    member: GuildMember | APIInteractionGuildMember | null
  ) {
    if (member instanceof GuildMember) {
      if (!(await Administrator.isValidCandidate(member))) {
        throw new Error(
          "You don't have the required permissions do execute this command."
        );
      }

      const role = member.guild.roles.cache.find(
        (role) => role.name === this.adminRoleName
      );

      if (role) {
        await member.roles.add(role);
        return;
      }
      throw new Error(`Role "${this.adminRoleName}" doesn't exist.`);
    }
  }

  /**
   * Removes the Administrator permission from a member.
   * @param {GuildMember} member
   * @throws Will throw an error if the member wasn't an Administrator already.'.
   * @throws Will throw an error if the role set to be the Administrator role doesn't exist.
   */
  static async removeAdmin(
    member: GuildMember | APIInteractionGuildMember | null
  ) {
    if (member instanceof GuildMember) {
      if (!member.roles.cache.find((role) => role.name === this.adminRoleName))
        throw new Error(
          `The user doesn't have Administrator privileges already.`
        );

      const role = member.guild.roles.cache.find(
        (role) => role.name === this.adminRoleName
      );

      if (role) {
        await member.roles.remove(role);
        return;
      }
      throw new Error(`Role "${this.adminRoleName}" doesn't exist.`);
    }
  }
}
