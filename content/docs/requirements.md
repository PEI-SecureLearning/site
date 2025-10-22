# Requirements


# Functional

### Requirement 1
**Description:** The platform should have a web/desktop application for sys admins to administrate the platform.  
**Context:** Sys admins need to register/unregister tenants and monitor system usage and content.

### Requirement 2
**Description:** The application for admins should have a tenant registry, content registry, plugin registry, and users registry.  
**Context:** These registries should be the basis of how an admin controls access, content, and so on.

### Requirement 3
**Description:** The tenant registry should allow admins to add / remove tenants, define which plugins they have access to, and define organization managers.  
**Context:** The basis for how an organization/tenant will be added to the ecosystem.

### Requirement 4
**Description:** The plugin registry should allow admins to add / remove plugins from the platform.  
**Context:** All available in production plugins should be listed and tracked in the plugins registry.

### Requirement 5
**Description:** The content registry should allow admins to block temporarily whatever content they want, while allowing content managers to add/remove content.  
**Context:** Even though content managers are supposed to be from within our company, the extra control and power allows admins to better manage the platform. This may increase admin power which may not be good in the case of the existence of a bad actor.

### Requirement 6
**Description:** The content registry should allow the registry of educational content and simulation content.  
**Context:** These two types of content are the primary types for the inception of the project, in future revisions of this work, we may include more.

### Requirement 7
**Description:** The content manager registry should allow registering new people assigned to creation of both educational and simulation contents.  
**Context:** Content should be linked to its creator. This allows for user reports or organization manager reports to be presented to the correct content manager.

### Requirement 8
**Description:** The content manager registry should allow the blocking of a content manager, and as a consequence block all of their contents for tenants.  
**Context:** In the case of a bad actor, admins want to act quick.

### Requirement 9
**Description:** The admin application should be exclusive to system admins, which requires a login page and session management.  
**Context:** There could be multiple admins, which logins would be created by who?? (God)

### Requirement 10
**Description:** The admin application should have logs for any change made in the registries. These logs should be separate for each registry.  
**Context:** (...)

### Requirement 11
**Description:** Any registry should have a possibility to search by record name.  
**Context:** This will improve usability.

### Requirement 12
**Description:** The LMS application should list the available courses for the user.  
**Context:** The user needs the option to choose its learning.

### Requirement 13
**Description:** The application should highlight the courses indicated by the organization manager.  
**Context:** The user should know which courses he can do optionally and which he is required to do.

### Requirement 14
**Description:** The application should implement a system for users to report problems and difficulties to their superiors.  
**Context:** In case the application fails or some of the content displayed is incorrect.

### Requirement 15 — Tenant Admin interface
**Description:** The platform should have a web/desktop platform for the organization manager to administrate the users in their tenant.  
**Context:** The tenant admins will need to manage the tenant users.

### Requirement 16 — Enrolling users with .csv files
**Description:** The organization manager application should have the option to register users to the platform by adding them manually or using a .csv file with info about each user’s first and last name, email and department number / role.  
**Context:** The organization manager should be able to add users with ease to the platform.

### Requirement 17 — User View for Tenant Admins
**Description:** The application should have a view to browse users, and group them by department/role.  
**Context:** The organization manager should be able to group the users, so he can schedule training to a multitude of users at the same time.

### Requirement 18 — User Attributes
**Description:** Each user in the platform should be characterized by their name, email and department/role.  
**Context:** These attributes allow the organization manager to perform phishing with the users and also group them by department function to speed up training assignment.

### Requirement 19 — User Statistics View
**Description:** The organization manager app should display each user’s stats in the user's view. These stats include performance on the training exams, as well as statistics about the user’s interactions with the phishing emails and landing pages.  
**Context:** The organization manager will want to check on these stats to give the users a more personalized training schedule that fits their weak points better.

### Requirement 20 — Available Courses View
**Description:** The tenant admin app should have a view to browse and consult available training courses, and the option to subscribe users to the course.  
**Context:** The tenant admin should be able to browse available courses.

### Requirement 21 — Phishing Campaign Feature
**Description:** The tenant app should have a phishing campaign functionality that allows phishing campaigns to be created with templates and scheduled to specific users.  
**Context:** The tenant admin will want to make phishing campaigns to test the users’ awareness.

