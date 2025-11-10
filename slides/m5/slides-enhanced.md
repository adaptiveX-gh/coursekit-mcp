---
theme: default
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## Module 5: Managing Flow of Work
  ICP-BAF Business Agility Foundations
  90-minute workshop on Lean Systems, Kanban, and Flow-based practices
  Enhanced with NaiveUI components for visual appeal and interactivity
drawings:
  persist: false
transition: slide-left
title: Module 5 - Managing Flow of Work (Enhanced)
mdc: true
---

<script setup>
import { NButton, NH1, NText } from 'naive-ui'
</script>

<NH1>Module 5: Managing Flow of Work</NH1>

<NText depth="2" class="text-xl mt-4" style="display: block;">
ICP-BAF Business Agility Foundations
</NText>

<div class="mt-12">
  <NButton type="primary" size="large" @click="$slidev.nav.next">
    Begin Workshop <carbon:arrow-right class="inline ml-2"/>
  </NButton>
</div>

<!--
Welcome to Module 5. We're now at a critical juncture in your business agility journey. You've explored mindset, vision, team alignment, and testing ideas. Today we focus on how work actually flows through your organization—and how to optimize that flow to deliver value faster and more reliably.
-->

---
layout: default
---

<script setup>
import { NH1, NH2, NText, NSpace } from 'naive-ui'
</script>

<NH1>Why Flow Matters for Agility</NH1>

<NH2 class="mt-8">The Heart of Business Agility</NH2>

<NSpace vertical size="large" class="mt-8">
  <NText>
    You can have great vision and strong teams, but if work gets stuck, business agility fails.
  </NText>

  <blockquote class="text-2xl text-primary" v-click>
    <NText type="primary" strong italic>
      "Flow is the movement of customer value through a system."
    </NText>
    <br/>
    <NText depth="3">— Mary and Tom Poppendieck</NText>
  </blockquote>

  <NText strong class="text-lg" v-click>
    Managing flow is about making work visible, eliminating waste, limiting work-in-progress, and measuring what matters. It's how strategy becomes reality.
  </NText>
</NSpace>

<!--
Think about water flowing through a river. When the river is clear and unobstructed, water flows smoothly. Add rocks, debris, and blockages, and flow slows or stops. Your organization is the same. Today we'll learn to see and remove the obstacles that block flow.
-->

---
layout: default
---

<script setup>
import { NH1, NGrid, NGi, NCard, NText } from 'naive-ui'
</script>

<NH1>Learning Outcomes for Today</NH1>

<NGrid :cols="24" x-gap="16" y-gap="16" class="mt-8">
  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>📊 Lean Systems Thinking</NText>
      <NText depth="3" class="mt-2">Discuss how it enables business agility</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>🗑️ Identify 7 Wastes</NText>
      <NText depth="3" class="mt-2">In your own work processes</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>📋 Kanban Values & Practices</NText>
      <NText depth="3" class="mt-2">9 values and 4 core practices</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>🛠️ Create Kanban Board</NText>
      <NText depth="3" class="mt-2">For your work process with WIP limits</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>⚖️ Iterative vs Flow Frameworks</NText>
      <NText depth="3" class="mt-2">Scrum vs Kanban - when to use each</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="12" :lg="12" v-click>
    <NCard size="small" hoverable>
      <NText strong>📈 Leading Indicators</NText>
      <NText depth="3" class="mt-2">Why they matter more than lagging</NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :sm="24" :lg="24" v-click>
    <NCard size="small" type="primary">
      <NText strong>💎 Make Customer Value Visible</NText>
      <NText depth="3" class="mt-2">Through value stream thinking</NText>
    </NCard>
  </NGi>
</NGrid>

<!--
These outcomes align directly with ICP-BAF certification requirements. Notice the blend of understanding and doing—you'll not just learn about kanban, you'll build a board for your real work. This is practical, hands-on learning.
-->

---
layout: default
---

<script setup>
import { NH1, NSpace, NDivider, NText } from 'naive-ui'
</script>

<NH1>Workshop Roadmap</NH1>

