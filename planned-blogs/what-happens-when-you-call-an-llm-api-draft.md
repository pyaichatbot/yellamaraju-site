# What Happens Between Sending an LLM API Call and Receiving a Response?

When you send a request to an LLM API, the answer can arrive fast enough to feel instantaneous.

That speed hides a lot of machinery.

Your request crosses the public internet, hits the provider's edge, gets authenticated, tokenized, routed to a model server, processed on GPUs, filtered, billed, and turned back into text before it comes back to you.

Most of that time is not spent "traveling through the internet." It is spent inside the provider's infrastructure doing compute and queueing work that users never see.

This post explains that path in plain language.

It also answers a question that comes up often: if data moves close to the speed of light, why does an LLM response still take hundreds of milliseconds or more?

If this becomes a published post, include the X post visual that depicts the full cycle near the opening explainer section:

- https://x.com/iamkyros69/status/2000541783231725839?s=46

Best placement:
- after the introduction and before "The Short Version"
- or immediately after "The Short Version" as a visual summary before the detailed walkthrough

Implementation note for the MDX version:
- use the existing [`TweetEmbed.astro`](/Users/spy/Documents/PY/self/yellamaraju-site/src/components/TweetEmbed.astro) component if X embeds are already supported on the site
- if the embed is unreliable, use a short inline reference such as "A compact visual summary of this flow is also captured in this X post" and link directly to the URL

## The Short Version

A typical LLM API request goes through seven broad stages:

1. API gateway
2. Internal routing and load balancing
3. Tokenization
4. Prefill, where the model reads the full prompt
5. Decode, where the model generates output tokens
6. Post-processing and safety checks
7. Billing, packaging, and response delivery

The network matters.

But for most real requests, the biggest delay is not the trip from your laptop to the provider.

It is the work required to run the model.

## 1. The Request Reaches the API Gateway

The first visible hop is the provider's API gateway.

This is where the platform does the boring but necessary work:

- terminate TLS
- validate your API key
- apply rate limits and quota checks
- validate the request schema
- attach request metadata for logging, tracing, and billing

This part is usually quick.

It is also where many requests fail early. A malformed payload, invalid key, or quota problem is often rejected here without ever reaching the model.

For engineers, this is the first useful reminder: an LLM call is not just "prompt in, text out." It is still an HTTP request passing through standard distributed systems layers.

## 2. The Platform Routes the Request Internally

Once admitted, the request is routed inside the provider's network.

That routing layer decides where the work should run:

- which region or data center should handle it
- which model cluster has capacity
- whether the request should go to a general-purpose model, a smaller low-latency model, or a specialized endpoint
- whether it can be batched efficiently with other requests

Users often imagine that their prompt goes to a single giant machine.

That is not how modern inference platforms work.

Requests are distributed across fleets of machines, and large models are often spread across multiple GPUs or multiple hosts.

The provider is managing two things at the same time:

- quality of service for you
- throughput and utilization for itself

Those goals are related, but not identical.

## 3. The Text Gets Tokenized

Before the model can do anything useful, the text must be converted into tokens.

A model does not read words the way a person does.

It reads integer token IDs produced by a tokenizer such as BPE or SentencePiece.

That tokenization step matters for three reasons:

- pricing is based on tokens
- context limits are based on tokens
- inference cost grows with token count

This is also where developers often misread performance.

A prompt that "does not look that long" in plain English can still expand into a large token count once formatting, code, JSON, tool schemas, and conversation history are included.

The model never sees your prompt as a neat paragraph.

It sees a long stream of token IDs.

## 4. Prefill Is Where the Model Reads the Prompt

This is the first heavy compute stage.

During prefill, the model processes the entire input context and builds the internal state needed for generation. In transformer systems, this includes computing attention over the prompt and constructing the key-value cache used for later decoding.

This is why long prompts hurt time-to-first-token.

The model has to read the whole thing before it can start producing the answer.

If you send:

- a large system prompt
- a long conversation history
- tool definitions
- retrieved documents
- structured examples

you are increasing the amount of prefill work before generation even begins.

This is one reason prompt design affects latency as much as it affects quality.

## 5. Decode Is Where the Model Generates Tokens

After prefill, the model moves into decode.

This is the stage most people picture when they think about inference.

The model generates one token at a time, autoregressively. Each new token depends on the tokens that came before it.

That means output generation is inherently sequential in a way that prompt ingestion is not.

This is why long outputs can feel slow even after the first token appears.

The platform is not "holding back" the answer.

It is computing each next token, sampling from a probability distribution, updating state, and repeating that loop until it hits a stop condition.

Streaming makes this feel faster because the provider returns tokens as they are generated.

That improves perceived latency.

It does not remove the underlying decode cost.

## 6. This Work Runs on Expensive, Specialized Hardware

The middle of the request path is where the real cost lives.

Large-model inference runs on accelerators such as NVIDIA A100 and H100 class GPUs, often with large pools of high-bandwidth memory and high-speed interconnects between devices.

For smaller models, one accelerator may be enough.

For frontier-scale models, the work may be split across multiple GPUs because the weights, KV cache, and runtime memory demands are too large for a single device.

This is also why inference engineering matters so much.

