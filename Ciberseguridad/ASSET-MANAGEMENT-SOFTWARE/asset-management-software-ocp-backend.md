# Parcheo de seguridad — `asset-management-software-ocp-backend`

> **Generado:** 2026-04-25T00:05:04Z  
> **Proyecto:** `ASSET-MANAGEMENT-SOFTWARE`  
> **Origen:** Scanner automático del QA / Security Hub (Trivy + Nuclei + npm audit)  
> **Estado actual:** 155 vulnerabilidades pendientes (8 🔴 crítica, 45 🟠 alta, 102 🟡 media, 0 ⚪ baja)  
> **Con fix disponible:** 97 · **Sin fix upstream:** 58

Este archivo lo lee otro Claude en el repo del proyecto. Sigue las instrucciones EN ORDEN. Cada vulnerabilidad parcheada debe registrarse como evidencia en el QA / Security Hub para cumplimiento ISO 27001.

---

## Controles ISO 27001 aplicables

- **A.8.8 — Gestión de vulnerabilidades técnicas**: identificar, evaluar y tratar vulnerabilidades técnicas de los activos de información antes de que sean explotadas.
- **A.8.9 — Gestión de configuración**: las configuraciones de hardware, software y servicios deben establecerse, documentarse, monitorizarse y revisarse.
- **A.8.32 — Gestión de cambios**: todo cambio que modifique servicios, sistemas o configuraciones debe ser controlado.
- **A.5.37 — Procedimientos operativos documentados**: los procedimientos para operar sistemas deben documentarse y actualizarse.

**Evidencia mínima a registrar tras parchear** (subir como URL en cada vulnerabilidad del hub):
- Diff del Dockerfile / package.json / go.mod / etc.
- Hash del commit de parcheo.
- Fecha de despliegue.
- Resultado del re-scan (debe ser 0 vulnerabilidades del CVE atacado).

---

## Instrucciones para el agente Claude del proyecto

**Contexto:** estás en el repositorio de un proyecto que contiene vulnerabilidades detectadas en su imagen Docker. Tu trabajo es:

1. Leer este archivo completo.
2. Para cada vulnerabilidad listada abajo, identificar dónde se origina (Dockerfile, package.json, requirements.txt, go.mod, dependencias del SO base).
3. Aplicar el fix si está disponible (sección 🟢 _Vulns con fix disponible_).
4. Para las que no tienen fix upstream (🔵 _Vulns sin fix_), evaluar si:
   - Se puede cambiar a una imagen base alternativa (ej: alpine en vez de debian).
   - El paquete vulnerable se usa realmente — si no, removerlo.
   - Si no hay acción posible, documentar y marcar como `aceptada` en el hub.
5. Construir la imagen actualizada y desplegar.
6. Verificar con `trivy image <imagen>` que las CVEs ya no aparecen.
7. Reportar al humano el commit + verificación.

**Reglas:**
- NO hagas cambios destructivos sin testear (no cambies de Debian a Alpine sin verificar que la app funcione).
- Crea **un commit por grupo lógico** (ej: 'bump base image', 'upgrade lodash', 'remove unused xml2js'), no uno gigante.
- Si un fix requiere bumpear una versión MAJOR de una lib (riesgo de breaking changes), avisa al humano antes de hacerlo.
- NO marques nada como mitigada en el hub manualmente — el scanner lo detectará automáticamente en el próximo ciclo.

---

## 🔴 Críticas (parcha HOY) (8)

### `libsqlite3-0`

- Versión instalada: `3.40.1-2+deb12u1`  
- ➜ **Actualizar a:** `3.40.1-2+deb12u2`
- CVEs (2):
  - **CVE-2025-6965** CVSS 9.8 — sqlite: Integer Truncation in SQLite en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6965)
  - **CVE-2025-7458** CVSS 9.1 — sqlite: SQLite integer overflow en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-7458)

### `libssl3`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (2):
  - **CVE-2025-15467** CVSS 9.8 — openssl: OpenSSL: Remote code execution or Denial of Service via oversized Initialization Vector in CMS parsing en asset-management-software [↗](https://avd.aquasec.com/nvd/cve-2025-15467)
  - **CVE-2026-31789** CVSS 9.8 — openssl: OpenSSL: Heap buffer overflow on 32-bit systems from large X.509 certificate processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-31789)

### `openssl`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (2):
  - **CVE-2025-15467** CVSS 9.8 — openssl: OpenSSL: Remote code execution or Denial of Service via oversized Initialization Vector in CMS parsing en asset-management-software [↗](https://avd.aquasec.com/nvd/cve-2025-15467)
  - **CVE-2026-31789** CVSS 9.8 — openssl: OpenSSL: Heap buffer overflow on 32-bit systems from large X.509 certificate processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-31789)

