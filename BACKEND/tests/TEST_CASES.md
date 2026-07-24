# Win-o-Learn Backend — Test Suite Documentation

This document enumerates all API routes and the test cases (success, validation, auth, and business-logic paths) that the test suite should cover, derived from the current controller/service/validator/middleware implementation.

Legend: `[201]`/`[200]`/`[400]`/`[401]`/`[403]`/`[404]`/`[409]` indicate the expected HTTP status for that case.

---

## 1. Auth Module (`/api/auth`)

### POST `/api/auth/signup`
- `[201]` Successfully creates a user with valid name, email, password, and default role (`participant`).
- `[201]` Successfully creates a user when an explicit valid role (`organizer`/`judge`/`participant`) is provided.
- `[400]` Rejects when `name` is missing or shorter than 2 / longer than 50 characters.
- `[400]` Rejects when `email` is missing or not a valid email format.
- `[400]` Rejects when `password` is missing, under 8 chars, missing an uppercase letter, missing a digit, or missing a special character.
- `[400]` Rejects when `role` is not one of `participant`, `organizer`, `judge` (e.g. attempting `admin`).
- `[409]` Rejects when the email already exists in the system.
- `[201]` Sets `accessToken` and `refreshToken` httpOnly cookies and strips tokens from the JSON response body.
- Rate limiting: requests beyond the `authLimiter` threshold (10 per 15 min) in production are throttled with a 429/limiter message (skipped in development).

### POST `/api/auth/login`
- `[200]` Successfully logs in with correct email/password and returns user profile with cookies set.
- `[400]` Rejects malformed email or missing password via validator.
- `[401]` Rejects login with a non-existent email ("Invalid email or password").
- `[401]` Rejects login with an incorrect password ("Invalid email or password").
- `[403]` Rejects login for a blocked user ("Your account has been blocked").
- `[200]` Confirms `accessToken`/`refreshToken` cookies are set and not present in response JSON.
- Rate limiting applies as with signup.

### POST `/api/auth/logout`
- `[200]` Successfully logs out an authenticated user and clears refresh tokens server-side.
- `[200]` Clears `accessToken`/`refreshToken` cookies on the response.
- `[401]` Rejects when no access token cookie/header is present.
- `[401]` Rejects with expired or invalid access token.

### GET `/api/auth/me`
- `[200]` Returns the authenticated user's own profile (password/refreshToken/reset fields excluded).
- `[401]` Rejects unauthenticated requests (missing token).
- `[401]` Rejects requests with an expired token ("Access token has expired").
- `[401]` Rejects requests with a malformed/invalid token ("Invalid access token").
- `[403]` Rejects when the user tied to the token is blocked.

### POST `/api/auth/refresh-token`
- `[200]` Issues a new access token cookie given a valid, matching refresh token cookie.
- `[401]` Rejects when no refresh token cookie is present ("Refresh token is required").
- `[401]` Rejects when the refresh token is malformed/invalid/expired ("Invalid refresh token").
- `[401]` Rejects when the user for the decoded token id no longer exists ("User not found").
- `[401]` Rejects when the token isn't in the user's stored refresh token list ("Refresh token mismatch"), e.g. after logout.

### PUT `/api/auth/change-password`
- `[200]` Successfully changes password with correct `oldPassword` and a valid `newPassword`.
- `[400]` Rejects when `oldPassword` is missing.
- `[400]` Rejects when `newPassword` fails complexity rules (length/uppercase/digit/special char).
- `[400]` Rejects when `oldPassword` does not match the stored password ("Old password is incorrect").
- `[401]` Rejects unauthenticated requests.
- `[200]` Confirms all refresh tokens are cleared after a successful password change (forces re-login on other devices).

### POST `/api/auth/forgot-password`
- `[200]` Returns success message and generates a reset token for an existing email.
- `[200]` Returns the same generic success response for a non-existent email (no user enumeration), with no token generated.
- `[400]` Rejects invalid/missing email format.
- `[200]` In development mode, response includes `resetToken`; in production it's omitted.
- Rate limiting applies via `authLimiter`.

