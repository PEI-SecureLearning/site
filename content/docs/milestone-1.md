# Milestone 1: Inception


<iframe
  src="https://www.canva.com/design/DAG2gqnmfl4/maQVq7KpVAxhcWJbTqZNGA/view?embed"
  width="100%"
  height="0" 
  frameborder="0"
  allowfullscreen
  style="border-radius: 0.75rem; margin: 2rem 0; min-height: 500px;"
></iframe>


## Project Overview

**SecureLearning** is a **multi-tenant cybersecurity awareness and training platform** that helps organizations **strengthen their human defences** against phishing and social engineering attacks.  
It allows companies to **simulate real phishing campaigns**, **measure employee reactions**, and deliver **targeted training and remediation**. Closing the loop between *attack, feedback, and learning*.

---

## Context

The vast majority of Cyberattacks **target people, not systems**.  
Most awareness programmes are **generic, static, and quickly forgotten**, failing to produce real behavioural change.  
SecureLearning addresses this by combining **continuous, role-based training**, **simulated attacks**, and **data-driven analytics** to improve awareness sustainably.

\
> _“We help organizations strengthen their security by training, testing, and measuring their people’s resilience against cyberattacks.”_

---

## Problem

Organizations often face three main challenges:
- **Engaging employees** with relevant and time-efficient cybersecurity education.  
- **Extracting actionable insights** from simulated phishing campaigns.  
- **Maintaining awareness levels** without compromising productivity.

---

## Goals

- Promote **secure user behaviour** through recurring, personalized learning paths.  
- Enable **easy campaign design and scheduling** for administrators.  
- Provide **real-time analytics and audit-grade reports** for managers.  
- Deliver a **secure, scalable, and modular platform** for future expansion.

---

## Main Features

- **Campaign Designer & Scheduler:** Create and plan phishing simulations using realistic templates.  
- **Phishing Simulation Engine:** Safely execute campaigns and collect behavioural metrics.  
- **Training & Remediation Module:** Assign short videos and quizzes based on user actions.  
- **Analytics & Dashboards:** Visualize awareness trends and remediation progress.  
- **Plugin-based Architecture:** Support for extensibility and integration of new modules (LMS, analytics, etc.).

---

## Personas

Our design is driven by five representative user profiles:

- **System Administrator** – maintains the platform and tenants.  
- **Content Manager** – manages educational and phishing content.  
- **Organization Manager** – runs simulations and assigns training.  
- **IT-Proficient Learner** – technical user improving awareness.  
- **Non-IT-Proficient Learner** – general staff with low digital literacy.

➡️ [Our Personas (Detailed)](/journey/personas)

---

## Requirements

We’ve defined both **functional** and **non-functional requirements**.

➡️ [Requirements document](/journey/requirements)  

---

## Architecture

SecureLearning adopts a **multi-tenant modular architecture**.

**Core components:**
- **Backend:** Python (FastAPI)  
- **Frontend:** React.js  
- **Modules:** LMS, Phishing Engine, Analytics, Feature Toggling System  
- **Deployment:** Containerized, supporting isolated tenant environments  

➡️ [Architecture overview](/journey/architecture)

---

## Expected Results

By the end of the project, SecureLearning aims to deliver:
- A **functional MVP** integrating simulations, remediation, and analytics.  
- A **plugin-based platform** ready for expansion.  
- **Measurable impact** on user awareness through data-driven reporting.

---

## Project Timeline

| Milestone | Dates | Focus |
|------------|--------|--------|
| **M1** | 23/09 – 27/10 | Personas, requirements, architecture, initial mockups |
| **M2** | 27/10 – 17/11 | Architecture refinement, ERD, UI mockups |
| **M3** | 18/11 – 17/12 | MVP development (Core API, dashboards, phishing engine) |
| **M4** | 17/12/25 – 02/06/26 | Final features, analytics, testing, Students@DETI demo |


---