### `python-jose`

- Versión instalada: `3.3.0`  
- ➜ **Actualizar a:** `3.4.0`
- CVEs (1):
  - **CVE-2024-33663**  — python-jose: algorithm confusion with OpenSSH ECDSA keys and other key formats en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-33663)

### `zlib1g`

- Versión instalada: `1:1.2.13.dfsg-1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2023-45853** CVSS 9.8 — zlib: integer overflow and resultant heap-based buffer overflow in zipOpenNewFileInZip4_6 en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-45853)

## 🟠 Altas (parcha en 7 días) (45)

### `PyJWT`

- Versión instalada: `2.9.0`  
- ➜ **Actualizar a:** `2.12.0`
- CVEs (1):
  - **CVE-2026-32597** CVSS 7.5 — pyjwt: PyJWT accepts unknown `crit` header extensions (RFC 7515 §4.1.11 MUST violation) en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-32597)

### `ecdsa`

- Versión instalada: `0.19.1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2024-23342** CVSS 7.4 — python-ecdsa: vulnerable to the Minerva attack en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-23342)

### `gpgv`

- Versión instalada: `2.2.40-1.1`  
- ➜ **Actualizar a:** `2.2.40-1.1+deb12u2`
- CVEs (1):
  - **CVE-2025-68973** CVSS 7.0 — GnuPG: GnuPG: Information disclosure and potential arbitrary code execution via out-of-bounds write en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-68973)

### `libc-bin`

- Versión instalada: `2.36-9+deb12u10`  
- ➜ **Actualizar a:** `2.36-9+deb12u11`
- CVEs (2):
  - **CVE-2025-4802** CVSS 7.0 — glibc: static setuid binary dlopen may incorrectly search LD_LIBRARY_PATH en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-4802)
  - **CVE-2026-0861** CVSS 8.1 — glibc: Integer overflow in memalign leads to heap corruption en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-0861)

### `libc6`

- Versión instalada: `2.36-9+deb12u10`  
- ➜ **Actualizar a:** `2.36-9+deb12u11`
- CVEs (2):
  - **CVE-2025-4802** CVSS 7.0 — glibc: static setuid binary dlopen may incorrectly search LD_LIBRARY_PATH en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-4802)
  - **CVE-2026-0861** CVSS 8.1 — glibc: Integer overflow in memalign leads to heap corruption en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-0861)

### `libgnutls30`

- Versión instalada: `3.7.9-2+deb12u4`  
- ➜ **Actualizar a:** `3.7.9-2+deb12u5`
- CVEs (2):
  - **CVE-2025-32990** CVSS 8.2 — gnutls: Vulnerability in GnuTLS certtool template parsing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-32990)
  - **CVE-2025-32988** CVSS 8.2 — gnutls: Vulnerability in GnuTLS otherName SAN export en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-32988)

### `libncursesw6`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-69720** CVSS 7.8 — ncurses: ncurses: Buffer overflow vulnerability may lead to arbitrary code execution. en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69720)

### `libpam-modules`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (1):
  - **CVE-2025-6020** CVSS 7.8 — linux-pam: Linux-pam directory Traversal en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6020)

### `libpam-modules-bin`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (1):
  - **CVE-2025-6020** CVSS 7.8 — linux-pam: Linux-pam directory Traversal en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6020)

### `libpam-runtime`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (1):
  - **CVE-2025-6020** CVSS 7.8 — linux-pam: Linux-pam directory Traversal en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6020)

### `libpam0g`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (1):
  - **CVE-2025-6020** CVSS 7.8 — linux-pam: Linux-pam directory Traversal en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6020)

### `libssl3`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (6):
  - **CVE-2026-28388** CVSS 7.5 — openssl: OpenSSL: Denial of Service due to NULL pointer dereference in delta CRL processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28388)
  - **CVE-2026-28390** CVSS 7.5 — openssl: OpenSSL: Denial of Service due to NULL pointer dereference in CMS EnvelopedData processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28390)
  - **CVE-2025-69421** CVSS 7.5 — openssl: OpenSSL: Denial of Service via malformed PKCS#12 file processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69421)
  - **CVE-2025-69419** CVSS 7.4 — openssl: OpenSSL: Arbitrary code execution due to out-of-bounds write in PKCS#12 processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69419)
  - **CVE-2026-28389** CVSS 7.5 — openssl: OpenSSL: Denial of Service vulnerability in CMS processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28389)
  - **CVE-2026-28387** CVSS 8.1 — openssl: OpenSSL: Arbitrary code execution due to use-after-free in DANE TLSA authentication en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28387)

