import { Command } from 'commander';
import { VERSION } from './lib/version.js';
import { initCommand } from './commands/init.js';
import { doctorCommand } from './commands/doctor.js';
import { replyCommand } from './commands/reply.js';
import { improveCommand } from './commands/improve.js';
import { scoreCommand } from './commands/score.js';
import { anglesCommand } from './commands/angles.js';
import { hooksCommand } from './commands/hooks.js';
import { profileSetInteractive, profileShowCommand } from './commands/profile.js';
import { runTui } from './tui/app.js';

export async function main(argv = process.argv) {
  const program = new Command();
  program.name('signallane').helpOption('-h, --help');
  program.exitOverride();

  const hasArgs = argv.slice(2).length > 0;
  if (argv.includes('--version') || argv.includes('-v')) {
    console.log(`signallane ${VERSION}`);
    return;
  }
  if (!hasArgs) {
    await runTui();
    return;
  }

  program
    .command('init')
    .description('initialize local storage')
    .action(() => console.log(initCommand()));

  program
    .command('doctor')
    .description('check local setup')
    .action(() => console.log(doctorCommand()));

  program
    .command('reply')
    .description('generate three reply options')
    .option('--from <file>', 'read source text from a file')
    .option('--text <text>', 'paste source text directly')
    .action((opts) => printReply(replyCommand(opts)));

  program
    .command('improve')
    .description('improve a reply draft')
    .requiredOption('--text <text>', 'draft reply text')
    .action((opts) => console.log(improveCommand(opts.text)));

  program
    .command('score')
    .description('score a reply draft')
    .requiredOption('--text <text>', 'reply text')
    .action((opts) => console.log(formatScore(scoreCommand(opts.text))));

  program
    .command('angles')
    .description('generate conversation angles')
    .requiredOption('--topic <topic>', 'topic to explore')
    .action((opts) => console.log(anglesCommand(opts.topic).join('\n\n')));

  program
    .command('hooks')
    .description('generate hooks')
    .requiredOption('--topic <topic>', 'topic to explore')
    .action((opts) => console.log(hooksCommand(opts.topic).join('\n')));

  const profile = program.command('profile').description('manage local profile');
  profile.command('set').description('set local profile').action(async () => console.log(JSON.stringify(await profileSetInteractive(), null, 2)));
  profile.command('show').description('show local profile').action(() => console.log(JSON.stringify(profileShowCommand(), null, 2)));

  try {
    await program.parseAsync(argv);
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
    if (code === 'commander.helpDisplayed' || code === 'commander.version') return;
    throw error;
  }
}

function printReply(items: { label: string; text: string }[]) {
  for (const item of items) console.log(`${item.label}:\n${item.text}\n`);
}

function formatScore(score: ReturnType<typeof scoreCommand>) {
  return [
    'SignalLane Reply Score',
    '',
    `Clarity: ${score.clarity}/10`,
    `Human tone: ${score.humanTone}/10`,
    `Specificity: ${score.specificity}/10`,
    `AI-sounding risk: ${score.aiRisk}`,
    '',
    `Suggested fix: ${score.suggestion}`,
  ].join('\n');
}
