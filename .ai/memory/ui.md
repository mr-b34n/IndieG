# UI MEMORY

## Decision: Dark Neutral Visual Language

Status: Active

Date: 2026-08-30

Decision:

The application should use a dark, neutral, modern, minimal visual direction.

Why:

This direction better supports the product's content-focused experience.

Implications:

New UI should fit the existing dark neutral hierarchy.

---

## Decision: Minimal Borders

Status: Active

Date: 2026-08-30

Decision:

Visible borders should be used sparingly.

Why:

Excessive borders make the interface fragmented and visually noisy.

Implications:

Prefer spacing, typography, surface contrast, and subtle elevation.

---

## Decision: Lightweight Header

Status: Active

Date: 2026-08-30

Decision:

The primary header should remain lightweight.

Why:

The previous direction felt crowded.

Implications:

Do not overload the header with secondary information or too many competing actions.

---

## Decision: Avoid Card-Heavy UI

Status: Active

Date: 2026-08-30

Decision:

Not every content section should be wrapped in a card.

Why:

Excessive cards fragment the interface.

Implications:

Use containers when they provide meaningful grouping or interaction.

---

## Decision: Profile Generic Feedback Notifications & Hidden Featured Showcase

Status: Active

Date: 2026-09-10

Decision:

Profile upload and update feedback toasts use generic, localized notification text ("Upload successful" / "Upload failed" and "Update successful" / "Update failed") in both English and Vietnamese. The Featured Game / Game Mastery section on the Profile Overview tab is temporarily hidden.

Why:

Keeps feedback notifications clean, concise, and standard across all languages, while hiding the unselected featured game showcase on the profile page per product request.

Implications:

- Notification strings for profile avatar/cover upload and profile edits must consume `t("profile.uploadSuccess")`, `t("profile.uploadFailed")`, `t("profile.updateSuccess")`, and `t("profile.updateFailed")`.
- `showGameMastery` in `OverviewTab.tsx` is set to `false`.

---

## Decision: Editorial Social Forum Design Language

Status: Active

Date: 2026-08-30

Decision:

The Community Detail page uses an "Editorial Social Forum" design language (Tumblr visual feed sensibility + Reddit structural discussion clarity).

Why:

The prior layout contained excessive controls, duplicate navigation tabs, and dashboard-like visual clutter that competed with actual content.

Implications:

1. **3-Column Architecture**: Left Sidebar (collapsible persistent navigation), Center Feed (max 760-840px content-first feed with compact sort/filter dropdowns and inline lightweight social interactions), Right Rail (lightweight contextual modules: About, Community, Up Next).
2. **Reduced Cognitive Clutter**: No duplicate header tabs under the cover banner, no 8-filter button rows (replaced by 2 quiet dropdowns), and no heavy cards inside cards.
3. **Typography & Spacing**: Generous line heights, subtle meta lines, muted secondary text, and single-line tags.

---

## Decision: Profile Customization & Section Edit Architecture

Status: Active

Date: 2026-08-31

Decision:

1. **Customization & Direct Edit Coexistence**: Profile hero and tabs combine the compact "Tùy chỉnh" mode toggle (`faSliders`) for section visibility (Hide/Show saved in `localStorage`) with direct action edit buttons ("Sửa hồ sơ", "Huy hiệu", "Sửa Bio", "Sửa Setup").
2. **Minimalist Visibility Toggles**: Section toggle buttons in customize mode use clean icon-only indicators (`faEye` / `faEyeSlash`) without text labels.
3. **Direct Inline Editing**: User profile edits (display name, username, bio, gaming setup) occur directly inline on the respective cards/hero, removing modal popups and portals.
4. **Customize Mode Overview-Bound**: Customization mode is restricted exclusively to the Overview tab. Attempting to switch tabs triggers a helpful warning toast to complete/save before leaving.
5. **No Preset Default Gear**: Battlestation setup starts completely unpopulated by default, allowing users to add their own custom hardware gear.
6. **Achievements Removal**: The Achievements section and tab were removed in favor of a streamlined Game Mastery and Activity feed.
7. **Clean Tab Layout**: Adjacent tabs (Game Mastery, Communities, Posts, Friends) use concise, high-density layouts without redundant description blocks.
8. **Reputation Default**: Default reputation is set to 0%.

---

## Decision: Community Admin & Steward Experience

Status: Active

Date: 2026-09-06

Decision:

The Community Admin/Owner role is treated as an in-context *Steward* rather than a generic SaaS platform administrator.

Why:

Platform administration belongs strictly to `admin.abc.com`. Turning the community page into a generic analytics/admin dashboard breaks community identity and disrupts context. 80–90% of the UI remains identical to the member view, opening management capabilities smoothly in-place.

Implications:

1. **Contextual Continuity**: Retains the 3-column layout (Sidebar, Center Column, Right Rail), breadcrumbs, search, and game identity.
2. **Left Sidebar "MANAGE" Section**: Rendered conditionally for Owner, Admin, and Moderator roles with direct entry points to Overview, Moderation, Members, Reports, Rules, and Settings.
3. **Right Rail "COMMUNITY STATUS"**: Displays lightweight operational status (pending requests, unhandled reports, active moderators count) instead of platform-level analytics.
4. **Header Stewardship Indicator**: Subtle "Admin / Owner" / "Moderator" badge and direct "Quản lý" / "Manage" button.
5. **Role Perspective Toggle**: Top-bar test switcher enables previewing Member, Moderator, and Admin experiences seamlessly.

---

## Decision: Profile Forge (Custom Bio System) & Compact Inline WYSIWYG Editor

Status: Active

Date: 2026-09-11

Decision:

1. **Controlled Bio Personalization**: Personalization uses a structured JSONB document schema (`{ version: 1, blocks: [...] }`) rather than arbitrary HTML, markdown, or page builders.
2. **Platform Owns Structure, User Owns Expression**:
   - Whitelist typography only: `inter`, `serif`, `mono`, `pixel`, `gothic`, `fantasy`.
   - Semantic theme colors only: `default` (#F0F1F2), `muted` (#8A8F98), `accent` (#1688E8), `highlight` (#E5A93D).
   - Paragraph alignments: `left`, `center`, `right`.
   - Formatting: `bold`, `italic`, `strikethrough`.
   - Presets: `Clean`, `Minimal`, `RPG`, `Terminal`, `Cyber`, `Gothic`.
3. **Editor Architecture (Compact Inline WYSIWYG)**:
   - Zero separate preview panels: The user customizes their bio directly in place where it appears in Player Identity / Sidebar.
   - Selection-based contextual floating toolbar: B, I, S, Aa (font selector), Color (semantic palette), and Align pop up directly above highlighted text and format in place instantly.
   - No permanent toolbar: Retains clean dark gaming aesthetic without visual clutter.
   - Native input preservation: ContentEditable element preserves native typing, backspace, and IME while synchronizing model to `BioDocument`.
   - Custom Enter & Backspace block handling: `handleKeyDown` intercepts Enter and Backspace to explicitly manage block splits (`splitBlockAtSelection`) and merges (`mergeBlockWithPrevious`) in `BioDocument` model, setting range caret accurately to line 2 without DOM corruption or cursor jumping.
   - Self-update DOM sync protection (`isSelfUpdatingRef`): Prevents internal `onChange` state updates from unnecessarily resetting `innerHTML`, preserving browser caret selection.
   - Character counter strictly capped at 300 characters with responsive status styling.
   - Contextual toolbar renders via React `createPortal` with fixed viewport coordinates and smart directional popovers (`top-full` / `bottom-full`), preventing clipping or layering behind outer card containers.
4. **Profile Edit State Recovery**:
   - `handleDiscardEdit` in `UserProfile.tsx` uses `setCustomGear(snapshotGear)` to avoid `ReferenceError` on gear restoration.

---

## Decision: Gaming Character Profile Overview Redesign

Status: Active

Date: 2026-09-11

Decision:

The Profile Overview page is redesigned into a **modern gaming character profile**, moving away from a generic social dashboard.

Key Architectural Decisions:

1. **Player Identity as Primary Anchor**:
   - Bio rendered naturally without an enclosing card box, borders, or nested containers in view mode.
   - Edit mode uses the inline selection-based `BioEditor`.
2. **Game Mastery Visual Cards**:
   - Focused on game artwork, title, hours played, rank, winrate, achievement progress bar, and skill stars.
   - When empty, uses an intentional compact empty button instead of a large empty card.
3. **Low-Weight Recent Activity Feed**:
   - Reduced visual weight with concise activity rows (Posts, Comments, Achievements, Community).
4. **Public Gaming Loadout Battlestation**:
   - Public view renders hardware gear as a high-density spec sheet (CPU, GPU, Display, Keyboard, Mouse, Headset) with category labels in mono font.
   - Edit view (`isCustomizeMode`) provides interactive form inputs per category.
5. **Section Hierarchy & Spacing**:
   - Order: Player Identity → Game Mastery → Recent Activity → Community Reputation & Battlestation Loadout.
   - Compact section gaps (24px) and dark neutral background (`#0A0C0E`).