### POST `/api/auth/reset-password/:token`
- `[200]` Successfully resets password with a valid, unexpired hashed token and valid new password.
- `[400]` Rejects when `password` fails complexity validation.
- `[400]` Rejects when the token is invalid, unknown, or expired ("Invalid or expired reset token").
- `[200]` Confirms `resetPasswordToken`/`resetPasswordExpires`/`refreshToken` are cleared after successful reset.

---

## 2. User Module (`/api/users`)

### GET `/api/users/me`
- `[200]` Returns the logged-in user's profile.
- `[401]` Rejects unauthenticated requests.

### PUT `/api/users/me`
- `[200]` Successfully updates allowed fields: `name`, `bio`, `skills`, `socials.github/linkedin/portfolio`.
- `[400]` Rejects `name` outside 2–50 characters.
- `[400]` Rejects `bio` longer than 300 characters.
- `[400]` Rejects `skills` that isn't an array, or array items that aren't strings.
- `[400]` Rejects invalid URLs for `socials.github`/`linkedin`/`portfolio`.
- `[400]` Rejects attempts to set protected fields (`email`, `password`, `role`, `isBlocked`, `avatar`, `avatarPublicId`) directly.
- `[401]` Rejects unauthenticated requests.

### PUT `/api/users/me/avatar`
- `[200]` Successfully uploads a valid image (jpg/jpeg/png/webp) and updates the user's avatar URL/public ID.
- `[200]` Deletes the previous avatar from Cloudinary when replacing an existing avatar.
- `[400]` Rejects when no file is provided ("Avatar image is required").
- `[400]` Rejects non-image mimetypes via Multer file filter.
- `[400]` Rejects files exceeding the 2MB size limit.
- `[401]` Rejects unauthenticated requests.

### GET `/api/users/` (Admin)
- `[200]` Admin successfully lists users with default pagination (page 1, limit 20).
- `[200]` Supports filtering by `search` (matches name or email, case-insensitive).
- `[200]` Supports filtering by `role` and `isBlocked`.
- `[200]` Clamps `limit` to a max of 100 and normalizes invalid `page`/`limit` (<1) to defaults.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-admin roles (organizer/participant/judge).

### GET `/api/users/:id` (Admin)
- `[200]` Admin successfully fetches a user by valid Mongo ID.
- `[400]` Rejects an invalid (non-Mongo) ID format.
- `[404]` Returns not found for a valid but non-existent ID.
- `[403]` Rejects non-admin roles.

### PUT `/api/users/:id` (Admin)
- `[200]` Admin successfully updates another user's `name`/`bio`/`skills`/`socials`.
- `[400]` Rejects attempts to set `password`, `role`, `isBlocked`, `avatar`, `avatarPublicId` directly (must use dedicated endpoints).
- `[400]` Rejects invalid field-level validation (name length, bio length, social URLs).
- `[404]` Returns not found for a non-existent user ID.
- `[403]` Rejects non-admin roles.

### DELETE `/api/users/:id` (Admin)
- `[200]` Admin successfully deletes another user, and removes their Cloudinary avatar if present.
- `[400]` Rejects an admin attempting to delete their own account.
- `[404]` Returns not found for a non-existent user ID.
- `[403]` Rejects non-admin roles.

### PATCH `/api/users/:id/block` (Admin)
- `[200]` Admin successfully blocks another user.
- `[400]` Rejects an admin attempting to block their own account.
- `[404]` Returns not found for a non-existent user ID.
- `[403]` Rejects non-admin roles.

### PATCH `/api/users/:id/unblock` (Admin)
- `[200]` Admin successfully unblocks a blocked user.
- `[404]` Returns not found for a non-existent user ID.
- `[403]` Rejects non-admin roles.

### PATCH `/api/users/:id/role` (Admin)
- `[200]` Admin successfully updates a user's role to a valid value (`participant`/`organizer`/`judge`).
- `[400]` Rejects missing `role` field.
- `[400]` Rejects invalid role values (e.g. `admin`, arbitrary strings — admin role cannot be assigned via this endpoint).
- `[404]` Returns not found for a non-existent user ID.
- `[403]` Rejects non-admin roles.

---

