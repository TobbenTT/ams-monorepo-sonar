# AMS Platform — Security Policy

**Version**: 1.0 (2026-04-10)
**Vendor**: Value Strategy Consulting
**Platform**: AMS Platform v2.0.0
**Reference Framework**: Mining-industry vendor cybersecurity checklist (ISO 27001 / SOC 2 inspired)

---

## 1. Scope

This policy defines the security controls, operational procedures, and client obligations that govern the AMS Platform ("the Service") when deployed for enterprise customers in mining, oil & gas, and industrial sectors.

## 2. Controls Implemented

See the public compliance status page at [`/security-compliance`](https://ams.aiprowork.com/security-compliance) or call `GET /api/v1/security/compliance-status` for a live assessment.

### 2.1 Authentication & Access Control
- JWT bearer tokens with minimum 32-character HMAC secret
- Configurable token expiry (default: 24h)
- Role-based access control (RBAC) with 6 roles: admin, manager, planner, engineer, tecnico, supervisor
- Multi-tenant data segmentation by `plant_id` at API and query level
- MFA (TOTP): **on roadmap for Q2 2026**

### 2.2 Network & Transport Security
- TLS 1.2+ enforced via Let's Encrypt certificates
- HSTS header in production (`Strict-Transport-Security: max-age=31536000`)
- Rate limiting: 120 requests/minute per IP (middleware layer)
- Security response headers on every response:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy: default-src 'self'; ...`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 2.3 Data Protection
- **In transit**: HTTPS-only (HTTP redirected to HTTPS)
- **At rest**: PostgreSQL deployed on LUKS/dm-crypt encrypted disk volumes
- **Backups**: Encrypted automated backups with configurable retention (1/3/5/10 years)
- **Data location**: EU/US configurable; documented per contract

### 2.4 Audit & Monitoring
- All privileged actions logged to `audit_log` table (timestamp, user, action, entity, payload)
- SIEM integration via `/api/v1/security/siem-export` (JSON or CEF format)
- Health check endpoint `/health` exposed for uptime monitoring
- Structured logs emitted to stdout (captured by Docker/host log driver)

## 3. Incident Response

### 3.1 Notification SLA
Security incidents are reported to affected clients within **24 hours** of detection, as required by Section 3 of the Mining Vendor Cybersecurity Checklist.

### 3.2 Incident Classification
| Severity | Examples | Notification Target |
|----------|----------|---------------------|
| Critical | Confirmed data breach, unauthorized admin access, ransomware | < 2 hours |
| High     | Suspected breach, exposed credentials, service unavailability > 4h | < 8 hours |
| Medium   | Failed intrusion attempt, elevated error rates | < 24 hours |
| Low      | Minor policy violation, non-sensitive data exposure | < 72 hours |

### 3.3 Reporting
Use `POST /api/v1/security/report-incident` to log and broadcast an incident. The endpoint writes to the audit log and sends an email notification to the configured security contact.

## 4. Contract Termination & Data Exit

When a client contract ends, AMS Platform guarantees:

1. **Data return**: Complete export in JSON format via `GET /api/v1/admin/export-data`. Excel/CSV per table available on request.
2. **Secure deletion**: Cascading delete across all plant-scoped tables via `POST /api/v1/security/certificate-of-deletion?plant_id=X&confirm=true`.
3. **Certificate of deletion**: SHA-256-signed JSON certificate returned at deletion time, containing:
   - Plant ID and name
   - Deletion timestamp (UTC)
   - Tables affected with pre-deletion row counts
   - Backup purge schedule (30 days)
   - Performer identity
   - SHA-256 signature of the above
4. **Backup purge**: Automated backups containing client data are purged within 30 days of the primary deletion event.
5. **Access revocation**: All user tokens invalidated via `POST /api/v1/security/revoke-tokens`. API keys rotated. User accounts disabled.

## 5. Client Rights

Clients of AMS Platform have the right to:
- **Audit**: Request the audit log for their data via `/api/v1/admin/audit-log`
- **Export**: Download all their data at any time
- **Delete**: Request secure deletion with certificate of deletion
- **Port**: Receive data in a usable format (JSON) for migration
- **Incident notification**: Be notified of any security incident affecting their data within 24h
- **Compliance verification**: Query the live compliance status via `/api/v1/security/compliance-status`

## 6. Vendor Certifications (Roadmap)

| Standard | Status | Target |
|----------|--------|--------|
| ISO 27001 | Roadmap | 2026 |
| SOC 2 Type II | Roadmap | 2026 |
| Chilean Data Protection Law (Ley 19.628) | Compliant | — |
| GDPR | Aligned (not formally certified) | — |

## 7. Contact

- **Security incidents**: security@aiprowork.com
- **Sales / compliance questions**: sales@aiprowork.com
- **Platform status**: https://ams.aiprowork.com/status

---

*This document is updated continuously. For the most current version, visit the repository at `docs/SECURITY.md` or the live compliance status page.*
