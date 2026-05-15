import { useState } from "react";

const D = {
  0: {
    beginner: {
      concept: "LangGraph is an open-source Python library (21,700+ GitHub stars, v1.0 stable Oct 2025) for building stateful AI agent workflows as directed graphs. It models agent execution as nodes (computation steps) connected by edges (control flow) sharing a common State TypedDict. Unlike LangChain chains, LangGraph agents can loop, branch, remember, and recover from failures. Trusted in production by Klarna, Replit, Elastic, Uber, and LinkedIn.",
      facts: ["Install: pip install langgraph langgraph-prebuilt langchain-openai", "Requires Python 3.10+ — dropped 3.8/3.9 in v1.0", "MIT-licensed, 21,700+ GitHub stars", "v1.0 breaking change: set_entry_point() REMOVED — use add_edge(START, 'node')", "Inspired by Google Pregel and Apache Beam bulk-synchronous parallel model"],
      code: `from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class MyState(TypedDict):
    message: str
    count: int

def greet(state: MyState):
    return {"message": "Hello!", "count": state["count"] + 1}

def farewell(state: MyState):
    return {"message": state["message"] + " Goodbye!"}

graph = StateGraph(MyState)
graph.add_node("greet", greet)
graph.add_node("farewell", farewell)
graph.add_edge(START, "greet")   # v1.0: no more set_entry_point()
graph.add_edge("greet", "farewell")
graph.add_edge("farewell", END)  # v1.0: no more set_finish_point()

app = graph.compile()
result = app.invoke({"message": "", "count": 0})
# {"message": "Hello! Goodbye!", "count": 1}`,
      qa: [
        { q: "What is LangGraph and why was it created?", a: "LangGraph is a low-level orchestration framework for building stateful, long-running AI agents as directed graphs. It was created because traditional LLM chains are linear and stateless — they cannot loop, branch conditionally, or resume after failure. LangGraph adds cycles, persistent state, and explicit control flow." },
        { q: "What are the three core components of every LangGraph app?", a: "State (a TypedDict schema defining shared data), Nodes (Python functions that read and update state), and Edges (connections between nodes — deterministic or conditional). Everything else — checkpointers, interrupts, tools — builds on this foundation." },
        { q: "What changed between LangGraph v0.x and v1.0?", a: "set_entry_point() and set_finish_point() were removed — replace with add_edge(START, 'node') and add_edge('node', END). Python 3.8/3.9 support was dropped. add_conditional_edges() is completely unchanged. Most online tutorials still use deprecated v0.x patterns — a common interview trap." }
      ]
    },
    intermediate: {
      concept: "LangGraph models execution as a state machine using the Pregel bulk synchronous parallel model. At each super-step, all scheduled nodes run potentially in parallel and write outputs to shared state via reducer functions. Key 2025 facts: LangGraph Platform was GA'd May 2025 then rebranded LangSmith Deployment in Oct 2025. The MessagesState built-in uses add_messages reducer to accumulate chat history correctly.",
      facts: ["Super-step: single tick where all scheduled nodes execute simultaneously", "Annotated[list, operator.add]: new values append rather than replace — use for messages", "MessagesState: built-in state class with add_messages reducer for chat apps", "add_conditional_edges() unchanged from v0.1 through v1.0", "70M+ monthly downloads across the LangChain ecosystem"],
      code: `from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from typing import TypedDict, Annotated
import operator

# Annotated controls HOW state merges
class AgentState(TypedDict):
    messages: Annotated[list, operator.add]  # appends, not replaces
    step_count: int                          # last-write-wins

model = ChatOpenAI(model="gpt-4o")

# Prebuilt ReAct agent — production-ready in 3 lines
agent = create_react_agent(model, tools=[])
result = agent.invoke({
    "messages": [("user", "What is the capital of France?")]
})`,
      qa: [
        { q: "What is a super-step in LangGraph execution?", a: "A super-step is a single execution tick where all nodes scheduled for that step run — potentially in parallel. LangGraph creates a checkpoint at each super-step boundary. For a graph START->A->B->END, there are separate super-steps for input, node A, and node B. You can only resume execution from a super-step checkpoint boundary." },
        { q: "How do Annotated type hints control state merging?", a: "Annotated types attach a reducer function that controls how state is merged when a node returns an update. Annotated[list, operator.add] means new list values are appended rather than replaced. Without a reducer, the last writer wins. This is critical for message history — you almost always want operator.add so messages accumulate correctly." },
        { q: "How does MessagesState differ from a plain TypedDict?", a: "MessagesState is a built-in subclass of TypedDict that includes messages: Annotated[list, add_messages]. The add_messages reducer from langchain_core handles deduplication and type coercion (tuples to HumanMessage/AIMessage). It saves boilerplate and is the recommended starting point for any chat-based LangGraph agent." }
      ]
    },
    advanced: {
      concept: "LangGraph's execution engine supports parallel fan-out/fan-in via the Send API, subgraphs as nodes with schema translation, and the Command type for atomic routing+state updates. The Send API enables true map-reduce: fan out to a node once per item, collect via reducer, fan in. Command(goto='node', update={...}) is returned from a node itself — more powerful than conditional edges because it atomically routes AND updates state.",
      facts: ["Send API: dynamically dispatch work to nodes mid-execution for map-reduce", "Command type: return Command(goto='node', update={...}) for atomic routing + state update", "Subgraphs: compile a StateGraph and use it as a node in a parent graph", "Parallel fan-out: add multiple edges from one node — they execute concurrently", "Recursion limit: default 25 steps; configurable per invocation via config dict"],
      code: `from langgraph.types import Send, Command
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List, Annotated
import operator

class MapState(TypedDict):
    docs: List[str]
    summaries: Annotated[List[str], operator.add]

def router(state: MapState):
    # Fan-out: spawn one summarize node per document
    return [Send("summarize", {"doc": doc}) for doc in state["docs"]]

def summarize(state: dict):
    return {"summaries": [f"Summary: {state['doc'][:40]}"]}

def aggregate(state: MapState):
    combined = " | ".join(state["summaries"])
    return {"summaries": [combined]}

graph = StateGraph(MapState)
graph.add_node("summarize", summarize)
graph.add_node("aggregate", aggregate)
graph.add_conditional_edges(START, router, ["summarize"])
graph.add_edge("summarize", "aggregate")
graph.add_edge("aggregate", END)

# Command: atomic routing + state update from inside a node
def supervisor(state):
    return Command(
        goto="worker",
        update={"routing_log": [f"dispatched to worker"]}
    )`,
      qa: [
        { q: "Explain the Send API and when to use it over a loop inside a node.", a: "The Send API dynamically dispatches work to a named node multiple times in a single step — each dispatch gets its own state slice. Use it for map-reduce: fan out to 'summarize' once per document, collect via reducer, then fan in to 'aggregate'. A loop inside one node is synchronous and cannot benefit from LangGraph's parallel execution or per-task checkpointing." },
        { q: "What is the Command return type and why is it more powerful than conditional edges?", a: "Command(goto='node', update={...}) lets a node simultaneously route execution AND update state atomically. With add_conditional_edges, routing and state mutation are separate steps. Command is essential when you need to pass computed routing data and update state in one operation — for example, a supervisor that both selects the next agent AND injects a task description into state." },
        { q: "How do subgraphs work and when should you use them?", a: "Compile a StateGraph and pass it as the value to add_node(). The subgraph has its own state schema; LangGraph handles schema translation at the boundary. Use subgraphs for modularity in large systems — a retrieval subgraph reused across multiple parent graphs, or when you want separate checkpointing granularity per functional area." }
      ]
    }
  },
  1: {
    beginner: {
      concept: "Nodes are the workers in your graph — any Python callable that takes state and returns a partial state update. Edges are the routes between workers. Two types: deterministic edges (always run) and conditional edges (logic decides at runtime). Every graph has two virtual sentinel nodes: START and END. In v1.0, you connect to these with add_edge() — the old set_entry_point() and set_finish_point() are removed.",
      facts: ["Nodes: sync or async Python functions, lambdas, or objects with __call__", "add_node('name', fn) — the name string is what edges reference", "add_edge('a', 'b') — deterministic, always runs after a", "add_conditional_edges(src, fn, [dests]) — routing function decides at runtime", "Nodes return a partial dict — only changed keys, not full state"],
      code: `from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class State(TypedDict):
    query: str
    result: str

def fetch(state: State) -> dict:
    return {"result": f"Data for: {state['query']}"}

def format_result(state: State) -> dict:
    return {"result": f"Formatted: {state['result']}"}

def route(state: State) -> str:
    return "format_result"   # always go to formatter

graph = StateGraph(State)
graph.add_node("fetch", fetch)
graph.add_node("format_result", format_result)
graph.add_edge(START, "fetch")
graph.add_conditional_edges("fetch", route, ["format_result"])
graph.add_edge("format_result", END)
app = graph.compile()`,
      qa: [
        { q: "What can a LangGraph node be?", a: "Any Python callable: a regular function, an async function for non-blocking IO, a lambda, or an object with __call__. The contract is: it receives the current state dict and returns a dict of partial state updates. You do not have to return the full state — only the keys you want to change." },
        { q: "What is the difference between add_edge and add_conditional_edges?", a: "add_edge creates a deterministic connection that always fires. add_conditional_edges calls a routing function that receives current state and returns a destination node name string, deciding at runtime which path to take. The list of possible destinations is required for graph validation and visualization." },
        { q: "Why are START and END needed in v1.0?", a: "START and END replaced set_entry_point() and set_finish_point() in v1.0. They are virtual sentinel nodes that make entry and exit points explicit graph citizens — you connect edges to them just like any other node. This is cleaner for visualization and enables features like multiple entry points." }
      ]
    },
    intermediate: {
      concept: "ToolNode from langgraph.prebuilt is a production-ready node that inspects the last AIMessage for tool_calls, dispatches each to the matching tool, and appends ToolMessage results back to state. It handles parallel tool calls automatically. Multiple edges from one source node creates parallel fan-out — both destination nodes execute in the same super-step and their outputs merge via reducers.",
      facts: ["ToolNode: prebuilt node executing tool calls from LLM messages automatically", "tools_condition: prebuilt router — 'tools' if tool was called, END if final answer", "Multiple edges from one source = parallel fan-out (both nodes run concurrently)", "async nodes: use async def and await graph.ainvoke() for non-blocking execution", "MessagesState has add_messages reducer that prevents duplicate messages"],
      code: `from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 22C, Sunny"

tools = [get_weather]
model = ChatOpenAI(model="gpt-4o").bind_tools(tools)

def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

tool_node = ToolNode(tools)

graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", tool_node)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", tools_condition)
graph.add_edge("tools", "agent")  # loop back after tool use
app = graph.compile()`,
      qa: [
        { q: "How does ToolNode work and why use it over a custom dispatcher?", a: "ToolNode inspects the last AIMessage in state for tool_calls, looks up the matching tool by name, executes it, and appends a ToolMessage result back to state. Writing your own requires handling dispatch logic, error cases, and message formatting manually. ToolNode also handles parallel tool calls from a single LLM response automatically." },
        { q: "What happens when you add two edges from the same source node?", a: "Both destination nodes are scheduled for the same super-step — they execute in parallel. This is fan-out. The results are merged back using your state reducers. If two parallel nodes write to the same state key without a reducer, you get a merge conflict error. Always use Annotated reducers for keys that multiple nodes write." },
        { q: "How do you handle errors inside a node without crashing the graph?", a: "Return an error field in the state dict and use a conditional edge to route to a fallback node. For infrastructure-level retries, wrap with try/except inside the node and return a retry signal. LangGraph's checkpointing stores per-task writes — if a node in a super-step fails, successful sibling nodes do not re-run on resume." }
      ]
    },
    advanced: {
      concept: "Advanced node patterns include async streaming nodes, nodes that call subgraphs with schema translation, and dynamic interrupt inside nodes. The interrupt() function (added in v0.4) lets you pause mid-node based on state conditions — more flexible than compile-time interrupt_before. Edge routing functions can return lists for parallel dispatch or use the Send API for per-item dynamic routing.",
      facts: ["interrupt() inside a node: pause dynamically based on state conditions", "graph.astream_events(input, config, version='v2'): per-token and per-node streaming", "interrupt_before=['node']: compile-time pause before that node every time", "Schema translation: subgraph InputState/OutputState maps to parent state keys", "NodeInterrupt exception raised by interrupt() — caught by LangGraph runtime"],
      code: `from langgraph.types import interrupt
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

class ReviewState(TypedDict):
    draft: str
    approved: bool
    feedback: str

def write_draft(state: ReviewState):
    return {"draft": "AI-generated draft content here"}

def human_review(state: ReviewState):
    # Pause execution and wait for external input
    feedback = interrupt({
        "draft": state["draft"],
        "instruction": "Approve or provide feedback"
    })
    if feedback.get("approved"):
        return {"approved": True}
    return {"approved": False, "feedback": feedback.get("comment", "")}

def revise(state: ReviewState):
    return {"draft": f"Revised: {state['feedback']}", "approved": False}

graph = StateGraph(ReviewState)
graph.add_node("write", write_draft)
graph.add_node("review", human_review)
graph.add_node("revise", revise)
graph.add_edge(START, "write")
graph.add_edge("write", "review")
graph.add_conditional_edges("review",
    lambda s: END if s["approved"] else "revise", [END, "revise"])
graph.add_edge("revise", "review")`,
      qa: [
        { q: "How do you stream intermediate node outputs to a UI?", a: "Use graph.astream_events(input, config, version='v2'). This yields RunnableStreamEvent objects tagged with node name and event type. Filter by event['name'] to show token-by-token LLM output or per-node status. This is how LangSmith Studio displays real-time agent reasoning and how you build live agent UIs." },
        { q: "What is the interrupt() pattern vs compile-time interrupt_before?", a: "interrupt_before=['node_name'] at compile time pauses before that node every single time. interrupt() inside a node is dynamic — you pause conditionally based on current state. interrupt() also passes a structured payload to the waiting client. Both resume with graph.invoke(None, config) after graph.update_state() injects human input." },
        { q: "How do you implement a node that calls external APIs without blocking?", a: "Make the node async (async def) and use await for the API call. Compile the graph and call await graph.ainvoke() or await graph.astream_events(). For true parallelism across multiple calls, use asyncio.gather(). Never use time.sleep() or synchronous requests inside an async node — it blocks the entire event loop." }
      ]
    }
  },
  2: {
    beginner: {
      concept: "State is the shared memory of your graph — a Python TypedDict that every node can read and update. Without persistence, state dies when the process ends. With a checkpointer, LangGraph saves a snapshot after every super-step. This enables resuming after failure, multi-turn conversations, and human-in-the-loop workflows. MemorySaver is for development only — use PostgresSaver in production.",
      facts: ["MemorySaver: in-process dict — dev/testing only, lost on restart", "SqliteSaver: file-based SQLite — good for single-instance local persistence", "PostgresSaver: production-grade, supports horizontal scaling and failover", "thread_id: unique ID per conversation/session — required when using a checkpointer", "graph.get_state(config): retrieve current state of any thread at any time"],
      code: `from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")

def chat_node(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

graph = StateGraph(MessagesState)
graph.add_node("chat", chat_node)
graph.add_edge(START, "chat")
graph.add_edge("chat", END)

checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "user-123"}}

# Turn 1
app.invoke({"messages": [("user", "My name is Praveen")]}, config)

# Turn 2 — agent loads checkpoint and remembers
result = app.invoke({"messages": [("user", "What is my name?")]}, config)
# "Your name is Praveen."`,
      qa: [
        { q: "Why is a checkpointer required for multi-turn conversations?", a: "Without a checkpointer, each invoke() starts with empty state — the agent has no memory of previous turns. A checkpointer saves the full state (including message history) after every super-step. On the next invocation with the same thread_id, LangGraph loads the checkpoint and the agent resumes with full context." },
        { q: "What is a thread_id and why does it matter?", a: "A thread_id is a unique identifier that groups a sequence of checkpoints into a single conversation. Each thread has its own independent checkpoint history. Use user ID plus session ID as thread_id in production. Without thread_id, the checkpointer cannot distinguish between different conversations." },
        { q: "Which checkpointer should I use in production?", a: "PostgresSaver or AsyncPostgresSaver for production. MemorySaver is development-only and is lost on restart. SqliteSaver is fine for local tools and single-process deployments. If using LangSmith Deployment (formerly LangGraph Platform), checkpointing is handled automatically." }
      ]
    },
    intermediate: {
      concept: "LangGraph state uses explicit reducer-driven schemas. Annotated types attach reducers controlling merge behavior. Checkpoints are stored per super-step AND per task — enabling pending writes recovery: if node B fails, node A's successful write is durable and won't re-run on resume. The InMemoryStore provides cross-thread persistent memory for user profiles and long-term preferences.",
      facts: ["Reducer: function(old_value, new_value) returning merged_value", "operator.add: appends lists — use for messages, steps, accumulated results", "Pending writes: per-task durability prevents duplicate side effects on retry", "InMemoryStore: cross-thread key-value memory separate from per-thread checkpoints", "graph.update_state(config, updates): inject state from outside the running graph"],
      code: `from langgraph.store.memory import InMemoryStore
from typing import TypedDict, Annotated, List
import operator

def keep_last_10(old: List, new: List) -> List:
    return (old + new)[-10:]

class AgentState(TypedDict):
    messages: Annotated[List, keep_last_10]       # rolling window
    tool_calls_made: Annotated[int, operator.add]  # cumulative counter
    final_answer: str                              # last-write-wins

# Store: cross-thread persistent memory
store = InMemoryStore()
store.put(("users", "praveen"), "prefs",
    {"lang": "Python", "level": "advanced"})
prefs = store.get(("users", "praveen"), "prefs")
print(prefs.value)  # {"lang": "Python", "level": "advanced"}

# Compile with both layers
# app = graph.compile(checkpointer=checkpointer, store=store)`,
      qa: [
        { q: "What is the difference between a checkpointer and a Store?", a: "A checkpointer saves graph state per thread_id — conversation memory within a session. A Store is a key-value store for cross-thread persistent memory — data that survives across multiple conversations. Use Store for user profiles, long-term preferences, or accumulated knowledge. Compile with both: graph.compile(checkpointer=..., store=...)." },
        { q: "How does pending writes recovery work?", a: "Within a super-step, LangGraph writes each node's output to a checkpoint_writes table as a task entry. If node B fails, node A's writes are already durable. On resume, A does not re-run — only B retries. This prevents duplicate side effects like sending an email twice from successful nodes." },
        { q: "How do you implement a rolling message window to control context length?", a: "Define a custom reducer: def keep_last_n(old, new): return (old + new)[-20:]. Use Annotated[List, keep_last_n] in your TypedDict. This trims state before the next node runs. For production, also consider token-based trimming using LangChain's trim_messages() utility to stay within model context limits." }
      ]
    },
    advanced: {
      concept: "Production state management requires schema evolution strategies (new fields with defaults so old checkpoints stay valid), time-travel debugging via get_state_history(), and AsyncPostgresSaver for async compilation. State schemas should be versioned like database schemas. The Store supports namespaced key-value with semantic search for agent memory systems.",
      facts: ["Time travel: graph.get_state_history(config) returns all checkpoints for a thread", "Fork: invoke with a past checkpoint_id in config to branch from that point", "Schema evolution: new fields must have defaults so old checkpoints remain valid", "AsyncPostgresSaver: required for async graph compilation in high-throughput production", "Checkpoint namespace: supports multi-tenant isolation in shared database environments"],
      code: `from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
import asyncio

async def production_agent():
    DB_URI = "postgresql://user:pass@host:5432/agents_db"

    async with AsyncPostgresSaver.from_conn_string(DB_URI) as checkpointer:
        await checkpointer.setup()  # creates tables if not exist

        app = graph.compile(checkpointer=checkpointer)
        config = {"configurable": {"thread_id": "prod-789"}}

        result = await app.ainvoke(
            {"messages": [("user", "Start audit")]}, config
        )

        # Time-travel: inspect all checkpoints
        history = [c async for c in app.aget_state_history(config)]
        print(f"Total checkpoints: {len(history)}")

        # Fork from a past checkpoint
        past_config = {"configurable": {
            "thread_id": "fork-789",
            "checkpoint_id": history[2].config["configurable"]["checkpoint_id"]
        }}
        forked = await app.ainvoke({"messages": []}, past_config)`,
      qa: [
        { q: "How do you implement time-travel debugging in a production LangGraph system?", a: "Use graph.get_state_history(config) to list all checkpoints for a thread. Each has a checkpoint_id and full state snapshot. To re-run from a specific point, invoke with that checkpoint_id in the config — LangGraph loads that snapshot and continues from there. In LangSmith Studio this is visual: click any step to fork and re-run." },
        { q: "How would you handle LangGraph state schema migrations in production?", a: "Treat it like a database migration: add new fields with default values so old checkpoints remain valid, never rename or remove fields without a migration step, and version your state schema. For breaking changes, write a migration script that reads old checkpoints and re-saves them with the new schema via checkpointer.put()." },
        { q: "What is the performance difference between MemorySaver and AsyncPostgresSaver?", a: "MemorySaver has zero serialization overhead but is single-process and not fault-tolerant. AsyncPostgresSaver adds serialization, network RTT, and disk IO per checkpoint — typically 5 to 50ms depending on payload. Use asyncpg connection pooling, compress large state fields, and consider Redis for hot state with Postgres as the durable backup." }
      ]
    }
  },
  3: {
    beginner: {
      concept: "Conditional routing lets your graph take different paths based on current state. Instead of always going A to B, you can say: if the query needs a tool go to tools, otherwise go to END. The routing function is a pure Python function that reads state and returns a string — the next node name. It must never modify state; it is read-only.",
      facts: ["Routing function: (state) -> str returning the destination node name", "Must list all possible destinations in add_conditional_edges()", "tools_condition: prebuilt router for standard ReAct loops", "Return END from a router to terminate the graph execution", "Routers are pure read functions — they must NOT modify state"],
      code: `from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Literal

class State(TypedDict):
    query: str
    answer: str

def classify(state: State) -> Literal["simple", "research", "tools"]:
    q = state["query"].lower()
    if "calculate" in q or "weather" in q:
        return "tools"
    elif len(q.split()) > 20:
        return "research"
    return "simple"

def simple_answer(state: State):
    return {"answer": f"Quick: {state['query']}"}

def do_research(state: State):
    return {"answer": f"Researched: {state['query']}"}

def use_tools(state: State):
    return {"answer": f"Tool result for: {state['query']}"}

graph = StateGraph(State)
graph.add_node("simple", simple_answer)
graph.add_node("research", do_research)
graph.add_node("tools", use_tools)
graph.add_conditional_edges(START, classify, ["simple", "research", "tools"])
graph.add_edge("simple", END)
graph.add_edge("research", END)
graph.add_edge("tools", END)`,
      qa: [
        { q: "How do you implement conditional routing in LangGraph?", a: "Use add_conditional_edges(source_node, routing_fn, [possible_destinations]). The routing function receives current state and returns a string matching one of the destination node names. The list of possible destinations is required for graph validation and visualization. Return END to terminate." },
        { q: "What is tools_condition and how does it work?", a: "tools_condition is a prebuilt routing function from langgraph.prebuilt. It inspects the last message in state['messages']: if it is an AIMessage with tool_calls, it returns 'tools'; otherwise it returns END. This is the standard router for ReAct agent loops." },
        { q: "Can a routing function modify state?", a: "No — routing functions must be pure: read state and return a destination string without side effects. If you need to compute something for routing, do that in a preceding node and store the result in state. The routing function then just reads that field and returns the appropriate destination string." }
      ]
    },
    intermediate: {
      concept: "Advanced routing uses LLM-driven decisions via structured outputs. The routing function calls a model with model.with_structured_output(RouteSchema) to classify the query and return the destination. Parallel routing (returning a list of node names) dispatches to multiple nodes simultaneously, enabling concurrent execution paths that merge back via reducers.",
      facts: ["LLM routing: model.with_structured_output(RouteSchema).invoke(state)", "Return a list of node names from router for parallel fan-out execution", "Literal types on routing schema enforce valid node names at the type level", "Recursion limit default 25 — plan accordingly for multi-hop agents", "Log routing decisions in state for LangSmith trace analysis"],
      code: `from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from typing import Literal

class RouteDecision(BaseModel):
    destination: Literal["research", "code", "math", "done"]
    reasoning: str

model = ChatOpenAI(model="gpt-4o")
router_model = model.with_structured_output(RouteDecision)

def llm_router(state) -> str:
    last_msg = state["messages"][-1].content
    decision = router_model.invoke([
        ("system", """Route to the right specialist:
        - research: factual questions, web search needed
        - code: coding, debugging, implementation
        - math: calculations, statistics, formulas
        - done: question fully answered"""),
        ("user", last_msg)
    ])
    print(f"Routing to: {decision.destination} | {decision.reasoning}")
    return decision.destination`,
      qa: [
        { q: "How do you prevent infinite loops in conditional routing?", a: "Three layers: set recursion_limit in the invocation config as a hard cap, add a step_count to state with operator.add and route to END when exceeded, and verify your conditional edge always has a path to END. Use graph.get_graph().draw_mermaid() to visually spot missing exit paths before deploying." },
        { q: "When should routing logic be in Python vs. an LLM?", a: "Use Python for: deterministic rules (error flag means go to fallback), state flags (approved means publish), token/length thresholds, format checks. Use LLM routing for: natural language intent classification or genuinely ambiguous queries. LLM routing adds 100-500ms latency and cost — never use it where a dict lookup suffices." },
        { q: "How do you implement parallel routing where multiple agents run simultaneously?", a: "Return a list of node names from the routing function. LangGraph schedules all of them for the same super-step and runs them concurrently. Their outputs merge via reducers. Ensure all parallel nodes write to different state keys or use list-appending reducers. Fan-out followed by a fan-in aggregate node is the classic pattern." }
      ]
    },
    advanced: {
      concept: "Production routing patterns: the Command type returned from a node atomically routes AND updates state — the recommended pattern for supervisors in v1.0+. Hierarchical routing (supervisor of supervisors) and dynamic agent registries with semantic capability search enable enterprise-scale orchestration. Always layer LLM routing with fallback: structured output → text parsing → safe default node.",
      facts: ["Command(goto=...) returned from node: atomic routing + state update", "FINISH sentinel: supervisor returns this string to exit multi-agent loop", "LLM routing latency: 100-500ms — pre-classify in state if latency sensitive", "Circuit breaker: track routing errors, fall back after N failures", "Audit logging: write routing decisions to state list for compliance trace"],
      code: `from langgraph.types import Command
from langgraph.graph import END
from typing import TypedDict, Annotated, List
import operator

class SupervisorState(TypedDict):
    messages: Annotated[list, operator.add]
    task_count: Annotated[int, operator.add]
    routing_log: Annotated[List[str], operator.add]

def supervisor_node(state: SupervisorState):
    # LLM decides — demo uses deterministic logic
    if state["task_count"] >= 2:
        return Command(
            goto=END,
            update={"routing_log": [f"DONE after {state['task_count']} tasks"]}
        )
    return Command(
        goto="researcher",
        update={
            "task_count": [1],
            "routing_log": [f"Step {state['task_count']}: dispatched to researcher"]
        }
    )
# Command gives atomic routing + state update in one return`,
      qa: [
        { q: "What is the Command return type and how does it differ from a routing function?", a: "Command(goto='node', update={...}) is returned from a node itself — not a separate routing function — and atomically routes AND updates state. This is more powerful than add_conditional_edges because you compute routing data mid-node and write it to state simultaneously. It is the recommended supervisor pattern in LangGraph v1.0+." },
        { q: "How do you implement a safe fallback routing pattern?", a: "Layer three fallback levels: try structured LLM output with model.with_structured_output(); if parsing fails try text-based extraction; if that fails route to a safe_default node that asks the user for clarification. Always wrap LLM routing in try/except and log failures to LangSmith for analysis." },
        { q: "How would you design routing for a compliance system requiring audit logs?", a: "Use the Command pattern: before returning the destination, write the routing decision to an audit_log list in state, emit an OpenTelemetry span with routing metadata, and conditionally insert a human_approval node for high-risk routes. Never trust LLM routing alone for financial or legal decisions — add deterministic guardrails on top." }
      ]
    }
  },
  4: {
    beginner: {
      concept: "Unlike traditional directed acyclic graphs, LangGraph explicitly supports cycles — edges that loop back to earlier nodes. This enables agentic behavior: an agent can try something, evaluate the result, and try again. The simplest loop is a ReAct cycle: call LLM, use tool if needed, call LLM again with tool result, decide to continue or stop. Always protect loops with a recursion_limit.",
      facts: ["Cycle = an edge pointing back to an earlier node", "ReAct loop: agent -> tools -> agent (repeats until LLM gives final answer)", "recursion_limit: default 25 steps, set in config per invocation", "Step counter in state: best practice to prevent runaway loops", "Always have a done exit branch in any loop's conditional edge"],
      code: `from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return f"Result: 42"  # simplified

model = ChatOpenAI(model="gpt-4o").bind_tools([calculator])
tool_node = ToolNode([calculator])

def agent(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

graph = StateGraph(MessagesState)
graph.add_node("agent", agent)
graph.add_node("tools", tool_node)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", tools_condition)
graph.add_edge("tools", "agent")  # creates the ReAct loop

app = graph.compile()
result = app.invoke(
    {"messages": [("user", "What is 42 * 17?")]},
    {"recursion_limit": 10}
)`,
      qa: [
        { q: "What makes LangGraph different from LangChain chains in terms of loops?", a: "LangChain chains are directed acyclic graphs — they cannot loop back. LangGraph explicitly supports cycles, the defining feature of true agent behavior. An agent needs to loop: try, evaluate, try again. Without cycles, you would have to pre-specify the exact number of tool calls, which is impossible for dynamic tasks." },
        { q: "How do you prevent infinite loops in LangGraph?", a: "Three layers: recursion_limit in config (hard cap on total steps), step_count in state with a conditional edge routing to END when exceeded, and a loop exit condition in the routing function itself. Always verify your conditional edge has a path to END — draw the graph with app.get_graph().draw_mermaid_png() to spot missing exits." },
        { q: "What is the ReAct pattern and how does LangGraph implement it?", a: "ReAct (Reasoning + Acting) alternates between LLM reasoning steps and tool actions. In LangGraph: agent node calls LLM, tools_condition routes to ToolNode if a tool is called, ToolNode executes and adds result to messages, then routes back to agent. Loop continues until the LLM generates a final answer without calling any more tools." }
      ]
    },
    intermediate: {
      concept: "Reflection loops add a self-evaluation node after main generation. The evaluator critiques output and decides: good enough (exit) or needs revision (loop back). Common patterns: generate-critique-revise, plan-execute-evaluate, draft-review-refine. Each iteration costs tokens — design stopping criteria carefully. Use a separate judge LLM to avoid same-model self-bias.",
      facts: ["Reflection: generate, critique with separate prompt, revise if needed", "LLM-as-judge: separate model for evaluation reduces same-model self-bias", "Max iterations guard: always include an iteration_count with operator.add reducer", "Constitutional AI: evaluate against defined principles, rewrite if violated", "Token cost: 3-iteration reflection costs 3-5x a single pass"],
      code: `from typing import TypedDict, Annotated, List
import operator

MAX_ITER = 3

class ReflectionState(TypedDict):
    task: str
    draft: str
    critiques: Annotated[List[str], operator.add]
    iteration: Annotated[int, operator.add]
    final: str

def generate(state: ReflectionState):
    if state.get("critiques"):
        prompt = f"Task: {state['task']}\\nFix this: {state['critiques'][-1]}"
    else:
        prompt = f"Complete: {state['task']}"
    draft = f"Draft v{state.get('iteration', 0) + 1}"  # replace with llm call
    return {"draft": draft, "iteration": [1]}

def critique(state: ReflectionState):
    evaluation = "PASS" if state["iteration"] >= 2 else "Needs more depth"
    return {"critiques": [evaluation]}

def should_continue(state: ReflectionState) -> str:
    if state["iteration"] >= MAX_ITER or "PASS" in state["critiques"][-1]:
        return "finalize"
    return "generate"

def finalize(state: ReflectionState):
    return {"final": state["draft"]}`,
      qa: [
        { q: "What is a reflection loop and when does it improve output quality?", a: "A reflection loop is generate-evaluate-revise, repeated until quality is sufficient. It improves output for: long-form writing, code generation (compile-check-fix), complex reasoning (verify logic), and safety-critical content. It does not help much for simple factual retrieval where the first pass is already deterministic." },
        { q: "How do you avoid the sycophancy problem in self-reflection?", a: "Use a separate LLM as judge with a different prompt than the generator. Same-model self-critique often validates its own output. Use a stricter judge prompt with specific evaluation criteria. Have the judge produce a numeric score not just pass/fail — route back if below threshold. Using a different model family for judging is most effective." },
        { q: "What is the Plan-Execute-Evaluate pattern?", a: "A three-phase loop: Plan node (LLM breaks task into steps), Execute node (run each step with tools), Evaluate node (check if plan succeeded or needs replanning). Used in research agents, coding agents, and complex automation. LangGraph's cycle support makes this natural — the evaluate node loops back to plan if needed." }
      ]
    },
    advanced: {
      concept: "Advanced patterns: LATS (Language Agent Tree Search) combines reflection with Monte Carlo Tree Search — generate multiple candidates via Send API fan-out, score each, expand the most promising. Confidence threshold routing stops the loop when the LLM reports high confidence via structured output. Cost control is critical: use cheap models for critique, expensive only for final generation.",
      facts: ["LATS: Send API fan-out + scoring + tree pruning for planning problems", "Confidence threshold: route to END only when structured output confidence > 0.85", "Parallel critique: fan-out to multiple critics, aggregate weighted scores", "Cost control: cheap model for critique, expensive model for final generation only", "Streaming reflection: astream_events() streams intermediate drafts to UI"],
      code: `from langgraph.types import Send
from typing import TypedDict, Annotated, List
import operator

class LATSState(TypedDict):
    task: str
    candidates: Annotated[List[str], operator.add]
    scores: Annotated[List[float], operator.add]
    iteration: Annotated[int, operator.add]
    best_candidate: str

def generate_candidates(state: LATSState):
    # Fan-out: generate 3 diverse candidates in parallel
    return [Send("gen_one", {"task": state["task"], "seed": i}) for i in range(3)]

def gen_one(state: dict):
    draft = f"Candidate {state['seed']}: {state['task'][:30]}"
    return {"candidates": [draft]}

def score_all(state: LATSState):
    # judge_llm.invoke each candidate in production
    scores = [0.6 + i * 0.1 for i in range(len(state["candidates"]))]
    best_idx = scores.index(max(scores))
    return {
        "scores": scores,
        "best_candidate": state["candidates"][best_idx],
        "iteration": [1]
    }

def should_continue(state: LATSState) -> str:
    if state["iteration"] >= 3 or max(state["scores"], default=0) > 0.85:
        return "end"
    return "generate_candidates"`,
      qa: [
        { q: "How would you implement a confidence-based loop that stops when certain enough?", a: "Add a confidence field to state. In your generation node, prompt the LLM to output confidence 0-1 alongside the answer using with_structured_output. In the routing function: if confidence > threshold (e.g., 0.85) route to END; else route back to generate with previous result as context. Calibrate the threshold empirically using your eval dataset." },
        { q: "Explain LATS and when to use it over simple reflection.", a: "LATS generates multiple candidate responses, evaluates each, expands the most promising, and backtracks dead ends — like MCTS. Use it when: the answer space is large and diverse, simple reflection converges to the same bad local optimum, or you have budget for 10-50 LLM calls per query. Standard reflection suffices for most production use cases." },
        { q: "How do you control costs in production reflection loops?", a: "Use a cheap fast model for critique (GPT-4o-mini, Claude Haiku), expensive model only for final generation. Cap iterations at 2-3 and measure quality uplift per iteration — often diminishing returns after round 2. Track cost per query in LangSmith and set budget alerts. Cache critiques for identical drafts." }
      ]
    }
  },
  5: {
    beginner: {
      concept: "Human-in-the-loop (HITL) means your agent pauses mid-execution and waits for a human to review, approve, or edit before continuing. LangGraph implements this via checkpointing: when the graph hits an interrupt point, it saves state and suspends. A human reviews, provides feedback, and the graph resumes from exactly where it stopped with zero state loss.",
      facts: ["interrupt_before=['node']: pause before this node every time it is reached", "interrupt_after=['node']: pause after this node completes its work", "interrupt() function: pause dynamically from inside a node based on state", "graph.update_state(config, updates): inject human feedback before resuming", "graph.invoke(None, config): resume a paused graph — pass None as input"],
      code: `from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.checkpoint.memory import MemorySaver

def draft_email(state: MessagesState):
    return {"messages": [("assistant", "Dear John, about tomorrow's meeting...")]}

def send_email(state: MessagesState):
    print("EMAIL SENT")
    return {"messages": [("system", "Email sent!")]}

graph = StateGraph(MessagesState)
graph.add_node("draft_email", draft_email)
graph.add_node("send_email", send_email)
graph.add_edge(START, "draft_email")
graph.add_edge("draft_email", "send_email")
graph.add_edge("send_email", END)

checkpointer = MemorySaver()
# Pause before send_email for human approval
app = graph.compile(checkpointer=checkpointer, interrupt_before=["send_email"])
config = {"configurable": {"thread_id": "email-001"}}

# Step 1: Draft (pauses before send_email)
app.invoke({"messages": [("user", "Email John about tomorrow")]}, config)

# Step 2: Human reviews
state = app.get_state(config)
print("Draft:", state.values["messages"])

# Step 3: Resume — send_email now runs
app.invoke(None, config)`,
      qa: [
        { q: "How does LangGraph implement HITL without losing agent state?", a: "Via checkpointing: when the graph reaches an interrupt point, it saves full state to the checkpointer and suspends. A human retrieves state via get_state(), reviews it, optionally edits via update_state(), then resumes with invoke(None, config). The graph continues from the exact suspension point with no state lost." },
        { q: "What is the difference between interrupt_before and interrupt_after?", a: "interrupt_before='node' pauses before the node runs — the human sees state going INTO the node and can edit or cancel. interrupt_after='node' pauses after the node completes — the human sees the node's output and can approve, reject, or edit before the next node runs. Use interrupt_before to review inputs, interrupt_after to review outputs." },
        { q: "How do you handle a human rejecting the agent's draft?", a: "After calling update_state() with rejection feedback, resume with invoke(None, config). Update a routing field in state before resuming — the conditional edge after the interrupt point routes to a revision node instead of proceeding. The key is to update state with feedback BEFORE calling invoke(None) so the next node sees the rejection." }
      ]
    },
    intermediate: {
      concept: "The interrupt() function (v0.4+) enables dynamic HITL from inside any node — pause based on state conditions, pass a structured payload to the waiting client, receive structured feedback on resume. More flexible than compile-time interrupt_before/after. Combined with a task queue and async API, you can build batch approval workflows where agents queue work and humans review throughout the day.",
      facts: ["interrupt(payload) suspends and returns the payload to the caller", "Resume: graph.invoke(Command(resume=human_input), config)", "Multiple interrupts: a graph can have many interrupt points across different nodes", "Async HITL: agents queue work in database, humans review in batches and resume", "Interrupt payload: any JSON-serializable dict — form data, documents, risk scores"],
      code: `from langgraph.types import interrupt
from typing import TypedDict

class ContractState(TypedDict):
    contract_text: str
    risk_score: float
    human_decision: str
    amendments: list

def analyze_contract(state: ContractState):
    # Simulate risk analysis — replace with LLM call
    return {"risk_score": 0.85}

def conditional_review(state: ContractState):
    if state["risk_score"] > 0.7:
        # Dynamic interrupt: only pauses for high-risk contracts
        human_input = interrupt({
            "contract_preview": state.get("contract_text", "")[:200],
            "risk_score": state["risk_score"],
            "recommendation": "HIGH RISK — Legal review required",
            "options": ["approve", "reject", "amend"]
        })
        return {
            "human_decision": human_input.get("decision", "reject"),
            "amendments": human_input.get("amendments", [])
        }
    return {"human_decision": "auto_approved"}

# Resume:
# app.invoke(Command(resume={"decision": "approve"}), config)`,
      qa: [
        { q: "How do you implement conditional HITL that only pauses for high-risk operations?", a: "Use the interrupt() function inside the node, gated by a condition: if state['risk_score'] > threshold: human_input = interrupt(payload). For low-risk cases, return normally without interrupting. This is more efficient than compile-time interrupt_before which always pauses regardless of state values." },
        { q: "How do you build an async HITL workflow with a human review queue?", a: "When interrupt() fires, the graph suspends and persists state. Store thread_id and interrupt payload in a review queue (database table). Human reviewers pick from the queue, review via UI, submit feedback via an API that calls update_state() and invoke(None, config). Agents create tasks; humans process throughout the day asynchronously." },
        { q: "What is the security model for HITL — who can resume a paused graph?", a: "LangGraph has no built-in authorization for resume operations — you implement access control in your application layer. Store which user or role can resume each thread_id, validate on the resume API endpoint before calling invoke(). For multi-tenant systems, namespace thread_ids by tenant and enforce isolation in your resume handler." }
      ]
    },
    advanced: {
      concept: "Enterprise HITL patterns: multi-approver workflows requiring N of M approvers, time-bounded approvals auto-rejecting after timeout, and approval chains from junior to senior to executive. LangGraph preserves every interrupt payload and resume input in checkpoint history automatically — enabling complete audit trails for regulated industries.",
      facts: ["Multi-approver: loop through approvers via interrupt(), each reviews independently", "Timeout: external scheduler calls reject+resume after TTL — graph cannot self-timeout", "Audit trail: every interrupt payload and resume input stored in checkpoint history", "4-eyes principle: require two independent approvals before high-risk actions", "Streaming HITL: astream_events() + interrupt() enables real-time human oversight"],
      code: `from langgraph.types import interrupt
from typing import TypedDict, List, Annotated
import operator

class MultiApprovalState(TypedDict):
    transaction: dict
    approvals: Annotated[List[dict], operator.add]
    required_approvers: List[str]
    final_status: str

def request_approval(state: MultiApprovalState):
    approved_by = [a["approver"] for a in state["approvals"] if a["approved"]]
    remaining = [a for a in state["required_approvers"] if a not in approved_by]

    if not remaining:
        return {"final_status": "approved"}

    decision = interrupt({
        "transaction": state["transaction"],
        "approver_role": remaining[0],
        "already_approved_by": approved_by,
    })

    record = {"approver": remaining[0],
              "approved": decision.get("approved", False),
              "comment": decision.get("comment", "")}

    if not decision.get("approved"):
        return {"approvals": [record], "final_status": "rejected"}
    return {"approvals": [record]}

def check_status(state: MultiApprovalState) -> str:
    if state.get("final_status"):
        return "finalize"
    approved = sum(1 for a in state["approvals"] if a["approved"])
    return "execute" if approved >= len(state["required_approvers"]) else "request_approval"`,
      qa: [
        { q: "How would you design a HITL system for the financial 4-eyes principle?", a: "Store required_approvers=['compliance_officer', 'risk_manager'] in state. Loop through approvers via interrupt() — each reviews independently with no initial knowledge of others' decisions. Store each approval record with timestamp, approver ID, and comment via append reducer. Only proceed if all required approvers approved. LangGraph preserves every interrupt payload and resume input in checkpoint history for complete audit trails." },
        { q: "How do you handle HITL timeout when an approver never responds?", a: "External scheduler (cron, Celery beat) queries your database for thread_ids with pending interrupts older than the TTL. The scheduler calls graph.update_state(config, {'timeout_reason': 'expired'}) followed by graph.invoke(None, config). The resuming node checks if timeout_reason is set and routes to a rejection or escalation path. The graph cannot self-timeout — it is suspended." },
        { q: "How do you expose a HITL interface to non-technical business users?", a: "Build a review UI that polls your database for pending reviews, renders the interrupt payload as a structured form, and submits the decision to a FastAPI endpoint that calls update_state() and invoke(None, config). LangSmith Studio provides this for technical users. Build a tailored domain-specific UI on top of the LangGraph Server REST API for business users." }
      ]
    }
  },
  6: {
    beginner: {
      concept: "LangChain is a framework for building LLM applications — it provides chains (linear sequences of steps), integrations with 100+ LLM providers, and tools. LangGraph is built ON TOP of LangChain and adds the graph layer: cycles, persistent state, and multi-actor coordination. You can use LangGraph without any LangChain components, but they work best together in the same stack.",
      facts: ["LangChain: linear pipelines, LCEL chains, 100+ model integrations", "LangGraph: cyclic graphs, stateful agents, multi-actor coordination", "Both from LangChain Inc. — designed to complement each other", "LangGraph works standalone with direct OpenAI/Anthropic/Gemini SDK calls", "LangSmith: observability platform working with both frameworks"],
      code: `# LangChain: simple linear chain — ideal for RAG and stateless pipelines
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

chain = (
    ChatPromptTemplate.from_template("Answer concisely: {question}")
    | ChatOpenAI(model="gpt-4o")
)
result = chain.invoke({"question": "What is Python?"})

# LangGraph: stateful agent with loops — ideal for complex multi-step tasks
from langgraph.prebuilt import create_react_agent

agent = create_react_agent(
    ChatOpenAI(model="gpt-4o"),
    tools=[]  # add search, calculator, etc.
)
result = agent.invoke({
    "messages": [("user", "Research 2025 AI trends and summarize")]
})
# Agent loops: search -> read -> search more -> synthesize -> done`,
      qa: [
        { q: "When should you use LangChain chains vs. LangGraph?", a: "Use LangChain chains for: simple RAG, single-step transformations, document processing pipelines, stateless operations. Use LangGraph for: multi-step agents using tools, workflows needing loops, long-running tasks needing checkpointing, systems requiring HITL, and multi-agent coordination. Rule of thumb: if you need a loop, use LangGraph." },
        { q: "Can you use LangGraph without LangChain?", a: "Yes. LangGraph is a standalone library. You can use the Anthropic SDK, OpenAI SDK, or any Python HTTP client directly inside your nodes. The only LangChain dependency in LangGraph is langchain-core for message types — and even those can be replaced with dicts if needed. LangGraph is model-agnostic by design." },
        { q: "What is LangSmith and how does it fit in?", a: "LangSmith is the observability and evaluation platform from LangChain Inc. It is framework-agnostic — works with LangChain chains, LangGraph agents, and even raw API calls. It provides execution traces, token-cost tracking, A/B prompt testing, and evaluation datasets. In Oct 2025, LangGraph Platform was rebranded as LangSmith Deployment." }
      ]
    },
    intermediate: {
      concept: "The core architectural decision is LCEL chain vs. StateGraph. LCEL (LangChain Expression Language) pipe composition is linear and efficient — great for RAG pipelines. StateGraph adds mutable shared state, cycles, and checkpointing. The two are composable: LangGraph nodes can contain LCEL chains internally, giving you streaming and batching from LCEL with persistence and loops from LangGraph.",
      facts: ["LCEL: composable pipes, lazy evaluation, built-in streaming and batching", "StateGraph: mutable state, cycles, checkpointing, HITL — the production agent layer", "Hybrid: LangGraph nodes can contain LCEL chains internally", "LangGraph vs CrewAI: LangGraph is lower-level with more control; CrewAI higher-level", "LangGraph vs AutoGen: similar goals, different APIs; LangGraph more Pythonic"],
      code: `# Hybrid: LCEL chain inside a LangGraph node — best of both
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END, MessagesState

# LCEL chain: gets streaming, retries, batching
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    ("placeholder", "{messages}")
])
model = ChatOpenAI(model="gpt-4o")
llm_chain = prompt | model  # LCEL pipe

def agent_node(state: MessagesState):
    # LangGraph node wraps LCEL chain
    response = llm_chain.invoke({"messages": state["messages"]})
    return {"messages": [response]}

# LangGraph manages state, loops, checkpointing
graph = StateGraph(MessagesState)
graph.add_node("agent", agent_node)
graph.add_edge(START, "agent")
graph.add_edge("agent", END)
app = graph.compile()`,
      qa: [
        { q: "How does LangGraph compare to AutoGen and CrewAI?", a: "LangGraph: lowest level, most control, explicit state machine, best for custom complex agents with deep observability needs. CrewAI: higher-level with predefined roles and crews, easier to start, less flexibility for custom routing. AutoGen: Microsoft's framework, strong for coding assistants. Production teams choose LangGraph for custom routing, specific state schemas, or deep LangSmith integration." },
        { q: "Why do companies like Uber and LinkedIn choose LangGraph?", a: "Production requirements: explicit traceable state machines not prompt spaghetti, durable execution that survives failures, first-class human-in-the-loop support, LangSmith observability, and model-agnostic deployment. Companies with compliance, reliability, and audit requirements need the control LangGraph provides. Simpler alternatives break under production load." },
        { q: "When is LangGraph overkill?", a: "If your use case is: a single-turn Q&A bot, a RAG pipeline without agentic steps, a simple document classifier, or any stateless single-LLM-call application — use LCEL chains or raw API calls. LangGraph's power comes with complexity: more code, more to debug, steeper learning curve. Over-engineering simple tasks with LangGraph is a real anti-pattern." }
      ]
    },
    advanced: {
      concept: "Enterprise framework selection: LangGraph wins on control, observability, and production readiness. The LangChain ecosystem is: LangChain (integrations) + LangGraph (orchestration) + LangSmith (evals + observability) + LangSmith Deployment (infrastructure). Competitors: AutoGen (Microsoft), CrewAI, Google ADK (strong GCP integration), AWS Bedrock Agents (managed, less control), Semantic Kernel (.NET-first).",
      facts: ["Google ADK: tight GCP integration, strong multi-modal; less flexible routing", "AWS Bedrock Agents: managed, less control; good for AWS-only shops", "Semantic Kernel: .NET-first enterprise integration; Python support secondary", "LangGraph + MCP: agents call MCP servers as standard tool nodes", "LangGraph Functional API: wraps CrewAI and other frameworks inside LangGraph"],
      code: `# Framework decision matrix
MATRIX = {
    "LangGraph": {
        "control": "maximum",
        "learning_curve": "steep",
        "state": "explicit TypedDict + reducers",
        "observability": "LangSmith (best-in-class)",
        "deployment": "LangSmith Deployment or self-hosted K8s",
        "best_for": ["complex agents","HITL","compliance","multi-agent"],
        "avoid_for": ["simple chatbots","stateless pipelines","rapid MVP"]
    },
    "CrewAI": {
        "control": "medium",
        "learning_curve": "gentle",
        "best_for": ["role-based teams","quick prototypes"],
        "avoid_for": ["custom routing","complex state schemas"]
    },
    "AWS Bedrock Agents": {
        "control": "low",
        "best_for": ["AWS-native shops","managed infra"],
        "avoid_for": ["multi-cloud","deep audit trails"]
    }
}`,
      qa: [
        { q: "How would you make the case for LangGraph over AWS Bedrock Agents in a financial firm?", a: "LangGraph wins on: control with explicit state schemas vs. managed black box, observability with LangSmith tracing every decision vs. CloudWatch logs, portability not locked to AWS (runs on-premises), first-class HITL for compliance workflows, and cost transparency. For a compliance-heavy financial firm needing audit trails, LangGraph is the defensible architectural choice." },
        { q: "How does LangGraph integrate with MCP (Model Context Protocol)?", a: "LangGraph agents call MCP servers as standard tool nodes. Use langchain-mcp-adapters to convert MCP server tools into LangChain tools, then pass them to create_react_agent() or ToolNode. This enables LangGraph agents to use any MCP-compatible server (Google Drive, Gmail, Supabase) without custom integration code." },
        { q: "Describe a migration path from LangChain chains to LangGraph.", a: "Incremental migration: keep existing LCEL chains and wrap each as a LangGraph node, add StateGraph around the chain sequence with explicit state, add MemorySaver for checkpointing without changing behavior, gradually replace chain-to-chain calls with graph edges, add conditional edges where you previously had if/else logic. Enable LangSmith tracing and use trace data to find bottlenecks. Full migration is 2-4 sprints for a complex system." }
      ]
    }
  },
  7: {
    beginner: {
      concept: "Deploying a LangGraph graph means exposing it as an API that clients can call. The simplest approach is wrapping it in FastAPI. LangSmith Deployment (formerly LangGraph Platform, GA'd May 2025, renamed Oct 2025) is the managed service — providing REST endpoints, streaming, async execution, and horizontal scaling with one-click GitHub deployment.",
      facts: ["LangGraph Server: opinionated REST API for stateful agents", "LangSmith Deployment: managed hosting (Cloud SaaS, Hybrid, Self-hosted)", "1-click deploy from GitHub via LangSmith UI", "Cloud SaaS requires Plus plan or above", "langgraph.json: config file mapping graph objects to deployment"],
      code: `# Option A: FastAPI DIY deployment
from fastapi import FastAPI
from pydantic import BaseModel

app_api = FastAPI()

class InvokeRequest(BaseModel):
    message: str
    thread_id: str

@app_api.post("/invoke")
async def invoke_agent(req: InvokeRequest):
    config = {"configurable": {"thread_id": req.thread_id}}
    result = await lg_app.ainvoke(
        {"messages": [("user", req.message)]}, config
    )
    return {"response": result["messages"][-1].content}

# Option B: langgraph.json for LangSmith 1-click deploy
# {
#   "dependencies": ["."],
#   "graphs": {
#     "my_agent": "./src/agent.py:graph"
#   },
#   "env": ".env"
# }
# Then: langgraph deploy --config langgraph.json`,
      qa: [
        { q: "What is LangSmith Deployment and when should you use it?", a: "LangSmith Deployment (renamed from LangGraph Platform in Oct 2025) is LangChain's managed infrastructure for deploying stateful agents. It provides REST endpoints with streaming, horizontal scaling, built-in persistence, LangSmith Studio for debugging, and 1-click GitHub deployment. Use it when you want to focus on agent logic, not infrastructure." },
        { q: "What deployment options does LangSmith Deployment offer?", a: "Three options: Cloud SaaS — fully managed on AWS/GCP, fastest setup, requires Plus plan. Hybrid — SaaS control plane with self-hosted data plane, for data residency requirements. Fully Self-Hosted — entire platform in your VPC via Helm charts, needs your own Postgres and Redis. Available on AWS Marketplace." },
        { q: "How do you add streaming to a deployed LangGraph agent?", a: "LangGraph Server provides /stream endpoints returning Server-Sent Events (SSE). For DIY deployment, use FastAPI's StreamingResponse with graph.astream_events(), filtering for on_chat_model_stream events to stream tokens. Client-side, use EventSource API or the LangGraph JS SDK's client.runs.stream() method." }
      ]
    },
    intermediate: {
      concept: "Production deployment challenges: async execution for long-running tasks to avoid HTTP timeouts, bursty traffic via Redis task queues, cold start prevention via prewarming, and multi-tenant isolation via namespaced thread_ids. For self-hosted, architect with Postgres for state, Redis for task queue, and Kubernetes HPA scaling on queue depth not CPU — agent workloads are IO-bound.",
      facts: ["Async execution: POST to start, poll for result — avoids HTTP timeout", "Webhooks: LangGraph Server POSTs result to your URL on completion", "Multi-tenant: namespace thread_ids as tenant_id:session_id", "HPA: scale on Redis queue depth not CPU — agents are IO-bound", "AsyncPostgresSaver: required for async graph compilation in production"],
      code: `# Kubernetes HPA — scale on queue depth, not CPU
# apiVersion: autoscaling/v2
# kind: HorizontalPodAutoscaler
# spec:
#   minReplicas: 2
#   maxReplicas: 20
#   metrics:
#   - type: External
#     external:
#       metric:
#         name: redis_queue_length
#       target:
#         type: AverageValue
#         averageValue: "10"

# Async production agent with Postgres persistence
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

async def run_production():
    DB = "postgresql://user:pass@host:5432/db"
    async with AsyncPostgresSaver.from_conn_string(DB) as cp:
        await cp.setup()  # creates required tables
        app = graph.compile(checkpointer=cp)
        config = {"configurable": {"thread_id": "prod-001"}}
        result = await app.ainvoke(
            {"messages": [("user", "Start task")]}, config
        )
        return result`,
      qa: [
        { q: "How do you handle long-running LangGraph agents without HTTP timeout errors?", a: "Use async run pattern: POST /runs to start the agent and get back a run_id, return 202 Accepted immediately, client polls GET /runs/{run_id}/status or subscribes to SSE for updates, on completion retrieve result from GET /runs/{run_id}/output. LangGraph Server handles this natively. For DIY, use Celery or RQ for background execution." },
        { q: "How would you architect LangGraph for 10,000 concurrent sessions?", a: "Horizontal scaling: multiple worker pods consuming from a Redis task queue. Postgres with PgBouncer connection pooling for checkpoint storage. Kubernetes HPA scaling on queue depth not CPU — agent workloads are IO-bound. Separate API gateway (stateless, many pods) from workers (stateful, fewer pods). Postgres read replicas for state history queries." },
        { q: "What is the langgraph.json config file?", a: "langgraph.json tells LangSmith Deployment where to find your graph objects in code (module:variable_name), what environment variables to load, and which Python dependencies to install. On deploy, LangSmith builds a Docker image from your GitHub repo, runs LangGraph Server with your graphs registered, and provisions Postgres and Redis automatically." }
      ]
    },
    advanced: {
      concept: "Advanced production: CI/CD with eval regression gating blocks deploys if quality drops, canary deployments route 5% traffic to new graph versions, and cost optimization uses smaller models for cheap routing steps. Observability stack: OpenTelemetry from LangGraph + Prometheus metrics + LangSmith traces. The langgraph deploy CLI integrates natively with GitHub Actions pipelines.",
      facts: ["Eval gating: run eval suite in CI, block deploy if quality below threshold", "Canary: LangSmith Deployment supports traffic splitting across graph versions", "Cost optimization: track tokens per node, substitute cheaper models for routing", "OpenTelemetry: LangGraph emits OTEL spans — export to Datadog, Grafana, Jaeger", "GitHub Actions: langgraph deploy CLI integrates as a pipeline step"],
      code: `# GitHub Actions CI/CD with eval gate (abbreviated)
# steps:
# 1. Run eval suite:
#    python scripts/run_evals.py \\
#      --dataset compliance_v2 \\
#      --threshold 0.85 \\
#      --output eval_results.json
#
# 2. Check results:
#    python -c "
#    import json
#    r = json.load(open('eval_results.json'))
#    assert r['aggregate_score'] >= 0.85, f'BLOCKED: {r[\"aggregate_score\"]}'
#    print('PASSED - deploying')
#    "
# 3. Deploy if passed:
#    langgraph deploy --config langgraph.json

from langsmith.evaluation import evaluate

def run_evals(dataset: str, threshold: float) -> dict:
    results = evaluate(
        lambda x: app.invoke(x),
        data=dataset,
        evaluators=[correctness_evaluator],
        experiment_prefix="ci-eval"
    )
    score = results.to_pandas()["feedback.correctness"].mean()
    return {"aggregate_score": float(score), "passed": score >= threshold}`,
      qa: [
        { q: "How do you implement eval-gated CI/CD for a LangGraph agent?", a: "In GitHub Actions: build and run the new graph version against a fixed evaluation dataset in LangSmith, parse the aggregate score from eval results, if score is at or above threshold proceed to langgraph deploy, otherwise fail the pipeline with a clear error. This prevents quality regressions from reaching production. Raise the threshold as the agent improves over time." },
        { q: "How do you implement cost observability for a production LangGraph agent?", a: "LangSmith automatically tracks token usage and cost per trace. For custom metrics: add a cost_tokens field to state with operator.add, increment in each node using get_usage_metadata() from the LLM response. Export LangSmith metrics via API to Grafana. Set alerts when cost_per_session exceeds threshold. Track cost_by_node to identify expensive nodes." },
        { q: "Describe a blue-green deployment strategy for LangGraph with stateful sessions.", a: "Challenge: users mid-session must complete on old (blue) graph; new sessions start on green. Strategy: deploy green alongside blue, route new thread_ids to green while existing ones stay on blue via routing by thread_id prefix or metadata, monitor green error rates and eval scores, once all blue sessions complete decommission blue. LangSmith Deployment handles this with graph version pinning per thread." }
      ]
    }
  },
  8: {
    beginner: {
      concept: "Evaluating an agent means measuring whether it achieves its goal correctly, efficiently, and safely. Unlike static ML models, agents take multiple steps — you evaluate both the final output AND the trajectory (the sequence of tool calls, routing decisions, and intermediate steps). LangSmith is the primary evaluation tool for LangGraph agents, providing traces, datasets, and evaluators.",
      facts: ["LangSmith: built-in tracing, datasets, evaluators, quality dashboards", "Trajectory eval: did the agent take the right steps, not just get the right answer", "LLM-as-judge: use an LLM to evaluate output quality automatically at scale", "Dataset: input/expected_output pairs for regression testing across releases", "LANGSMITH_TRACING_V2=true: env var enables automatic tracing, zero code changes"],
      code: `import os
from langsmith import Client
from langsmith.evaluation import evaluate

os.environ["LANGSMITH_TRACING_V2"] = "true"
os.environ["LANGSMITH_API_KEY"] = "your-api-key"

client = Client()

# Create regression test dataset
dataset = client.create_dataset("compliance-agent-v1")
client.create_examples(
    inputs=[{"question": "Is clause 7.3 GDPR compliant?"}],
    outputs=[{"answer": "No, violates GDPR Article 17"}],
    dataset_id=dataset.id
)

def correctness_evaluator(run, example):
    expected = example.outputs["answer"]
    actual = run.outputs.get("answer", "")
    # In production: use judge LLM for semantic comparison
    score = 1.0 if expected[:20].lower() in actual.lower() else 0.0
    return {"key": "correctness", "score": score}

results = evaluate(
    lambda x: app.invoke(x),
    data="compliance-agent-v1",
    evaluators=[correctness_evaluator],
    experiment_prefix="v1.2-release"
)`,
      qa: [
        { q: "What is the difference between evaluating a chain vs. an agent graph?", a: "A chain has one input-output pair to evaluate. An agent graph has a trajectory: multiple steps, branching decisions, tool calls, and potentially loops. You evaluate: final output quality (correct answer?), trajectory correctness (right steps taken?), efficiency (minimum steps?), and cost (total tokens). Agent evals require trajectory-level datasets, not just expected output strings." },
        { q: "What is LLM-as-judge and what are its limitations?", a: "LLM-as-judge uses a separate LLM to evaluate another LLM's output. Limitations: same-family models tend to be lenient on each other's outputs, non-deterministic across runs, expensive (extra LLM calls per eval), and requires careful judge prompt calibration against human labels to be reliable." },
        { q: "How do you set up automatic tracing for a LangGraph agent?", a: "Set LANGSMITH_TRACING_V2=true and LANGSMITH_API_KEY in your environment. LangGraph automatically instruments all node executions, state transitions, and LLM calls with zero code changes. Each invocation creates a trace with full step-by-step visibility. Use LANGSMITH_PROJECT to group traces by deployment version." }
      ]
    },
    intermediate: {
      concept: "Production eval framework has three levels: offline evals (pre-deploy CI gate), online evals (post-deploy sampling), and A/B experiments (live traffic comparison). Trajectory evaluation checks whether the agent visited correct nodes in the correct order. LangSmith automation rules sample 10-20% of production traces and auto-evaluate asynchronously with no user impact.",
      facts: ["Offline eval: run before deploy, block on regression — the CI/CD quality gate", "Online eval: sample 10-20% of production traces, evaluate asynchronously", "A/B experiment: route percentage of live traffic to new prompt/model, compare metrics", "Trajectory accuracy: percent of runs matching expected node visit sequence", "Custom metrics: domain-specific KPIs like compliance_score or confidence_level"],
      code: `from langsmith.evaluation import evaluate, LangChainStringEvaluator

def trajectory_evaluator(run, example):
    actual = [s.name for s in (run.child_runs or []) if s.run_type == "chain"]
    expected = example.outputs.get("expected_trajectory", [])
    if not expected:
        return {"key": "trajectory", "score": 1.0}
    matches = sum(1 for a, e in zip(actual, expected) if a == e)
    return {"key": "trajectory_accuracy", "score": matches / max(len(expected), 1)}

def cost_evaluator(run, example):
    tokens = run.total_tokens or 0
    budget = example.outputs.get("max_tokens", 2000)
    return {"key": "cost_efficiency", "score": min(1.0, budget / max(tokens, 1))}

results = evaluate(
    lambda x: app.invoke(x),
    data="agent-prod-dataset",
    evaluators=[trajectory_evaluator, cost_evaluator,
                LangChainStringEvaluator("correctness")],
    max_concurrency=5
)
df = results.to_pandas()
print(df[["feedback.trajectory_accuracy","feedback.cost_efficiency"]].describe())`,
      qa: [
        { q: "How do you implement trajectory evaluation for a multi-step agent?", a: "Trajectory evaluation checks whether the agent visited expected nodes in the expected order. In LangSmith, each node execution is a child run in the trace. Your evaluator extracts child run names from run.child_runs, compares against expected_trajectory from your dataset, and computes a match score. Use sequence similarity for partial credit rather than exact match." },
        { q: "What metrics should you track for a production LangGraph agent?", a: "Four categories: Quality — correctness via LLM judge, task completion rate, user satisfaction. Efficiency — steps per task, tokens per task, latency, time-to-first-token. Safety — error rate, hallucination rate, refusal rate. Cost — tokens per run by model tier, cost per session, cost per successful completion. Track all four and alert on regressions." },
        { q: "How do you run online evals in production without disrupting users?", a: "Use LangSmith automation rules: sample 10-20% of production traces, auto-apply an LLM judge evaluator, and write results back as feedback asynchronously. No user impact — evaluation runs against completed traces. Set alerts: if online eval correctness drops below threshold, trigger a PagerDuty notification." }
      ]
    },
    advanced: {
      concept: "Enterprise eval infrastructure: custom evaluator libraries for domain-specific metrics (GDPR compliance, financial accuracy), simulation-based testing where agents interact with simulated environments, and pairwise comparison where two agent versions are judged head-to-head. Sophisticated eval suites can cost as much as production traffic — budget accordingly.",
      facts: ["Simulation testing: agent interacts with a simulated customer or environment LLM", "Pairwise eval: compare two versions on same input, LLM judge picks winner", "Human eval pipeline: labelers create gold standard ground truth datasets", "Eval cost control: use cheap judge model, cache evaluations of identical outputs", "Regression baseline: pin a golden graph version as the permanent benchmark"],
      code: `from langsmith.evaluation import evaluate_comparative

def pairwise_judge(runs, example):
    old_output = runs[0].outputs.get("answer", "")
    new_output = runs[1].outputs.get("answer", "")
    # In production: judge_llm.invoke comparison prompt
    # Return 1.0 if new version wins, 0.0 if old wins
    score = 1.0 if len(new_output) > len(old_output) else 0.0  # simplified
    return {"key": "preference", "score": score}

results = evaluate_comparative(
    [
        lambda x: old_app.invoke(x),   # baseline
        lambda x: new_app.invoke(x)    # challenger
    ],
    evaluators=[pairwise_judge],
    data="customer-scenarios-v2"
)

# Simulation-based testing
class CustomerSimulator:
    def respond(self, agent_message: str, scenario: dict) -> str:
        # sim_llm.invoke(realistic customer response prompt)
        return f"Simulated response to: {agent_message[:50]}"

def simulate_conversation(example):
    sim = CustomerSimulator()
    config = {"configurable": {"thread_id": f"eval-{example['id']}"}}
    for turn in range(5):
        customer_msg = sim.respond("Hello", example["scenario"])
        result = app.invoke({"messages": [("user", customer_msg)]}, config)
    return result`,
      qa: [
        { q: "How do you build an eval framework for compliance automation where correctness is legally defined?", a: "Legal compliance eval requires ground truth from lawyers, not just LLM judges. Build: a dataset of regulatory clauses with legally-verified answers labeled by compliance lawyers, a rule-based evaluator checking required keywords from regulatory text, an LLM judge calibrated against lawyer labels with Cohen's kappa above 0.7, and a false-negative evaluator since missing compliance issues are worse than false positives." },
        { q: "How do you detect agent quality degradation before users notice?", a: "Multi-signal monitoring: online eval sampling 15% of traces with LLM judge, step count drift (increasing average steps suggests looping), human feedback thumbs up/down tracked weekly, and error rate spikes in tool calls. Set LangSmith alerts on all four signals. Correlate degradation events with model updates or upstream data changes." },
        { q: "What is simulation-based testing and when is it more valuable than dataset evaluation?", a: "Simulation-based testing has an agent interact with a simulated environment — another LLM playing a customer, a mock API, or a synthetic database. Valuable when real interactions are too expensive to collect, you need to test rare edge cases at scale, or quality requires multi-turn dynamics that static datasets cannot capture." }
      ]
    }
  },
  9: {
    beginner: {
      concept: "Multi-agent systems have multiple specialized agents collaborating on a task. Instead of one agent doing everything and hitting context limits, you divide the work: a Research Agent, a Code Agent, a Writing Agent — each with focused prompts, minimal tools, and high accuracy in their domain. A Supervisor coordinates them, routing work to the right specialist at each step.",
      facts: ["Supervisor pattern: central coordinator routes to specialists — most common in production", "Swarm pattern: agents hand off peer-to-peer based on their own assessment", "Network/Mesh: any agent calls any other — most flexible, hardest to debug", "Tool-based handoff: supervisor calls agents as tools — recommended in v1.0+", "Each specialist can be a separate compiled StateGraph used as a subgraph"],
      code: `from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

model = ChatOpenAI(model="gpt-4o")

# Focused specialist agents
research_agent = create_react_agent(model, tools=[],
    prompt="Research specialist. Find accurate information only.")
writer_agent = create_react_agent(model, tools=[],
    prompt="Writing specialist. Produce polished content only.")

# Tool-based handoff — recommended pattern in v1.0+
@tool
def delegate_to_researcher(query: str) -> str:
    """Research specialist: web search, fact-finding."""
    result = research_agent.invoke({"messages": [("user", query)]})
    return result["messages"][-1].content

@tool
def delegate_to_writer(request: str) -> str:
    """Writing specialist: blog posts, summaries."""
    result = writer_agent.invoke({"messages": [("user", request)]})
    return result["messages"][-1].content

supervisor = create_react_agent(
    model,
    tools=[delegate_to_researcher, delegate_to_writer],
    prompt="Coordinate specialists. NEVER do specialist work yourself."
)`,
      qa: [
        { q: "What are the main multi-agent patterns in LangGraph?", a: "Three patterns: Supervisor — a central orchestrator routes to specialized agents and controls all communication flow, best for structured workflows. Swarm — agents hand off to each other peer-to-peer based on their own assessment, best for fluid collaboration. Network/Mesh — any agent can call any other, most flexible but hardest to trace and debug in production." },
        { q: "Why use multiple agents instead of one powerful agent?", a: "Single agents hit ceilings: prompt length (many tools confuse the model), tool selection errors, and prompt dilution (long system prompts mean forgotten rules). Specialists have short focused prompts, fewer tools, and higher accuracy. Independent testing is easier. When an agent shows growing prompts and falling accuracy, it is time to split into specialists." },
        { q: "How does the supervisor pattern work in LangGraph?", a: "The supervisor is an LLM node that receives conversation state and decides which agent to invoke next or returns FINISH to terminate. Each specialist runs, appends output to shared state, and returns control to the supervisor. The supervisor evaluates progress and routes to the next needed specialist." }
      ]
    },
    intermediate: {
      concept: "Tool-based handoff (recommended for v1.0+) treats each specialist agent as a LangChain tool. The supervisor's prompt describes when to use each specialist-tool. This gives full control over what context each specialist receives, cleaner LangSmith traces as tool calls are distinct events, and easier prompt engineering. Context bloat is a common failure mode — add summarization after N turns.",
      facts: ["Tool-based handoff: supervisor calls agents as tools — recommended since v1.0", "Subgraph: each specialist is a compiled StateGraph used as a node", "No tool overlap: each specialist owns exactly one domain — prevents scope creep", "Context bloat: shared message history grows — add summarization node after N turns", "Supervisor prompt must forbid doing specialist work directly"],
      code: `from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")

research_agent = create_react_agent(model, tools=[],
    prompt="Research ONLY. No code, no writing.")
code_agent = create_react_agent(model, tools=[],
    prompt="Code ONLY. No research, no writing.")

@tool
def delegate_to_researcher(query: str) -> str:
    """Research specialist: web search, fact-finding, data gathering."""
    result = research_agent.invoke({"messages": [("user", query)]})
    return result["messages"][-1].content

@tool
def delegate_to_coder(task: str) -> str:
    """Code specialist: writing, debugging, and testing Python code."""
    result = code_agent.invoke({"messages": [("user", task)]})
    return result["messages"][-1].content

supervisor = create_react_agent(
    model,
    tools=[delegate_to_researcher, delegate_to_coder],
    prompt="""Coordinate specialists. Synthesize results into a final answer.
    NEVER do specialist work yourself — always delegate."""
)`,
      qa: [
        { q: "What is tool-based handoff and why is it recommended now?", a: "Tool-based handoff treats each specialist agent as a LangChain tool the supervisor can call. This gives: full control over what context each specialist receives by crafting the tool input string, cleaner traces in LangSmith where tool calls are distinct events, and easier prompt engineering. It supersedes graph-based multi-agent for most v1.0+ use cases." },
        { q: "How do you prevent context bloat in a multi-agent system?", a: "Add a context management node: after N turns or when message count exceeds threshold, run a summarization node that condenses older messages into a summary and replaces them. For tool-based handoff, pass only the relevant excerpt to each specialist, not the full conversation history. Use LangChain's trim_messages() utility with a token limit." },
        { q: "How do you handle state isolation between specialist agents?", a: "Subgraph approach: each specialist has its own TypedDict with private keys. At the subgraph boundary, define InputState (subset of parent state passed in) and OutputState (what the subgraph returns). LangGraph handles schema translation. For tool-based handoff, isolation is natural — the tool call passes only a string input and receives a string output." }
      ]
    },
    advanced: {
      concept: "Enterprise multi-agent architecture: hierarchical supervisor-of-supervisors with 3 tiers, dynamic agent spawning, agent registries with semantic capability search, and cross-agent memory via shared Store. Production challenges: deadlock detection, circuit breakers for failing agents, cost attribution per specialist tagged in LangSmith, and SLA monitoring per agent type.",
      facts: ["Hierarchical: top supervisor -> domain supervisors -> specialists (3 tiers)", "Agent registry: Store with capabilities, semantic search selects the right agent", "Circuit breaker: if specialist fails N times, route to fallback or human escalation", "Cost attribution: tag LangSmith traces by agent_name for per-specialist cost breakdown", "Command(goto=...): recommended supervisor routing pattern in v1.0+"],
      code: `from langgraph.types import Command
from langgraph.store.memory import InMemoryStore
from typing import TypedDict, Annotated, List, Dict
import operator

store = InMemoryStore()
store.put(("agents",), "researcher", {"caps": ["search","facts"], "errors": 0})
store.put(("agents",), "coder",      {"caps": ["code","debug"], "errors": 0})
store.put(("agents",), "writer",     {"caps": ["prose","blog"], "errors": 0})

class EnterpriseState(TypedDict):
    task: str
    messages: Annotated[List, operator.add]
    agent_costs: Annotated[Dict, lambda a, b: {**a, **b}]
    routing_log: Annotated[List[str], operator.add]

def enterprise_supervisor(state: EnterpriseState):
    task = state["task"].lower()
    if any(k in task for k in ["code","debug"]):
        agent = "coder"
    elif any(k in task for k in ["write","blog","draft"]):
        agent = "writer"
    else:
        agent = "researcher"

    # Circuit breaker check
    info = store.get(("agents",), agent)
    if info and info.value["errors"] >= 3:
        agent = "researcher"  # safe fallback

    return Command(
        goto=agent,
        update={
            "routing_log": [f"Routed to: {agent}"],
            "agent_costs": {agent: 0.001}
        }
    )`,
      qa: [
        { q: "How would you design a hierarchical multi-agent system for enterprise compliance?", a: "Three-tier hierarchy: CEO-Supervisor receives the full task and decomposes into regulatory domains (GDPR, SOX, HIPAA). Domain supervisors one per regulation coordinate specialist agents for that domain. Specialist agents include clause analyzer, citation retriever, risk scorer, and report generator with targeted tools. State flows down with task context and up with results. Each tier has its own checkpoint namespace for independent audit trails." },
        { q: "How do you implement a circuit breaker for a failing specialist agent?", a: "Track error counts in the LangGraph Store or Redis. In the supervisor routing function, check error count before routing: if error_count >= threshold, route to a fallback agent or escalate to human review. Use exponential backoff: after circuit opens, test the agent again after a cooldown period. Log all circuit-breaker events to LangSmith for postmortem analysis." },
        { q: "How do you do cost attribution across multiple agents in a multi-agent system?", a: "Tag each LangSmith trace with the agent_name via config metadata: config['metadata']['agent_name'] = 'researcher'. In each agent node, capture token usage from response.usage_metadata and add to an agent_costs dict in state. Export LangSmith API data to your BI tool and aggregate by agent_name to identify which specialist is most expensive." }
      ]
    }
  }
};