## 3. Hackathon Module (`/api/hackathons`)

### GET `/api/hackathons/`
- `[200]` Returns paginated public list of hackathons with default pagination.
- `[200]` Filters by `search` across title/theme/description.
- `[200]` Filters by `theme`, `mode` (`online`/`offline`), `registrationOpen` (boolean).
- `[200]` Filters by computed `status` (`upcoming`/`ongoing`/`completed`) based on current date vs. dates.
- `[200]` Supports `sort` (ascending default, prefixed `-` for descending).
- `[400]` Rejects invalid `mode`, `status`, or out-of-range `page`/`limit`.
- No auth required (public route).

### POST `/api/hackathons/`
- `[201]` Organizer successfully creates a hackathon with all required valid fields.
- `[400]` Rejects missing/invalid `title` (must be 5–150 chars), `description` (20–5000 chars), `theme` (2–100 chars).
- `[400]` Rejects invalid `mode` (must be `online`/`offline`).
- `[400]` Rejects offline hackathon missing `venue`.
- `[400]` Rejects missing/invalid ISO8601 dates for registration/start/submission/end dates.
- `[400]` Rejects when `registrationDeadline` is not after `registrationStartDate`.
- `[400]` Rejects when `startDate` is not after `registrationDeadline`.
- `[400]` Rejects when `submissionDeadline` is before `startDate`.
- `[400]` Rejects when `submissionDeadline` is after `endDate`.
- `[400]` Rejects negative `prizePool`.
- `[400]` Rejects `maxTeamSize` outside 1–10.
- `[400]` Rejects more than 20 `rules` or a rule item exceeding 200 chars.
- `[400]` Rejects empty `judgingCriteria` array or invalid criterion/maxMarks (1–100).
- `[400]` Rejects attempts to set protected fields (`organizer`, `registrationOpen`, `resultsPublished`, `banner`, `bannerPublicId`) directly.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-organizer roles.
- `[201]` Confirms the creating user is automatically set as `organizer`.

### GET `/api/hackathons/my` (Organizer)
- `[200]` Organizer successfully lists only their own hackathons, paginated.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-organizer roles.

### GET `/api/hackathons/:id`
- `[200]` Successfully fetches a hackathon by valid ID with organizer populated.
- `[400]` Rejects invalid Mongo ID.
- `[404]` Returns not found for non-existent hackathon.
- No auth required (public route).

### PUT `/api/hackathons/:id`
- `[200]` Organizer-owner successfully updates one or more allowed fields (partial update).
- `[200]` Admin can update any hackathon regardless of ownership.
- `[400]` Rejects invalid field values (same per-field rules as create, but optional).
- `[400]` Rejects date-order violations when merging updated + existing dates.
- `[400]` Rejects attempts to set protected fields directly.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects organizer who does not own the hackathon.
- `[404]` Returns not found for non-existent hackathon ID.

### DELETE `/api/hackathons/:id`
- `[200]` Organizer-owner successfully deletes a hackathon that has zero registrations.
- `[200]` Deletes the associated Cloudinary banner image if one exists.
- `[400]` Rejects deletion when the hackathon has at least one existing registration.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-owner organizer (admin override allowed).
- `[404]` Returns not found for non-existent hackathon ID.

### PATCH `/api/hackathons/:id/open-registration`
- `[200]` Organizer-owner successfully opens registration within the valid window.
- `[400]` Rejects when registration is already open.
- `[400]` Rejects when the current date is before `registrationStartDate` ("Registration has not started yet").
- `[400]` Rejects when the current date is after `registrationDeadline` ("Registration deadline has already passed").
- `[400]` Rejects when the current date is on/after `startDate` ("Registration cannot be opened after the hackathon has started").
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon ID.

### PATCH `/api/hackathons/:id/close-registration`
- `[200]` Organizer-owner successfully closes an open registration window.
- `[400]` Rejects when registration is already closed.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon ID.

### PATCH `/api/hackathons/:id/publish-results`
- `[200]` Organizer-owner successfully publishes results.
- `[400]` Rejects when results are already published.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon ID.