<NSpace vertical size="large" class="mt-8">
  <div v-click>
    <NText strong class="text-xl">1. History of Lean Thinking</NText>
    <NText depth="3" class="ml-8">From Toyota to knowledge work</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">2. Lean Systems Thinking</NText>
    <NText depth="3" class="ml-8">End-to-end perspective and 7 Wastes</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">3. Making Value Visible</NText>
    <NText depth="3" class="ml-8">Value streams and customer outcomes</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">4. Kanban Values & Practices</NText>
    <NText depth="3" class="ml-8">Visualize, limit WIP, lead with flow</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">5. Iterative vs Flow Frameworks</NText>
    <NText depth="3" class="ml-8">When to use each</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">6. Leading vs Lagging Indicators</NText>
    <NText depth="3" class="ml-8">Metrics that matter</NText>
  </div>

  <NDivider dashed />

  <div v-click>
    <NText strong class="text-xl">7. Flow as Foundation</NText>
    <NText depth="3" class="ml-8">Connecting to business agility</NText>
  </div>
</NSpace>

<NText depth="3" class="mt-8" v-click>
  <strong>Interactive Elements:</strong> 4 hands-on activities throughout
</NText>

<!--
We'll move through these topics with a mix of frameworks, real examples, and practical activities. By the end, you'll have tools you can apply immediately to improve flow in your work.
-->

---
layout: center
---

<script setup>
import { NH1, NDivider } from 'naive-ui'
</script>

<NH1>History of Lean Thinking</NH1>

<NDivider>From the factory floor to knowledge work</NDivider>

---
layout: two-cols
layoutClass: gap-16
---

<script setup>
import { NH2, NText, NSpace } from 'naive-ui'
</script>

<NH2>Origins: The Toyota Production System</NH2>

<NH3 class="mt-4">Post-WWII Japan: The Birth of Lean</NH3>

::left::

<NSpace vertical size="medium" class="mt-4">
  <div>
    <NText type="error" strong>The Challenge:</NText>
    <ul class="mt-2">
      <li>Japan, 1950s: Limited resources, small market</li>
      <li>American mass production required large scale</li>
      <li>Toyota needed a different approach</li>
    </ul>
  </div>
</NSpace>

::right::

<NSpace vertical size="medium" class="mt-4">
  <div>
    <NText type="success" strong>The Innovation - Taiichi Ohno & TPS:</NText>
    <ul class="mt-2">
      <li>Focus on eliminating waste (muda)</li>
      <li>Respect for people and continuous improvement (kaizen)</li>
      <li>Just-in-time production</li>
      <li>Built-in quality (jidoka)</li>
      <li>Pull systems over push systems</li>
    </ul>
  </div>

  <NText type="primary" strong class="mt-4">
    💡 Key Insight: Small batches, continuous flow, and worker empowerment beat mass production
  </NText>
</NSpace>

<!--
Taiichi Ohno, Toyota's chief engineer, revolutionized manufacturing. American companies produced in huge batches—make 10,000 units, then switch to make something else. Toyota realized smaller batches with continuous improvement were faster and higher quality. By the 1980s, Toyota was outcompeting Detroit on quality, cost, and speed.
-->

---
layout: default
---

<script setup>
import { NH1, NTabs, NTabPane, NText, NSpace } from 'naive-ui'
import { ref } from 'vue'

const activeTab = ref('pillar1')
</script>

<NH1>The Two Pillars of TPS</NH1>

<NTabs v-model:value="activeTab" type="card" size="large" class="mt-8" justify-content="center">
  <NTabPane name="pillar1" tab="🧑‍🤝‍🧑 Respect for People">
    <NSpace vertical size="large" class="p-6">
      <NText strong class="text-xl">Pillar 1: Respect for People</NText>
      <ul class="text-lg">
        <li>Workers closest to the work know best</li>
        <li>Anyone can stop the line to fix problems</li>
        <li>Continuous learning and improvement</li>
        <li>Psychological safety to surface issues</li>
        <li>Empowerment over command-and-control</li>
      </ul>
      <NText type="primary" depth="2" class="mt-4">
        This pillar laid the foundation for modern psychological safety concepts and self-organizing teams.
      </NText>
    </NSpace>
  </NTabPane>

  <NTabPane name="pillar2" tab="📈 Continuous Improvement">
    <NSpace vertical size="large" class="p-6">
      <NText strong class="text-xl">Pillar 2: Continuous Improvement (Kaizen)</NText>
      <ul class="text-lg">
        <li>Small, incremental improvements every day</li>
        <li>Experimentation encouraged</li>
        <li>Learn from problems, don't hide them</li>
        <li>Gemba (go see) - leaders observe actual work</li>
        <li>Standardize, then improve</li>
      </ul>
      <NText type="success" depth="2" class="mt-4">
        The cycle of continuous improvement became the foundation for modern agile practices and iterative development.
      </NText>
    </NSpace>
  </NTabPane>
