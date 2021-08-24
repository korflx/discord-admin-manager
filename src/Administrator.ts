import { GuildMember } from "discord.js";
import { APIInteractionGuildMember } from "discord-api-types";

export class Administrator {
  static _adminCandidateRoles: string[][] = [["IT", "Coordenação"]];

  static _adminRoleName: string = "Admin";

  static get adminRoleName() {
    return this._adminRoleName;
  }

  static set adminRoleName(role: string) {
    this._adminRoleName = role;
  }

  static async isAdministrator(member: GuildMember) {
    return (
      this._adminCandidateRoles.some((roleCombination) =>
        roleCombination.every((roleName) => {
          return member.roles.cache.find((role) => role.name === roleName);
        })
      ) || (await member.guild.fetchOwner()) === member
    );
  }

  static async setAdmin(
    member: GuildMember | APIInteractionGuildMember | null
  ) {
    if (member instanceof GuildMember) {
      if (!(await Administrator.isAdministrator(member))) {
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