const TOPICS = [
  { icon:"⬡",  title:"LangGraph Core",         sub:"Stateful multi-actor graph runtime" },
  { icon:"◈",  title:"Nodes & Edges",           sub:"Modular building blocks" },
  { icon:"◉",  title:"State & Persistence",     sub:"Checkpoints & long-running agents" },
  { icon:"⟁",  title:"Conditional Routing",     sub:"Dynamic decision-making" },
  { icon:"↺",  title:"Cycles & Reflection",     sub:"Self-correction through loops" },
  { icon:"⏸",  title:"Human-in-the-Loop",       sub:"Interrupt, approve, edit" },
  { icon:"⚖",  title:"LangGraph vs LangChain",  sub:"When to use graphs over chains" },
  { icon:"⬆",  title:"Deployment & Scaling",    sub:"Local graph to production API" },
  { icon:"◎",  title:"Evaluation",              sub:"Trace analysis & metrics" },
  { icon:"⬡⬡", title:"Multi-Agent Systems",     sub:"Supervisor + specialist teams" },
];

const LC = {
  beginner:     { label:"🟢 Beginner",     color:"#4ade80", bg:"rgba(74,222,128,0.06)",  border:"rgba(74,222,128,0.2)" },
  intermediate: { label:"🟡 Intermediate", color:"#facc15", bg:"rgba(250,204,21,0.06)",  border:"rgba(250,204,21,0.2)" },
  advanced:     { label:"🔴 Advanced",     color:"#f87171", bg:"rgba(248,113,113,0.06)", border:"rgba(248,113,113,0.2)" },
};

