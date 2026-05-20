export function recipientUserId(match: {
  initiatorUserId: string;
  workerProfile: { userId: string };
  employerProfile: { userId: string };
}) {
  const employerUid = match.employerProfile.userId;
  return match.initiatorUserId === employerUid
    ? match.workerProfile.userId
    : employerUid;
}