### Requirement 22 — Phishing Remediation
**Description:** The phishing campaigns should have remediation steps for when a user fails like a redirect to the platform or a course.  
**Context:** In case a user falls for the phishing, they should receive immediate feedback.

### Requirement 23 — Phishing Failure Notification
**Description:** The tenant admin should be notified whenever a user falls for phishing.  
**Context:** The admin will want to get in touch with the user to help him with training.

### Requirement 24 — Uploading Landing Pages
**Description:** The phishing feature should have an option to upload .html files to render landing pages.  
**Context:** The admin will want to simulate fake websites for the phishing campaigns.

### Requirement 25 — Module Deadlines
**Description:** Each course module should have a deadline.  
**Context:** The learning process demands consistent practice.

### Requirement 26 — Phishing Email Templates
**Description:** There should be available templates for the phishing emails.  
**Context:** Saves time when creating phishing campaigns.

### Requirement 27 — Automatically Generated Phishing Campaigns
**Description:** The app should be able to generate phishing campaigns based on templates and a schedule, using an LLM to generate the emails and landing pages by filling in the templates.  
**Context:** Makes scheduling campaigns a lot easier for the tenant admin.

### Requirement 28
**Description:** The application should allow each user to access their personal phishing and training performance metrics.  
**Context:** IT proficient learners like Bruno want to understand their security behavior. Access to personal metrics helps them measure awareness progress and identify areas for improvement

### Requirement 29
**Description:** The platform should provide immediate feedback to users after they interact with simulated phishing emails.  
**Context:** When a user clicks, or ignores a phishing simulation, the platform must display contextual feedback explaining what happened and what the correct action would have been.

### Requirement 30 — Create & publish courses
**Description:** The platform shall allow Content Managers to create and publish courses composed of videos, quizzes, images, and PDFs, making them available in the catalog.  
**Context:** Enables organizations to subscribe to standardized training.

### Requirement 31 — Course versioning & statuses
**Description:** The platform shall support course versioning and status management: published, updated (new version available), and discontinued.  
**Context:** Keeps material accurate and traceable over time.

### Requirement 32 — Course categorization & tags
**Description:** The platform shall allow categorization/tagging of courses by topic, role, level, duration, language and expose filters in the catalog.  
**Context:** Improves discovery and selection by org admins.

### Requirement 33 — Discontinue courses with alternatives
**Description:** The platform shall allow Content Managers to discontinue a course and optionally suggest alternative courses.  
**Context:** Prevents adoption of obsolete material while guiding replacement.

### Requirement 34 — Highlight recommended courses
**Description:** The platform shall support recommendations/collections to highlight selected courses in the catalog UI.  
**Context:** Guides organizations toward high-value content.

### Requirement 35 — Create phishing email templates & landing pages
**Description:** The platform shall allow Content Managers to create, edit, and publish phishing email templates and landing page templates for organizations to use in campaigns.  
**Context:** Central simulation content aligned with campaign designer.

### Requirement 36 — Template categorization & difficulty
**Description:** The platform shall allow tagging of simulation templates by attack type (e.g., credential theft, invoice fraud) and difficulty level.  
**Context:** Helps org admins select appropriate scenarios.

### Requirement 37 — Update simulation templates
**Description:** The platform shall allow updating existing simulation templates to reflect current phishing trends, keeping older versions for traceability.  
**Context:** Maintains realism and currency.

### Requirement 38 — Archive/disable simulation templates
**Description:** The platform shall allow Content Managers to archive or disable templates that are no longer relevant, removing them from selection while keeping history. (Should we?)  
**Context:** Preserves catalog quality and governance.

### Requirement 39 — Pre-publication review for templates
**Description:** The platform shall enforce a review/approval step before a simulation template becomes published.  
**Context:** Ensures safety, tone, and compliance in simulations.    (Should it?)

### Requirement 40 — Content usage metrics
**Description:** The platform shall provide Content Managers with adoption metrics per course/template (e.g., number of organizations using it; basic usage trend).  
**Context:** Guides prioritization of updates and deprecation (Both in Educational and Simulation content).