</NTabs>

<NText depth="3" class="mt-6" v-click>
  <strong>Connection to Business Agility:</strong> These same pillars enable organizational agility - empowered teams continuously learning and adapting.
</NText>

<!--
These two pillars might sound familiar - they're the foundation of modern agile practices. Respect for people translates to psychological safety and self-organizing teams. Kaizen translates to inspect-and-adapt cycles, retrospectives, and continuous delivery. Toyota figured this out in manufacturing decades before we applied it to software and knowledge work.
-->

---
layout: default
---

<script setup>
import { NH1, NCarousel, NCarouselItem, NCard, NText } from 'naive-ui'
</script>

<NH1>From Manufacturing to Knowledge Work</NH1>

<NCarousel autoplay :interval="4000" show-arrow effect="fade" class="mt-8" style="height: 400px;">
  <NCarouselItem>
    <NCard title="1990s: Lean Manufacturing Spreads" size="large">
      <NText>
        • Lean principles move beyond Toyota to global manufacturing<br/>
        • Focus on eliminating waste, pull systems, and continuous flow<br/>
        • Books like "The Machine That Changed the World" popularize TPS<br/>
        • American manufacturers begin Toyota-style transformations
      </NText>
    </NCarouselItem>

  <NCarouselItem>
    <NCard title="2000s: Lean Software Development" size="large">
      <NText>
        • Mary and Tom Poppendieck adapt Lean to software (2003)<br/>
        • Kanban method for knowledge work emerges (David Anderson)<br/>
        • Integration with Agile principles<br/>
        • Emphasis shifts from physical flow to information flow
      </NText>
    </NCarouselItem>

  <NCarouselItem>
    <NCard title="2010s: DevOps and Value Streams" size="large">
      <NText>
        • Value stream mapping for software delivery<br/>
        • Continuous delivery and deployment pipelines<br/>
        • "The Phoenix Project" brings Lean to IT operations<br/>
        • Theory of Constraints applied to development workflows
      </NText>
    </NCarouselItem>

  <NCarouselItem>
    <NCard title="Today: Lean Everywhere" size="large" type="primary">
      <NText>
        • Lean Startup for entrepreneurship and innovation<br/>
        • Lean UX for design and product development<br/>
        • Business agility frameworks incorporate Lean thinking<br/>
        • Focus on rapid experimentation and validated learning
      </NText>
    </NCard>
  </NCarouselItem>
</NCarousel>

<NText depth="3" class="mt-4">
  <strong>Key Principle:</strong> The fundamentals (eliminate waste, respect people, continuous improvement) remain constant across domains.
</NText>

<!--
Lean thinking started in manufacturing but the principles are universal. When Mary and Tom Poppendieck wrote "Lean Software Development" in 2003, they translated concepts like "inventory" to "partially done work" and "defects" to "bugs." The Kanban method emerged as a way to visualize knowledge work flow. Today, whether you're building software, designing products, or running a startup, Lean principles provide a foundation for business agility.
-->

---
layout: two-cols
layoutClass: gap-16
---

<script setup>
import { NH2, NTabs, NTabPane, NText } from 'naive-ui'
import { ref } from 'vue'

const comparisonTab = ref('traditional')
</script>

<NH2>Why Lean Matters Now</NH2>