The basic transformer attention mechanism is expensive in both memory and compute. Techniques such as FlashAttention improved this by reducing unnecessary memory traffic and making better use of GPU hardware. FlashAttention-2 reported substantial speedups over prior attention kernels on A100 GPUs.

The practical takeaway is simple:

much of modern LLM performance comes not only from better models, but from better systems work around those models.

## 7. Post-Processing Happens After Generation

Once the model has finished generating, the provider still has a few more steps to run:

- convert token IDs back into text
- apply output formatting
- run policy or safety checks
- detect stop sequences or truncation conditions
- package the result into JSON or a streaming event format
- record usage metadata

This part is usually not the dominant share of latency, but it is still part of the path.

If a provider supports structured outputs, tool calling, or safety filtering, some of that logic lives here.

## 8. Billing Happens at the End, but Cost Starts Much Earlier

From the user's point of view, billing appears at the end of the request.

From the platform's point of view, cost begins the moment the request is accepted and resources are allocated.

Providers typically meter:

- input tokens
- output tokens
- sometimes cached versus uncached input tokens

This is where prompt caching can matter. If the same long prompt prefix is reused, some providers can reduce both latency and input cost by reusing recent work.

That does not make inference free.

It does reduce repeated prompt overhead in workloads with large static prefixes, such as assistants with long system prompts or repeated tool instructions.

## Why Distance Still Matters

Even though inference dominates most user-visible latency, network physics still sets a floor.

Signals in optical fiber do not travel at the speed of light in vacuum. A useful engineering rule of thumb is about 4.9 microseconds per kilometer one way.

That means long-haul routes accumulate delay quickly, even before you account for routers, switches, and queueing.

But the more important point is that real internet paths are rarely straight.

Academic work on long-haul US fiber infrastructure found that conduit lengths are often materially longer than simple line-of-sight distance, and measured internet latency is often much worse than the ideal lower bound suggested by geography alone.

That extra delay comes from things like:

- circuitous fiber routes
- slack loops left for maintenance
- optical layer overhead
- routing policy choices
- congestion and queueing

So yes, distance matters.

But not in the naive way many people imagine.

The path between two cities is not a ruler line on a map. It is a business, physics, and infrastructure path.

## Why the Internet Is Usually Not the Main Bottleneck

If you are sending a short request to a provider in the same broad region, the public internet hop may only be a modest fraction of end-to-end latency.

The more expensive part is often:

- waiting for the request to enter the right queue
- processing a large prompt during prefill
- generating many output tokens during decode

In other words:

physics gives you a baseline, but compute gives you the bill.

That is why shrinking a prompt often helps latency more than obsessing over a few milliseconds of network distance.

## What You Can Actually Control

You cannot change the speed of light.

You can change a lot of other things.

### 1. Keep prompts smaller

Long prompts increase prefill time, token cost, and memory pressure.

If the model does not need a paragraph, do not send a paragraph.

### 2. Ask for shorter outputs

Long outputs increase decode time because generation is token-by-token.

If your UI only needs a concise answer, ask for one.

### 3. Choose the right model

A smaller model with lower latency is often the better product choice for classification, routing, extraction, and light summarization.

Do not use your largest model for every request by default.

### 4. Use streaming when UX matters

Streaming does not reduce total generation cost, but it improves perceived speed.

For chat, that often matters more than absolute completion time.

### 5. Put users near the region that serves them

If your traffic is concentrated in one geography, avoid adding unnecessary transcontinental hops.

Distance still matters at the margins.

### 6. Reuse prompt prefixes when possible

Prompt caching and repeated static prefixes can lower both latency and cost in some workloads.

## What This Means for Engineers

The hidden path behind an LLM API call matters because it changes how you design systems.

If you think the latency is "just network," you will optimize the wrong layer.

If you think the cost is "just model pricing," you will miss the effect of prompt size, output length, retries, and batching.

If you think streaming means the model is done faster, you will confuse perceived latency with total compute time.

The real engineering lesson is that an LLM call is not a magic function.

It is a distributed systems pipeline wrapped around an expensive autoregressive compute loop.

## Final Takeaways

- Most of the visible delay in an LLM API call happens inside the provider's infrastructure, not on the open internet.
- Long prompts mostly hurt prefill. Long outputs mostly hurt decode.
- Network physics sets a floor, but real-world routing makes that floor messier than simple geographic distance suggests.
- GPU memory, batching, and inference kernels matter because the model is doing heavy numerical work, not simple string processing.
- The most useful latency levers for application builders are usually prompt size, output length, model choice, streaming strategy, and regional placement.

When you press send, your request does travel far.

But the bigger story is what happens after it arrives.

That is where the milliseconds, the money, and the engineering tradeoffs live.

## Suggested Sources

- OpenAI, Prompt Caching docs: https://platform.openai.com/docs/guides/prompt-caching/prompt-caching
- OpenAI, Prompt Caching announcement: https://openai.com/index/api-prompt-caching/
- FlashAttention-2 paper: https://arxiv.org/abs/2307.08691
- Dissecting Latency in the Internet's Fiber Infrastructure: https://arxiv.org/abs/1811.10737
- InterTubes paper overview: https://dl.acm.org/doi/10.1145/2785956.2787499