### `libsystemd0`

- Versión instalada: `252.36-1~deb12u1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-29111** CVSS 7.8 — systemd: systemd: Arbitrary code execution or Denial of Service via spurious IPC API call data en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-29111)

### `libtinfo6`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-69720** CVSS 7.8 — ncurses: ncurses: Buffer overflow vulnerability may lead to arbitrary code execution. en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69720)

### `libudev1`

- Versión instalada: `252.36-1~deb12u1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-29111** CVSS 7.8 — systemd: systemd: Arbitrary code execution or Denial of Service via spurious IPC API call data en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-29111)

### `ncurses-base`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-69720** CVSS 7.8 — ncurses: ncurses: Buffer overflow vulnerability may lead to arbitrary code execution. en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69720)

### `ncurses-bin`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-69720** CVSS 7.8 — ncurses: ncurses: Buffer overflow vulnerability may lead to arbitrary code execution. en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69720)

### `openssl`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (6):
  - **CVE-2025-69419** CVSS 7.4 — openssl: OpenSSL: Arbitrary code execution due to out-of-bounds write in PKCS#12 processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69419)
  - **CVE-2025-69421** CVSS 7.5 — openssl: OpenSSL: Denial of Service via malformed PKCS#12 file processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69421)
  - **CVE-2026-28387** CVSS 8.1 — openssl: OpenSSL: Arbitrary code execution due to use-after-free in DANE TLSA authentication en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28387)
  - **CVE-2026-28390** CVSS 7.5 — openssl: OpenSSL: Denial of Service due to NULL pointer dereference in CMS EnvelopedData processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28390)
  - **CVE-2026-28389** CVSS 7.5 — openssl: OpenSSL: Denial of Service vulnerability in CMS processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28389)
  - **CVE-2026-28388** CVSS 7.5 — openssl: OpenSSL: Denial of Service due to NULL pointer dereference in delta CRL processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28388)

### `perl-base`

- Versión instalada: `5.36.0-7+deb12u1`  
- ➜ **Actualizar a:** `5.36.0-7+deb12u2, 5.36.0-7+deb12u3`
- CVEs (2):
  - **CVE-2024-56406** CVSS 7.3 — perl: Perl 5.34, 5.36, 5.38 and 5.40 are vulnerable to a heap buffer overflow when transliterating non-ASCII bytes en asset-management-softw [↗](https://avd.aquasec.com/nvd/cve-2024-56406)
  - **CVE-2023-31484** CVSS 8.1 — perl: CPAN.pm does not verify TLS certificates when downloading distributions over HTTPS en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-31484)

### `picomatch`

- Versión instalada: `4.0.3`  
- ➜ **Actualizar a:** `4.0.4, 3.0.2, 2.3.2`
- CVEs (1):
  - **CVE-2026-33671** CVSS 6.5 — picomatch: Picomatch: Regular Expression Denial of Service via crafted extglob patterns en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-33671)

### `pillow`

- Versión instalada: `12.1.1`  
- ➜ **Actualizar a:** `12.2.0`
- CVEs (1):
  - **CVE-2026-40192** CVSS 7.5 — Pillow: Pillow: Denial of Service via decompression bomb in FITS image processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-40192)

### `pyasn1`

- Versión instalada: `0.6.2`  
- ➜ **Actualizar a:** `0.6.3`
- CVEs (1):
  - **CVE-2026-30922** CVSS 7.5 — pyasn1: pyasn1 Vulnerable to Denial of Service via Unbounded Recursion en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-30922)

### `setuptools`

- Versión instalada: `65.5.1`  
- ➜ **Actualizar a:** `70.0.0, 78.1.1`
- CVEs (2):
  - **CVE-2024-6345** CVSS 8.8 — pypa/setuptools: Remote code execution via download functions in the package_index module in pypa/setuptools en asset-management-software-oc [↗](https://avd.aquasec.com/nvd/cve-2024-6345)
  - **CVE-2025-47273** CVSS 8.8 — setuptools: Path Traversal Vulnerability in setuptools PackageIndex en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-47273)

### `tornado`

- Versión instalada: `6.5.4`  
- ➜ **Actualizar a:** `6.5.5`
- CVEs (2):
  - **CVE-2026-35536** CVSS 5.3 — tornado: Tornado: Cookie attribute injection due to improper handling of cookie arguments en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-35536)
  - **CVE-2026-31958** CVSS 7.5 — tornado-python: Tornado: Denial of Service via large multipart bodies en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-31958)

