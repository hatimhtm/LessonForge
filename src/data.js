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
