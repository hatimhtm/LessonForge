/**
 * LessonForge — Demo Data
 * Generic lesson content for showcase purposes.
 * Users can import their own content via JSON.
 */

export const defaultPages = [
    {
        id: 'p1',
        title: 'Warm-Up',
        content: `
            <h1>Warm-Up Activities</h1>
            <h2>1. Greetings & Small Talk</h2>
            <p>Start by asking the student about their week. Use <span class="hl-green">open-ended questions</span> to encourage longer responses.</p>
            <ul>
                <li>How was your weekend? What did you do?</li>
                <li>Have you been practicing since our last session?</li>
                <li>Is there anything specific you'd like to work on today?</li>
            </ul>

            <h2>2. Quick Review</h2>
            <p>Review <span class="hl-blue">key vocabulary</span> from the previous lesson:</p>
            <ul>
                <li>Ask the student to use 3 words from last session in new sentences</li>
                <li>Check pronunciation of any tricky words</li>
                <li>Briefly revisit any grammar points that were challenging</li>
            </ul>

            <blockquote>💡 Tip: Keep the warm-up to 5–7 minutes. Set a timer!</blockquote>
        `
    },
    {
        id: 'p2',
        title: 'Vocabulary',
        content: `
            <h1>Vocabulary Building</h1>
            <h2>Today's Theme: Travel & Transportation</h2>

            <h3>Core Words</h3>
            <ul>
                <li><span class="hl-green">Itinerary</span> — A planned route or journey</li>
                <li><span class="hl-green">Destination</span> — The place someone is going to</li>
                <li><span class="hl-green">Accommodation</span> — A place to stay (hotel, hostel, etc.)</li>
                <li><span class="hl-green">Departure</span> — The act of leaving</li>
                <li><span class="hl-green">Commute</span> — Regular travel between home and work</li>
            </ul>

            <h3>Practice Activities</h3>
            <ol>
                <li>Describe your <span class="hl-blue">ideal vacation itinerary</span></li>
                <li>Role-play: <span class="hl-orange">Booking a hotel room</span></li>
                <li>Compare two modes of transportation — pros and cons</li>
            </ol>

            <h3>Common Mistakes</h3>
            <p><span class="hl-pink">"I went to travel"</span> → <span class="hl-green">"I went traveling"</span> or <span class="hl-green">"I took a trip"</span></p>
        `
    },
    {
        id: 'p3',
        title: 'Grammar',
        content: `
            <h1>Grammar Focus</h1>
            <h2>Present Perfect vs. Past Simple</h2>

            <h3>When to Use Present Perfect</h3>
            <p>Use <span class="hl-blue">have/has + past participle</span> when:</p>
            <ul>
                <li>The <span class="hl-green">exact time doesn't matter</span>: "I have visited Paris."</li>
                <li>The action <span class="hl-green">connects to now</span>: "I have lost my keys." (still lost)</li>
                <li>With <span class="hl-orange">ever, never, already, yet, just</span></li>
            </ul>

            <h3>When to Use Past Simple</h3>
            <p>Use <span class="hl-purple">past tense</span> when:</p>
            <ul>
                <li>You mention a <span class="hl-pink">specific time</span>: "I visited Paris in 2019."</li>
                <li>The action is <span class="hl-pink">finished and done</span>: "I lost my keys yesterday."</li>
            </ul>

            <h3>Practice Sentences</h3>
            <ol>
                <li>"I _____ (eat) sushi before." → <span class="hl-green">have eaten</span></li>
                <li>"She _____ (go) to London last year." → <span class="hl-purple">went</span></li>
                <li>"We _____ (not/see) that movie yet." → <span class="hl-green">haven't seen</span></li>
            </ol>
        `
    },
    {
        id: 'p4',
        title: 'Speaking',
        content: `
            <h1>Speaking Practice</h1>
            <h2>Guided Conversation</h2>

            <h3>Discussion Questions</h3>
            <ol>
                <li>What is the most interesting place you have <span class="hl-green">ever</span> visited?</li>
                <li>Do you prefer traveling alone or with friends? Why?</li>
                <li>How has transportation in your city changed over the years?</li>
                <li>If you could live in any country for a year, where would you go?</li>
            </ol>

            <h3>Role-Play Scenarios</h3>
            <ul>
                <li><span class="hl-orange">At the Airport</span>: Check-in, going through security, asking for directions</li>
                <li><span class="hl-blue">Hotel Problems</span>: Complaining about a noisy room, requesting a late checkout</li>
            </ul>

            <blockquote>📝 Note: Correct errors gently. Write down recurring mistakes for the wrap-up.</blockquote>
        `
    },
    {
        id: 'p5',
        title: 'Wrap-Up',
        content: `
            <h1>Wrap-Up & Homework</h1>
            <h2>Session Summary</h2>
            <p>Review what was covered today:</p>
            <ul>
                <li>Vocabulary: Travel & Transportation (5 core words)</li>
                <li>Grammar: Present Perfect vs. Past Simple</li>
                <li>Speaking: Discussion + Role-play</li>
            </ul>

            <h2>Homework</h2>
            <ol>
                <li>Write a short paragraph (80–100 words) about a <span class="hl-green">memorable trip</span></li>
                <li>Use at least <span class="hl-blue">3 new vocabulary words</span></li>
                <li>Include <span class="hl-purple">2 present perfect sentences</span></li>
            </ol>

            <h2>Next Session Preview</h2>
            <p><span class="hl-orange">Topic: Food & Restaurant Culture</span></p>
            <p>We'll practice ordering food, describing dishes, and expressing preferences.</p>
        `
    }
];