### `vite`

- Versión instalada: `7.3.1`  
- ➜ **Actualizar a:** `8.0.5, 7.3.2, 8.0.5, 7.3.2, 6.4.2`
- CVEs (2):
  - **CVE-2026-39363** CVSS 7.5 — Vite: Vite: Information disclosure via WebSocket connection bypasses access control en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-39363)
  - **CVE-2026-39364** CVSS 7.5 — vite: Vite: Information disclosure via query parameter manipulation on the development server en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-39364)

### `wheel`

- Versión instalada: `0.45.1`  
- ➜ **Actualizar a:** `0.46.2`
- CVEs (1):
  - **CVE-2026-24049** CVSS 5.5 — wheel: wheel: Privilege Escalation or Arbitrary Code Execution via malicious wheel file unpacking en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-24049)

### `xlsx`

- Versión instalada: `0.18.5`  
- ➜ **Actualizar a:** `0.19.3, 0.20.2`
- CVEs (2):
  - **CVE-2023-30533** CVSS 7.8 — Prototype Pollution in sheetJS en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-30533)
  - **CVE-2024-22363**  — SheetJS Regular Expression Denial of Service (ReDoS) en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-22363)

## 🟡 Medias (sprint actual) (102)

### `bsdutils`

- Versión instalada: `1:2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `cryptography`

- Versión instalada: `46.0.5`  
- ➜ **Actualizar a:** `46.0.7`
- CVEs (1):
  - **CVE-2026-39892** CVSS 9.8 — cryptography: Cryptography: Buffer overflow via non-contiguous buffer in API en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-39892)

### `dpkg`

- Versión instalada: `1.21.22`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-2219**  — It was discovered that dpkg-deb (a component of dpkg, the Debian packa ... en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-2219)

### `ecdsa`

- Versión instalada: `0.19.1`  
- ➜ **Actualizar a:** `0.19.2`
- CVEs (1):
  - **CVE-2026-33936** CVSS 5.3 — python-ecdsa: ecdsa: Denial of Service via crafted DER input en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-33936)

### `gpgv`

- Versión instalada: `2.2.40-1.1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (2):
  - **CVE-2025-68972** CVSS 4.7 — gnupg: GnuPG: Signature bypass via form feed character in signed messages en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-68972)
  - **CVE-2025-30258** CVSS 4.7 — gnupg: verification DoS due to a malicious subkey in the keyring en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-30258)

### `libblkid1`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `libc-bin`

- Versión instalada: `2.36-9+deb12u10`  
- ➜ **Actualizar a:** `2.36-9+deb12u13`
- CVEs (8):
  - **CVE-2025-8058** CVSS 4.2 — glibc: Double free in glibc en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-8058)
  - **CVE-2026-4437** CVSS 6.5 — glibc: glibc: Incorrect DNS response parsing via crafted DNS server response en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4437)
  - **CVE-2026-4046** CVSS 5.3 — glibc: glibc: Denial of Service via iconv() function with specific character sets en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4046)
  - **CVE-2026-0915** CVSS 5.3 — glibc: glibc: Information disclosure via zero-valued network query en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-0915)
  - **CVE-2025-15281** CVSS 5.9 — glibc: wordexp with WRDE_REUSE and WRDE_APPEND may return uninitialized memory en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-15281)
  - **CVE-2026-5928** CVSS 5.0 — glibc: glibc: Information disclosure or denial of service via ungetwc function with specific wide character encodings en asset-management-so [↗](https://avd.aquasec.com/nvd/cve-2026-5928)
  - **CVE-2026-5450** CVSS 5.0 — glibc: glibc: Heap Buffer Overflow in `scanf` with `%mc` format specifier and large width en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-5450)
  - **CVE-2026-4438** CVSS 4.0 — glibc: glibc: Invalid DNS hostname returned via gethostbyaddr functions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4438)

### `libc6`

