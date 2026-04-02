# **Cloud AI Wi-Fi Management Dashboard for Service Providers**

## **Product Requirements Document (PRD)**

### **1\. Product Overview**

The Cloud AI Wi-Fi Management Dashboard is a centralized, cloud-based platform designed for Internet Service Providers (ISPs) to monitor, manage, optimize, and troubleshoot subscriber gateways and Wi-Fi networks at scale.

The dashboard enables proactive support, performance optimization, anomaly detection, and operational efficiency improvements across millions of deployed devices.

### **2\. Goals & Objectives**

* Provide real-time and wide visibility of gateway and Wi-Fi performance.  
* Enable AI-driven proactive issue detection and resolution.  
* Reduce ISP support call volume through automation and predictive insights.  
* Empower support teams with AI agents and advanced remote troubleshooting tools.  
* Provide network-wide performance benchmarking and segmentation insights.

### **3\. Target Users**

* **CSR Dashboard Users:** Tier-1 and Tier-2 Support Agents.  
* **NOC Teams:** Network Operations Center personnel monitoring fleet-wide health.  
* **Management:** Product & Operations Managers.  
* **Data Teams:** Data Analysts and AI Operations Teams.

### **4\. Platform Architecture**

* **Core Framework:** A cloud-native, multi-tenant architecture designed for secure, remote access via HTTPS, ensuring high scalability and robust tenant isolation.  
* **Identity & Access Management:** Centralized user management featuring granular, role-based access control (RBAC) to secure system resources and operations.  
* **Data & Storage Repository:** An integrated file management module for the centralized storage, versioning, and distribution of firmware, system logs, and configuration payloads.  
* **Autonomous Service Orchestration:** An intelligent workflow combining an "App Store" Lifecycle Management (LCM) model with an Agentic AI backend. This enables the autonomous provisioning, deployment, and lifecycle management of edge services without requiring full monolithic firmware upgrades.  
* **Activation Flow:**  
  1. **External Trigger:** A provisioning request is initiated for a new service.  
  2. **Agentic Reasoning & Resource Validation:** The AI agent autonomously evaluates edge gateway resources. By analyzing live status and historical telemetry, it predicts user behavior and identifies the optimal, least-disruptive deployment window (e.g., true idle periods).  
  3. **Modular Deployment:** Leveraging the App Store model, the specific service container is dynamically downloaded and installed on the target gateway, completely bypassing the need for a full image upgrade.  
  4. **Cloud Synchronization:** The user profile and service entitlements are activated and synchronized across the cloud backend.  
  5. **Closed-Loop Monitoring:** Post-installation, the Agentic AI continuously monitors service health. Upon detecting anomalies or performance degradation, it autonomously executes remediation workflows—such as logging incident tickets, alerting system administrators, or rolling back the specific container.  
  6. **User Access:** The newly provisioned service becomes seamlessly available to the end-user via customer-facing interfaces (e.g., mobile application or CSP frontend).

### **5\. Functional Requirements**

#### **5.1 Fleet Overview Dashboard**

*Provides top-level visibility into network-wide performance and connected gateway health.* **Aggregation & Grouping Flexibility:** The dashboard architecture natively supports hierarchical data aggregation, allowing operators to seamlessly summarize, filter, and drill down into metrics by specific customized groups, overarching organizational units (Orgs), or distinct geographic regions. This ensures the platform can adapt to the unique operational and business structures of any ISP.

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Total Gateways Status** | Display total deployed gateways and online/offline status. | High | MVP | Cloud, Frontend |
| **Real-Time Health Score** | Show real-time fleet health score (AI-calculated). | High | MVP | Cloud (AI), Frontend |
| **Performance Trends** | Visualize network performance trends (latency, throughput, packet loss). | High | MVP | Cloud, Frontend |
| **Fleet Segmentation** | Segment data dynamically by region, organization, group, firmware version, and hardware model. | Medium | MVP | Cloud, Frontend |
| **Alert Center** | Alert center with prioritized AI-detected anomalies. | High | MVP | Cloud (AI), Frontend |

#### **5.2 Subscriber-Level View**

