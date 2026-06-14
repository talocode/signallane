export function generateAngles(topic: string) {
  const clean = topic.trim();
  return [
    `Contrarian angle: ${clean} is only valuable when it reduces friction, not when it adds more dashboards.`,
    `Founder angle: building around ${clean} means focusing on workflow, not hype.`,
    `Technical angle: the interesting part of ${clean} is the system design beneath the surface.`,
    `User pain angle: people do not want more complexity, they want faster clarity.`,
    `Story angle: the best product lessons come from what breaks in real use.`,
  ];
}
