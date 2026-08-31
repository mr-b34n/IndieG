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