### PUT `/api/hackathons/:id/banner`
- `[200]` Organizer-owner successfully uploads/replaces a valid banner image.
- `[200]` Deletes the previous banner image from Cloudinary when replacing.
- `[400]` Rejects when no file is provided ("Banner image is required").
- `[400]` Rejects non-image mimetypes.
- `[400]` Rejects files exceeding the 5MB size limit.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon ID.

---

## 4. Team Module (`/api/teams`)

### GET `/api/teams/` (Admin)
- `[200]` Admin successfully lists teams with pagination, `search`, and `sort`.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-admin roles.

### POST `/api/teams/`
- `[201]` Participant successfully creates a team with valid `name` and optional `members` (valid user IDs).
- `[400]` Rejects `name` outside 3–50 characters.
- `[400]` Rejects an empty `members` array (must be non-empty if provided).
- `[400]` Rejects non-Mongo-ID entries in `members`.
- `[400]` Rejects duplicate IDs within `members`.
- `[400]` Rejects including the creator's own ID inside `members` (leader is implicit).
- `[400]` Rejects when one or more member IDs don't correspond to an existing user.
- `[400]` Rejects attempts to directly set `leader`/`pendingInvites`/`createdAt`/`updatedAt`.
- `[201]` Confirms creator is set as `leader` and included in `members` automatically.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-participant roles.

### GET `/api/teams/:id`
- `[200]` Successfully fetches a team by ID (any authenticated user).
- `[400]` Rejects invalid Mongo ID.
- `[404]` Returns not found for non-existent team.
- `[401]` Rejects unauthenticated requests.

### PUT `/api/teams/:id`
- `[200]` Team leader successfully updates `name` and/or `description`.
- `[400]` Rejects an empty update body (at least one field required).
- `[400]` Rejects `name` outside 3–50 characters, or `description` over 500 characters.
- `[400]` Rejects attempts to update protected fields (`leader`, `members`, `pendingInvites`, timestamps).
- `[403]` Rejects a non-leader member attempting to update (admin override allowed).
- `[404]` Returns not found for non-existent team ID.

### DELETE `/api/teams/:id`
- `[200]` Team leader successfully deletes a team with zero registrations.
- `[400]` Rejects deletion when the team has at least one existing registration.
- `[403]` Rejects a non-leader attempting to delete.
- `[404]` Returns not found for non-existent team ID.

### POST `/api/teams/:id/invite`
- `[200]` Team leader successfully invites a user by valid, existing email.
- `[400]` Rejects missing/invalid email format.
- `[404]` Returns not found when the invited email doesn't correspond to a user.
- `[400]` Rejects inviting the team leader themself.
- `[400]` Rejects inviting a user who is already a team member.
- `[400]` Rejects inviting a user who already has a pending invite.
- `[403]` Rejects a non-leader attempting to invite.
- `[404]` Returns not found for non-existent team ID.

### POST `/api/teams/:id/invite/accept`
- `[200]` Invitee successfully accepts a pending invite and is added to `members`.
- `[404]` Rejects when the requesting user has no matching pending invite.
- `[400]` Rejects acceptance when it would push team size beyond `maxTeamSize` for any hackathon the team is already registered in.
- `[403]` Rejects a user with no pending invite from accepting (middleware `requireInvitee`).
- `[404]` Returns not found for non-existent team ID.

### POST `/api/teams/:id/invite/reject`
- `[200]` Invitee (or leader) successfully rejects/removes a pending invite.
- `[404]` Rejects when the target invite does not exist.
- `[404]` Returns not found for non-existent team ID.

### PATCH `/api/teams/:id/leader`
- `[200]` Team leader successfully transfers leadership to an existing team member.
- `[400]` Rejects missing/invalid `userId`.
- `[400]` Rejects transferring leadership to the current leader themself.
- `[404]` Rejects when the target `userId` does not correspond to an existing user.
- `[400]` Rejects transferring leadership to a user who is not currently a team member.
- `[403]` Rejects a non-leader attempting the transfer.
- `[404]` Returns not found for non-existent team ID.

