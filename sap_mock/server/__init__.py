"""Mock SAP S/4HANA OData server.

FastAPI app que simula los endpoints OData v4 de SAP S/4HANA Cloud para
desarrollo offline + tests E2E sin necesitar SAP real.

Endpoints cubiertos (subset PM relevant):
  GET  /healthz
  GET  /odata/v4/api_equipment
  GET  /odata/v4/api_equipment/{eq}
  GET  /odata/v4/api_functional_location
  POST /odata/v4/api_maintnotification          (crear aviso)
  POST /odata/v4/api_maintorder                 (crear OT)
  PATCH /odata/v4/api_maintorder/{order_number}  (actualizar)
  GET  /odata/v4/api_maintorder
  GET  /odata/v4/api_maintorder/{order_number}

Configurable vía env:
  MOCK_LATENCY_MS_MIN, MOCK_LATENCY_MS_MAX  → latencia random
  MOCK_ERROR_RATE                            → % de requests que fallan 5xx
  MOCK_DB_PATH                               → path SQLite (default /data/mock.db)
"""