- Versión instalada: `2.36-9+deb12u10`  
- ➜ **Actualizar a:** `2.36-9+deb12u13`
- CVEs (8):
  - **CVE-2025-8058** CVSS 4.2 — glibc: Double free in glibc en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-8058)
  - **CVE-2026-5928** CVSS 5.0 — glibc: glibc: Information disclosure or denial of service via ungetwc function with specific wide character encodings en asset-management-so [↗](https://avd.aquasec.com/nvd/cve-2026-5928)
  - **CVE-2026-4438** CVSS 4.0 — glibc: glibc: Invalid DNS hostname returned via gethostbyaddr functions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4438)
  - **CVE-2026-4437** CVSS 6.5 — glibc: glibc: Incorrect DNS response parsing via crafted DNS server response en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4437)
  - **CVE-2026-4046** CVSS 5.3 — glibc: glibc: Denial of Service via iconv() function with specific character sets en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4046)
  - **CVE-2026-0915** CVSS 5.3 — glibc: glibc: Information disclosure via zero-valued network query en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-0915)
  - **CVE-2025-15281** CVSS 5.9 — glibc: wordexp with WRDE_REUSE and WRDE_APPEND may return uninitialized memory en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-15281)
  - **CVE-2026-5450** CVSS 5.0 — glibc: glibc: Heap Buffer Overflow in `scanf` with `%mc` format specifier and large width en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-5450)

### `libcap2`

- Versión instalada: `1:2.66-4`  
- ➜ **Actualizar a:** `1:2.66-4+deb12u1`
- CVEs (2):
  - **CVE-2025-1390** CVSS 6.1 — libcap: pam_cap: Fix potential configuration parsing error en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-1390)
  - **CVE-2026-4878** CVSS 6.7 — libcap: libcap: Privilege escalation via TOCTOU race condition in cap_set_file() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4878)

### `libgnutls30`

- Versión instalada: `3.7.9-2+deb12u4`  
- ➜ **Actualizar a:** `3.7.9-2+deb12u5, 3.7.9-2+deb12u6`
- CVEs (4):
  - **CVE-2025-32989** CVSS 5.3 — gnutls: Vulnerability in GnuTLS SCT extension parsing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-32989)
  - **CVE-2025-9820** CVSS 4.0 — gnutls: Stack-based Buffer Overflow in gnutls_pkcs11_token_init() Function en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-9820)
  - **CVE-2025-6395** CVSS 6.5 — gnutls: NULL pointer dereference in _gnutls_figure_common_ciphersuite() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-6395)
  - **CVE-2025-14831** CVSS 5.3 — gnutls: GnuTLS: Denial of Service via excessive resource consumption during certificate verification en asset-management-software-ocp-backen [↗](https://avd.aquasec.com/nvd/cve-2025-14831)

### `libgssapi-krb5-2`

- Versión instalada: `1.20.1-2+deb12u2`  
- ➜ **Actualizar a:** `1.20.1-2+deb12u3, 1.20.1-2+deb12u4`
- CVEs (3):
  - **CVE-2024-26462** CVSS 5.5 — krb5: Memory leak at /krb5/src/kdc/ndr.c en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-26462)
  - **CVE-2025-24528** CVSS 6.5 — krb5: overflow when calculating ulog block size en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-24528)
  - **CVE-2025-3576** CVSS 5.9 — krb5: Kerberos RC4-HMAC-MD5 Checksum Vulnerability Enabling Message Spoofing via MD5 Collisions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-3576)

### `libk5crypto3`

- Versión instalada: `1.20.1-2+deb12u2`  
- ➜ **Actualizar a:** `1.20.1-2+deb12u3, 1.20.1-2+deb12u4`
- CVEs (3):
  - **CVE-2025-3576** CVSS 5.9 — krb5: Kerberos RC4-HMAC-MD5 Checksum Vulnerability Enabling Message Spoofing via MD5 Collisions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-3576)
  - **CVE-2025-24528** CVSS 6.5 — krb5: overflow when calculating ulog block size en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-24528)
  - **CVE-2024-26462** CVSS 5.5 — krb5: Memory leak at /krb5/src/kdc/ndr.c en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-26462)

### `libkrb5-3`

- Versión instalada: `1.20.1-2+deb12u2`  
- ➜ **Actualizar a:** `1.20.1-2+deb12u3, 1.20.1-2+deb12u4`
- CVEs (3):
  - **CVE-2025-3576** CVSS 5.9 — krb5: Kerberos RC4-HMAC-MD5 Checksum Vulnerability Enabling Message Spoofing via MD5 Collisions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-3576)
  - **CVE-2025-24528** CVSS 6.5 — krb5: overflow when calculating ulog block size en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-24528)
  - **CVE-2024-26462** CVSS 5.5 — krb5: Memory leak at /krb5/src/kdc/ndr.c en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-26462)

### `libkrb5support0`

- Versión instalada: `1.20.1-2+deb12u2`  
- ➜ **Actualizar a:** `1.20.1-2+deb12u3, 1.20.1-2+deb12u4`
- CVEs (3):
  - **CVE-2024-26462** CVSS 5.5 — krb5: Memory leak at /krb5/src/kdc/ndr.c en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-26462)
  - **CVE-2025-3576** CVSS 5.9 — krb5: Kerberos RC4-HMAC-MD5 Checksum Vulnerability Enabling Message Spoofing via MD5 Collisions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-3576)
  - **CVE-2025-24528** CVSS 6.5 — krb5: overflow when calculating ulog block size en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-24528)

