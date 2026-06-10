const prohibitedPhrases = [
  "child sexual abuse",
  "child pornography",
  "terrorist recruitment",
  "human trafficking",
  "stolen credentials",
  "credit card dumps",
  "non-consensual intimate",
  "revenge porn",
  "illegal drugs marketplace",
  "buy illegal drugs",
];

export function containsProhibitedContent(values: string[]) {
  const content = values.join(" ").toLowerCase();
  return prohibitedPhrases.some((phrase) => content.includes(phrase));
}