*Granular diagnostics and management tools for individual subscriber accounts and homes.*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Subscriber Search** | Search subscribers by account, MAC, serial number, or address. | High | MVP | Cloud, Frontend |
| **Home Health Score** | Real-time score aggregating sub-scores (internet connection, stability, coverage, congestion). | High | Phase 2 | Cloud (AI), Frontend |
| **Home Summary** | View services, connected devices, traffic usage, and suggested recommendations. | High | MVP | Cloud, Frontend |
| **Live Wi-Fi Topology** | Visual tree of gateway, mesh nodes, and end-devices. Clickable for deep device details (Type, FW/HW, IP/MAC). | High | MVP | Cloud, Device FW, Frontend |
| **Historical Topology** | Historical timeline for home topology, allowing users to add/remove data layers. | Medium | Phase 3 | Cloud, Frontend |
| **QoE Dashboard** | Display traffic usage, throughput, Wi-Fi parameters (RSSI, Phy rate), and service flows per device. | High | MVP | Cloud, Device FW, Frontend |
| **Security Dashboard** | Edit security policies per customer, present security events, and detect anomalies. | High | MVP | Cloud (Sec), Frontend |
| **Historical Performance** | Provide a historical performance timeline of network data. | Medium | Phase 2 | Cloud, Frontend |
| **Remote Actions** | Trigger remote reboots, Wi-Fi optimization, and firmware upgrades. | High | MVP | Cloud, Device FW, Frontend |
| **Remote Configuration** | Edit WiFi parameters, LAN/WAN configurations remotely. | High | MVP | Cloud, Device FW, Frontend |
| **Gateway Resources** | Monitor available gateway resources (CPE, memory, storage, process status, etc.). | Medium | MVP | Cloud, Device FW, Frontend |
| **Integrated Speedtest** | Run down, up, and latency tests per gateway and mesh device. | Medium | MVP | Cloud, Device FW, Frontend |
| **Container Management** | Remote container environment management (install/uninstall, service start/stop, updates). | High | Phase 3 | Cloud, Device FW, Frontend |
| **Per-CPE Log Retrieval** | On-demand fetch of historical events, telemetry, and system logs specific to a single CPE MAC/Serial. Exportable for Tier 3 escalation. | High | MVP | Cloud, Device FW, Frontend |

#### **5.3 AI Engine & Automation**

*The backend intelligence powering predictive analytics and proactive support.*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Predictive Degradation** | Predict Wi-Fi performance degradation before complete failure. | High | Phase 3 | Cloud (AI) |
| **Automated Optimization** | Automated channel, client, and band steering optimization. | High | MVP | Cloud (AI), Device FW |
| **Self-Healing Network** | Autonomous, closed-loop network repair and self-healing automation. | High | MVP/Phase2 | Cloud (AI), Device FW |
| **Anomaly Detection** | Anomaly detection utilizing behavioral baselines. | Medium | Phase 2 | Cloud (AI) |
| **Staged Rollouts** | Automated and optimized firmware rollout deployment scheduling. | Medium | Phase 2 | Cloud |
| **Auto-Backup & Restore** | Automatically backup and restore user configuration in case of failure. | High | MVP | Cloud, Device FW |
| **RCA Suggestions** | Root cause analysis suggestions provided directly to support agents. | High | MVP | Cloud (AI), Frontend |
| **Gen AI Assistant** | Generative AI chat assistant explicitly for the support team. | High | MVP | Cloud (AI), Frontend |

#### **5.4 Alerting & Incident Management**

*System configuration for handling and prioritizing fleet events.*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Configurable Thresholds** | Allow admins to define specific alert thresholds. | High | MVP | Cloud, Frontend |
| **AI Incident Queue** | Incident queue prioritized intelligently by the AI engine. | High | Phase 2 | Cloud (AI), Frontend |
| **Incident Correlation** | Correlate incidents across regions, hardware models, or firmware versions. | Medium | Phase 3 | Cloud, Frontend |

#### **5.5 Analytics & Reporting**

*Long-term data tracking for business intelligence and operations.*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Benchmarking Dashboard** | Fleet performance benchmarking and comparative metrics. | Medium | Phase 2 | Cloud, Frontend |
| **Churn Risk Prediction** | AI-driven insights identifying subscribers at risk of churning. | High | Phase 3 | Cloud (AI) |
| **CX Scoring Trends** | Track historical Customer Experience scoring trends over time. | Medium | Phase 2 | Cloud, Frontend |
| **Firmware Adoption** | Dashboard tracking the adoption rate of new firmware releases. | Medium | MVP | Cloud, Frontend |
| **Custom Report Generation** | Generate and export customized reports (CSV/PDF formats) for network health, device inventory, and alert logs. | High | MVP | Cloud, Frontend |
| **Historical Event Reporting** | Dashboard interface to filter and visualize asynchronous event telemetry (connections, WAN drops, security events) across the fleet over time. | High | MVP | Cloud, Frontend |

