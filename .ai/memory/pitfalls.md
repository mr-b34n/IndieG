# PROJECT PITFALLS

## Pitfall: Excessive Borders

Status: Active

Problem:

Using borders as the default way to create hierarchy makes the UI visually fragmented.

Root cause:

Containers were being visually separated instead of using spacing and surface hierarchy.

Prevention:

Use borders only when they communicate meaningful structure.

---

## Pitfall: Overloaded Header

Status: Active

Problem:

Putting too many controls and secondary information in the main header makes navigation feel crowded.

Prevention:

Keep primary navigation and primary actions clear.

---

## Pitfall: Frontend-Only Authorization

Status: Active

Problem:

A UI can hide a feature while the API remains directly callable.

Prevention:

Enforce sensitive restrictions server-side.

---

## Pitfall: Rendering All Search Results

Status: Active

Problem:

Rendering every search result makes discovery pages long and difficult to scan.

Prevention:

Use limited previews and progressive discovery.
