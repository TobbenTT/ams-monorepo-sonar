# Guía rápida: RAG (Retrieval-Augmented Generation)

> Cómo funciona, cuándo usarlo y cómo implementarlo en otros proyectos de IA.

---

## ¿Qué es RAG?

**Retrieval-Augmented Generation**: en vez de que el LLM responda solo con lo que "sabe" (datos del entrenamiento), le pasas **contexto relevante** recuperado de tus datos en tiempo real, y le pides que responda usando ese contexto.

```
Pregunta del usuario
      │
      ▼
[Retriever] ──busca en tus datos──► chunks relevantes
      │
      ▼
[LLM] ──recibe pregunta + chunks──► respuesta con citas
```

---

## ¿Por qué importa?

- **No alucina** sobre tus datos (si no está en el contexto, no lo inventa)
- **Datos frescos** sin reentrenar nada
- **Privado** — los datos nunca van al training set del modelo
- **Citable** — puedes mostrar la fuente que usó

---

## Las 3 piezas universales

### 1. Ingesta (una vez por dato)

- Parteas tus documentos en **chunks** (~500 tokens) — `langchain.text_splitters` o manual
- Cada chunk → **embedding** (vector de 384–1536 dimensiones)
- Guardas `(chunk_text, embedding, metadata)` en una **vector DB**

### 2. Retrieval (cada query)

- Embedding de la pregunta
- Búsqueda por similitud cosine → top-k chunks más cercanos
- Eso es tu "contexto"

### 3. Generación

- Prompt: `"Responde usando SOLO este contexto: {chunks}\n\nPregunta: {q}"`
- LLM genera la respuesta

---

## Stack mínimo (lo que usé en Goldfields)

| Pieza | Opción ligera | Alternativa profesional |
|---|---|---|
| **Embeddings** | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (local, gratis, CPU, 384-dim) | Voyage 3, OpenAI text-embedding-3, Cohere |
| **Vector DB** | LanceDB (1 archivo local) | Pinecone, Weaviate, Qdrant, pgvector |
| **Chunking** | `RecursiveCharacterTextSplitter` (LangChain) | Llama Index parsers |
| **LLM** | Cualquiera — Claude, GPT, Llama via Groq | — |
| **Orquestador** | Una función Python | LangGraph, LlamaIndex |

Para empezar: **MiniLM + LanceDB + función Python**. Gratis, sin API keys de embeddings, corre en CPU. Lo escalas después.

---

## RAG vectorial vs GraphRAG

**RAG vectorial** (lo más común) — solo similitud semántica:
- ✅ Bueno para: docs largos, FAQs, manuales, soporte
- ❌ Malo para: relaciones entre entidades, "qué bloquea a qué", razonamiento multi-hop

**GraphRAG** (lo que construimos en Goldfields) — vectorial + grafo de conocimiento:
- ✅ Bueno para: dominios estructurados (permisos→hitos→responsables→docs), análisis de impacto, "muéstrame todo lo conectado a X"
- ❌ Más complejo, requiere extraer entidades y relaciones

**Regla práctica**: si tus datos son texto plano → RAG vectorial. Si son entidades con relaciones → GraphRAG (vectorial sigue siendo parte del pipeline).

---

## Receta para implementarlo en otro proyecto (1 día)

```python
# 1. Setup
# pip install sentence-transformers lancedb

# 2. Ingesta
from sentence_transformers import SentenceTransformer
import lancedb

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
db = lancedb.connect("./mi_rag")

docs = [...]  # tus chunks de texto
vectors = model.encode(docs, normalize_embeddings=True)
items = [{"text": t, "vector": v.tolist()} for t, v in zip(docs, vectors)]
db.create_table("chunks", data=items)

# 3. Query
def rag_query(question: str, llm, k=5):
    q_vec = model.encode(question, normalize_embeddings=True).tolist()
    chunks = db.open_table("chunks").search(q_vec).limit(k).to_list()
    context = "\n---\n".join(c["text"] for c in chunks)
    return llm(f"Responde usando este contexto:\n{context}\n\nPregunta: {question}")
```