### POST `/api/teams/:id/leave`
- `[200]` A team member successfully leaves the team.
- `[400]` Rejects the leader attempting to leave without transferring leadership first.
- `[400]` Rejects a non-member attempting to leave.
- `[403]` Rejects a non-member (middleware `requireMember`) from calling this endpoint at all.
- `[404]` Returns not found for non-existent team ID.

### DELETE `/api/teams/:id/members/:userId`
- `[200]` Team leader successfully removes a member from the team.
- `[400]` Rejects invalid `userId` param format.
- `[404]` Rejects when the target user does not exist.
- `[400]` Rejects attempting to remove the team leader.
- `[400]` Rejects attempting to remove a user who is not a team member.
- `[403]` Rejects a non-leader attempting removal.
- `[404]` Returns not found for non-existent team ID.

---

## 5. Registration Module (`/api/hackathons/:hackathonId/register*`, `/api/registrations`)

### POST `/api/hackathons/:hackathonId/register`
- `[201]` Team leader successfully registers their team for an open hackathon before the deadline.
- `[400]` Rejects invalid `hackathonId` or missing/invalid `teamId` in body.
- `[400]` Rejects attempts to directly set `status`/`respondedBy`/`respondedAt`.
- `[400]` Rejects registration when the hackathon's registration is closed.
- `[400]` Rejects registration after the registration deadline has passed.
- `[403]` Rejects a non-leader team member from registering the team.
- `[400]` Rejects when team size exceeds the hackathon's `maxTeamSize`.
- `[409]` Rejects when the team is already registered for the same hackathon.
- `[409]` Rejects when one or more team members are already registered (via another team) for the same hackathon.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-participant roles.
- `[404]` Returns not found for non-existent hackathon.

### DELETE `/api/hackathons/:hackathonId/register/:teamId`
- `[200]` Team leader successfully cancels an existing registration.
- `[403]` Rejects a non-leader from cancelling.
- `[404]` Rejects when no registration exists for the given hackathon/team pair.
- `[400]` Rejects invalid `hackathonId`/`teamId` params.
- `[404]` Returns not found for non-existent hackathon.

### GET `/api/hackathons/:hackathonId/register/status/:teamId`
- `[200]` Team member successfully retrieves `{ registered: false }` when not registered.
- `[200]` Team member successfully retrieves `{ registered: true, status }` when registered (`pending`/`approved`/`rejected`).
- `[403]` Rejects a non-member from checking another team's status.
- `[404]` Returns not found for non-existent hackathon.

### GET `/api/hackathons/:hackathonId/registrations`
- `[200]` Organizer-owner successfully lists registrations for their hackathon, paginated.
- `[200]` Filters by `status` (`pending`/`approved`/`rejected`).
- `[400]` Rejects invalid `status`, `page`, or `limit`.
- `[403]` Rejects non-owner organizer.
- `[401]` Rejects unauthenticated requests.
- `[404]` Returns not found for non-existent hackathon.

### PATCH `/api/registrations/:registrationId/approve`
- `[200]` Organizer-owner successfully approves a `pending` registration.
- `[400]` Rejects approving a registration that is not currently `pending` (e.g. already approved/rejected).
- `[400]` Rejects invalid `registrationId`.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent registration.

### PATCH `/api/registrations/:registrationId/reject`
- `[200]` Organizer-owner successfully rejects a `pending` registration.
- `[400]` Rejects rejecting a registration that is not currently `pending`.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent registration.

---

## 6. Submission Module (`/api/hackathons/:hackathonId/submissions*`, `/api/submissions`)

### POST `/api/hackathons/:hackathonId/submissions`
- `[201]` Team leader successfully creates a submission for an approved registration before the deadline.
- `[400]` Rejects when the team's registration status is not `approved`.
- `[400]` Rejects submission after the hackathon's `submissionDeadline` has passed.
- `[400]` Rejects when a submission already exists for the registration ("Submission already exists").
- `[400]` Rejects missing `projectName`, `problemStatement`, or `solutionDescription`.
- `[400]` Rejects invalid URL formats for `githubRepo`, `liveDemoUrl`, `demoVideo`, `presentation`.
- `[400]` Rejects non-array `techStack`.
- `[400]` Rejects attempts to directly set protected fields (`status`, `registration`, `averageScore`, `reviewCount`, `_id`, timestamps).
- `[403]` Rejects a non-leader team member from creating the submission.
- `[404]` Rejects when the requesting user has no registration for the hackathon.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-participant roles.
- `[201]` Confirms score fields are hidden in the response for participants when `resultsPublished` is false.