### `liblzma5`

- Versión instalada: `5.4.1-1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-34743** CVSS 5.3 — xz: XZ Utils: Denial of Service via buffer overflow in index decoding en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-34743)

### `libmount1`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `libncursesw6`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2023-50495** CVSS 6.5 — ncurses: segmentation fault via _nc_wrap_entry() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-50495)

### `libpam-modules`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (2):
  - **CVE-2024-22365** CVSS 5.5 — pam: allowing unprivileged user to block another user namespace en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-22365)
  - **CVE-2024-10041** CVSS 4.7 — pam: libpam: Libpam vulnerable to read hashed password en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-10041)

### `libpam-modules-bin`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (2):
  - **CVE-2024-22365** CVSS 5.5 — pam: allowing unprivileged user to block another user namespace en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-22365)
  - **CVE-2024-10041** CVSS 4.7 — pam: libpam: Libpam vulnerable to read hashed password en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-10041)

### `libpam-runtime`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (2):
  - **CVE-2024-22365** CVSS 5.5 — pam: allowing unprivileged user to block another user namespace en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-22365)
  - **CVE-2024-10041** CVSS 4.7 — pam: libpam: Libpam vulnerable to read hashed password en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-10041)

### `libpam0g`

- Versión instalada: `1.5.2-6+deb12u1`  
- ➜ **Actualizar a:** `1.5.2-6+deb12u2`
- CVEs (2):
  - **CVE-2024-22365** CVSS 5.5 — pam: allowing unprivileged user to block another user namespace en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-22365)
  - **CVE-2024-10041** CVSS 4.7 — pam: libpam: Libpam vulnerable to read hashed password en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-10041)

### `libsmartcols1`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `libsqlite3-0`

- Versión instalada: `3.40.1-2+deb12u1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-7709**  — An integer overflow exists in the FTS5 https://sqlite.org/fts5.html e ... en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-7709)

### `libssl3`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.16-1~deb12u1, 3.0.17-1~deb12u3, 3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (8):
  - **CVE-2024-13176** CVSS 4.7 — openssl: Timing side-channel in ECDSA signature computation en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-13176)
  - **CVE-2025-69418** CVSS 4.0 — openssl: OpenSSL: Information disclosure and data tampering via specific low-level OCB encryption/decryption calls en asset-management-softw [↗](https://avd.aquasec.com/nvd/cve-2025-69418)
  - **CVE-2025-69420** CVSS 5.9 — openssl: OpenSSL: Denial of Service via malformed TimeStamp Response en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69420)
  - **CVE-2025-9230** CVSS 5.6 — openssl: Out-of-bounds read & write in RFC 3211 KEK Unwrap en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-9230)
  - **CVE-2026-22795** CVSS 5.5 — openssl: OpenSSL: Denial of Service due to type confusion in PKCS#12 file processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-22795)
  - **CVE-2026-22796** CVSS 5.9 — openssl: OpenSSL: Denial of Service via type confusion in PKCS#7 signature verification en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-22796)
  - **CVE-2026-31790** CVSS 5.9 — openssl: openssl: Information Disclosure from Uninitialized Memory via Invalid RSA Public Key en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-31790)
  - **CVE-2025-68160** CVSS 4.7 — openssl: OpenSSL: Denial of Service due to out-of-bounds write in BIO filter en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-68160)

### `libsystemd0`

- Versión instalada: `252.36-1~deb12u1`  
- ➜ **Actualizar a:** `252.38-1~deb12u1`
- CVEs (4):
  - **CVE-2025-4598** CVSS 4.7 — systemd-coredump: race condition that allows a local attacker to crash a SUID program and gain read access to the resulting core dump en ass [↗](https://avd.aquasec.com/nvd/cve-2025-4598)
  - **CVE-2026-40225** CVSS 6.4 — systemd: udev in systemd: Privilege escalation via malicious hardware devices and unsanitized kernel output en asset-management-software-ocp [↗](https://avd.aquasec.com/nvd/cve-2026-40225)
  - **CVE-2026-4105** CVSS 6.7 — systemd: systemd: Privilege escalation via improper access control in RegisterMachine D-Bus method en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4105)
  - **CVE-2026-40226** CVSS 6.4 — systemd: systemd nspawn: Escape-to-host action via crafted config file en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-40226)

