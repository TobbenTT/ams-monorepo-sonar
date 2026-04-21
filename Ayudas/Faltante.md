## Cosas en mi cancha — 0 pendientes

Todo lo del plan original + lo de la reunión del 21 está deployado. No tengo nada ejecutable esperándome.

## Bloqueado por terceros (no puedo avanzar)

1. **Data sintética realista** → David lo hace esta noche
2. **SAP sync real** → necesito credenciales del cliente (IDoc/RFC/REST)
3. **ISO 27001** → decisión de compañía, no de producto
4. **Second Brain** → David

## No urgente (se puede posponer sin impacto)

5. **Paginación server-side frontend** — volumen actual (614 OTs) no la necesita. Cuando pase los 5000 la activamos.

## Deuda técnica real (no está en listas pero debería estar)

6. **Tests automatizados** — 0 tests. Cualquier refactor puede romper producción. Al menos smoke tests de los flujos críticos: WR→OT, cierre, scheduling.
7. **CI/CD** — deploy es manual (`ssh vps && /root/deploy.sh`). No hay check pre-deploy, no hay rollback automático si algo rompe.
8. **Observabilidad** — el Telegram bot avisa si algo cae, pero no hay métricas de uso, errores estructurados, ni trazabilidad de request-ID.
9. **Performance de Planning.jsx** — el archivo tiene ~2500 líneas. Con muchas OTs el render se nota lento. Vale virtualizar las listas.
10. **Permisos granulares** — los roles existen pero varios endpoints no los aplican. Un tecnico podría pegarle endpoints de admin si adivina la URL.
11. **i18n inconsistente** — mezcla de español/inglés en labels. Problema para la demo multi-idioma.

## Bugs potenciales que no testeé

* **Optimistic lock** : lógica está, pero no confirmé 409 end-to-end con 2 tabs.
* **Audio transcribe** : whisper CPU puede tardar 5-10s, no hay loading decente.
* **Auto-scroll drag** : solo en desktop, mobile usa touch events distintos.
* **Fullscreen en /present** : requiere gesto de usuario, en algunos browsers no dispara.

## Cosas que Jorge va a pedir (especulando)

Firma digital real con pad táctil (no solo texto)

Vista consolidada multi-planta para gerente

PDF export de OT individual

Notificaciones push a Teams/Slack

Más animaciones (es su patrón)