### GET `/api/hackathons/:hackathonId/submissions/mine`
- `[200]` Team member successfully retrieves their team's own submission.
- `[404]` Rejects when no submission exists yet for the registration.
- `[403]` Rejects a user who is not a member of the registered team.
- `[401]` Rejects unauthenticated requests.

### GET `/api/hackathons/:hackathonId/submissions`
- `[200]` Organizer-owner successfully lists all submissions for their hackathon.
- `[403]` Rejects non-owner organizer.
- `[401]` Rejects unauthenticated requests.
- `[404]` Returns not found for non-existent hackathon.

### GET `/api/submissions/` (Admin)
- `[200]` Admin successfully lists all submissions with pagination, `search` (by projectName), and `sort`.
- `[400]` Rejects invalid `page`/`limit`/`sort` query values.
- `[403]` Rejects non-admin roles.
- `[401]` Rejects unauthenticated requests.

### GET `/api/submissions/:id`
- `[200]` Admin/organizer(of hackathon)/team member/assigned judge successfully retrieves a submission.
- `[403]` Rejects a user with no relation to the submission (not admin/organizer/team member/assigned judge).
- `[400]` Rejects invalid Mongo ID.
- `[404]` Returns not found for non-existent submission.
- `[200]` Confirms score fields are hidden for a participant viewer when results aren't published, but visible once `resultsPublished` is true.

### PUT `/api/submissions/:id`
- `[200]` Team leader successfully updates submission fields before the deadline.
- `[400]` Rejects update after the submission deadline has passed.
- `[400]` Rejects invalid URL fields or non-array `techStack` when provided.
- `[400]` Rejects attempts to set protected fields directly.
- `[403]` Rejects a non-leader team member from updating.
- `[404]` Returns not found for non-existent submission.

### PUT `/api/submissions/:id/files`
- `[200]` Team leader successfully updates `screenshots`/`presentation`/`demoVideo` before the deadline.
- `[400]` Rejects update after the submission deadline has passed.
- `[400]` Rejects non-array `screenshots` or invalid URLs for `presentation`/`demoVideo`.
- `[403]` Rejects a non-leader team member from updating files.
- `[404]` Returns not found for non-existent submission.

### PATCH `/api/submissions/:id/status`
- `[200]` Hackathon organizer successfully updates submission `status` to a valid value (`pending`/`under_review`/`approved`/`rejected`).
- `[400]` Rejects an invalid status value.
- `[403]` Rejects a user who is not the hackathon's organizer.
- `[404]` Returns not found for non-existent submission.

---

## 7. Judge Assignment Module (`/api/hackathons/:hackathonId/judges*`, `/api/judges`)

### POST `/api/hackathons/:hackathonId/judges`
- `[201]` Organizer-owner successfully assigns an existing judge-role user to their hackathon.
- `[400]` Rejects missing/invalid `judgeId`.
- `[404]` Rejects when `judgeId` doesn't correspond to an existing user.
- `[400]` Rejects when the target user's role is not `judge`.
- `[409]` Rejects when the judge is already assigned to the hackathon.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon.

### DELETE `/api/hackathons/:hackathonId/judges/:judgeId`
- `[200]` Organizer-owner successfully removes an assigned judge.
- `[404]` Rejects when no assignment exists for the given hackathon/judge pair.
- `[400]` Rejects invalid `judgeId` param.
- `[403]` Rejects non-owner organizer.
- `[404]` Returns not found for non-existent hackathon.

### GET `/api/hackathons/:hackathonId/judges`
- `[200]` Organizer-owner or admin successfully lists all judges assigned to a hackathon.
- `[403]` Rejects non-owner organizer.
- `[401]` Rejects unauthenticated requests.
- `[404]` Returns not found for non-existent hackathon.