export const defaultTools = [
    { id: 't1', type: 'grammar', tag: 'GRAM', text: 'Subject-Verb agreement: "She goes" not "She go"' },
    { id: 't2', type: 'grammar', tag: 'GRAM', text: 'Articles: Use "the" for specific, "a/an" for general' },
    { id: 't3', type: 'vocabulary', tag: 'VOCAB', text: 'Word families: teach/teacher/teaching/teachable' },
    { id: 't4', type: 'vocabulary', tag: 'VOCAB', text: 'Collocations: "make a decision" not "do a decision"' },
    { id: 't5', type: 'connectors', tag: 'CONN', text: 'However, Moreover, Furthermore, In addition, Nevertheless' },
    { id: 't6', type: 'connectors', tag: 'CONN', text: 'Cause & effect: because, due to, as a result, therefore' },
    { id: 't7', type: 'pronunciation', tag: 'PRON', text: 'Minimal pairs: ship/sheep, bit/beat, full/fool' },
    { id: 't8', type: 'pronunciation', tag: 'PRON', text: 'Word stress patterns: PHOtograph vs photOgraphy' },
];

export const defaultCategories = ['grammar', 'vocabulary', 'connectors', 'pronunciation'];

export const defaultChecklist = [
    'Review previous homework',
    'Introduce new vocabulary',
    'Grammar explanation + examples',
    'Guided practice activity',
    'Free speaking exercise',
    'Error correction review',
    'Assign homework',
];

export const defaultStudents = [];