<NTabs v-model:value="comparisonTab" type="card" class="mt-8">
  <NTabPane name="traditional" tab="Traditional Approach">
    <div class="p-4">
      <NText type="error" strong class="text-lg">Traditional Management:</NText>
      <ul class="mt-4">
        <li>Optimize individual productivity</li>
        <li>Keep everyone 100% busy</li>
        <li>Large batches for "efficiency"</li>
        <li>Handoffs between specialists</li>
        <li>Hidden delays and waiting</li>
        <li>Blame individuals for problems</li>
      </ul>
      <NText type="error" class="mt-4">
        ❌ Result: Local optimization, system-level waste, slow delivery
      </NText>
    </div>
  </NTabPane>

  <NTabPane name="lean" tab="Lean Approach">
    <div class="p-4">
      <NText type="success" strong class="text-lg">Lean Systems Thinking:</NText>
      <ul class="mt-4">
        <li>Optimize end-to-end flow</li>
        <li>Limit work-in-progress (WIP)</li>
        <li>Small batches for fast feedback</li>
        <li>Cross-functional teams</li>
        <li>Make delays visible</li>
        <li>Fix systemic problems</li>
      </ul>
      <NText type="success" class="mt-4">
        ✅ Result: System optimization, waste elimination, rapid delivery
      </NText>
    </div>
  </NTabPane>
</NTabs>

<!--
Here's the fundamental insight: optimizing parts of a system often makes the whole system slower. Imagine a highway where one lane moves at 100mph while the others are stopped - the average speed is terrible. Lean teaches us to optimize the system, not the parts. This means sometimes people aren't "busy" - and that's okay, because work flows faster through the system. This counterintuitive insight is critical for business agility.
-->

---
layout: center
---

<NH1>NUMMI: Proof That Culture Beats Process</NH1>

<div class="mt-8 max-w-4xl mx-auto">
  <NCard hoverable>
    <template #header>
      <NText strong class="text-xl">New United Motor Manufacturing, Inc. (1984-2010)</NText>
    </template>

    <NSpace vertical size="large">
      <div>
        <NText type="error" strong>1982: GM Fremont Plant</NText>
        <NText depth="3" class="ml-4">• Worst quality in GM • Highest absenteeism (20%+) • Adversarial labor relations • Closed due to poor performance</NText>
      </div>

      <NDivider />

      <div>
        <NText type="warning" strong>1984: GM-Toyota Joint Venture</NText>
        <NText depth="3" class="ml-4">• Same facility, same union, 85% same workers • Toyota brings TPS culture and practices • Focus on respect and continuous improvement</NText>
      </div>

      <NDivider />

      <div>
        <NText type="success" strong>Result: Transformation</NText>
        <NText depth="3" class="ml-4">• Best quality in GM within 2 years • Lowest absenteeism (2%) • Workers stopping the line to fix problems • Proof that culture and systems matter more than people</NText>
      </div>
    </NSpace>

    <template #footer>
      <NText type="primary" strong>
        💡 Key Lesson: Change the system and culture, not the people. The same workers produced drastically different results under different management approaches.
      </NText>
    </template>
  </NCard>
</div>

<!--
The NUMMI story is one of the most powerful examples of systemic thinking. GM executives visited NUMMI, saw the results, and thought "we need to copy these processes." But they missed the point - it wasn't the processes alone, it was the culture of respect, empowerment, and continuous improvement. When GM tried to replicate NUMMI elsewhere without the cultural foundation, it failed. This teaches us that you can't install Lean or Agile by copying practices - you need to transform the underlying culture and system.
-->

---
layout: center
---

<script setup>
import { NH1, NButton } from 'naive-ui'
</script>

<NH1>Lean Systems Thinking Deep Dive</NH1>

<div class="mt-8">
  <NButton type="primary" size="large" @click="$slidev.nav.next">
    Explore Lean Systems →
  </NButton>
</div>

---
layout: default
---

<script setup>
import { NH1, NCarousel, NCarouselItem, NCard, NText, NSpace } from 'naive-ui'
</script>

<NH1>The 7 Wastes of Lean (TIMWOOD)</NH1>

