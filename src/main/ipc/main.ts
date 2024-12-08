import { IntializeConsoleKeyHandlers } from './settings/console-key'
import { forEachPreset, InitializePreset } from './presets'
import { InitializeCommandQueue } from './commands/queue'
import InitializeContributors from './contributors'
import { BrowserWindow, ipcMain } from 'electron'
import { InitializeAPIHandlers } from './api'

function IntializeIPC(mainWindow: BrowserWindow) {
  forEachPreset(
    ipcMain.handle,
    InitializePreset('announcements', [
      {
        type: 'server',
        label: 'NO FFA/RDM ...',
        message:
          'NO FFA/RDM (only in the pit) Flourish[Press Scroll Wheel] to duel someone! To votekick a FFAer Press ESC - Scoreboard and klick on the name'
      },
      {
        type: 'admin',
        label: 'Problem/Appeal/Invite',
        message:
          'If you have a problem with a player/ appeal a ban visit discord.gg/sakclan and go to server tickets. Dont throw stuff or people into the pit!!!'
      }
    ])
  )
  forEachPreset(
    ipcMain.handle,
    InitializePreset('punishments', [
      {
        label: 'FFA',
        reason: 'FFA',
        min_duration: 1,
        max_duration: 12
      },
      {
        label: 'FFA (4 hours)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 4,
        max_duration: 4
      },
      {
        label: 'FFA (warning)',
        reason: '',
        min_duration: 1,
        max_duration: 1
      },
      {
        label: 'FFA (warning 1 hour)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 1,
        max_duration: 1
      },
      {
        label: 'FFA (8 hours)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 8,
        max_duration: 8
      },
      {
        label: 'FFA (12 hours)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 12,
        max_duration: 12
      },
      {
        label: 'FFA (1d)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 24,
        max_duration: 24
      },
      {
        label: 'FFA (3d)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 72,
        max_duration: 72
      },
      {
        label: 'FFA (1w)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 144,
        max_duration: 144
      },
      {
        label: 'FFA (2 weeks)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 288,
        max_duration: 288
      },
      {
        label: 'FFA (1 month)',
        reason:
          "FFA: You need to flourish to your opponent and wait on them to flourish back to start a duel. Flourish can be done with MMB, or L3+Square/X. FFA is allowed only in the pit, outside of the pit you aren't allowed to randomly attack (which includes; jabs, kicks, tackles, throwing items, arrows, etc.) other players. Read the rules at discord.gg/sakclan or appeal your ban in there.",
        min_duration: 576,
        max_duration: 576
      },
      {
        label: 'PERMANENT: (add custom reason)',
        reason: 'Appeal at discord.gg/sakclan',
        min_duration: 999999,
        max_duration: 999999
      },
      {
        label: 'PERMANENT: (GENERIC REASON)',
        reason:
          'You have been permanently banned from this server, depending on the details of your case this can be due to various differnt reasons. Make an appeal at discord.gg/sakclan if you believe this was unfair, you want to ask questions about this ban, or appeal this ban. Playing on any alts in the mean time will only worsen your situation, please refrain from doing so.',
        min_duration: 999999,
        max_duration: 999999
      },
      {
        label: 'Racism / Bigotry / Hatespeech',
        reason:
          'Hate speech, whether racist, sexist or whatever other kind of bigotry you can think of can all fall under this umbrella term. Appeal at discord.gg/sakclan',
        min_duration: 100,
        max_duration: 100000
      },
      {
        label: 'Offensive username',
        reason:
          'Ur username is not allowed on this server, appeal this at discord.gg/sakclan when you have changed it to something that is in line with the rules of the server (disc.gg/sakclan). Appeal your ban here incase you believe this was either unwaranted, you have changed ur name and want to resume playing, or have any questions.',
        min_duration: 999,
        max_duration: 999999
      },
      {
        label: 'Alt Account Suspected, appeal:',
        reason:
          'This account is suspected of being an alt account for a banned player, if this ban is unjust/incorrect appeal your ban at discord.gg/sakclan and we will look at your case as soon as we can.',
        min_duration: 1,
        max_duration: 999999
      },
      {
        label: 'Cheats / DDOS',
        reason:
          'Cheating and/or DDOS attempts are strictly prohibited, please make a ticket at discord.gg/sakclan if you wish to appeal this ban. Using alt accounts in the mean time will be a surefire way to get yourself in even more trouble with the community, take the right approach and contact us.',
        min_duration: 999999,
        max_duration: 999999
      },
      {
        label: 'Trollvote (1st offense 1-4H)',
        reason:
          'Creating votekicks against players without any valid reason to do so will be considered troll voting. The admins are there to help out if you need it, if you see this, you are someone that has been repeatedly doing this or has simply done it to the wrong group of players at the time. Read the rules at discord.gg/sakclan before you continue playing, here you can also appeal your ban or ask further questions.',
        min_duration: 1,
        max_duration: 4
      },
      {
        label: 'Trollvoting',
        reason:
          'Creating votekicks against players without any valid reason to do so will be considered troll voting. The admins are there to help out if you need it, if you see this, you are someone that has been repeatedly doing this or has simply done it to the wrong group of players at the time. Read the rules at discord.gg/sakclan before you continue playing, here you can also appeal your ban or ask further questions.',
        min_duration: 1,
        max_duration: 9999
      },
      {
        label: 'Trollvoting (repeat, other)',
        reason:
          'Creating votekicks against players without any valid reason to do so will be considered troll voting. The admins are there to help out if you need it, if you see this, you are someone that has been repeatedly doing this or has simply done it to the wrong group of players at the time. Read the rules at discord.gg/sakclan before you continue playing, here you can also appeal your ban or ask further questions.',
        min_duration: 1,
        max_duration: 9999,
      }
    ])
  )
  IntializeConsoleKeyHandlers(mainWindow, ipcMain)
  InitializeContributors(ipcMain.handle)
  InitializeAPIHandlers(ipcMain.handle)
  InitializeCommandQueue(ipcMain)
}

export default IntializeIPC