#### 

#### **5.6 API & Enterprise Integration (Headless Mode)**

*Services enabling direct integration with ISP operations (OSS/BSS, CRM, NMS).*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **RESTful/GraphQL APIs** | Comprehensive API suite for external systems to query health scores, topology, and trigger remote actions. | High | MVP | Cloud |
| **Event Streaming / Webhooks** | Real-time push notifications to external CRMs when AI detects a severe anomaly or offline event (e.g., via Kafka). | High | MVP/Phase 2 | Cloud |
| **Single Sign-On (SSO)** | OIDC/SAML integration allows ISP agents to access the dashboard using their existing corporate credentials. | High | MVP | Cloud |
| **Data Export Pipeline** | Automated bulk export of anonymized telemetry data to the ISP's internal Data Warehouse or billing systems. | Medium | MVP/Phase 2 | Cloud |

#### **5.7 Multi-Tenancy & Administration**

*Tools required to manage discrete organizations and sub-tier partners within a single platform deployment.*

| Feature | Description | Priority | Stage | Teams Involved |
| :---- | :---- | :---- | :---- | :---- |
| **Tenant Provisioning** | Create and manage fully isolated tenant workspaces (for different regions, orgs, or wholesale MVNOs). | High | MVP | Cloud, Frontend |
| **Data Isolation & Masking** | Ensure strict logical separation of subscriber PII and telemetry data between distinct tenants. | High | MVP | Cloud |
| **Tenant-Level Branding** | Support white-labeling the dashboard interface (logos, colors) per individual tenant. | Medium | Phase 2 | Cloud, Frontend |
| **Super-Admin View** | A top-level aggregated view for master administrators to monitor the health and license usage across all tenants. | Medium | MVP | Cloud, Frontend |
| **Activity & Command Audit Logging** | Immutable audit trail tracking all CRUD operations, API calls, and cloud-to-edge commands (who, what, when, status). Exportable. | High | MVP | Cloud, Frontend |

## **6\. UX & Design Requirements: The Generative AI Paradigm**

To inspire a truly modern interface, the design language must move beyond traditional, static telecom dashboards. The goal is to create an "AI-native" look and feel where the system acts as an intelligent, collaborative partner rather than a rigid reporting tool.

* **Conversational & Prompt-Driven Interface (The Core Shift):** Shift away from traditional manual configuration (selecting widgets, dragging charts, mapping data sources). The primary interaction model should be a chatbot-driven interface. Operators can type a single natural language prompt (e.g., *"Show me the correlation between offline events and firmware version 2.1 across all Broadcom gateways in the northern region"*), and the system dynamically builds the interface to answer it.  
* **Dynamic React Component Generation:** The AI must instantly design and render functional, production-ready React components on the fly. Based on the prompt, the system should autonomously generate the optimal mix of interactive charts, data tables, and filters—complete with live data connections—without requiring the user to build the view manually. *(Design Inspiration: Figma's AI business dashboard generators).*  
* **Autonomous Multidimensional Data Correlation:** The generated dashboards must intelligently weave together complex dimensions without manual database queries. The UI should visually correlate anomalies across disparate datasets, events, physical locations, regions, hardware models, and firmware versions seamlessly.  
* **Access Control & Adaptive UI:** Role-based access control (RBAC) that not only restricts data access but tailors the complexity of the AI-generated views. A Tier-1 agent receives simplified diagnostic cards, while a NOC engineer receives deeply correlated data tables.  
* **Fluid Navigation:** Deep, intuitive drill-down capabilities flowing seamlessly from a macro level (Country/Region) directly to a micro level (Subscriber Gateway → Specific Mesh node or end-client).  
* **Visual Language:** A modern, clean aesthetic using standardized, color-coded health indicators mapping to specific severity levels. The generative AI components should feel cohesive and native to this design system.  
* **Accessibility:** Full Dark Mode support meticulously tailored to reduce eye strain in NOC (Network Operations Center) environments.  
  ---

**Note for the Design Team:** When wireframing this, do not start with a blank grid and a menu of charts. Start with a search/chat bar and design the fluid transition of how a plain-text question visually expands into a fully functional, data-rich React dashboard.