Eso es un RAG funcional en ~20 líneas. El resto (hybrid search, re-ranking, query expansion, evaluación) son optimizaciones.

---

## Cuándo aplicarlo

**Sí**: chatbot sobre tus docs internos, soporte técnico que cita el manual, asistente legal/médico/contable, análisis de contratos, helpdesk con base de conocimiento.

**No**: tareas creativas puras, generación de código complejo, problemas que requieren cálculo (para eso → tools/function calling, no RAG).

---

## Mejoras que valen la pena (cuando duela el RAG básico)

1. **Hybrid search** — combina vectorial + BM25/keyword. Mata casos donde la pregunta tiene términos exactos (códigos, nombres propios).
2. **Re-ranker** — un modelo pequeño que reordena los top-20 a top-5. `cross-encoder/ms-marco-MiniLM-L-12-v2` es gratis y mejora mucho.
3. **Query rewriting** — el LLM expande la pregunta antes de buscar (ej: acrónimos, sinónimos).
4. **Contextual retrieval** (Anthropic) — pre-pendear un mini-resumen del documento padre a cada chunk antes de embeber. Mejora ~35% sin cambiar la arquitectura.
5. **Métricas** — `ragas` o `deepeval` para medir faithfulness/relevance, no a ojo.

---

## Caso de estudio: Goldfields PMO

Lo que construimos como referencia concreta:

**Datos fuente**: 500 permisos × 15 hitos cada uno + documentos requeridos + responsables + comentarios. Todo estructurado en BD.

**Estrategia elegida**: GraphRAG porque las preguntas típicas son relacionales:
- "¿Qué permisos del contratista X están atrasados?"
- "¿Quién es el responsable del documento Y de la obra Z?"
- "Muéstrame los hitos críticos de los proyectos en RCA 153"

**Pipeline**:
1. **Ingesta estructurada** (sin LLM): cada permiso → nodo `Permiso`, cada hito → nodo `Hito`, etc. Aristas: `requiere`, `responsable_de`, `ejecuta`, `emite`, `tiene_hito`.
2. **Embeddings** de cada nodo (texto = "tipo | nombre | propiedades") con MiniLM local.
3. **Retrieval híbrido**: vector search (top-8 nodos) → BFS 2 hops desde esos seeds → subgrafo de evidencia.
4. **Orquestador LangGraph**: router (graphrag vs direct) → retrieve → synthesize.
5. **UI**: el frontend muestra la respuesta + subgrafo SVG con los nodos usados + traza del razonamiento.

**Stack final**:
- Python 3.12 + FastAPI
- `sentence-transformers` (MiniLM) — embeddings locales
- LanceDB — vector store
- NetworkX — grafo en memoria para BFS
- SQLite — persistencia de nodos/aristas
- LangGraph — orquestación

**Tiempo de implementación**: ~6 horas (Fase 1 backend + Fase 2 UI).

---

## Recursos rápidos

- **LangChain RAG tutorial** — `python.langchain.com/docs/tutorials/rag`
- **LlamaIndex** — más opinionado, mejor docs para principiantes
- **Anthropic contextual retrieval** — paper que mejora RAG con un truco simple (pre-pending contexto a cada chunk antes de embeber)
- **Microsoft GraphRAG** — implementación de referencia más sofisticada con community detection

---

## Decisión rápida: ¿qué stack para mi proyecto?

| Si tu proyecto es… | Usa |
|---|---|
| Docs internos en PDFs/Notion/Confluence | RAG vectorial: LangChain + Chroma + OpenAI/Voyage |
| Datos en BD relacional con muchas FKs | GraphRAG: extracción estructurada + LanceDB + NetworkX |
| Catálogo de productos / FAQ | RAG vectorial + filtros por metadata |
| Agente que toma decisiones con datos | RAG + tool use (function calling) |
| Soporte multi-idioma | Embeddings multilingual (MiniLM-multi, Cohere multilingual) |
| On-prem / sin internet | sentence-transformers + LanceDB + Llama 3 local |