<NCarousel autoplay :interval="5000" show-arrow show-dots class="mt-8" style="height: 450px;">
  <NCarouselItem>
    <NCard title="1️⃣ Transport" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Moving things around unnecessarily</NText>
        <NText depth="3">Manufacturing: Moving parts between warehouses</NText>
        <NText depth="3">Knowledge Work: Context switching, handoffs between teams, information scattered across tools</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Co-locate teams, reduce handoffs, integrate tools, make information easily accessible
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="2️⃣ Inventory" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Excess work sitting idle</NText>
        <NText depth="3">Manufacturing: Raw materials or finished goods in storage</NText>
        <NText depth="3">Knowledge Work: Partially done features, unmerged code, backlog bloat, pending approvals</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Limit WIP, smaller batches, just-in-time development, continuous deployment
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="3️⃣ Motion" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Unnecessary movement of people</NText>
        <NText depth="3">Manufacturing: Workers walking to get tools, reaching for parts</NText>
        <NText depth="3">Knowledge Work: Searching for information, hunting for files, attending unnecessary meetings</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Organize workspace, documentation at point of use, eliminate wasteful meetings
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="4️⃣ Waiting" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Idle time waiting for something</NText>
        <NText depth="3">Manufacturing: Machines waiting for materials, workers waiting for approvals</NText>
        <NText depth="3">Knowledge Work: Waiting for code reviews, approvals, builds, environments, responses</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Automate, parallelize, eliminate approval bottlenecks, make dependencies visible
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="5️⃣ Overproduction" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Making more than needed</NText>
        <NText depth="3">Manufacturing: Producing beyond customer demand</NText>
        <NText depth="3">Knowledge Work: Gold-plating features, building what wasn't requested, comprehensive documentation nobody reads</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Build only what's needed, validate with customers first, MVP mindset
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="6️⃣ Over-processing" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Doing more work than necessary</NText>
        <NText depth="3">Manufacturing: More precise tolerances than required</NText>
        <NText depth="3">Knowledge Work: Excessive meetings, redundant approvals, over-engineering, report formatting nobody needs</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Question every step, simplify processes, eliminate redundant reviews
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="7️⃣ Defects" type="warning" size="large">
      <NSpace vertical size="medium">
        <NText strong>Errors requiring rework</NText>
        <NText depth="3">Manufacturing: Products that fail quality checks</NText>
        <NText depth="3">Knowledge Work: Bugs, incorrect requirements, misunderstood user needs, technical debt</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Build quality in, automated testing, early feedback, definition of done
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>

  <NCarouselItem>
    <NCard title="➕ Bonus: Unused Talent" type="error" size="large">
      <NSpace vertical size="medium">
        <NText strong>Not utilizing people's skills and ideas</NText>
        <NText depth="3">The "8th waste" added later to TPS</NText>
        <NText depth="3">Knowledge Work: Top-down decisions, ignoring frontline expertise, not empowering teams, bureaucracy preventing innovation</NText>
        <NText type="error" class="mt-4">
          💡 Fix: Self-organizing teams, psychological safety, bottom-up innovation, respect for people
        </NText>
      </NSpace>
    </NCard>
  </NCarouselItem>
</NCarousel>

<!--
The 7 Wastes (TIMWOOD) are the foundation of Lean thinking. Toyota identified these patterns of waste in manufacturing, but they translate perfectly to knowledge work. The key insight: waste is anything that doesn't add value for the customer. In knowledge work, the biggest wastes are often Waiting (for approvals, reviews, environments) and Inventory (partially done work). The 8th waste - Unused Talent - is particularly relevant to business agility. If you're not empowering teams to innovate and solve problems, you're wasting your most valuable resource.
-->

---
layout: default
---

<script setup>
import { NH1, NCard, NButton, NText } from 'naive-ui'
</script>

<NH1>Activity 1: Identify the Waste</NH1>

<NCard
  title="🔍 Hands-On Exercise: Map Waste in Your Process"
  size="large"
  type="warning"
  style="border: 4px solid var(--n-border-color); margin-top: 2rem;"