### Requirement 41 — Feedback collection loop
**Description:** The platform shall allow organization administrators to submit feedback on courses/templates and expose that feedback to Content Managers.  
**Context:** Continuous quality improvement.

### Requirement 42?? — Recommended packs (cross-content)
**Description:** The platform shall allow highlighting of recommended packs that combine courses + phishing templates around themes (e.g., Finance fraud awareness).  
**Context:** Helps orgs build balanced programs quickly.

### Requirement 43 — Catalog management views & filters
**Description:** The platform shall provide a filterable management view for Content Managers showing status (published/updated/discontinued), type (educational/simulation), tags, and adoption.  
**Context:** Efficient day-to-day catalog operations.

### Requirement 44 — Course Deadline
**Description:** Each course should have a deadline that is calculated as the sum of the deadlines of its inner modules. However if the deadline for any of the modules is not met, the course’s validity should be negated.
**Context:** Enforcing completion through deadlines.

### Requirement 45 — Course Deadline Notifications
**Description:** TWhenever a user enrolls in a course, they should receive a notification about the deadline as well recurring reminders about the approaching deadline.
**Context:** Raising deadline awareness.

----
---

# Non Functional

### Availability & Reliability

**RFN-1**: Uptime: Service availability ≥ XX% per month, excluding announced maintenance (≥72 h notice, ≤2 h each).

**RFN-2**: Queued sends on failure: If email provider/API is down, campaign sends queue + auto-retry for up to 24 h before failing visibly to the tenant.

### Multi-Tenancy & Access Control

**RFN-3**: RBAC enforcement: Roles (Master Admin, Content Manager, Org Admin, Read-only, End User) gate features; authorization code has ≥95% branch coverage.

**RFN-4**: Tenant isolation: CI includes automated tests covering 100% of endpoints to prove 0 cross-tenant leaks.  

### Security & Privacy

**RFN-5**: Transport security: All external traffic over HTTPS / TLS 1.2+; HTTP requests are redirected.

**RFN-6**: No credential capture: Simulation landing pages never store entered credentials; any input is discarded within <2 s and not logged.

**RFN-7**: Audit log: Append-only records for role changes, content publish/version/discontinue, campaign scheduling; retained ≥1 year.  

### Content Governance & Safety

**RFN-8**: Content provenance: Every course/template version records author, timestamp, version note; visible in a version history UI.

**RFN-9**: Phishing safety gate: Phishing templates require a published checklist approval (ethics/brand-safety/no-credential-capture) before going live; 0 templates bypass this.

### Performance

**RFN-10**: Dashboard latency: Description

**RFN-11**: Title: Description

### Email Delivery Safeguards

**RFN-12**: Per-tenant rate cap: Default cap ≤2 000 emails / 15 min; breaching pauses remaining sends and surfaces an alert to the tenant.  

### Usability, i18n & Accessibility

**RFN-13**: Accessibility: Training, quiz, remediation pages meet WCAG 2.1 AA; automated checks report 0 critical violations.

**RFN-14**: i18n(MVP): EN and PT for all learner flows; missing keys fail CI.  

### Build & Release Quality

**RFN-15**: Test coverage: ≥80% overall; ≥90% on tenant-isolation and authorization modules.

**RFN-16**: Security scans: Release pipeline blocks deploy if any High/Critical SAST/DAST finding is open.  

### Video Protection

**RFN-17**: Protected Streaming (DRM + Expiring Segments): Videos shall be delivered via HLS/DASH with DRM on supported clients (e.g., Widevine/FairPlay); where DRM is unavailable, fall back to HLS with user-scoped, pre-signed segment URLs expiring ≤ 5 minutes; no direct MP4 endpoints exposed; a visible per-session watermark (tenant + user + timestamp) must be rendered during playback.

**RFN-18**: Download Deterrence & Traceability: Enforce CSP/CORS allow-lists for media and frame-ancestors 'none' (no embedding); log per-user video play events (tenant, user, asset, timestamp) retained ≥ 1 year; apply a per-user media rate limit (e.g., ≤ 300 segment requests / 5 min, excess returns HTTP 429 and is logged).

