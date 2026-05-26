# M4: Security, Performance, and Project Management

<div style="position: relative; width: 100%; height: 0; padding-top: 56.25%; padding-bottom: 0; margin: 2rem 0; overflow: hidden; border-radius: 0.75rem; border: 1px solid rgba(167,139,250,0.18); box-shadow: 0 10px 40px rgba(12,10,15,0.4);">
  <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0;" src="https://www.canva.com/design/DAHJlVvdNZ8/3NBi8GRgn4uJBcs7LbEhuA/view?embed" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>
</div>

## Focus

For this milestone, we focused on the platform qualities that matter once SecureLearning starts moving from prototype toward deployment.

The presentation covered performance and scalability, security risks, algorithm behavior, edge cases, CI/CD, and project management practices.

---

## Performance and Scalability

We measured API response times and throughput using the current deployment environment.

The results helped us separate normal endpoint behavior from areas that need optimization:

- Small requests, such as user information, responded in around 95 ms.
- Medium requests, such as course endpoints, usually stayed around 150 to 200 ms.
- Larger operations, such as user creation, reached around 350 ms.

Stress testing also exposed a scalability limit around higher request rates, where SQLAlchemy connection pool exhaustion caused API failures.

The main improvement areas identified were connection cleanup, reducing blocking synchronous code, and addressing slow endpoints such as realm user listing, where role fetching creates an N+1 query problem.

---

## Security Review

We reviewed SecureLearning against relevant OWASP risks, especially access control, security misconfiguration, supply chain failures, and injection.

Some protections are already in place:

- RBAC is enforced on API endpoints.
- Frontend pages render dynamically based on user roles.
- API authentication is controlled.
- URL travelling is restricted.
- SQLModel query constructors reduce SQL injection risk.

The review also identified remaining risks, including missing authentication on some endpoints, exploitable tracking endpoints, cross-tenant ID-only lookups, default production secrets, exposed operational endpoints, missing Nginx security headers, unpinned Docker images and GitHub Actions, and unsanitized phishing template HTML rendering.

The proposed fixes include enforcing tenant isolation by realm, completing RBAC coverage, hardening production secrets, restricting operational tools, adding security headers, versioning images and actions more strictly, adding dependency audits, and sanitizing template HTML with DOMPurify.

---

## Algorithms and Edge Cases

We documented the user risk score algorithm around knowledge, sentiment, engagement, confidence, and risk.

We also tested edge cases that could break assumptions in the platform:

- Invalid campaign states forced directly in the database.
- End dates before start dates.
- Missing phishing kits or user groups.
- Negative sending intervals.
- Phishing event consistency across opened, clicked, and phished states.
- Compliance changes while a user is answering terms and conditions.

These tests showed that some validation exists at API level, but DB-level constraints and lifecycle protections still need to be strengthened.

---

## Project Management and Delivery

This milestone also reviewed how the team is planning and delivering work.

The main process improvements were:

- Better task effort estimation and team capacity planning.
- Clearer definition of done.
- Improved dependency management.
- Stronger CI checks for formatting, testing, builds, SonarCloud, and subproject-specific work.
- Better tracking of CI failures around coverage, security hotspots, and code smells.
- A CD pipeline with manual release trigger, environment fetch, composition, GitHub Actions, and observability.

We also reviewed Jira automation, versioning, pull request distribution, and common minor problem sources such as deployment configuration hotfixes, UX improvements, and business requirement changes.

---

## What This Milestone Represents

M4 of the second semester was about hardening SecureLearning.

It made the remaining technical risks more explicit and connected engineering work with delivery practices, so the final stretch can focus on deployment, final reporting, demo material, and polish.
