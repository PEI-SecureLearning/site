# M3: Legal, Business, and Risk Review

<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; padding-bottom: 0; margin: 2rem 0; overflow: hidden; border-radius: 0.75rem; border: 1px solid rgba(167,139,250,0.18); box-shadow: 0 10px 40px rgba(12,10,15,0.4);">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0;" src="https://www.canva.com/design/DAHInMntAjk/NrdSXg08WAj1nLw-0PpWsg/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>
</div>

## Focus

For this milestone, we stepped back from implementation details and reviewed SecureLearning as a product that needs to operate responsibly in real organizations.

The presentation focused on legal requirements, licensing, sector-specific cybersecurity awareness guidance, terms of use, technical risks, and the business model behind the platform.

---

## Legal and Ethical Requirements

We reviewed the data SecureLearning handles, including user identity data, quiz answers, campaign engagement, and IP addresses.

The main GDPR-related concerns were:

- Protecting personal data with encrypted identity storage.
- Verifying role-based access control on every endpoint and rendered page.
- Using secure JWT authentication.
- Informing users and applying consent where needed.
- Pseudonymizing identities for campaign and learning analytics.

We also identified improvements still needed, especially IP anonymization and clearer data retention limits.

---

## Licensing and Terms

The platform was positioned under the **Business Source License 1.1**, while the dependency review mapped the licenses used across the technical stack.

We also defined the main terms of use for the product:

- Phishing campaigns must be used strictly for educational purposes.
- Campaigns must not collect sensitive information.
- Campaign templates must not include malicious scripts.
- Uploaded content remains the responsibility of the organization using the platform.

The terms also clarify that SecureLearning supports awareness and resilience, but does not guarantee immunity from cyberattacks or a measurable improvement in every organization's security posture.

---

## Regulation and Measurement

We connected the platform to **NIST SP 800-50**, especially its focus on building and measuring cybersecurity and privacy learning programs.

This reinforced the importance of tracking:

- Training attendance and completion.
- Assessment performance.
- Phishing response behavior.
- Behavior change over time.
- Department-level performance data.
- Qualitative feedback from participants.

These measurements align with SecureLearning's goal of closing the loop between phishing simulations, remediation, and learning.

---

## Risk and Business Direction

The milestone also covered technical and business risks.

On the technical side, we highlighted external dependencies such as Keycloak, technical debt, maintainability issues, and fragile critical components that still need attention.

On the business side, we refined SecureLearning as a SaaS and managed-service offering, with options for private cloud deployment, onboarding, advisory support, and feature sets adapted to organization size.

The SWOT, TOWS, and PESTEL analysis helped clarify where the product has room to grow and where adoption risks remain, especially for smaller companies with limited security budgets.

---

## What This Milestone Represents

M3 of the second semester was about making SecureLearning more complete as a real platform, not just as a working prototype.

It clarified the legal, operational, and business assumptions that need to support the final product before deployment and final delivery.
