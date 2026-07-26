export function getHackathonStatus(hackathon) {
  if (!hackathon) return 'unknown';
  const now = new Date();
  const regStart = new Date(hackathon.registrationStartDate);
  const regDeadline = new Date(hackathon.registrationDeadline);
  const start = new Date(hackathon.startDate);
  const end = new Date(hackathon.endDate);

  if (hackathon.resultsPublished) return 'results-published';
  if (now > end) return 'ended';
  if (now >= start && now <= end) return 'live';
  if (hackathon.registrationOpen) return 'registration-open';
  if (now < regStart) return 'upcoming';
  if (now > regDeadline) return 'registration-closed';
  return 'draft';
}

export const STATUS_LABELS = {
  'draft': { label: 'Draft', variant: 'default' },
  'upcoming': { label: 'Upcoming', variant: 'info' },
  'registration-open': { label: 'Registration Open', variant: 'success' },
  'registration-closed': { label: 'Registration Closed', variant: 'warning' },
  'live': { label: 'Live', variant: 'info' },
  'ended': { label: 'Ended', variant: 'default' },
  'results-published': { label: 'Results Published', variant: 'success' },
  'unknown': { label: 'Unknown', variant: 'default' },
};