>
  <NText strong class="text-xl">Duration: 7 minutes</NText>

  <div class="mt-6">
    <NText strong>Instructions:</NText>
    <ol class="mt-2 text-lg">
      <li>Think of your current work process (feature development, project approval, customer onboarding, etc.)</li>
      <li>On paper or digital tool, create 7 columns labeled with TIMWOOD</li>
      <li>For each waste type, identify 1-2 specific examples from your process</li>
      <li>Circle the waste that causes the biggest delays or frustration</li>
      <li>Share one key insight with your partner</li>
    </ol>
  </div>

  <div class="mt-6">
    <NText type="primary" strong>Reflection Question:</NText>
    <NText depth="2" class="mt-2">If you could eliminate ONE type of waste from your process today, which would have the biggest impact on delivery speed?</NText>
  </div>

  <template #footer>
    <div class="flex justify-between items-center">
      <NText depth="3">⏱️ Set timer for 7 minutes</NText>
      <NButton type="primary" size="large">
        Start Activity
      </NButton>
    </div>
  </template>
</NCard>

<!--
Facilitation tips: Walk around and observe. Common patterns you'll see: Waiting is almost always the biggest waste in knowledge work, followed by Inventory (partially done work). If teams struggle, ask: "Where does work sit idle?" or "What do you wait for most often?" After the activity, ask 2-3 people to share their biggest waste. You'll likely hear: waiting for approvals, context switching, meetings, unclear requirements. Use these as examples to reinforce the concepts.
-->

---
layout: center
---

<NH1>Making Value Visible</NH1>

<NText class="text-xl mt-4">Value streams and customer outcomes</NText>

<NButton type="primary" class="mt-8" size="large" @click="$slidev.nav.next">
  Continue to Value Mapping →
</NButton>

---

<NH1>Key Principle: Value is Delivered Through Completion</NH1>

<NGrid :cols="24" x-gap="16" y-gap="16" class="mt-8">
  <NGi :xs="24" :lg="12">
    <NCard title="❌ NOT Value" type="error" hoverable>
      <ul>
        <li>Features started but not finished</li>
        <li>Code written but not deployed</li>
        <li>Requirements documented but not built</li>
        <li>Designs created but not implemented</li>
        <li>Tests written but not run</li>
      </ul>
      <NText type="error" class="mt-4" strong>
        Until the customer can use it, there's NO value - only inventory (waste)
      </NText>
    </NCard>
  </NGi>

  <NGi :xs="24" :lg="12">
    <NCard title="✅ Actual Value" type="success" hoverable>
      <ul>
        <li>Working software in production</li>
        <li>Customer using the feature</li>
        <li>Problem solved end-to-end</li>
        <li>Benefit realized and measured</li>
        <li>Learning validated</li>
      </ul>
      <NText type="success" class="mt-4" strong>
        Value = Completed functional slice + Delivered to customer + Benefit measured
      </NText>
    </NCard>
  </NGi>
</NGrid>

<NText class="mt-6" depth="3">
  <strong>Implication:</strong> Stop rewarding "busy work." Start measuring completion and customer outcomes.
</NText>

<!--
This is perhaps the most important slide in the module. Most organizations measure activity (lines of code, story points, hours worked) instead of outcomes (customer value delivered). If you have 10 features 90% complete, you have ZERO value - just waste. If you have 1 feature 100% complete and in customers' hands, you have value. This is why Lean and Agile emphasize small batches and frequent delivery - you want to convert work to value as quickly as possible. Ask the room: "How does your organization measure progress? Activity or outcomes?"
-->

---

This is a comprehensive starting point showing the first ~20 slides with extensive NaiveUI integration. The file demonstrates:

✅ **NButton** for CTAs and navigation
✅ **NCard** with different types for visual distinction
✅ **NGrid/NGi** for responsive layouts
✅ **NTabs** for comparisons (Traditional vs Lean, TPS Pillars)
✅ **NCarousel** for the 7 Wastes and evolution timeline
✅ **NSpace** for consistent spacing
✅ **NDivider** for section separators
✅ **NH1/NH2/NText** for semantic typography
✅ **Activity cards** with distinct styling

Due to the length, I'll continue adding the remaining sections (Kanban, frameworks, metrics, activities 2-4, and closing) in incremental updates. Would you like me to continue building out the complete 59-slide presentation, or would you prefer to review this enhanced version first?
