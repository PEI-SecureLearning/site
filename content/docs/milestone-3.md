# Milestone 3: MVP

<iframe
  src="https://www.canva.com/design/DAG7McoSF04/sMord_BglF7fgzVM9M4bnQ/view?embed"
  width="100%"
  height="0"
  frameborder="0"
  allowfullscreen
  style="border-radius: 0.75rem; margin: 2rem 0; min-height: 500px;"
></iframe>

## MVP scope & positioning

For our **MVP**, we decided to focus on the **Phishing Engine**: enabling organizations to run phishing simulation campaigns end-to-end, while leaving the **LMS** for a future iteration.

This puts us **on par** with **GoPhish** (the industry-standard open source tool for phishing simulations), while still aligning with SecureLearning’s longer-term vision.

---

## Multi-tenancy (why it matters)

Unlike single-tenant setups, SecureLearning’s Phishing Engine is designed for **multi-tenancy**, meaning multiple organizations can use the platform while remaining isolated from each other.

This is important because it enables:

- **Data isolation**: one organization’s users, campaigns, templates, and metrics are not visible to others.
- **Operational scalability**: onboarding new organizations doesn’t require spinning up a separate deployment per customer.
- **Safer administration**: platform-level admins can manage tenants centrally while keeping boundaries enforced.

---

## What we implemented (persona-driven workflows)

Because of this MVP scope, we focused more heavily on **3 of our 4 personas**:

### System Admin
- **Tenant Management**

### Content Manager
- **Phishing Templates**: Emails & Landing Pages

### Organization Manager
- **User Management**
- **Phishing Campaigns**: Launching and Monitoring phishing simulation campaigns

---

## Demo videos

To support the milestone presentation, we recorded short demo videos of the MVP workflows, organised by persona.
[See MVP Workflow Videos ↗](/journey/mvp-workflows)