### GET `/api/judges/me/assigned-hackathons`
- `[200]` Judge successfully lists all hackathons they are assigned to.
- `[200]` Returns an empty list for a judge with no assignments.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-judge roles.

---

## 8. Review Module (`/api/reviews`, `/api/submissions/:submissionId/reviews`, `/api/hackathons/:hackathonId/reviews`, `/api/judges/me/reviews`)

### POST `/api/submissions/:submissionId/reviews`
- `[201]` Assigned judge successfully submits a review with valid scores for every judging criterion.
- `[403]` Rejects a judge not assigned to the submission's hackathon.
- `[409]` Rejects a judge submitting a second review for the same submission.
- `[400]` Rejects `scores` that isn't an array.
- `[400]` Rejects when the number of scores doesn't match the number of judging criteria exactly.
- `[400]` Rejects duplicate scores for the same criterion.
- `[400]` Rejects a score for a criterion name not defined in the hackathon's `judgingCriteria`.
- `[400]` Rejects a score outside `0`–`criterion.maxMarks`, or a non-numeric score.
- `[201]` Confirms `totalScore` is computed as the sum of all criterion scores.
- `[201]` Confirms the submission's `averageScore`/`reviewCount` are recalculated after the review is saved.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-judge roles.
- `[404]` Returns not found for non-existent submission.

### GET `/api/submissions/:submissionId/reviews`
- `[200]` Admin/hackathon organizer/assigned judge successfully lists all reviews for a submission.
- `[403]` Rejects a user unrelated to the submission's hackathon.
- `[404]` Returns not found for non-existent submission.
- `[401]` Rejects unauthenticated requests.

### PUT `/api/reviews/:id`
- `[200]` Review's original judge author successfully updates their own review with valid scores.
- `[403]` Rejects a different judge attempting to edit someone else's review.
- `[400]` Rejects invalid score payloads (same rules as submit: count, duplicates, criterion match, range).
- `[200]` Confirms `totalScore` and the submission's aggregate score/reviewCount are recalculated after update.
- `[403]` Rejects a judge not assigned to the hackathon (`HasHackathonAccess` check).
- `[404]` Returns not found for non-existent review.
- `[401]` Rejects unauthenticated requests.

### GET `/api/reviews/:id`
- `[200]` Admin/hackathon organizer/assigned judge successfully retrieves a single review by ID.
- `[403]` Rejects a user with no relation to the review's hackathon.
- `[404]` Returns not found for non-existent review.
- `[401]` Rejects unauthenticated requests.

### GET `/api/hackathons/:hackathonId/reviews`
- `[200]` Admin/hackathon organizer successfully lists all reviews for a hackathon.
- `[403]` Rejects a non-owner organizer or unrelated judge.
- `[404]` Returns not found for non-existent hackathon.
- `[401]` Rejects unauthenticated requests.

### GET `/api/judges/me/reviews`
- `[200]` Judge successfully lists all reviews they have submitted, across hackathons.
- `[200]` Returns an empty list when the judge has no reviews yet.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-judge roles.

---

## 9. Leaderboard Module (`/api/hackathons/:hackathonId/leaderboard*`)

### GET `/api/hackathons/:hackathonId/leaderboard`
- `[200]` Successfully returns a ranked list (by `averageScore` descending) once `resultsPublished` is true.
- `[403]` Rejects access when results have not yet been published ("Leaderboard is not available yet").
- `[404]` Returns not found for non-existent hackathon.
- `[200]` No authentication required once published (public route); confirms correct `rank` assignment (1-indexed).

### GET `/api/hackathons/:hackathonId/leaderboard/recalculate`
- `[200]` Admin or hackathon organizer-owner successfully triggers a recalculation of all submissions' average scores for the hackathon.
- `[403]` Rejects a non-owner organizer or non-admin user.
- `[401]` Rejects unauthenticated requests.
- `[404]` Returns not found for non-existent hackathon.

---

## 10. Dashboard Module (`/api/dashboard`)

### GET `/api/dashboard/admin`
- `[200]` Admin successfully retrieves platform-wide totals: total users, hackathons, teams, submissions.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-admin roles.

