import prompts from 'prompts';
import { banner } from '../lib/terminal.js';
import { initCommand } from '../commands/init.js';
import { doctorCommand } from '../commands/doctor.js';

export async function runTui() {
  console.log(banner());
  const choice = await prompts({
    type: 'select',
    name: 'action',
    message: 'Choose an action',
    choices: [
      { title: 'Write reply', value: 'reply' },
      { title: 'Improve draft', value: 'improve' },
      { title: 'Score reply', value: 'score' },
      { title: 'Generate angles', value: 'angles' },
      { title: 'Generate hooks', value: 'hooks' },
      { title: 'Profile', value: 'profile' },
      { title: 'Doctor', value: 'doctor' },
      { title: 'Exit', value: 'exit' },
    ],
  });
  if (choice.action === 'doctor') console.log(doctorCommand());
  if (choice.action === 'profile') console.log(initCommand());
}