export default function App() {
  const [ti, setTi] = useState(0);
  const [lv, setLv] = useState("beginner");
  const [tab, setTab] = useState("concept");
  const [oq, setOq] = useState(null);

  const topic = TOPICS[ti];
  const data = D[ti]?.[lv];
  const lc = LC[lv];

  function gotoTopic(i) { setTi(i); setOq(null); setTab("concept"); }
  function gotoLevel(l) { setLv(l); setOq(null); setTab("concept"); }

  return (
    <div style={{ fontFamily:"monospace", background:"#07090f", minHeight:"100vh", color:"#c8d6e5" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0a0d14;}
        ::-webkit-scrollbar-thumb{background:#1a2535;border-radius:2px;}
        .btn{cursor:pointer;background:none;border:none;transition:opacity .15s;font-family:monospace;}
        .btn:hover{opacity:.75;}
        .qrow{cursor:pointer;}
        .qrow:hover{border-color:#2d5080!important;}
        pre{white-space:pre-wrap;word-break:break-word;line-height:1.65;}
      `}</style>

      {/* HEADER */}
      <div style={{ background:"#080b14", borderBottom:"1px solid #131c2b", padding:"18px 16px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ fontSize:9, color:"#1e3350", letterSpacing:".15em", marginBottom:6 }}>YELLAMARAJU.COM / TUTORIALS / LANGGRAPH</div>
          <h1 style={{ fontSize:"clamp(18px,4vw,34px)", fontWeight:700, color:"#d8e8f5", letterSpacing:"-.02em", lineHeight:1.2, marginBottom:8 }}>
            LangGraph & Agentic AI <span style={{ color:"#3b82f6" }}>Interview Mastery</span>
          </h1>
          <p style={{ fontSize:11, color:"#3d5a78", maxWidth:560, lineHeight:1.7, marginBottom:12 }}>
            10 topics · 3 levels · 90+ Q&amp;As · LangGraph v1.0 · Production patterns · 2025–2026
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
            {["LangGraph v1.0","Python 3.10+","21,700+ ⭐","Production Patterns","2025 Updated"].map(t=>(
              <span key={t} style={{ fontSize:8, padding:"2px 6px", border:"1px solid #1a2d45", borderRadius:3, color:"#3b82f6", background:"#07111e" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex" }}>
        {/* SIDEBAR */}
        <div style={{ width:220, flexShrink:0, borderRight:"1px solid #131c2b", padding:"12px 0", position:"sticky", top:0, height:"calc(100vh - 120px)", overflowY:"auto" }}>
          <div style={{ fontSize:8, color:"#1e3350", letterSpacing:".12em", padding:"0 10px 7px", textTransform:"uppercase" }}>10 Core Topics</div>
          {TOPICS.map((t,i)=>(
            <button key={i} className="btn" onClick={()=>gotoTopic(i)}
              style={{ width:"100%", textAlign:"left", padding:"7px 10px", background:i===ti?"#0b1828":"transparent", borderLeft:`2px solid ${i===ti?"#3b82f6":"transparent"}`, display:"flex", gap:6, alignItems:"flex-start" }}>
              <span style={{ fontSize:12, marginTop:1, flexShrink:0 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize:9, color:i===ti?"#bdd4ec":"#3d5a78", lineHeight:1.3 }}>{t.title}</div>
                <div style={{ fontSize:8, color:i===ti?"#2563eb":"#0f1a28", marginTop:1 }}>{t.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* MAIN */}
        <div style={{ flex:1, padding:"16px 20px", overflowX:"hidden" }}>
          <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:24 }}>{topic.icon}</span>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:"#d8e8f5" }}>{topic.title}</h2>
              <p style={{ fontSize:9, color:"#3b82f6" }}>{topic.sub}</p>
            </div>
          </div>

          {/* Level selector */}
          <div style={{ display:"flex", gap:4, marginBottom:10 }}>
            {["beginner","intermediate","advanced"].map(key=>{
              const cfg=LC[key];
              return (
                <button key={key} className="btn" onClick={()=>gotoLevel(key)}
                  style={{ padding:"4px 10px", borderRadius:4, border:`1px solid ${lv===key?cfg.border:"#131c2b"}`, background:lv===key?cfg.bg:"#07090f", color:lv===key?cfg.color:"#1e3350", fontSize:9, fontWeight:lv===key?700:400 }}>
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #131c2b", marginBottom:12 }}>
            {[["concept","📖 Concept"],["code","💻 Code"],["interview","🎯 Q&A"]].map(([key,label])=>(
              <button key={key} className="btn" onClick={()=>{ setTab(key); setOq(null); }}
                style={{ padding:"5px 11px", borderBottom:`2px solid ${tab===key?lc.color:"transparent"}`, color:tab===key?lc.color:"#1e3350", fontSize:9, marginBottom:-1 }}>
                {label}
              </button>
            ))}
          </div>

          {data && (
            <>
              {tab==="concept" && (
                <div>
                  <div style={{ background:lc.bg, border:`1px solid ${lc.border}`, borderRadius:7, padding:"13px 15px", marginBottom:10 }}>
                    <div style={{ fontSize:7, color:lc.color, textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>{lc.label} — Core Concept</div>
                    <p style={{ fontSize:11, color:"#7aaec8", lineHeight:1.85 }}>{data.concept}</p>
                  </div>
                  <div style={{ background:"#07090f", border:"1px solid #131c2b", borderRadius:7, padding:"13px 15px" }}>
                    <div style={{ fontSize:7, color:"#3b82f6", textTransform:"uppercase", letterSpacing:".12em", marginBottom:9 }}>📌 Key Facts to Memorize</div>
                    {data.facts.map((f,i)=>(
                      <div key={i} style={{ display:"flex", gap:6, padding:"5px 0", borderBottom:i<data.facts.length-1?"1px solid #0d1520":"none" }}>
                        <span style={{ color:lc.color, fontSize:9, flexShrink:0 }}>▸</span>
                        <span style={{ fontSize:10, color:"#4a7098", lineHeight:1.5 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab==="code" && (
                <div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:7 }}>
                    <span style={{ fontSize:8, padding:"2px 6px", background:lc.bg, color:lc.color, border:`1px solid ${lc.border}`, borderRadius:3 }}>{lc.label}</span>
                    <span style={{ fontSize:8, color:"#1e3350" }}>LangGraph v1.0 · Python 3.10+</span>
                  </div>
                  <div style={{ background:"#050810", border:"1px solid #131c2b", borderRadius:7, padding:13, overflowX:"auto" }}>
                    <pre style={{ fontSize:10, color:"#6a9ec0" }}><code>{data.code}</code></pre>
                  </div>
                  <div style={{ marginTop:7, padding:"6px 9px", background:"#07090f", border:"1px solid #0d1520", borderRadius:4, fontSize:8, color:"#1e3350" }}>
                    💡 Practice explaining this line-by-line — interviewers ask you to whiteboard similar patterns.
                  </div>
                </div>
              )}

              {tab==="interview" && (
                <div>
                  <div style={{ fontSize:8, color:"#1e3350", marginBottom:9 }}>3 {lv}-level questions — click to reveal model answers</div>
                  {data.qa.map((qa,i)=>(
                    <div key={i} className="qrow" onClick={()=>setOq(oq===i?null:i)}
                      style={{ marginBottom:7, border:`1px solid ${oq===i?lc.border:"#131c2b"}`, borderRadius:6, overflow:"hidden" }}>
                      <div style={{ padding:"9px 13px", background:oq===i?lc.bg:"#07090f", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:7 }}>
                        <div style={{ display:"flex", gap:6 }}>
                          <span style={{ color:lc.color, fontSize:8, flexShrink:0, marginTop:2 }}>Q{i+1}</span>
                          <span style={{ fontSize:10, color:"#9abcda", lineHeight:1.5 }}>{qa.q}</span>
                        </div>
                        <span style={{ color:"#1e3350", fontSize:10, flexShrink:0 }}>{oq===i?"▲":"▼"}</span>
                      </div>
                      {oq===i && (
                        <div style={{ padding:"11px 13px", background:"#040710", borderTop:`1px solid ${lc.border}` }}>
                          <div style={{ fontSize:7, color:lc.color, textTransform:"uppercase", letterSpacing:".1em", marginBottom:6 }}>Model Answer</div>
                          <p style={{ fontSize:10, color:"#5a8aaa", lineHeight:1.85 }}>{qa.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Nav */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:22, paddingTop:12, borderTop:"1px solid #131c2b" }}>
            <button className="btn" onClick={()=>gotoTopic(Math.max(0,ti-1))} disabled={ti===0}
              style={{ padding:"5px 10px", background:ti===0?"#07090f":"#0a1525", border:`1px solid ${ti===0?"#131c2b":"#1a3050"}`, borderRadius:4, color:ti===0?"#1a2d40":"#3b82f6", fontSize:9 }}>
              ← Previous
            </button>
            <span style={{ fontSize:8, color:"#1a2d40" }}>{ti+1} / {TOPICS.length}</span>
            <button className="btn" onClick={()=>gotoTopic(Math.min(TOPICS.length-1,ti+1))} disabled={ti===TOPICS.length-1}
              style={{ padding:"5px 10px", background:ti===TOPICS.length-1?"#07090f":"#0a1525", border:`1px solid ${ti===TOPICS.length-1?"#131c2b":"#1a3050"}`, borderRadius:4, color:ti===TOPICS.length-1?"#1a2d40":"#3b82f6", fontSize:9 }}>
              Next →
            </button>
          </div>

          {/* Quick nav */}
          <div style={{ marginTop:16, background:"#050810", border:"1px solid #131c2b", borderRadius:6, padding:"10px 12px" }}>
            <div style={{ fontSize:7, color:"#1a2d40", textTransform:"uppercase", letterSpacing:".12em", marginBottom:7 }}>⚡ All 10 Topics</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"2px 12px" }}>
              {TOPICS.map((t,i)=>(
                <div key={i} style={{ display:"flex", gap:4, fontSize:8, padding:"2px 0", cursor:"pointer" }} onClick={()=>gotoTopic(i)}>
                  <span style={{ color:"#3b82f6" }}>{t.icon}</span>
                  <span style={{ color:i===ti?"#4a90c8":"#1e3350" }}>{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
