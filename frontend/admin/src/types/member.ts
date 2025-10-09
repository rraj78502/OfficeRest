export interface MemberLookup {
  _id: string;
  employeeId?: string;
  username?: string;
  surname?: string;
  email?: string;
  mobileNumber?: string;
  membershipNumber?: string;
  registrationNumber?: string;
  profilePic?: string;
  membershipStatus?: string;
}

export const buildMemberDisplayName = (member?: MemberLookup | null): string => {
  if (!member) return "";
  const parts = [member.username, member.surname].filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean);
  const joined = parts.join(" ").trim();
  return joined || member.email || member.mobileNumber || "";
};