### `libtasn1-6`

- Versión instalada: `4.19.0-2+deb12u1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2025-13151** CVSS 5.9 — libtasn1: libtasn1: Denial of Service via stack-based buffer overflow in asn1_expend_octet_string en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-13151)

### `libtinfo6`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2023-50495** CVSS 6.5 — ncurses: segmentation fault via _nc_wrap_entry() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-50495)

### `libudev1`

- Versión instalada: `252.36-1~deb12u1`  
- ➜ **Actualizar a:** `252.38-1~deb12u1`
- CVEs (4):
  - **CVE-2025-4598** CVSS 4.7 — systemd-coredump: race condition that allows a local attacker to crash a SUID program and gain read access to the resulting core dump en ass [↗](https://avd.aquasec.com/nvd/cve-2025-4598)
  - **CVE-2026-40226** CVSS 6.4 — systemd: systemd nspawn: Escape-to-host action via crafted config file en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-40226)
  - **CVE-2026-4105** CVSS 6.7 — systemd: systemd: Privilege escalation via improper access control in RegisterMachine D-Bus method en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-4105)
  - **CVE-2026-40225** CVSS 6.4 — systemd: udev in systemd: Privilege escalation via malicious hardware devices and unsanitized kernel output en asset-management-software-ocp [↗](https://avd.aquasec.com/nvd/cve-2026-40225)

### `libuuid1`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `login`

- Versión instalada: `1:4.13+dfsg1-1+b1`  
- ➜ **Actualizar a:** `1:4.13+dfsg1-1+deb12u1`
- CVEs (1):
  - **CVE-2023-4641** CVSS 5.5 — shadow-utils: possible password leak during passwd(1) change en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-4641)

### `mount`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `ncurses-base`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2023-50495** CVSS 6.5 — ncurses: segmentation fault via _nc_wrap_entry() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-50495)

### `ncurses-bin`

- Versión instalada: `6.4-4`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2023-50495** CVSS 6.5 — ncurses: segmentation fault via _nc_wrap_entry() en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-50495)

### `openssl`

- Versión instalada: `3.0.15-1~deb12u1`  
- ➜ **Actualizar a:** `3.0.16-1~deb12u1, 3.0.17-1~deb12u3, 3.0.18-1~deb12u2, 3.0.19-1~deb12u2`
- CVEs (8):
  - **CVE-2026-22796** CVSS 5.9 — openssl: OpenSSL: Denial of Service via type confusion in PKCS#7 signature verification en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-22796)
  - **CVE-2026-31790** CVSS 5.9 — openssl: openssl: Information Disclosure from Uninitialized Memory via Invalid RSA Public Key en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-31790)
  - **CVE-2026-22795** CVSS 5.5 — openssl: OpenSSL: Denial of Service due to type confusion in PKCS#12 file processing en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-22795)
  - **CVE-2024-13176** CVSS 4.7 — openssl: Timing side-channel in ECDSA signature computation en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-13176)
  - **CVE-2025-68160** CVSS 4.7 — openssl: OpenSSL: Denial of Service due to out-of-bounds write in BIO filter en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-68160)
  - **CVE-2025-9230** CVSS 5.6 — openssl: Out-of-bounds read & write in RFC 3211 KEK Unwrap en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-9230)
  - **CVE-2025-69420** CVSS 5.9 — openssl: OpenSSL: Denial of Service via malformed TimeStamp Response en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-69420)
  - **CVE-2025-69418** CVSS 4.0 — openssl: OpenSSL: Information disclosure and data tampering via specific low-level OCB encryption/decryption calls en asset-management-softw [↗](https://avd.aquasec.com/nvd/cve-2025-69418)

### `passwd`

- Versión instalada: `1:4.13+dfsg1-1+b1`  
- ➜ **Actualizar a:** `1:4.13+dfsg1-1+deb12u1`
- CVEs (1):
  - **CVE-2023-4641** CVSS 5.5 — shadow-utils: possible password leak during passwd(1) change en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2023-4641)

### `perl-base`

- Versión instalada: `5.36.0-7+deb12u1`  
- ➜ **Actualizar a:** `5.36.0-7+deb12u3`
- CVEs (1):
  - **CVE-2025-40909** CVSS 5.9 — perl: Perl threads have a working directory race condition where file operations may target unintended paths en asset-management-software-oc [↗](https://avd.aquasec.com/nvd/cve-2025-40909)

### `picomatch`

- Versión instalada: `4.0.3`  
- ➜ **Actualizar a:** `4.0.4, 3.0.2, 2.3.2`
- CVEs (1):
  - **CVE-2026-33672** CVSS 5.3 — picomatch: Picomatch: Data integrity compromised via method injection with crafted POSIX bracket expressions en asset-management-software-oc [↗](https://avd.aquasec.com/nvd/cve-2026-33672)

### `pip`

- Versión instalada: `24.0`  
- ➜ **Actualizar a:** `25.3`
- CVEs (3):
  - **CVE-2025-8869** CVSS 5.3 — pip: pip missing checks on symbolic link extraction en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-8869)
  - **CVE-2026-3219** CVSS 5.0 — pip: pip: Incorrect file installation due to improper archive handling en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-3219)
  - **CVE-2026-3219** CVSS 5.0 — pip: pip: Incorrect file installation due to improper archive handling en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-3219)

### `postcss`

- Versión instalada: `8.5.6`  
- ➜ **Actualizar a:** `8.5.10`
- CVEs (1):
  - **CVE-2026-41305**  — PostCSS has XSS via Unescaped </style> in its CSS Stringify Output en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-41305)

### `pytest`

- Versión instalada: `9.0.2`  
- ➜ **Actualizar a:** `9.0.3`
- CVEs (1):
  - **CVE-2025-71176** CVSS 6.8 — pytest: pytest: Denial of Service or Privilege Escalation via insecure temporary directory handling en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2025-71176)

### `python-dotenv`

- Versión instalada: `1.2.1`  
- ➜ **Actualizar a:** `1.2.2`
- CVEs (1):
  - **CVE-2026-28684** CVSS 7.1 — python-dotenv: python-dotenv: Arbitrary file overwrite via symbolic link following en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-28684)

### `python-jose`

- Versión instalada: `3.3.0`  
- ➜ **Actualizar a:** `3.4.0`
- CVEs (1):
  - **CVE-2024-33664**  — python-jose: allows attackers to cause a denial of service en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2024-33664)

### `requests`

- Versión instalada: `2.32.5`  
- ➜ **Actualizar a:** `2.33.0`
- CVEs (1):
  - **CVE-2026-25645** CVSS 5.5 — requests: Requests: Security bypass due to predictable temporary file creation en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-25645)

### `tar`

- Versión instalada: `1.34+dfsg-1.2+deb12u1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-5704** CVSS 5.5 — tar: tar: Hidden file injection via crafted archives en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-5704)

