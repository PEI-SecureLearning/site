The domain model captures the essential objects in SecureLearning and how they relate across the **Core**, **Phishing Engine**, and **LMS** feature areas.  
It defines tenants, users, groups, content, campaigns and remediation flows, and acts as the bridge between requirements, architecture and the data model.

---

## Domain Model Overview

![](domain-model.png)

This model reflects the main entities that exist in the system and the relationships between them, considering the multi-tenant environment and the separation between **configuration content** (templates, learning assets) and **runtime activity** (campaigns, email sends, landing pages, remediation events).

Key ideas represented in the diagram:

- **Multi-tenant structure:** Each tenant manages its own users, groups and campaigns, while the platform controls global content and feature toggles.
- **Unified user identity:** A single `User` entity with role specialisation (Admin, Tenant Admin, Content Manager, Learner).
- **Reusable content:** Email templates and landing page templates are managed centrally and reused across campaigns.
- **Campaign lifecycle:** A campaign schedules emails, links to templates, targets users/groups, and triggers remediation.
- **Immediate remediation flow:** When a user fails a simulation, they are redirected to learning content through a Remediation Plan.

---

## Core Entities

### **Tenant**
Represents each organisation using the platform.  
Each tenant:
- Has its own users and groups  
- Accesses specific **features** (LMS, Phishing Engine, Analytics) via feature toggles  
- Runs independent phishing campaigns and training programs  

---

### **User (with roles)**
A common identity for all platform users, specialised into:
- **Admin** – manages the entire platform  
- **Tenant Admin** – manages users, groups, courses, campaigns  
- **Content Manager** – manages educational and simulation content  
- **Learner** – completes courses and receives remediation  

Users belong to a single tenant (except platform-wide admins) and may be grouped for targeted campaigns and training.

---

### **Group**
Department- or role-based groupings of learners within a tenant.  
Used to:
- Target campaigns  
- Enrol multiple users in courses  
- Analyse performance at department/role level  

---

## Content & Templates

### **Content (supertype)**
A generic representation of content stored in the catalog, referenced by a token/path.  
Specialisations include:

- **Email Template** – phishing email bases with replacement arguments  
- **Landing Page Template** – pages displayed during simulations  
- (Extensible) educational content stored in the LMS

Templates are created by Content Creat Managers and used by Tenant Admins when crafting campaigns.

---

## Campaigns & Simulation Flow

### **Campaign**
Defines a phishing campaign created by a Tenant Admin.  
Includes:
- Name, description  
- Target users or groups  
- Schedule (date/time)  
- Associated **Remediation Plan**

### **Email Sending**
Each email in a campaign generates an `Email Sending` record storing:
- Template used  
- Timestamp  
- Profile and dynamic arguments  
- Whether it was interacted with  

### **Landing Page**
Represents a rendered landing page used in the simulation, based on a Landing Page Template.

---

## Remediation & Learning

### **Remediation Plan**
Configured per campaign to define immediate feedback and redirection when a user fails the simulation.

### **Module**
Represents LMS learning modules assigned as remediation or as part of regular training plans.

---

## How This Model Guides Implementation

The domain model establishes:
- The **entities** that must exist in the database  
- The **relationships** necessary for scheduling, tracking and analysing campaigns  
- The **workflow** linking simulations to immediate remediation and formal learning  
- The **boundaries** between global (platform-level) content and tenant-level operations  

It is the foundation for the relational and non-relational data structures defined next in the journey.