// ═══════════════════════════════════════════════════
// Starter lesson templates — appended on user pick
// ═══════════════════════════════════════════════════
export const lessonTemplates = [
    {
        id: 'tpl-conversation',
        title: 'Conversation Class',
        icon: 'fa-comments',
        description: '60-min talking practice with prompts, follow-ups, and feedback.',
        pages: [
            {
                title: 'Warm-Up · Conversation',
                content: `<h1>Conversation Warm-Up</h1><p>Pick one and spend 5 minutes:</p><ul><li>What's something new you tried this week?</li><li>If you could teleport anywhere right now, where?</li><li>Describe a meal that made you happy.</li></ul><blockquote>Goal: relaxed flow, not perfect grammar.</blockquote>`,
            },
            {
                title: 'Prompts · Speaking',
                content: `<h1>Speaking Prompts</h1><h3>Agree / Disagree</h3><ul><li>Working from home is better than the office.</li><li>Social media has done more harm than good.</li><li>Cities are better than the countryside.</li></ul><h3>Story Builder</h3><p>Student tells a 2-minute story from <span class="hl-blue">three random words</span>: <em>bridge · stranger · umbrella</em>.</p>`,
            },
            {
                title: 'Feedback',
                content: `<h1>Feedback & Correction</h1><p>Note <span class="hl-green">3 things they did well</span>, and <span class="hl-pink">3 things to improve</span>.</p><ul><li>Pronunciation:</li><li>Grammar:</li><li>Vocabulary gap:</li></ul>`,
            },
        ],
    },
    {
        id: 'tpl-grammar',
        title: 'Grammar Focus',
        icon: 'fa-spell-check',
        description: 'Tense or structure deep-dive with examples + drills.',
        pages: [
            {
                title: 'Warm-Up · Grammar',
                content: `<h1>Warm-Up</h1><p>Find the mistake in each sentence:</p><ol><li>I'm working here since 2020.</li><li>She don't likes coffee.</li><li>If I would have known, I would tell you.</li></ol>`,
            },
            {
                title: 'Concept · Present Perfect',
                content: `<h1>Present Perfect</h1><p><strong>Form:</strong> have / has + past participle</p><h3>Used for</h3><ul><li>Experience: <em>I've been to Japan.</em></li><li>Unfinished time: <em>I've worked here for 3 years.</em></li><li>Recent past: <em>She's just left.</em></li></ul>`,
            },
            {
                title: 'Drills',
                content: `<h1>Practice Drills</h1><ol><li>Have you ever ___ (eat) sushi?</li><li>She ___ (live) in Paris for 5 years now.</li><li>They ___ just ___ (arrive) at the airport.</li></ol>`,
            },
        ],
    },
    {
        id: 'tpl-business',
        title: 'Business English',
        icon: 'fa-briefcase',
        description: 'Meetings, emails, presentations — workplace vocabulary.',
        pages: [
            {
                title: 'Vocab · Meetings',
                content: `<h1>Meeting Vocabulary</h1><ul><li><span class="hl-green">Agenda</span> — the list of items to discuss</li><li><span class="hl-green">Stakeholder</span> — someone affected by the decision</li><li><span class="hl-green">Deliverable</span> — a concrete result</li><li><span class="hl-green">Action item</span> — a task assigned in the meeting</li><li><span class="hl-green">Circle back</span> — return to a topic later</li></ul>`,
            },
            {
                title: 'Roleplay · Email',
                content: `<h1>Email Roleplay</h1><p>Write a polite reply to this email:</p><blockquote>"Hi — just following up on the proposal. Can you send the revised numbers by EOD?"</blockquote><p>Use: <em>apologise for delay · attach · confirm timeline · sign off</em>.</p>`,
            },
            {
                title: 'Presentation Skills',
                content: `<h1>Presenting in English</h1><h3>Useful phrases</h3><ul><li>"I'd like to walk you through…"</li><li>"As you can see on this slide…"</li><li>"Let me come back to that in a moment."</li><li>"To wrap up…"</li></ul>`,
            },
        ],
    },
    {
        id: 'tpl-exam',
        title: 'Exam Prep (IELTS / TOEFL)',
        icon: 'fa-graduation-cap',
        description: 'Timed practice across the four exam skills.',
        pages: [
            {
                title: 'Speaking · Part 2',
                content: `<h1>IELTS Speaking — Part 2</h1><p><strong>Task:</strong> Speak for 1–2 minutes about a place you'd like to visit.</p><p>Cover:</p><ul><li>Where it is</li><li>Why you want to go</li><li>What you'd do there</li><li>Who you'd go with</li></ul>`,
            },
            {
                title: 'Writing · Task 2',
                content: `<h1>Writing Task 2</h1><blockquote>Some people believe technology has made us less social. To what extent do you agree?</blockquote><p>Plan: <em>intro · agree side · counter-argument · conclusion</em>. 40 minutes, 250 words.</p>`,
            },
            {
                title: 'Listening Strategy',
                content: `<h1>Listening — Quick Tips</h1><ul><li>Read questions <strong>before</strong> the audio starts.</li><li>Underline keywords — names, numbers, dates.</li><li>Don't get stuck on one question — keep moving.</li><li>Watch for distractors: speakers often change their mind.</li></ul>`,
            },
        ],
    },
    {
        id: 'tpl-beginner',
        title: 'Absolute Beginner',
        icon: 'fa-seedling',
        description: 'First-lesson scaffolding for A0/A1 students.',
        pages: [
            {
                title: 'Hello & Names',
                content: `<h1>Greetings</h1><ul><li>Hello / Hi / Good morning</li><li>What's your name? — My name is ___.</li><li>Nice to meet you.</li><li>How are you? — I'm fine, thanks.</li></ul><p><strong>Practice:</strong> roleplay meeting 3 times with different greetings.</p>`,
            },
            {
                title: 'Numbers 1–20',
                content: `<h1>Numbers</h1><p>1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten</p><p>11 eleven · 12 twelve · 13 thirteen · 14 fourteen · 15 fifteen · 16 sixteen · 17 seventeen · 18 eighteen · 19 nineteen · 20 twenty</p>`,
            },
            {
                title: 'Verb "to be"',
                content: `<h1>The verb "to be"</h1><ul><li>I <strong>am</strong> a teacher.</li><li>You <strong>are</strong> a student.</li><li>He / She / It <strong>is</strong> happy.</li><li>We / You / They <strong>are</strong> friends.</li></ul>`,
            },
        ],
    },
    {
        id: 'tpl-kids',
        title: 'Young Learners',
        icon: 'fa-child-reaching',
        description: 'Game-driven 30-min lesson — songs, flashcards, movement.',
        pages: [
            {
                title: 'Warm-Up · Song',
                content: `<h1>Hello Song</h1><p>Sing "Hello, hello, how are you?" with actions. Repeat 2x.</p><p>Then ask each kid: "What's your name?" / "How old are you?"</p>`,
            },
            {
                title: 'Flashcards · Animals',
                content: `<h1>Animal Flashcards</h1><p>Show cards one by one. Kids shout the name. Then play <strong>Simon Says</strong>: "Simon says jump like a frog!"</p><p>Animals: cat · dog · fish · bird · cow · horse · pig · sheep</p>`,
            },
            {
                title: 'Goodbye Activity',
                content: `<h1>Bye-Bye</h1><p>Quick recap with the flashcards. Each kid says their favourite animal. Wave and sing the "Goodbye" song.</p>`,
            },
        ],
    },
];