### GET `/api/dashboard/organizer`
- `[200]` Organizer successfully retrieves counts scoped to their own hackathons: hackathon count, total registrations, total submissions, and results-published count.
- `[200]` Returns all-zero counts for an organizer with no hackathons yet.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-organizer roles.

### GET `/api/dashboard/participant`
- `[200]` Participant successfully retrieves their registered hackathon count, team list, submission summaries (with score/review count), and results-published count.
- `[200]` Returns empty arrays/zero counts for a participant with no teams yet.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-participant roles.

### GET `/api/dashboard/judge`
- `[200]` Judge successfully retrieves assigned hackathon count, assigned project count, completed review count, and pending review count.
- `[200]` Correctly computes `pendingReviews` as assigned submissions minus already-reviewed submissions.
- `[401]` Rejects unauthenticated requests.
- `[403]` Rejects non-judge roles.

---

## 11. Cross-Cutting / Middleware & Infrastructure Cases

### Authentication (`VerifyToken`)
- `[401]` Rejects requests with no `accessToken` cookie and no `Authorization: Bearer` header.
- `[200]` Accepts a valid token supplied via the `Authorization: Bearer <token>` header (not just cookie).
- `[401]` Rejects an expired access token with `"Access token has expired"`.
- `[401]` Rejects a malformed/invalid-signature token with `"Invalid access token"`.
- `[401]` Rejects a token whose user no longer exists in the database.
- `[403]` Rejects a token belonging to a blocked user.

### Role Authorization (`AuthorizeRoles`)
- `[403]` Rejects any route-protected action when `req.user.role` is not in the allowed role list.
- `[200]` Allows access when the role matches one of the allowed roles.

### Ownership Checks (`CheckHackathonOwnership`)
- `[200]` Allows the hackathon's own organizer to proceed.
- `[200]` Allows an admin to bypass ownership when `allowAdminOverride` is true.
- `[403]` Rejects a non-owner organizer with `"You are not authorized to manage this hackathon"`.

### Hackathon Access (`HasHackathonAccess`)
- `[200]` Allows admin when `allowAdmin` is true.
- `[200]` Allows the owning organizer when `allowOrganizer` is true.
- `[200]` Allows a judge with a matching `JudgeAssignment` when `allowJudge` is true.
- `[403]` Rejects a judge with no assignment to the hackathon.
- `[500]` Throws when no hackathon context (`req.hackathon`/submission/review chain) can be resolved.

### Resource Loaders (`LoadHackathon`, `LoadTeam`, `LoadRegistration`, `LoadSubmission`, `LoadReview`, `LoadRegistrationForSubmission`)
- `[404]` Each loader returns not-found when the referenced ID doesn't exist.
- `[403]` `LoadTeam`/`LoadSubmission` correctly enforce `requireLeader`/`requireMember`/`requireOrganizer`/`requireAccess` combinations, with admin override where applicable.
- `[403]` `LoadRegistrationForSubmission` enforces `requireLeader`/`requireMember` against the resolved team for the hackathon.

### Global Error Handler
- `[409]` Converts a Mongo duplicate-key error (`code 11000`) on `hackathon+team` into `"This team is already registered for this hackathon"`.
- `[409]` Converts other duplicate-key errors into a generic `"<Field> already exists"` message.
- `[400]` Converts Mongoose `ValidationError` into a concatenated message of all field errors.
- `[400]` Converts Mongoose `CastError` (e.g. malformed ObjectId in an unvalidated path) into `"Invalid value for field: <path>"`.
- `[401]` Converts `JsonWebTokenError`/`TokenExpiredError` into appropriate 401 messages.
- `[500]` Falls back to `"Internal Server Error"` with the correct status for unhandled errors.
- Confirms `stack` trace is included in the response only when `NODE_ENV === 'development'`.

### Health Check
- `GET /health` — `[200]` Always returns `{ status: 'OK', message, timestamp }` with no auth required.

### Rate Limiting (`authLimiter`)
- `[429]` Confirms auth-sensitive endpoints (`signup`, `login`, `forgot-password`) are throttled after 10 requests within 15 minutes in production.
- `[200]` Confirms rate limiting is skipped entirely when `NODE_ENV === 'development'`.