### `tornado`

- Versión instalada: `6.5.4`  
- ➜ **Actualizar a:** `6.5.5`
- CVEs (1):
  - **GHSA-78cv-mqj4-43f7**  — Tornado has incomplete validation of cookie attributes en asset-management-software-ocp-backend [↗](https://github.com/advisories/GHSA-78cv-mqj4-43f7)

### `util-linux`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `util-linux-extra`

- Versión instalada: `2.38.1-5+deb12u3`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27456** CVSS 4.7 — util-linux: TOCTOU in the mount program when setting up loop devices en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27456)

### `vite`

- Versión instalada: `7.3.1`  
- ➜ **Actualizar a:** `8.0.5, 7.3.2, 6.4.2`
- CVEs (1):
  - **CVE-2026-39365** CVSS 5.3 — vite: Vite: Information disclosure via path traversal in dev server's .map request handling en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-39365)

### `zlib1g`

- Versión instalada: `1:1.2.13.dfsg-1`  
- ➜ **Sin fix upstream disponible** — evaluar workaround
- CVEs (1):
  - **CVE-2026-27171** CVSS 5.5 — zlib: zlib: Denial of Service via infinite loop in CRC32 combine functions en asset-management-software-ocp-backend [↗](https://avd.aquasec.com/nvd/cve-2026-27171)

---

## Verificación post-parcheo

Después de aplicar los fixes y rebuild de la imagen:

```bash
# Rebuild local
docker build -t asset-management-software-ocp-backend:patched .

# Verificar con trivy
docker exec qa-scanner trivy image --severity CRITICAL,HIGH asset-management-software-ocp-backend:patched 2>/dev/null | head -50

# Forzar re-scan en el hub
ssh vps 'docker exec qa-scanner /scanner/scripts/run-trivy.sh'
```

Después abre `https://security.aiprowork.com/vulnerabilidades`, filtra por componente que contenga este nombre de imagen, y confirma que las CVEs listadas arriba ya no aparecen como 🟥 nuevas.

Si quedaron algunas que NO se pueden parchear (sin fix upstream), edítalas en el hub y márcalas como `aceptada` con justificación en el campo Notas. Eso satisface el requisito ISO 27001 A.8.8 de **decisión documentada de tratamiento de riesgos**.
