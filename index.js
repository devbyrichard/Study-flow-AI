/* =========================================================
   STUDYFLOW AI
   COMPLETE JAVASCRIPT
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */



/* =========================================================
   GEMINI AI
========================================================= */

/* =========================================================
   SUPABASE SETUP
========================================================= */
const SUPABASE_URL = "https://vyomsqtwtdvrmextmjtp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_evz_iy2P_zJOoOINaHGNXQ_6FxxBcWy";

let supabaseClient = null;

if (
    window.supabase &&

    SUPABASE_URL &&
    SUPABASE_PUBLISHABLE_KEY
) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );
} else {
    console.warn("Supabase is not configured.");
}

const GEMINI_FUNCTION_NAME = "gemini-ai";

async function askGemini(prompt) {

    if (!supabaseClient) {
        throw new Error(
            "Supabase is not configured."
        );
    }

    if (!prompt || !String(prompt).trim()) {
        throw new Error(
            "Please enter a question first."
        );
    }

    const educationInstruction = `
You are Studyflow 🎓, an AI educational assistant.

Your purpose is to help students with:

- Education
- Studying
- School subjects
- Homework
- Revision
- Exams
- Learning
- Practice questions

Stay focused on education.

When helping students:

- Use clear language.
- Explain difficult ideas step by step.
- Give useful examples.
- Adapt explanations to the student's level.
- Be accurate.
- Help students understand concepts.
- Show mathematical working when appropriate.
- Keep answers organized.
- Avoid unnecessarily complicated language.

If a request is completely unrelated to education, respond:

"I'm Studyflow 🎓. I can only help with education, studying, school subjects, exams, homework, and learning."
`;

    const fullPrompt =
        educationInstruction +
        "\n\nUSER REQUEST:\n" +
        String(prompt).trim();

    const { data, error } =
        await supabaseClient.functions.invoke(
            GEMINI_FUNCTION_NAME,
            {
                body: {
                    prompt: fullPrompt
                }
            }
        );

    if (error) {
        console.error(
            "Studyflow Gemini function error:",
            error
        );

        throw new Error(
            error.message ||
            "Could not connect to Studyflow AI."
        );
    }

    const answer =
        data?.answer ||
        data?.text ||
        "";

    if (!answer) {
        console.error(
            "Studyflow Gemini returned:",
            data
        );

        throw new Error(
            "Studyflow AI returned no response."
        );
    }

    return String(answer).trim();
}


/* =========================================================
   PAGE ELEMENTS
========================================================= */

const pages = {

    home:
        document.getElementById(
            "homePage"
        ),

    study:
        document.getElementById(
            "studyPage"
        ),

    exams:
        document.getElementById(
            "examsPage"
        ),

    social:
        document.getElementById(
            "socialPage"
        ),

    dashboard:
        document.getElementById(
            "dashboardPage"
        ),

    savedNote:
        document.getElementById(
            "savedNotePage"
        )

};


const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const themeBtn =
    document.getElementById(
        "themeBtn"
    );


const toast =
    document.getElementById(
        "toast"
    );


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentPage = "home";

let pageHistory = [];


/* =========================================================
   COMMUNITY STATE
========================================================= */

let communityUser = null;

let communityRealtimeChannel = null;

let communityFriendChannel = null;


/* =========================================================
   PROGRESS STATE
========================================================= */

let progress;

try {

    progress =
        JSON.parse(
            localStorage.getItem(
                "studyflowProgress"
            )
        ) || {};

} catch {

    progress = {};

}


if (
    !Array.isArray(
        progress.topics
    )
) {

    progress.topics = [];

}


if (
    !Array.isArray(
        progress.studyDays
    )
) {

    progress.studyDays = [];

}


if (
    typeof progress.quizCorrect !==
    "number"
) {

    progress.quizCorrect = 0;

}


if (
    typeof progress.quizTotal !==
    "number"
) {

    progress.quizTotal = 0;

}


if (
    typeof progress.streak !==
    "number"
) {

    progress.streak = 0;

}


if (
    !progress.weakTopics ||
    typeof progress.weakTopics !==
        "object"
) {

    progress.weakTopics = {};

}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(
    pageName,
    addToHistory = true
) {

    if (
        !pages[pageName]
    ) {

        console.warn(
            "Page not found:",
            pageName
        );

        return;

    }


    if (
        addToHistory &&
        currentPage !== pageName
    ) {

        pageHistory.push(
            currentPage
        );

    }


    Object.values(
        pages
    ).forEach(
        page => {

            if (page) {

                page.classList.remove(
                    "active-page"
                );

            }

        }
    );


    pages[pageName]
        .classList.add(
            "active-page"
        );


    navLinks.forEach(
        link => {

            link.classList.remove(
                "active"
            );


            if (
                link.dataset.page ===
                pageName
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );


    currentPage =
        pageName;


    if (
        pageName ===
        "dashboard"
    ) {

        if (
            typeof updateDashboard ===
            "function"
        ) {

            updateDashboard();

        }

    }


    if (
        pageName ===
        "study"
    ) {

        if (
            typeof displayWeakTopics ===
            "function"
        ) {

            displayWeakTopics();

        }

    }


    if (
        pageName ===
        "social" &&
        communityUser
    ) {

        if (
            typeof loadCommunityData ===
            "function"
        ) {

            loadCommunityData();

        }

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function goBack() {

    if (
        pageHistory.length === 0
    ) {

        showPage(
            "home",
            false
        );

        return;

    }


    const previousPage =
        pageHistory.pop();


    showPage(
        previousPage,
        false
    );

}

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mainNav = document.getElementById("mainNav");

if (mobileMenuBtn && mainNav) {

    mobileMenuBtn.addEventListener("click", function () {

        const isOpen = mainNav.classList.toggle("mobile-open");

        mobileMenuBtn.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

        mobileMenuBtn.textContent = isOpen ? "✕" : "☰";
    });


    mainNav.querySelectorAll(".nav-link").forEach(function (link) {

        link.addEventListener("click", function () {

            mainNav.classList.remove("mobile-open");

            mobileMenuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

            mobileMenuBtn.textContent = "☰";
        });

    });
}


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

navLinks.forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                showPage(
                    link.dataset.page
                );

            }
        );

    }
);


document
    .querySelectorAll(
        "[data-page]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                event => {

                    if (
                        event.currentTarget
                            .classList
                            .contains(
                                "nav-link"
                            )
                    ) {

                        return;

                    }


                    const page =
                        element.dataset.page;


                    if (page) {

                        showPage(
                            page
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   LOGO
========================================================= */

const logo =
    document.querySelector(
        ".logo"
    );


if (logo) {

    logo.addEventListener(
        "click",
        () => {

            /*
              Do not prevent the default
              behaviour.

              If the logo is an index.html
              link, the page refreshes.
            */

        }
    );

}


/* =========================================================
   DARK MODE
========================================================= */

const savedTheme =
    localStorage.getItem(
        "studyflowTheme"
    );


if (
    savedTheme ===
    "dark"
) {

    document.body.classList.add(
        "dark"
    );


    if (themeBtn) {

        themeBtn.textContent =
            "☀️";

    }

}


if (themeBtn) {

    themeBtn.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            themeBtn.textContent =
                dark
                    ? "☀️"
                    : "🌙";


            localStorage.setItem(
                "studyflowTheme",
                dark
                    ? "dark"
                    : "light"
            );


            showToast(
                dark
                    ? "Dark mode enabled 🌙"
                    : "Light mode enabled ☀️"
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    return String(
        text ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   FORMAT AI TEXT
========================================================= */

function formatAIText(
    text
) {

    let html =
        escapeHTML(
            text
        );


    html =
        html.replace(
            /^### (.*?)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^## (.*?)$/gm,
            "<h2>$1</h2>"
        );


    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    html =
        html.replace(
            /^\s*[-*] (.*?)$/gm,
            "<li>$1</li>"
        );


    html =
        html.replace(
            /\n\n/g,
            "</p><p>"
        );


    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    return html;

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    duration = 2500
) {

    if (!toast) {

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            duration
        );

}


/* =========================================================
   LOADING
========================================================= */

function showLoading(
    container,
    message =
        "Studyflow AI is thinking..."
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="ai-loading">

            <div class="loading-spinner"></div>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   SAVE PROGRESS
========================================================= */

function saveProgress() {

    localStorage.setItem(
        "studyflowProgress",
        JSON.stringify(
            progress
        )
    );


    if (
        typeof updateStats ===
        "function"
    ) {

        updateStats();

    }

}


/* =========================================================
   ADD TOPIC TO PROGRESS
========================================================= */

function addTopic(
    topic
) {

    const cleanTopic =
        String(
            topic || ""
        ).trim();

    if (!cleanTopic) {
        return;
    }

    if (!Array.isArray(progress.topics)) {
        progress.topics = [];
    }

    const alreadyExists =
        progress.topics.some(
            item =>
                String(item).toLowerCase() ===
                cleanTopic.toLowerCase()
        );

    if (!alreadyExists) {
        progress.topics.push(cleanTopic);
    }

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    if (!Array.isArray(progress.studyDays)) {
        progress.studyDays = [];
    }

    if (!progress.studyDays.includes(today)) {
        progress.studyDays.push(today);
    }

    saveProgress();

}
/* =========================================================
   SAVED NOTES
========================================================= */

function getSavedNotes() {

    return JSON.parse(
        localStorage.getItem(
            "studyflowSavedNotes"
        )
    ) || [];

}


/* =========================================================
   DISPLAY SAVED NOTES
========================================================= */

function displaySavedNotes() {

    const savedNotesList =
        document.getElementById(
            "savedNotesList"
        );


    if (!savedNotesList) {

        return;

    }


    const notes =
        getSavedNotes();


    if (!notes.length) {

        savedNotesList.innerHTML = `

            <div class="empty-state">

                <p>
                    No saved notes yet.
                </p>

                <small>
                    Save an AI explanation and
                    it will appear here.
                </small>

            </div>

        `;

        return;

    }


    savedNotesList.innerHTML =
        notes
            .map(
                note => `

                    <div
                        class="saved-note-item"
                        data-note-id="${note.id}"
                    >

                        <div class="saved-note-info">

                            <h3>
                                ${escapeHTML(
                                    note.title
                                )}
                            </h3>

                            <small>
                                ${new Date(
                                    note.date
                                ).toLocaleDateString()}
                            </small>

                        </div>

                        <div class="saved-note-actions">

                            <button
                                class="secondary-btn open-saved-note"
                                data-id="${note.id}"
                            >
                                Open
                            </button>

                            <button
                                class="danger-btn delete-saved-note"
                                data-id="${note.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `
            )
            .join("");


    savedNotesList
        .querySelectorAll(
            ".open-saved-note"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openSavedNote(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    savedNotesList
        .querySelectorAll(
            ".delete-saved-note"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteSavedNote(
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   OPEN SAVED NOTE
========================================================= */

function openSavedNote(
    noteId
) {

    const notes =
        getSavedNotes();


    const note =
        notes.find(
            item =>
                String(item.id) ===
                String(noteId)
        );


    if (!note) {

        showToast(
            "Saved note not found."
        );

        return;

    }


    const title =
        document.getElementById(
            "savedNoteTitle"
        );


    const content =
        document.getElementById(
            "savedNoteContent"
        );


    if (title) {

        title.textContent =
            note.title;

    }


    if (content) {

        content.innerHTML = `

            <div class="ai-result-content">

                ${formatAIText(
                    note.content
                )}

            </div>

        `;

    }


    showPage(
        "savedNote"
    );

}


/* =========================================================
   DELETE SAVED NOTE
========================================================= */

function deleteSavedNote(
    noteId
) {

    const notes =
        getSavedNotes();


    const filtered =
        notes.filter(
            note =>
                String(note.id) !==
                String(noteId)
        );


    localStorage.setItem(
        "studyflowSavedNotes",
        JSON.stringify(
            filtered
        )
    );


    displaySavedNotes();


    showToast(
        "Saved note deleted."
    );

}


/* =========================================================
   CLEAR SAVED NOTES
========================================================= */

const clearSavedNotesBtn =
    document.getElementById(
        "clearSavedNotesBtn"
    );


if (clearSavedNotesBtn) {

    clearSavedNotesBtn.addEventListener(
        "click",
        () => {

            const notes =
                getSavedNotes();


            if (!notes.length) {

                showToast(
                    "There are no saved notes."
                );

                return;

            }


            localStorage.removeItem(
                "studyflowSavedNotes"
            );


            displaySavedNotes();


            showToast(
                "All saved notes deleted."
            );

        }
    );

}


/* =========================================================
   BACK FROM SAVED NOTE
========================================================= */

const savedNoteBackBtn =
    document.getElementById(
        "savedNoteBackBtn"
    );


if (savedNoteBackBtn) {

    savedNoteBackBtn.addEventListener(
        "click",
        () => {

            goBack();

        }
    );

}


/* =========================================================
   DISPLAY SAVED NOTES ON START
========================================================= */

displaySavedNotes();


/* =========================================================
   STUDY TIMER
========================================================= */

let timerInterval = null;

let timerSeconds = 0;

let timerRunning = false;


/* =========================================================
   TIMER ELEMENTS
========================================================= */

const timerDisplay =
    document.getElementById(
        "timerDisplay"
    );


const timerStartBtn =
    document.getElementById(
        "timerStartBtn"
    );


const timerPauseBtn =
    document.getElementById(
        "timerPauseBtn"
    );


const timerResetBtn =
    document.getElementById(
        "timerResetBtn"
    );


const timerMinutesInput =
    document.getElementById(
        "timerMinutes"
    );


/* =========================================================
   FORMAT TIMER
========================================================= */

function formatTimer(
    totalSeconds
) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        );


    const seconds =
        totalSeconds % 60;


    return (
        String(minutes)
            .padStart(2, "0") +
        ":" +
        String(seconds)
            .padStart(2, "0")
    );

}


/* =========================================================
   UPDATE TIMER DISPLAY
========================================================= */

function updateTimerDisplay() {

    if (!timerDisplay) {

        return;

    }


    timerDisplay.textContent =
        formatTimer(
            timerSeconds
        );

}


/* =========================================================
   START TIMER
========================================================= */

function startTimer() {

    if (timerRunning) {

        return;

    }


    if (
        timerSeconds <= 0
    ) {

        const minutes =
            Number(
                timerMinutesInput?.value
            );


        if (
            !minutes ||
            minutes <= 0
        ) {

            showToast(
                "Enter the number of minutes first."
            );

            return;

        }


        timerSeconds =
            Math.floor(
                minutes * 60
            );

    }


    timerRunning = true;


    if (timerStartBtn) {

        timerStartBtn.disabled =
            true;

    }


    if (timerPauseBtn) {

        timerPauseBtn.disabled =
            false;

    }


    timerInterval =
        setInterval(
            () => {

                if (
                    timerSeconds > 0
                ) {

                    timerSeconds--;

                    updateTimerDisplay();

                }


                if (
                    timerSeconds <= 0
                ) {

                    finishTimer();

                }

            },
            1000
        );

}


/* =========================================================
   PAUSE TIMER
========================================================= */

function pauseTimer() {

    if (!timerRunning) {

        return;

    }


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    timerRunning =
        false;


    if (timerStartBtn) {

        timerStartBtn.disabled =
            false;

    }


    if (timerPauseBtn) {

        timerPauseBtn.disabled =
            true;

    }


    showToast(
        "Timer paused."
    );

}


/* =========================================================
   FINISH TIMER
========================================================= */

function finishTimer() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    timerRunning =
        false;


    timerSeconds =
        0;


    updateTimerDisplay();


    if (timerStartBtn) {

        timerStartBtn.disabled =
            false;

    }


    if (timerPauseBtn) {

        timerPauseBtn.disabled =
            true;

    }


    showToast(
        "Study session complete! 🎉",
        4000
    );


    addTopic(
        "Study session"
    );

}


/* =========================================================
   RESET TIMER
========================================================= */

function resetTimer() {

    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    timerRunning =
        false;


    timerSeconds =
        0;


    updateTimerDisplay();


    if (timerStartBtn) {

        timerStartBtn.disabled =
            false;

    }


    if (timerPauseBtn) {

        timerPauseBtn.disabled =
            true;

    }

}


/* =========================================================
   TIMER BUTTONS
========================================================= */

if (timerStartBtn) {

    timerStartBtn.addEventListener(
        "click",
        startTimer
    );

}


if (timerPauseBtn) {

    timerPauseBtn.addEventListener(
        "click",
        pauseTimer
    );

}


if (timerResetBtn) {

    timerResetBtn.addEventListener(
        "click",
        resetTimer
    );

}


updateTimerDisplay();


/* =========================================================
   SUBJECTS
========================================================= */

const subjectCards =
    document.querySelectorAll(
        ".subject-card"
    );


subjectCards.forEach(
    card => {

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "button"
                    )
                ) {

                    return;

                }


                const subject =
                    card.dataset.subject ||
                    card.querySelector(
                        "h3"
                    )?.textContent?.trim();


                if (!subject) {

                    return;

                }


                localStorage.setItem(
                    "studyflowSelectedSubject",
                    subject
                );


                if (topicInput) {

                    topicInput.value =
                        subject;

                }


                showPage(
                    "study"
                );


                showToast(
                    `${subject} selected 📚`
                );

            }
        );

    }
);


/* =========================================================
   SELECT SUBJECT BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-subject]"
    )
    .forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    const subject =
                        element.dataset.subject;


                    if (!subject) {

                        return;

                    }


                    localStorage.setItem(
                        "studyflowSelectedSubject",
                        subject
                    );


                    if (topicInput) {

                        topicInput.value =
                            subject;

                    }


                    showPage(
                        "study"
                    );


                    showToast(
                        `${subject} selected 📚`
                    );

                }
            );

        }
    );


/* =========================================================
   LOAD SELECTED SUBJECT
========================================================= */

const savedSubject =
    localStorage.getItem(
        "studyflowSelectedSubject"
    );


if (
    savedSubject &&
    topicInput &&
    !topicInput.value
) {

    topicInput.value =
        savedSubject;

}


/* =========================================================
   SUBJECT SEARCH
========================================================= */

const subjectSearch =
    document.getElementById(
        "subjectSearch"
    );


if (subjectSearch) {

    subjectSearch.addEventListener(
        "input",
        () => {

            const search =
                subjectSearch.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".subject-card"
                )
                .forEach(
                    card => {

                        const text =
                            card.textContent
                                .toLowerCase();


                        card.style.display =
                            !search ||
                            text.includes(
                                search
                            )
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   BACK BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".back-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    goBack();

                }
            );

        }
    );


/* =========================================================
   HOME BUTTONS
========================================================= */

const startStudyingBtn =
    document.getElementById(
        "startStudyingBtn"
    );


if (startStudyingBtn) {

    startStudyingBtn.addEventListener(
        "click",
        () => {

            showPage(
                "study"
            );

        }
    );

}


const exploreBtn =
    document.getElementById(
        "exploreBtn"
    );


if (exploreBtn) {

    exploreBtn.addEventListener(
        "click",
        () => {

            showPage(
                "exams"
            );

        }
    );

}

/* =========================================================
   HOME AI ASK BUTTON
========================================================= */

const homeQuestion = document.getElementById("homeQuestion");
const homeAskBtn = document.getElementById("homeAskBtn");

if (homeAskBtn && homeQuestion) {

    homeAskBtn.addEventListener("click", async () => {

        const question = homeQuestion.value.trim();

        if (!question) {
            showToast("Please enter a question first.");
            return;
        }

        const topicInput = document.getElementById("topicInput");

        if (topicInput) {
            topicInput.value = question;
        }

        showPage("study");

        const explainBtn =
            document.getElementById("explainBtn");

        if (explainBtn) {
            explainBtn.click();
        }

    });

}

/* =========================================================
   AUTHENTICATION
========================================================= */


/* =========================================================
   AUTH ELEMENTS
========================================================= */

const profileBtn =
    document.getElementById(
        "profileBtn"
    );


const profileDropdown =
    document.getElementById(
        "profileDropdown"
    );


const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const signupBtn =
    document.getElementById(
        "signupBtn"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const contactBtn =
    document.getElementById(
        "contactBtn"
    );


const authUserInfo =
    document.getElementById(
        "authUserInfo"
    );


const profileName =
    document.getElementById(
        "profileName"
    );


const profileEmail =
    document.getElementById(
        "profileEmail"
    );


const loginModal =
    document.getElementById(
        "loginModal"
    );


const signupModal =
    document.getElementById(
        "signupModal"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const loginSubmit =
    document.getElementById(
        "loginSubmit"
    );


const signupName =
    document.getElementById(
        "signupName"
    );


const signupEmail =
    document.getElementById(
        "signupEmail"
    );


const signupPassword =
    document.getElementById(
        "signupPassword"
    );


const signupSubmit =
    document.getElementById(
        "signupSubmit"
    );


const switchToSignup =
    document.getElementById(
        "switchToSignup"
    );


const switchToLogin =
    document.getElementById(
        "switchToLogin"
    );


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

if (profileBtn) {

    profileBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            if (!profileDropdown) {

                return;

            }


            profileDropdown.classList.toggle(
                "show"
            );


            profileDropdown.classList.toggle(
                "hidden"
            );

        }
    );

}


document.addEventListener(
    "click",
    event => {

        if (
            profileDropdown &&
            !profileDropdown.contains(
                event.target
            ) &&
            event.target !== profileBtn
        ) {

            profileDropdown.classList.remove(
                "show"
            );

            profileDropdown.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(
    modal
) {

    if (!modal) {

        return;

    }


    modal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(
    modal
) {

    if (!modal) {

        return;

    }


    modal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );

}


function closeAllAuthModals() {

    closeModal(
        loginModal
    );


    closeModal(
        signupModal
    );

}


/* =========================================================
   MODAL CLOSE BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.close;


                    closeModal(
                        document.getElementById(
                            id
                        )
                    );

                }
            );

        }
    );


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
========================================================= */

[
    loginModal,
    signupModal
].forEach(
    modal => {

        if (!modal) {

            return;

        }


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeModal(
                        modal
                    );

                }

            }
        );

    }
);


/* =========================================================
   LOGIN BUTTON
========================================================= */

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (profileDropdown) {

                profileDropdown.classList.remove(
                    "show"
                );

                profileDropdown.classList.add(
                    "hidden"
                );

            }


            openModal(
                loginModal
            );

        }
    );

}


/* =========================================================
   SIGN UP BUTTON
========================================================= */

if (signupBtn) {

    signupBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (profileDropdown) {

                profileDropdown.classList.remove(
                    "show"
                );

                profileDropdown.classList.add(
                    "hidden"
                );

            }


            openModal(
                signupModal
            );

        }
    );

}


/* =========================================================
   SWITCH LOGIN → SIGN UP
========================================================= */

if (switchToSignup) {

    switchToSignup.addEventListener(
        "click",
        event => {

            event.preventDefault();


            closeModal(
                loginModal
            );


            openModal(
                signupModal
            );

        }
    );

}


/* =========================================================
   SWITCH SIGN UP → LOGIN
========================================================= */

if (switchToLogin) {

    switchToLogin.addEventListener(
        "click",
        event => {

            event.preventDefault();


            closeModal(
                signupModal
            );


            openModal(
                loginModal
            );

        }
    );

}


/* =========================================================
   LOGIN FUNCTION
========================================================= */

async function loginUser() {

    if (!supabaseClient) {

        showToast(
            "Supabase is not configured yet."
        );

        console.error(
            "Supabase client is not initialized."
        );

        return;

    }


    const email =
        loginEmail?.value
            ?.trim();


    const password =
        loginPassword?.value || "";


    if (!email) {

        showToast(
            "Enter your email."
        );

        return;

    }


    if (!password) {

        showToast(
            "Enter your password."
        );

        return;

    }


    if (loginSubmit) {

        loginSubmit.disabled =
            true;

        loginSubmit.textContent =
            "Logging in...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (error) {

            throw error;

        }


        console.log(
            "Login successful:",
            data.user
        );


        closeModal(
            loginModal
        );


        if (loginPassword) {

            loginPassword.value =
                "";

        }


        showToast(
            "Welcome back! 👋"
        );


        await updateAuthUI(
            data.user
        );

    }

    catch (error) {

        console.error(
            "Login error:",
            error
        );


        showToast(
            error.message ||
            "Login failed. Please check your email and password."
        );

    }

    finally {

        if (loginSubmit) {

            loginSubmit.disabled =
                false;

            loginSubmit.textContent =
                "Log In";

        }

    }

}


/* =========================================================
   SIGN UP FUNCTION
========================================================= */

async function signUpUser() {

    if (!supabaseClient) {

        showToast(
            "Supabase is not configured yet."
        );

        console.error(
            "Supabase client is not initialized."
        );

        return;

    }


    const name =
        signupName?.value
            ?.trim() || "";


    const email =
        signupEmail?.value
            ?.trim() || "";


    const password =
        signupPassword?.value || "";


    if (!name) {

        showToast(
            "Enter your name."
        );

        return;

    }


    if (!email) {

        showToast(
            "Enter your email."
        );

        return;

    }


    if (!password) {

        showToast(
            "Enter a password."
        );

        return;

    }


    if (
        password.length < 6
    ) {

        showToast(
            "Password must be at least 6 characters."
        );

        return;

    }


    if (signupSubmit) {

        signupSubmit.disabled =
            true;

        signupSubmit.textContent =
            "Creating account...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signUp({

                    email:
                        email,

                    password:
                        password,

                    options: {

                        data: {

                            full_name:
                                name,

                            name:
                                name

                        }

                    }

                });


        if (error) {

            throw error;

        }


        if (
            data?.session
        ) {

            closeModal(
                signupModal
            );


            showToast(
                "Account created successfully! 🎉"
            );


            await updateAuthUI(
                data.user
            );

        }

        else {

            showToast(
                "Account created. Check your email to confirm your account."
            );

        }


        if (signupPassword) {

            signupPassword.value =
                "";

        }

    }

    catch (error) {

        console.error(
            "Signup error:",
            error
        );


        showToast(
            error.message ||
            "Could not create your account."
        );

    }

    finally {

        if (signupSubmit) {

            signupSubmit.disabled =
                false;

            signupSubmit.textContent =
                "Sign Up";

        }

    }

}


/* =========================================================
   LOGIN BUTTON EVENT
========================================================= */

if (loginSubmit) {

    loginSubmit.addEventListener(
        "click",
        loginUser
    );

}


/* =========================================================
   SIGN UP BUTTON EVENT
========================================================= */

if (signupSubmit) {

    signupSubmit.addEventListener(
        "click",
        signUpUser
    );

}


/* =========================================================
   LOGIN WITH ENTER
========================================================= */

if (loginPassword) {

    loginPassword.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                loginUser();

            }

        }
    );

}


/* =========================================================
   SIGN UP WITH ENTER
========================================================= */

if (signupPassword) {

    signupPassword.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                signUpUser();

            }

        }
    );

}


/* =========================================================
   UPDATE AUTH UI
========================================================= */

async function updateAuthUI(
    user = null
) {

    const loggedIn =
        Boolean(user);


    /*
       Keep community state synchronized.
    */

    communityUser =
        user;


    if (!loggedIn) {

        if (loginBtn) {

            loginBtn.style.display =
                "";

            loginBtn.classList.remove(
                "hidden"
            );

        }


        if (signupBtn) {

            signupBtn.style.display =
                "";

            signupBtn.classList.remove(
                "hidden"
            );

        }


        if (logoutBtn) {

            logoutBtn.style.display =
                "none";

            logoutBtn.classList.add(
                "hidden"
            );

        }


        if (authUserInfo) {

            authUserInfo.style.display =
                "none";

            authUserInfo.classList.add(
                "hidden"
            );

        }


        if (profileName) {

            profileName.textContent =
                "Guest";

        }


        if (profileEmail) {

            profileEmail.textContent =
                "";

        }


        return;

    }


    if (loginBtn) {

        loginBtn.style.display =
            "none";

        loginBtn.classList.add(
            "hidden"
        );

    }


    if (signupBtn) {

        signupBtn.style.display =
            "none";

        signupBtn.classList.add(
            "hidden"
        );

    }


    if (logoutBtn) {

        logoutBtn.style.display =
            "";

        logoutBtn.classList.remove(
            "hidden"
        );

    }


    if (authUserInfo) {

        authUserInfo.style.display =
            "";

        authUserInfo.classList.remove(
            "hidden"
        );

    }


    let displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Student";


    /*
       Try to get the display name
       from the Supabase profiles table.

       If the table isn't available,
       the user's metadata is still used.
    */

    if (supabaseClient) {

        try {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "display_name,username"
                    )
                    .eq(
                        "id",
                        user.id
                    )
                    .maybeSingle();


            if (
                !error &&
                data
            ) {

                displayName =
                    data.display_name ||
                    data.username ||
                    displayName;

            }

        }

        catch (error) {

            console.warn(
                "Could not load profile:",
                error
            );

        }

    }


    if (profileName) {

        profileName.textContent =
            displayName;

    }


    if (profileEmail) {

        profileEmail.textContent =
            user.email || "";

    }

}


/* =========================================================
   CHECK CURRENT SESSION
========================================================= */

async function checkAuth() {

    if (!supabaseClient) {

        updateAuthUI(
            null
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            throw error;

        }


        const user =
            data?.session?.user ||
            null;


        communityUser =
            user;


        await updateAuthUI(
            user
        );

    }

    catch (error) {

        console.error(
            "Auth check error:",
            error
        );


        communityUser =
            null;


        await updateAuthUI(
            null
        );

    }

}


/* =========================================================
   SUPABASE AUTH STATE CHANGES
========================================================= */

if (
    supabaseClient &&
    supabaseClient.auth
) {

    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            const user =
                session?.user ||
                null;


            communityUser =
                user;


            /*
               Do not make another Supabase
               request inside this callback.
               Updating the UI is enough here.
            */

            setTimeout(
                () => {

                    updateAuthUI(
                        user
                    );

                },
                0
            );


            if (!user) {

                if (
                    typeof cleanupCommunityRealtime ===
                    "function"
                ) {

                    cleanupCommunityRealtime();

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            if (!supabaseClient) {

                showToast(
                    "Supabase is not configured yet."
                );

                return;

            }


            try {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .signOut();


                if (error) {

                    throw error;

                }


                communityUser =
                    null;


                if (
                    typeof cleanupCommunityRealtime ===
                    "function"
                ) {

                    cleanupCommunityRealtime();

                }


                if (profileDropdown) {

                    profileDropdown.classList.remove(
                        "show"
                    );

                    profileDropdown.classList.add(
                        "hidden"
                    );

                }


                await updateAuthUI(
                    null
                );


                showToast(
                    "You have been logged out."
                );


                showPage(
                    "home"
                );

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                showToast(
                    error.message ||
                    "Could not log out."
                );

            }

        }
    );

}


/* =========================================================
   CONTACT
========================================================= */

if (contactBtn) {

    contactBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();


            if (profileDropdown) {

                profileDropdown.classList.remove(
                    "show"
                );

                profileDropdown.classList.add(
                    "hidden"
                );

            }


            window.location.href =
                "mailto:rkannison@gmail.com";

        }
    );

}


/* =========================================================
   INITIAL AUTH CHECK
========================================================= */

checkAuth();


/* =========================================================
   END OF PART 3
========================================================= */
/* =========================================================
   COMMUNITY / SOCIAL
========================================================= */

const socialPage =
    document.getElementById("socialPage");

const socialLoginRequired =
    document.getElementById(
        "socialLoginRequired"
    );

const socialLoginBtn =
    document.getElementById(
        "socialLoginBtn"
    );

const socialApp =
    document.getElementById(
        "socialApp"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );

const chatForm =
    document.getElementById(
        "chatForm"
    );

const chatInput =
    document.getElementById(
        "chatInput"
    );

const friendSearchInput =
    document.getElementById(
        "friendSearchInput"
    );

const friendSearchBtn =
    document.getElementById(
        "friendSearchBtn"
    );

const friendSearchResults =
    document.getElementById(
        "friendSearchResults"
    );

const friendRequestsList =
    document.getElementById(
        "friendRequestsList"
    );

const friendsList =
    document.getElementById(
        "friendsList"
    );

const requestCount =
    document.getElementById(
        "requestCount"
    );



/* =========================================================
   COMMUNITY NOTIFICATION
========================================================= */

function showCommunityNotification(
    message
) {

    if (
        typeof showToast ===
        "function"
    ) {

        showToast(message);

        return;

    }


    const notification =
        document.createElement(
            "div"
        );

    notification.className =
        "study-notification";

    notification.textContent =
        message;

    document.body.appendChild(
        notification
    );


    setTimeout(
        () => {

            notification.remove();

        },
        2500
    );

}


/* =========================================================
   COMMUNITY LOGIN CHECK
========================================================= */

function requireCommunityLogin() {

    if (
        !communityUser
    ) {

        showCommunityNotification(
            "Please log in to use Community."
        );

        if (
            loginModal &&
            typeof openModal ===
            "function"
        ) {

            openModal(
                loginModal
            );

        }

        return false;

    }

    return true;

}


/* =========================================================
   UPDATE COMMUNITY ACCESS
========================================================= */

function updateCommunityAccess(
    user
) {

    communityUser =
        user || null;


    if (
        !socialPage
    ) {

        return;

    }


    if (
        communityUser
    ) {

        if (
            socialLoginRequired
        ) {

            socialLoginRequired.classList.add(
                "hidden"
            );

        }


        if (
            socialApp
        ) {

            socialApp.classList.remove(
                "hidden"
            );

        }

    }

    else {

        if (
            socialLoginRequired
        ) {

            socialLoginRequired.classList.remove(
                "hidden"
            );

        }


        if (
            socialApp
        ) {

            socialApp.classList.add(
                "hidden"
            );

        }


        cleanupCommunityRealtime();

    }

}


/* =========================================================
   SOCIAL LOGIN BUTTON
========================================================= */

if (
    socialLoginBtn
) {

    socialLoginBtn.addEventListener(
        "click",
        () => {

            if (
                loginModal &&
                typeof openModal ===
                "function"
            ) {

                openModal(
                    loginModal
                );

            }

        }
    );

}


/* =========================================================
   LOAD COMMUNITY
========================================================= */

async function loadCommunityData() {

    if (
        !communityUser ||
        !supabaseClient
    ) {

        return;

    }


    await Promise.all([
        loadChatMessages(),
        loadFriendRequests(),
        loadFriends()
    ]);


    subscribeToCommunityUpdates();

}


/* =========================================================
   CHAT TIME FORMAT
========================================================= */

function formatCommunityTime(
    date
) {

    if (
        !date
    ) {

        return "";

    }


    const value =
        new Date(date);


    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return "";

    }


    return value.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   CREATE CHAT MESSAGE
========================================================= */

function createChatMessageElement(
    message
) {

    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "chat-message";


    if (
        message.user_id ===
        communityUser?.id
    ) {

        wrapper.classList.add(
            "mine"
        );

    }


    const content =
        document.createElement(
            "div"
        );

    content.className =
        "chat-message-content";


    const userName =
        document.createElement(
            "div"
        );

    userName.className =
        "chat-user-name";


    userName.textContent =
        message.profile?.display_name ||
        message.profile?.username ||
        "Student";


    const bubble =
        document.createElement(
            "div"
        );

    bubble.className =
        "chat-bubble";


    /*
       textContent is used instead of
       innerHTML so chat messages
       cannot inject HTML.
    */

    bubble.textContent =
        message.message || "";


    const time =
        document.createElement(
            "div"
        );

    time.className =
        "chat-time";

    time.textContent =
        formatCommunityTime(
            message.created_at
        );


    content.appendChild(
        userName
    );

    content.appendChild(
        bubble
    );

    content.appendChild(
        time
    );

    wrapper.appendChild(
        content
    );


    return wrapper;

}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChatToBottom() {

    if (
        !chatMessages
    ) {

        return;

    }


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================================================
   LOAD CHAT MESSAGES
========================================================= */

async function loadChatMessages() {

    if (
        !supabaseClient ||
        !communityUser ||
        !chatMessages
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("messages")
                .select(`
                    id,
                    user_id,
                    message,
                    created_at,
                    profile:user_id (
                        username,
                        display_name,
                        avatar_url
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                )
                .limit(100);


        if (
            error
        ) {

            throw error;

        }


        chatMessages.innerHTML =
            "";


        if (
            !data ||
            !data.length
        ) {

            chatMessages.innerHTML = `
                <div class="chat-empty">
                    <p>No messages yet.</p>
                    <small>
                        Start the conversation!
                    </small>
                </div>
            `;

            return;

        }


        data.forEach(
            message => {

                chatMessages.appendChild(
                    createChatMessageElement(
                        message
                    )
                );

            }
        );


        scrollChatToBottom();

    }

    catch (error) {

        console.error(
            "Chat loading error:",
            error
        );


        chatMessages.innerHTML = `
            <div class="chat-empty">
                <p>
                    Could not load messages.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   SEND CHAT MESSAGE
========================================================= */

async function sendChatMessage(
    event
) {

    if (
        event
    ) {

        event.preventDefault();

    }


    if (
        !requireCommunityLogin()
    ) {

        return;

    }


    if (
        !supabaseClient ||
        !chatInput
    ) {

        return;

    }


    const message =
        chatInput.value.trim();


    if (
        !message
    ) {

        return;

    }


    if (
        message.length >
        1000
    ) {

        showCommunityNotification(
            "Message is too long."
        );

        return;

    }


    const submitButton =
        chatForm?.querySelector(
            "button[type='submit']"
        );


    if (
        submitButton
    ) {

        submitButton.disabled =
            true;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("messages")
                .insert({
                    user_id:
                        communityUser.id,

                    message:
                        message
                })
                .select(`
                    id,
                    user_id,
                    message,
                    created_at
                `)
                .single();


        if (
            error
        ) {

            throw error;

        }


        chatInput.value =
            "";


        /*
           If realtime is not enabled,
           display the message immediately.
        */

        if (
            data
        ) {

            data.profile = {
                display_name:
                    communityUser.user_metadata
                        ?.display_name ||
                    communityUser.user_metadata
                        ?.full_name ||
                    communityUser.email
                        ?.split("@")[0] ||
                    "Student",

                username:
                    communityUser.user_metadata
                        ?.username ||
                    communityUser.email
                        ?.split("@")[0] ||
                    "Student"
            };


            const existing =
                chatMessages?.querySelector(
                    `[data-message-id="${data.id}"]`
                );


            if (
                !existing &&
                chatMessages
            ) {

                const element =
                    createChatMessageElement(
                        data
                    );

                element.dataset.messageId =
                    data.id;

                chatMessages.appendChild(
                    element
                );

                scrollChatToBottom();

            }

        }

    }

    catch (error) {

        console.error(
            "Send message error:",
            error
        );


        showCommunityNotification(
            error.message ||
            "Could not send message."
        );

    }

    finally {

        if (
            submitButton
        ) {

            submitButton.disabled =
                false;

        }

    }

}


/* =========================================================
   CHAT FORM
========================================================= */

if (
    chatForm
) {

    chatForm.addEventListener(
        "submit",
        sendChatMessage
    );

}


/* =========================================================
   SEARCH FRIENDS
========================================================= */

async function searchFriends() {

    if (
        !requireCommunityLogin()
    ) {

        return;

    }


    if (
        !supabaseClient ||
        !friendSearchInput ||
        !friendSearchResults
    ) {

        return;

    }


    const search =
        friendSearchInput.value.trim();


    if (
        !search
    ) {

        friendSearchResults.innerHTML =
            "";

        return;

    }


    friendSearchResults.innerHTML = `
        <div class="chat-empty">
            Searching...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(`
                    id,
                    username,
                    display_name,
                    avatar_url
                `)
                .or(
                    `username.ilike.%${search}%,display_name.ilike.%${search}%`
                )
                .neq(
                    "id",
                    communityUser.id
                )
                .limit(20);


        if (
            error
        ) {

            throw error;

        }


        friendSearchResults.innerHTML =
            "";


        if (
            !data ||
            !data.length
        ) {

            friendSearchResults.innerHTML = `
                <div class="chat-empty">
                    No students found.
                </div>
            `;

            return;

        }


        data.forEach(
            user => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "friend-item";


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "friend-info";


                const name =
                    document.createElement(
                        "strong"
                    );

                name.textContent =
                    user.display_name ||
                    user.username ||
                    "Student";


                const username =
                    document.createElement(
                        "span"
                    );

                username.textContent =
                    user.username
                        ? `@${user.username}`
                        : "";


                info.appendChild(
                    name
                );

                info.appendChild(
                    username
                );


                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "friend-request-btn";

                button.textContent =
                    "Add Friend";


                button.addEventListener(
                    "click",
                    () => {

                        sendFriendRequest(
                            user.id,
                            button
                        );

                    }
                );


                item.appendChild(
                    info
                );

                item.appendChild(
                    button
                );


                friendSearchResults.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Friend search error:",
            error
        );


        friendSearchResults.innerHTML = `
            <div class="chat-empty">
                Could not search students.
            </div>
        `;

    }

}


/* =========================================================
   SEARCH BUTTON
========================================================= */

if (
    friendSearchBtn
) {

    friendSearchBtn.addEventListener(
        "click",
        searchFriends
    );

}


if (
    friendSearchInput
) {

    friendSearchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchFriends();

            }

        }
    );

}


/* =========================================================
   SEND FRIEND REQUEST
========================================================= */

async function sendFriendRequest(
    receiverId,
    button
) {

    if (
        !requireCommunityLogin()
    ) {

        return;

    }


    if (
        receiverId ===
        communityUser.id
    ) {

        return;

    }


    if (
        button
    ) {

        button.disabled =
            true;

        button.textContent =
            "Sending...";

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "friend_requests"
                )
                .insert({

                    sender_id:
                        communityUser.id,

                    receiver_id:
                        receiverId,

                    status:
                        "pending"

                });


        if (
            error
        ) {

            if (
                error.code ===
                "23505"
            ) {

                throw new Error(
                    "You already sent a request to this student."
                );

            }

            throw error;

        }


        if (
            button
        ) {

            button.textContent =
                "Request Sent";

            button.classList.add(
                "pending"
            );

        }


        showCommunityNotification(
            "Friend request sent! 🤝"
        );

    }

    catch (error) {

        console.error(
            "Friend request error:",
            error
        );


        if (
            button
        ) {

            button.disabled =
                false;

            button.textContent =
                "Add Friend";

        }


        showCommunityNotification(
            error.message ||
            "Could not send friend request."
        );

    }

}


/* =========================================================
   LOAD FRIEND REQUESTS
========================================================= */

async function loadFriendRequests() {

    if (
        !supabaseClient ||
        !communityUser ||
        !friendRequestsList
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "friend_requests"
                )
                .select(`
                    id,
                    sender_id,
                    receiver_id,
                    status,
                    created_at,
                    profiles:sender_id (
                        username,
                        display_name,
                        avatar_url
                    )
                `)
                .eq(
                    "receiver_id",
                    communityUser.id
                )
                .eq(
                    "status",
                    "pending"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (
            error
        ) {

            throw error;

        }


        renderFriendRequests(
            data || []
        );

    }

    catch (error) {

        console.error(
            "Friend requests error:",
            error
        );


        friendRequestsList.innerHTML = `
            <div class="chat-empty">
                Could not load friend requests.
            </div>
        `;

    }

}


/* =========================================================
   RENDER FRIEND REQUESTS
========================================================= */

function renderFriendRequests(
    requests
) {

    if (
        !friendRequestsList
    ) {

        return;

    }


    friendRequestsList.innerHTML =
        "";


    if (
        requestCount
    ) {

        requestCount.textContent =
            String(
                requests.length
            );

    }


    if (
        !requests.length
    ) {

        friendRequestsList.innerHTML = `
            <div class="chat-empty">
                No pending requests.
            </div>
        `;

        return;

    }


    requests.forEach(
        request => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "friend-item";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "friend-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                request.profiles
                    ?.display_name ||
                request.profiles
                    ?.username ||
                "Student";


            const username =
                document.createElement(
                    "span"
                );

            username.textContent =
                request.profiles
                    ?.username
                    ? `@${request.profiles.username}`
                    : "";


            info.appendChild(
                name
            );

            info.appendChild(
                username
            );


            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "friend-actions";


            const acceptButton =
                document.createElement(
                    "button"
                );

            acceptButton.type =
                "button";

            acceptButton.className =
                "friend-request-btn";

            acceptButton.textContent =
                "Accept";


            acceptButton.addEventListener(
                "click",
                () => {

                    respondToFriendRequest(
                        request.id,
                        "accepted"
                    );

                }
            );


            const rejectButton =
                document.createElement(
                    "button"
                );

            rejectButton.type =
                "button";

            rejectButton.className =
                "friend-request-btn";

            rejectButton.textContent =
                "Decline";


            rejectButton.addEventListener(
                "click",
                () => {

                    respondToFriendRequest(
                        request.id,
                        "rejected"
                    );

                }
            );


            actions.appendChild(
                acceptButton
            );

            actions.appendChild(
                rejectButton
            );


            item.appendChild(
                info
            );

            item.appendChild(
                actions
            );


            friendRequestsList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   RESPOND TO FRIEND REQUEST
========================================================= */

async function respondToFriendRequest(
    requestId,
    status
) {

    if (
        !requireCommunityLogin()
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from(
                    "friend_requests"
                )
                .update({
                    status:
                        status
                })
                .eq(
                    "id",
                    requestId
                )
                .eq(
                    "receiver_id",
                    communityUser.id
                );


        if (
            error
        ) {

            throw error;

        }


        showCommunityNotification(
            status === "accepted"
                ? "Friend request accepted! 🎉"
                : "Friend request declined."
        );


        await loadFriendRequests();

        await loadFriends();

    }

    catch (error) {

        console.error(
            "Friend response error:",
            error
        );


        showCommunityNotification(
            error.message ||
            "Could not update friend request."
        );

    }

}


/* =========================================================
   LOAD FRIENDS
========================================================= */

async function loadFriends() {

    if (
        !supabaseClient ||
        !communityUser ||
        !friendsList
    ) {

        return;

    }


    try {

        const {
            data: sent,
            error: sentError
        } =
            await supabaseClient
                .from(
                    "friend_requests"
                )
                .select(`
                    receiver_id,
                    profiles:receiver_id (
                        id,
                        username,
                        display_name,
                        avatar_url
                    )
                `)
                .eq(
                    "sender_id",
                    communityUser.id
                )
                .eq(
                    "status",
                    "accepted"
                );


        if (
            sentError
        ) {

            throw sentError;

        }


        const {
            data: received,
            error: receivedError
        } =
            await supabaseClient
                .from(
                    "friend_requests"
                )
                .select(`
                    sender_id,
                    profiles:sender_id (
                        id,
                        username,
                        display_name,
                        avatar_url
                    )
                `)
                .eq(
                    "receiver_id",
                    communityUser.id
                )
                .eq(
                    "status",
                    "accepted"
                );


        if (
            receivedError
        ) {

            throw receivedError;

        }


        const friends = [];


        (sent || []).forEach(
            row => {

                if (
                    row.profiles
                ) {

                    friends.push(
                        row.profiles
                    );

                }

            }
        );


        (received || []).forEach(
            row => {

                if (
                    row.profiles
                ) {

                    friends.push(
                        row.profiles
                    );

                }

            }
        );


        renderFriends(
            friends
        );

    }

    catch (error) {

        console.error(
            "Friends loading error:",
            error
        );


        friendsList.innerHTML = `
            <div class="chat-empty">
                Could not load friends.
            </div>
        `;

    }

}


/* =========================================================
   RENDER FRIENDS
========================================================= */

function renderFriends(
    friends
) {

    if (
        !friendsList
    ) {

        return;

    }


    friendsList.innerHTML =
        "";


    const uniqueFriends =
        [];

    const ids =
        new Set();


    friends.forEach(
        friend => {

            if (
                friend?.id &&
                !ids.has(
                    friend.id
                )
            ) {

                ids.add(
                    friend.id
                );

                uniqueFriends.push(
                    friend
                );

            }

        }
    );


    if (
        !uniqueFriends.length
    ) {

        friendsList.innerHTML = `
            <div class="chat-empty">
                You have no friends yet.
            </div>
        `;

        return;

    }


    uniqueFriends.forEach(
        friend => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "friend-item";


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "friend-info";


            const name =
                document.createElement(
                    "strong"
                );

            name.textContent =
                friend.display_name ||
                friend.username ||
                "Student";


            const username =
                document.createElement(
                    "span"
                );

            username.textContent =
                friend.username
                    ? `@${friend.username}`
                    : "";


            info.appendChild(
                name
            );

            info.appendChild(
                username
            );


            const status =
                document.createElement(
                    "span"
                );

            status.className =
                "friend-online-status";

            status.textContent =
                "Friend";


            item.appendChild(
                info
            );

            item.appendChild(
                status
            );


            friendsList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   SUBSCRIBE TO COMMUNITY REALTIME UPDATES
========================================================= */

function subscribeToCommunityUpdates() {

    if (
        !supabaseClient ||
        !communityUser
    ) {
        return;
    }

    // Remove previous channels first
    cleanupCommunityRealtime();


    /* =====================================================
       GLOBAL CHAT
    ===================================================== */

    communityRealtimeChannel =
        supabaseClient
            .channel("studyflow-global-chat")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
                },
                async (payload) => {

                    if (
                        !payload ||
                        !payload.new
                    ) {
                        return;
                    }

                    const newMessage =
                        payload.new;

                    // Get the sender profile
                    let profile = null;

                    try {

                        const {
                            data
                        } =
                            await supabaseClient
                                .from("profiles")
                                .select(`
                                    username,
                                    display_name,
                                    avatar_url
                                `)
                                .eq(
                                    "id",
                                    newMessage.user_id
                                )
                                .maybeSingle();

                        profile = data;

                    } catch (error) {

                        console.error(
                            "Could not load message profile:",
                            error
                        );

                    }

                    const message = {
                        ...newMessage,
                        profile
                    };

                    if (chatMessages) {

                        // Remove empty state
                        const empty =
                            chatMessages.querySelector(
                                ".chat-empty"
                            );

                        if (empty) {
                            empty.remove();
                        }

                        chatMessages.appendChild(
                            createChatMessageElement(
                                message
                            )
                        );

                        scrollChatToBottom();
                    }
                }
            )
            .subscribe(
                (status) => {

                    console.log(
                        "Global chat realtime status:",
                        status
                    );

                }
            );


    /* =====================================================
       FRIEND REQUESTS
    ===================================================== */

    communityFriendChannel =
        supabaseClient
            .channel(
                `studyflow-friends-${communityUser.id}`
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "friend_requests",
                    filter:
                        `receiver_id=eq.${communityUser.id}`
                },
                async () => {

                    await loadFriendRequests();

                }
            )
            .subscribe(
                (status) => {

                    console.log(
                        "Friend requests realtime status:",
                        status
                    );

                }
            );

}


/* =========================================================
   CLEANUP COMMUNITY REALTIME
========================================================= */

function cleanupCommunityRealtime() {

    if (!supabaseClient) {
        return;
    }


    if (
        communityRealtimeChannel
    ) {

        supabaseClient.removeChannel(
            communityRealtimeChannel
        );

        communityRealtimeChannel =
            null;
    }


    if (
        communityFriendChannel
    ) {

        supabaseClient.removeChannel(
            communityFriendChannel
        );

        communityFriendChannel =
            null;
    }

}

/* =========================================================
   COMMUNITY NAVIGATION
========================================================= */

const communityNav =
    document.querySelector(
        '[data-page="social"]'
    );


if (
    communityNav
) {

    communityNav.addEventListener(
        "click",
        () => {

            if (
                communityUser
            ) {

                loadCommunityData();

            }

        }
    );

}


/* =========================================================
   COMMUNITY AUTH UPDATE
========================================================= */

/*
   IMPORTANT:
   This listener is intentionally separate from
   the main auth listener in Part 3.
*/

if (
    supabaseClient
) {

    supabaseClient.auth.onAuthStateChange(
        (
            _event,
            session
        ) => {

            const user =
                session?.user ||
                null;


            updateCommunityAccess(
                user
            );


            if (
                !user
            ) {

                cleanupCommunityRealtime();

            }

        }
    );

}


/* =========================================================
   INITIAL COMMUNITY STATE
========================================================= */

if (
    supabaseClient
) {

    supabaseClient.auth.getSession()
        .then(
            ({
                data
            }) => {

                const user =
                    data?.session?.user ||
                    null;


                updateCommunityAccess(
                    user
                );

            }
        )
        .catch(
            error => {

                console.error(
                    "Community session error:",
                    error
                );

            }
        );

}
/* =========================================================
   PART 5
   STUDY & AI EXPLAINER
========================================================= */


/* =========================================================
   STUDY EXPLAINER ELEMENTS
========================================================= */

const explainBtn =
    document.getElementById(
        "explainBtn"
    );

const topicInput =
    document.getElementById(
        "topicInput"
    );

const levelInput =
    document.getElementById(
        "levelInput"
    );

const styleInput =
    document.getElementById(
        "styleInput"
    );

const explainResult =
    document.getElementById(
        "explainResult"
    );

const saveExplainBtn =
    document.getElementById(
        "saveExplainBtn"
    );


let lastExplanation =
    "";


/* =========================================================
   EXPLAIN TOPIC
========================================================= */

if (
    explainBtn
) {

    explainBtn.addEventListener(
        "click",
        async () => {

            const topic =
                topicInput?.value
                    ?.trim();


            if (
                !topic
            ) {

                showToast(
                    "Enter a topic first."
                );

                return;

            }


            const level =
                levelInput?.value ||
                "Secondary school";


            const style =
                styleInput?.value ||
                "Simple and clear";


            const prompt = `

Explain the following topic to a student.

Topic:
${topic}

Student level:
${level}

Explanation style:
${style}

Use this structure:

1. Simple definition
2. Main points
3. Step-by-step explanation
4. Example
5. Important things to remember
6. Quick revision summary

Keep the explanation educational,
accurate, simple and easy to understand.

`;


            explainBtn.disabled =
                true;


            const originalText =
                explainBtn.textContent;


            explainBtn.textContent =
                "AI is thinking...";


            showLoading(
                explainResult
            );


            try {

                const answer =
                    await askGemini(
                        prompt
                    );


                lastExplanation =
                    answer;


                if (
                    explainResult
                ) {

                    explainResult.innerHTML = `
                        <div class="ai-result-content">
                            ${formatAIText(
                                answer
                            )}
                        </div>
                    `;

                }


                addTopic(
                    topic
                );


                showToast(
                    "Explanation generated successfully."
                );

            }

            catch (
                error
            ) {

                console.error(
                    "Explain error:",
                    error
                );


                if (
                    explainResult
                ) {

                    explainResult.innerHTML = `
                        <div class="error-state">

                            <h3>
                                Something went wrong
                            </h3>

                            <p>
                                ${escapeHTML(
                                    error.message ||
                                    "AI request failed."
                                )}
                            </p>

                        </div>
                    `;

                }

            }

            finally {

                explainBtn.disabled =
                    false;


                explainBtn.textContent =
                    originalText;

            }

        }
    );

}


/* =========================================================
   SAVE EXPLANATION
========================================================= */

if (
    saveExplainBtn
) {

    saveExplainBtn.addEventListener(
        "click",
        () => {

            if (
                !lastExplanation
            ) {

                showToast(
                    "Generate an explanation first."
                );

                return;

            }


            const notes =
                JSON.parse(
                    localStorage.getItem(
                        "studyflowSavedNotes"
                    )
                ) || [];


            const topic =
                topicInput
                    ?.value
                    ?.trim() ||
                "Study Note";


            notes.unshift({

                id:
                    Date.now(),

                title:
                    topic,

                content:
                    lastExplanation,

                date:
                    new Date()
                        .toISOString()

            });


            localStorage.setItem(
                "studyflowSavedNotes",
                JSON.stringify(
                    notes.slice(
                        0,
                        50
                    )
                )
            );


            showToast(
                "Explanation saved 📚"
            );


            if (
                typeof displaySavedNotes ===
                "function"
            ) {

                displaySavedNotes();

            }

        }
    );

}


/* =========================================================
   READ ALOUD
========================================================= */

const voiceSelect =
    document.getElementById(
        "voiceSelect"
    );

const readAloudBtn =
    document.getElementById(
        "readAloudBtn"
    );

const stopReadingBtn =
    document.getElementById(
        "stopReadingBtn"
    );


let speechUtterance =
    null;


/* =========================================================
   READ EXPLANATION
========================================================= */

if (
    readAloudBtn
) {

    readAloudBtn.addEventListener(
        "click",
        () => {

            if (
                !lastExplanation
            ) {

                showToast(
                    "Generate an explanation first."
                );

                return;

            }


            if (
                !("speechSynthesis" in window)
            ) {

                showToast(
                    "Read aloud is not supported in this browser."
                );

                return;

            }


            window.speechSynthesis.cancel();


            speechUtterance =
                new SpeechSynthesisUtterance(
                    lastExplanation
                );


            speechUtterance.rate =
                0.9;

            speechUtterance.pitch =
                1;


            const voices =
                window.speechSynthesis
                    .getVoices();


            if (
                voiceSelect &&
                voiceSelect.value
            ) {

                const selectedVoice =
                    voices.find(
                        voice =>
                            voice.name ===
                            voiceSelect.value
                    );


                if (
                    selectedVoice
                ) {

                    speechUtterance.voice =
                        selectedVoice;

                }

            }


            speechUtterance.onstart =
                () => {

                    if (
                        readAloudBtn
                    ) {

                        readAloudBtn.disabled =
                            true;

                    }


                    if (
                        stopReadingBtn
                    ) {

                        stopReadingBtn.disabled =
                            false;

                    }

                };


            speechUtterance.onend =
                () => {

                    if (
                        readAloudBtn
                    ) {

                        readAloudBtn.disabled =
                            false;

                    }


                    if (
                        stopReadingBtn
                    ) {

                        stopReadingBtn.disabled =
                            true;

                    }

                };


            speechUtterance.onerror =
                error => {

                    console.error(
                        "Speech error:",
                        error
                    );


                    if (
                        readAloudBtn
                    ) {

                        readAloudBtn.disabled =
                            false;

                    }


                    if (
                        stopReadingBtn
                    ) {

                        stopReadingBtn.disabled =
                            true;

                    }

                };


            window.speechSynthesis.speak(
                speechUtterance
            );

        }
    );

}


/* =========================================================
   STOP READING
========================================================= */

if (
    stopReadingBtn
) {

    stopReadingBtn.disabled =
        true;


    stopReadingBtn.addEventListener(
        "click",
        () => {

            if (
                "speechSynthesis" in
                window
            ) {

                window.speechSynthesis.cancel();

            }


            if (
                readAloudBtn
            ) {

                readAloudBtn.disabled =
                    false;

            }


            stopReadingBtn.disabled =
                true;

        }
    );

}


/* =========================================================
   LOAD BROWSER VOICES
========================================================= */

function loadSpeechVoices() {

    if (
        !voiceSelect ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const voices =
        window.speechSynthesis
            .getVoices();


    voiceSelect.innerHTML =
        "";


    if (
        !voices.length
    ) {

        return;

    }


    voices.forEach(
        voice => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                voice.name;

            option.textContent =
                `${voice.name} (${voice.lang})`;


            voiceSelect.appendChild(
                option
            );

        }
    );

}


if (
    "speechSynthesis" in window
) {

    loadSpeechVoices();


    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            loadSpeechVoices
        );

}


/* =========================================================
   CLEAR STUDY INPUT
========================================================= */

const clearStudyBtn =
    document.getElementById(
        "clearStudyBtn"
    );


if (
    clearStudyBtn
) {

    clearStudyBtn.addEventListener(
        "click",
        () => {

            if (
                topicInput
            ) {

                topicInput.value =
                    "";

            }


            if (
                explainResult
            ) {

                explainResult.innerHTML =
                    `
                    <div class="empty-state">
                        <div>📚</div>
                        <p>
                            Your explanation will appear here.
                        </p>
                        <small>
                            Enter a topic and ask Studyflow AI.
                        </small>
                    </div>
                    `;

            }


            lastExplanation =
                "";


            showToast(
                "Study area cleared."
            );

        }
    );

}


/* =========================================================
   STUDY TOPIC ENTER KEY
========================================================= */

if (
    topicInput
) {

    topicInput.addEventListener(
        "keydown",
        event => {

            /*
               Ctrl + Enter or
               Enter with Ctrl
               generates the explanation.
            */

            if (
                event.key ===
                    "Enter" &&
                event.ctrlKey
            ) {

                event.preventDefault();


                if (
                    explainBtn
                ) {

                    explainBtn.click();

                }

            }

        }
    );

}


/* =========================================================
   AUTO FILL SAVED SUBJECT
========================================================= */

try {

    const savedSubject =
        localStorage.getItem(
            "studyflowSelectedSubject"
        );


    if (
        savedSubject &&
        topicInput &&
        !topicInput.value
    ) {

        topicInput.value =
            savedSubject;

    }

}

catch (
    error
) {

    console.error(
        "Could not load saved subject:",
        error
    );

}


/* =========================================================
   STOP SPEECH WHEN LEAVING PAGE
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            "speechSynthesis" in
            window
        ) {

            window.speechSynthesis.cancel();


            if (
                readAloudBtn
            ) {

                readAloudBtn.disabled =
                    false;

            }


            if (
                stopReadingBtn
            ) {

                stopReadingBtn.disabled =
                    true;

            }

        }

    }
);
/* =========================================================
   PART 6 — EXAM / QUIZ SYSTEM
========================================================= */

let examQuestions = [];
let examAnswers = [];
let currentExamQuestion = 0;

let selectedQuestionType = "obj";
let selectedExamMode = "practice";

let examTimerInterval = null;
let examTimeRemaining = 0;

let examConfig = {};
let examFinished = false;
let theoryMarkingResults = [];


/* =========================================================
   EXAM ELEMENTS
========================================================= */

const examSetup =
    document.getElementById("examSetup");

const examContainer =
    document.getElementById("examContainer");

const examResults =
    document.getElementById("examResults");

const examTypeSelect =
    document.getElementById("examTypeSelect");

const examSubject =
    document.getElementById("examSubject");

const examTopic =
    document.getElementById("examTopic");

const questionCount =
    document.getElementById("questionCount");

const examTime =
    document.getElementById("examTime");

const startExamBtn =
    document.getElementById("startExamBtn");

const objAnswers =
    document.getElementById("objAnswers");

const theoryAnswerArea =
    document.getElementById("theoryAnswerArea");

const theoryAnswer =
    document.getElementById("theoryAnswer");

const practiceFeedback =
    document.getElementById("practiceFeedback");

const examPreviousQuestionBtn =
    document.getElementById("previousQuestionBtn");

const examNextQuestionBtn =
    document.getElementById("nextQuestionBtn");

const examSubmitButton =
    document.getElementById("submitExamBtn");

const examRetryButton =
    document.getElementById("retryExamBtn");

const examNewButton =
    document.getElementById("newExamBtn");


/* =========================================================
   EXAM JSON PARSER
========================================================= */

function extractJSON(text) {

    if (!text) {
        throw new Error(
            "Gemini returned an empty response."
        );
    }

    let cleaned =
        String(text)
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

    try {
        return JSON.parse(cleaned);
    }

    catch (_) {}


    const firstObject =
        cleaned.indexOf("{");

    const lastObject =
        cleaned.lastIndexOf("}");

    if (
        firstObject !== -1 &&
        lastObject !== -1
    ) {

        try {

            return JSON.parse(
                cleaned.slice(
                    firstObject,
                    lastObject + 1
                )
            );

        }

        catch (_) {}

    }


    const firstArray =
        cleaned.indexOf("[");

    const lastArray =
        cleaned.lastIndexOf("]");

    if (
        firstArray !== -1 &&
        lastArray !== -1
    ) {

        try {

            return JSON.parse(
                cleaned.slice(
                    firstArray,
                    lastArray + 1
                )
            );

        }

        catch (_) {}

    }


    throw new Error(
        "Gemini did not return valid JSON."
    );
}


/* =========================================================
   VALIDATE EXAM QUESTIONS
========================================================= */

function validateExamQuestions(
    questions
) {

    if (!Array.isArray(questions)) {
        return [];
    }

    return questions
        .map(question => {

            if (!question) {
                return null;
            }

            const type =
                String(
                    question.type || "obj"
                ).toLowerCase();

            if (type === "obj") {

                if (
                    !question.question ||
                    !Array.isArray(
                        question.options
                    ) ||
                    question.options.length < 2
                ) {
                    return null;
                }

                let correctIndex =
                    Number(
                        question.correctIndex
                    );

                if (
                    !Number.isInteger(
                        correctIndex
                    ) ||
                    correctIndex < 0 ||
                    correctIndex >=
                        question.options.length
                ) {

                    correctIndex = 0;

                }

                return {

                    type: "obj",

                    question:
                        String(
                            question.question
                        ),

                    options:
                        question.options.map(
                            option =>
                                String(option)
                        ),

                    correctIndex,

                    explanation:
                        String(
                            question.explanation ||
                            ""
                        ),

                    marks:
                        Number(
                            question.marks
                        ) || 1

                };

            }


            if (type === "theory") {

                if (!question.question) {
                    return null;
                }

                return {

                    type: "theory",

                    question:
                        String(
                            question.question
                        ),

                    modelAnswer:
                        String(
                            question.modelAnswer ||
                            ""
                        ),

                    marks:
                        Number(
                            question.marks
                        ) || 5,

                    explanation:
                        String(
                            question.explanation ||
                            ""
                        )

                };

            }

            return null;

        })
        .filter(Boolean);
}


/* =========================================================
   BUILD EXAM PROMPT
========================================================= */

function buildExamPrompt() {

    const config =
        examConfig;

    let questionInstruction =
        "Generate only OBJ questions.";

    if (
        config.questionType ===
        "theory"
    ) {

        questionInstruction =
            "Generate only Theory questions.";

    }

    else if (
        config.questionType ===
        "both"
    ) {

        questionInstruction =
            "Generate a mixture of OBJ and Theory questions.";

    }


    return `

You are Studyflow AI, an educational exam generator.

Create a school assessment for a student.

Exam type:
${config.examType}

Subject:
${config.subject}

Topic:
${config.topic}

Number of questions:
${config.count}

${questionInstruction}

IMPORTANT:

Return ONLY valid JSON.

Use this exact structure:

{
  "questions": [
    {
      "type": "obj",
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 0,
      "explanation": "Short explanation",
      "marks": 1
    }
  ]
}

For Theory questions use:

{
  "type": "theory",
  "question": "Question text",
  "modelAnswer": "Expected answer",
  "marks": 5,
  "explanation": "Short marking explanation"
}

Rules:

- Make questions appropriate for the subject.
- Make them educational and accurate.
- Do not repeat questions.
- OBJ questions must have four options.
- correctIndex must be 0, 1, 2, or 3.
- Do not put letters such as A, B, C or D inside correctIndex.
- Theory questions must have a useful model answer.
- Match the selected exam type.
- Return JSON only.

`;
}


/* =========================================================
   QUESTION TYPE SELECTION
========================================================= */

document
    .querySelectorAll(
        ".choice-btn[data-question-type]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".choice-btn[data-question-type]"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );

                selectedQuestionType =
                    button.dataset.questionType ||
                    "obj";

            }
        );

    });


/* =========================================================
   EXAM MODE SELECTION
========================================================= */

document
    .querySelectorAll(
        ".mode-btn[data-mode]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".mode-btn[data-mode]"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });

                button.classList.add(
                    "active"
                );

                selectedExamMode =
                    button.dataset.mode ||
                    "practice";

            }
        );

    });


/* =========================================================
   START EXAM
========================================================= */

async function startExam() {

    const subject =
        examSubject?.value?.trim();

    if (!subject) {

        showToast(
            "Enter a subject first."
        );

        examSubject?.focus();

        return;
    }


    const topic =
        examTopic?.value?.trim();

    if (!topic) {

        showToast(
            "Enter a topic first."
        );

        examTopic?.focus();

        return;
    }


    const count =
        Math.max(
            1,
            Math.min(
                Number(
                    questionCount?.value
                ) || 10,
                50
            )
        );


    const minutes =
        Math.max(
            1,
            Number(
                examTime?.value
            ) || 20
        );


    examConfig = {

        subject,

        topic,

        count,

        minutes,

        examType:
            examTypeSelect?.value ||
            "General",

        questionType:
            selectedQuestionType,

        mode:
            selectedExamMode

    };


    if (startExamBtn) {

        startExamBtn.disabled =
            true;

        startExamBtn.textContent =
            "Generating...";

    }


    if (examContainer) {

        examContainer.classList.remove(
            "hidden"
        );

        examContainer.innerHTML = `

            <div class="ai-loading">

                <div class="loading-spinner"></div>

                <h3>
                    Generating your questions...
                </h3>

                <p>
                    Studyflow AI is preparing
                    your ${escapeHTML(subject)}
                    assessment.
                </p>

            </div>

        `;

    }


    try {

        const prompt =
            buildExamPrompt();


        const response =
            await askGemini(
                prompt
            );


        const parsed =
            extractJSON(
                response
            );


        const rawQuestions =
            Array.isArray(parsed)
                ? parsed
                : parsed.questions;


        examQuestions =
            validateExamQuestions(
                rawQuestions
            );


        if (
            !examQuestions.length
        ) {

            throw new Error(
                "No valid questions were generated."
            );

        }


        examAnswers =
            examQuestions.map(
                () => null
            );


        theoryMarkingResults =
            [];


        currentExamQuestion =
            0;

        examFinished =
            false;


        examTimeRemaining =
            minutes * 60;


        if (examResults) {

            examResults.classList.add(
                "hidden"
            );

        }


        if (examContainer) {

            examContainer.classList.remove(
                "hidden"
            );

        }


        startExamTimer();

        renderExamQuestion();

        renderQuestionNumbers();

        updateExamProgressBar();


        if (
            typeof addTopic ===
            "function"
        ) {

            addTopic(
                `${subject}: ${topic}`
            );

        }

    }

    catch (error) {

        console.error(
            "Exam generation error:",
            error
        );


        if (examContainer) {

            examContainer.innerHTML = `

                <div class="error-state">

                    <h3>
                        Unable to generate the exam
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        id="tryExamAgainBtn">

                        Try Again

                    </button>

                </div>

            `;


            const tryAgain =
                document.getElementById(
                    "tryExamAgainBtn"
                );

            if (tryAgain) {

                tryAgain.addEventListener(
                    "click",
                    startExam
                );

            }

        }

    }

    finally {

        if (startExamBtn) {

            startExamBtn.disabled =
                false;

            startExamBtn.textContent =
                "✦ Generate Exam";

        }

    }

}


/* =========================================================
   START BUTTON
========================================================= */

if (startExamBtn) {

    startExamBtn.addEventListener(
        "click",
        startExam
    );

}


/* =========================================================
   RENDER EXAM QUESTION
========================================================= */

function renderExamQuestion() {

    const question =
        examQuestions[
            currentExamQuestion
        ];

    if (!question) {
        return;
    }


    const examQuestion =
        document.getElementById(
            "examQuestion"
        );

    const examProgressText =
        document.getElementById(
            "examProgressText"
        );

    const examModeText =
        document.getElementById(
            "examModeText"
        );

    const questionTypeBadge =
        document.getElementById(
            "questionTypeBadge"
        );

    const questionMarks =
        document.getElementById(
            "questionMarks"
        );


    const questionNumber =
        currentExamQuestion + 1;

    const totalQuestions =
        examQuestions.length;


    if (examProgressText) {

        examProgressText.textContent =
            `Question ${questionNumber} of ${totalQuestions}`;

    }


    if (examModeText) {

        examModeText.textContent =
            examConfig.mode === "exam"
                ? "Exam Mode"
                : "Practice Mode";

    }


    if (questionTypeBadge) {

        questionTypeBadge.textContent =
            question.type === "obj"
                ? "OBJ"
                : "THEORY";

    }


    if (questionMarks) {

        const marks =
            Number(
                question.marks || 1
            );

        questionMarks.textContent =
            `${marks} mark${marks === 1 ? "" : "s"}`;

    }


    if (examQuestion) {

        examQuestion.innerHTML =
            formatAIText(
                question.question
            );

    }


    if (objAnswers) {

        objAnswers.innerHTML = "";

    }


    if (theoryAnswerArea) {

        theoryAnswerArea.classList.add(
            "hidden"
        );

    }


    if (practiceFeedback) {

        practiceFeedback.innerHTML =
            "";

        practiceFeedback.classList.add(
            "hidden"
        );

    }


    if (
        question.type ===
        "obj"
    ) {

        renderOBJQuestion(
            question
        );

    }

    else {

        renderTheoryQuestion(
            question
        );

    }


    updateExamNavigation();

    updateExamProgressBar();

    renderQuestionNumbers();

}


/* =========================================================
   RENDER OBJ QUESTION
========================================================= */

function renderOBJQuestion(
    question
) {

    if (!objAnswers) {
        return;
    }


    objAnswers.classList.remove(
        "hidden"
    );


    const selected =
        examAnswers[
            currentExamQuestion
        ];


    question.options.forEach(
        (
            option,
            index
        ) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "obj-answer";

            button.dataset.index =
                index;


            const letter =
                String.fromCharCode(
                    65 + index
                );


            button.innerHTML = `

                <span class="answer-letter">
                    ${letter}
                </span>

                <span class="answer-text">
                    ${escapeHTML(option)}
                </span>

            `;


            if (
                selected ===
                index
            ) {

                button.classList.add(
                    "selected"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    selectOBJAnswer(
                        index
                    );

                }
            );


            objAnswers.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   SELECT OBJ ANSWER
========================================================= */

function selectOBJAnswer(
    index
) {

    if (
        examFinished ||
        !examQuestions[
            currentExamQuestion
        ]
    ) {

        return;

    }


    const question =
        examQuestions[
            currentExamQuestion
        ];


    if (
        question.type !==
        "obj"
    ) {

        return;

    }


    examAnswers[
        currentExamQuestion
    ] = index;


    if (objAnswers) {

        objAnswers
            .querySelectorAll(
                ".obj-answer"
            )
            .forEach(button => {

                button.classList.toggle(
                    "selected",
                    Number(
                        button.dataset.index
                    ) === index
                );

            });

    }


    if (
        examConfig.mode ===
        "practice"
    ) {

        showPracticeFeedback();

    }


    updateExamNavigation();

}


/* =========================================================
   PRACTICE FEEDBACK
========================================================= */

function showPracticeFeedback() {

    const question =
        examQuestions[
            currentExamQuestion
        ];

    if (
        !question ||
        question.type !== "obj" ||
        !practiceFeedback
    ) {

        return;

    }


    const answer =
        examAnswers[
            currentExamQuestion
        ];


    if (
        answer === null ||
        answer === undefined
    ) {

        practiceFeedback.classList.add(
            "hidden"
        );

        return;

    }


    const correct =
        answer ===
        question.correctIndex;


    practiceFeedback.classList.remove(
        "hidden"
    );


    practiceFeedback.innerHTML = `

        <div class="${
            correct
                ? "feedback-correct"
                : "feedback-wrong"
        }">

            <strong>

                ${
                    correct
                        ? "Correct! ✓"
                        : "Not quite."
                }

            </strong>

            <p>

                ${escapeHTML(
                    question.explanation ||
                    (
                        correct
                            ? "Well done!"
                            : `The correct answer is ${
                                question.options[
                                    question.correctIndex
                                ]
                            }.`
                    )
                )}

            </p>

        </div>

    `;

}


/* =========================================================
   THEORY QUESTION
========================================================= */

function renderTheoryQuestion(
    question
) {

    if (!theoryAnswerArea) {
        return;
    }


    theoryAnswerArea.classList.remove(
        "hidden"
    );


    if (theoryAnswer) {

        theoryAnswer.value =
            examAnswers[
                currentExamQuestion
            ] || "";

    }

}


/* =========================================================
   SAVE CURRENT ANSWER
========================================================= */

function saveCurrentAnswer() {

    if (
        !examQuestions[
            currentExamQuestion
        ]
    ) {

        return;

    }


    const question =
        examQuestions[
            currentExamQuestion
        ];


    if (
        question.type === "theory" &&
        theoryAnswer
    ) {

        examAnswers[
            currentExamQuestion
        ] =
            theoryAnswer.value.trim();

    }

}


/* =========================================================
   NEXT QUESTION
========================================================= */

function nextQuestion() {

    if (examFinished) {
        return;
    }


    saveCurrentAnswer();


    if (
        currentExamQuestion <
        examQuestions.length - 1
    ) {

        currentExamQuestion++;

        renderExamQuestion();

        return;

    }


    showToast(
        "You are on the last question. Submit when ready."
    );

}


/* =========================================================
   PREVIOUS QUESTION
========================================================= */

function previousQuestion() {

    if (examFinished) {
        return;
    }


    saveCurrentAnswer();


    if (
        currentExamQuestion >
        0
    ) {

        currentExamQuestion--;

        renderExamQuestion();

    }

}


/* =========================================================
   QUESTION NAVIGATION
========================================================= */

function updateExamNavigation() {

    if (examPreviousQuestionBtn) {

        examPreviousQuestionBtn.disabled =
            currentExamQuestion === 0;

    }


    if (examNextQuestionBtn) {

        examNextQuestionBtn.disabled =
            currentExamQuestion >=
            examQuestions.length - 1;

    }

}


/* =========================================================
   QUESTION NUMBERS
========================================================= */

function renderQuestionNumbers() {

    const questionNumbers =
        document.getElementById(
            "questionNumbers"
        );

    if (!questionNumbers) {
        return;
    }


    questionNumbers.innerHTML = "";


    examQuestions.forEach(
        (
            question,
            index
        ) => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "question-number";

            button.textContent =
                index + 1;


            if (
                index ===
                currentExamQuestion
            ) {

                button.classList.add(
                    "active"
                );

            }


            const answered =
                examAnswers[index] !==
                    null &&
                examAnswers[index] !==
                    undefined &&
                examAnswers[index] !==
                    "";


            if (answered) {

                button.classList.add(
                    "answered"
                );

            }


            button.addEventListener(
                "click",
                () => {

                    saveCurrentAnswer();

                    currentExamQuestion =
                        index;

                    renderExamQuestion();

                }
            );


            questionNumbers.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   EXAM TIMER
========================================================= */

function startExamTimer() {

    stopExamTimer();


    const timerElement =
        document.getElementById(
            "examTimer"
        );


    if (!timerElement) {
        return;
    }


    updateExamTimerDisplay();


    examTimerInterval =
        setInterval(
            () => {

                if (examFinished) {

                    stopExamTimer();

                    return;

                }


                examTimeRemaining--;

                updateExamTimerDisplay();


                if (
                    examTimeRemaining <= 0
                ) {

                    stopExamTimer();

                    showToast(
                        "Time is up. Your exam will be submitted."
                    );


                    if (
                        typeof finishExam ===
                        "function"
                    ) {

                        finishExam();

                    }

                }

            },
            1000
        );

}


function stopExamTimer() {

    if (examTimerInterval) {

        clearInterval(
            examTimerInterval
        );

        examTimerInterval =
            null;

    }

}


function updateExamTimerDisplay() {

    const timerElement =
        document.getElementById(
            "examTimer"
        );


    if (!timerElement) {
        return;
    }


    const minutes =
        Math.floor(
            examTimeRemaining / 60
        );


    const seconds =
        examTimeRemaining % 60;


    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    timerElement.classList.toggle(
        "timer-warning",
        examTimeRemaining <= 60
    );

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

if (examPreviousQuestionBtn) {

    examPreviousQuestionBtn.addEventListener(
        "click",
        previousQuestion
    );

}


if (examNextQuestionBtn) {

    examNextQuestionBtn.addEventListener(
        "click",
        nextQuestion
    );

}


/* =========================================================
   AUTO-SAVE THEORY ANSWER
========================================================= */

if (theoryAnswer) {

    theoryAnswer.addEventListener(
        "input",
        () => {

            examAnswers[
                currentExamQuestion
            ] =
                theoryAnswer.value;

            renderQuestionNumbers();

        }
    );

}
/* =========================================================
   PART 7 — EXAM RESULTS & MARKING
========================================================= */


/* =========================================================
   MARK THEORY ANSWERS WITH GEMINI
========================================================= */

async function markTheoryAnswers() {

    const theoryQuestions =
        examQuestions
            .map(
                (question, index) => ({
                    question,
                    index
                })
            )
            .filter(
                item =>
                    item.question.type ===
                    "theory"
            );


    if (!theoryQuestions.length) {
        return [];
    }


    const results = [];


    for (
        const item of theoryQuestions
    ) {

        const question =
            item.question;


        const studentAnswer =
            String(
                examAnswers[
                    item.index
                ] || ""
            ).trim();


        if (!studentAnswer) {

            results.push({

                questionIndex:
                    item.index,

                awardedMarks:
                    0,

                feedback:
                    "No answer was provided."

            });

            continue;
        }


        const prompt = `

Mark this student's theory answer.

Question:
${question.question}

Model answer:
${question.modelAnswer}

Maximum marks:
${question.marks}

Student answer:
${studentAnswer}

Return ONLY valid JSON:

{
  "awardedMarks": 0,
  "feedback": "Short constructive feedback"
}

Rules:

- Award between 0 and the maximum marks.
- Give marks for correct relevant content.
- Do not require exact wording.
- Do not give more marks than the maximum.
- Keep the feedback short and helpful.

`;


        try {

            const response =
                await askGemini(
                    prompt
                );


            const parsed =
                extractJSON(
                    response
                );


            let awardedMarks =
                Number(
                    parsed.awardedMarks
                );


            if (
                !Number.isFinite(
                    awardedMarks
                )
            ) {

                awardedMarks = 0;

            }


            awardedMarks =
                Math.max(
                    0,
                    Math.min(
                        awardedMarks,
                        Number(
                            question.marks
                        ) || 0
                    )
                );


            results.push({

                questionIndex:
                    item.index,

                awardedMarks,

                feedback:
                    String(
                        parsed.feedback ||
                        "Answer reviewed."
                    )

            });

        }

        catch (error) {

            console.error(
                "Theory marking error:",
                error
            );


            results.push({

                questionIndex:
                    item.index,

                awardedMarks:
                    0,

                feedback:
                    "This answer could not be automatically marked."

            });

        }

    }


    return results;
}


/* =========================================================
   CALCULATE EXAM SCORE
========================================================= */

function calculateExamScore() {

    let earnedMarks = 0;
    let totalMarks = 0;

    let objCorrect = 0;
    let objTotal = 0;


    examQuestions.forEach(
        (question, index) => {

            const marks =
                Number(
                    question.marks
                ) || 1;


            totalMarks += marks;


            if (
                question.type ===
                "obj"
            ) {

                objTotal++;


                const answer =
                    examAnswers[
                        index
                    ];


                if (
                    answer !== null &&
                    answer !== undefined &&
                    Number(answer) ===
                        Number(
                            question.correctIndex
                        )
                ) {

                    objCorrect++;

                    earnedMarks +=
                        marks;

                }

            }

        }
    );


    theoryMarkingResults.forEach(
        result => {

            const question =
                examQuestions[
                    result.questionIndex
                ];


            if (!question) {
                return;
            }


            earnedMarks +=
                Number(
                    result.awardedMarks
                ) || 0;

        }
    );


    const percentage =
        totalMarks > 0
            ? (
                earnedMarks /
                totalMarks
            ) * 100
            : 0;


    return {

        earnedMarks,

        totalMarks,

        percentage,

        objCorrect,

        objTotal

    };
}


/* =========================================================
   SAVE EXAM PROGRESS
========================================================= */

function saveExamProgress(
    score
) {

    if (
        !score ||
        !progress
    ) {

        return;
    }


    progress.quizCorrect =
        Number(
            progress.quizCorrect || 0
        ) +
        Number(
            score.objCorrect || 0
        );


    progress.quizTotal =
        Number(
            progress.quizTotal || 0
        ) +
        Number(
            score.objTotal || 0
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (
        !Array.isArray(
            progress.studyDays
        )
    ) {

        progress.studyDays =
            [];

    }


    if (
        !progress.studyDays.includes(
            today
        )
    ) {

        progress.studyDays.push(
            today
        );

    }


    if (
        typeof saveProgress ===
        "function"
    ) {

        saveProgress();

    }


    if (
        typeof updateDashboard ===
        "function"
    ) {

        updateDashboard();

    }

}


/* =========================================================
   DISPLAY EXAM RESULTS
========================================================= */

function displayExamResults(
    score
) {

    if (!examResults) {
        return;
    }


    const resultScore =
        document.getElementById(
            "resultScore"
        );

    const resultPercentage =
        document.getElementById(
            "resultPercentage"
        );

    const resultCorrect =
        document.getElementById(
            "resultCorrect"
        );

    const resultTotal =
        document.getElementById(
            "resultTotal"
        );

    const resultSubject =
        document.getElementById(
            "resultSubject"
        );

    const resultTopic =
        document.getElementById(
            "resultTopic"
        );


    if (resultScore) {

        resultScore.textContent =
            `${score.earnedMarks}/${score.totalMarks}`;

    }


    if (resultPercentage) {

        resultPercentage.textContent =
            `${Math.round(
                score.percentage
            )}%`;

    }


    if (resultCorrect) {

        resultCorrect.textContent =
            score.objCorrect;

    }


    if (resultTotal) {

        resultTotal.textContent =
            score.objTotal;

    }


    if (resultSubject) {

        resultSubject.textContent =
            examConfig.subject ||
            "";

    }


    if (resultTopic) {

        resultTopic.textContent =
            examConfig.topic ||
            "";

    }


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (resultMessage) {

        const percentage =
            score.percentage;


        if (percentage >= 80) {

            resultMessage.textContent =
                "Excellent work! Keep it up.";

        }

        else if (
            percentage >= 60
        ) {

            resultMessage.textContent =
                "Good work. Keep practising.";

        }

        else if (
            percentage >= 40
        ) {

            resultMessage.textContent =
                "You are making progress. Review the difficult topics.";

        }

        else {

            resultMessage.textContent =
                "Keep practising and review the questions you missed.";

        }

    }


    renderTheoryResults();

    renderReviewAnswers();


    examResults.classList.remove(
        "hidden"
    );

}


/* =========================================================
   THEORY RESULTS
========================================================= */

function renderTheoryResults() {

    const theoryResultsList =
        document.getElementById(
            "theoryResultsList"
        );


    if (!theoryResultsList) {
        return;
    }


    theoryResultsList.innerHTML =
        "";


    const theoryQuestions =
        examQuestions.filter(
            question =>
                question.type ===
                "theory"
        );


    if (!theoryQuestions.length) {

        theoryResultsList.innerHTML = `

            <div class="empty-state">

                <p>
                    No Theory questions in this assessment.
                </p>

            </div>

        `;

        return;
    }


    theoryQuestions.forEach(
        (
            question,
            questionIndex
        ) => {

            const originalIndex =
                examQuestions.indexOf(
                    question
                );


            const result =
                theoryMarkingResults.find(
                    item =>
                        Number(
                            item.questionIndex
                        ) ===
                        originalIndex
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "theory-result-card";


            card.innerHTML = `

                <h4>
                    Theory Question
                    ${questionIndex + 1}
                </h4>

                <p>

                    <strong>
                        Your answer:
                    </strong>

                    ${escapeHTML(
                        examAnswers[
                            originalIndex
                        ] ||
                        "No answer"
                    )}

                </p>

                <p>

                    <strong>
                        Feedback:
                    </strong>

                    ${escapeHTML(
                        result?.feedback ||
                        "No feedback available."
                    )}

                </p>

                <p>

                    <strong>
                        Marks:
                    </strong>

                    ${
                        Number(
                            result?.awardedMarks
                        ) || 0
                    }
                    /
                    ${
                        Number(
                            question.marks
                        ) || 0
                    }

                </p>

            `;


            theoryResultsList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   REVIEW ALL ANSWERS
========================================================= */

function renderReviewAnswers() {

    const reviewAnswers =
        document.getElementById(
            "reviewAnswers"
        );


    if (!reviewAnswers) {
        return;
    }


    reviewAnswers.innerHTML =
        "";


    examQuestions.forEach(
        (
            question,
            index
        ) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "review-answer-card";


            let content =
                "";


            if (
                question.type ===
                "obj"
            ) {

                const answer =
                    examAnswers[
                        index
                    ];


                const studentText =
                    answer === null ||
                    answer === undefined ||
                    answer === ""
                        ? "Unanswered"
                        : question.options[
                            answer
                        ];


                const correctText =
                    question.options[
                        question.correctIndex
                    ];


                const isCorrect =
                    Number(answer) ===
                    Number(
                        question.correctIndex
                    );


                content = `

                    <p>

                        <strong>
                            Your answer:
                        </strong>

                        ${escapeHTML(
                            studentText
                        )}

                    </p>

                    <p>

                        <strong>
                            Correct answer:
                        </strong>

                        ${escapeHTML(
                            correctText
                        )}

                    </p>

                    <p>

                        <strong>
                            Result:
                        </strong>

                        ${
                            isCorrect
                                ? "Correct ✓"
                                : "Incorrect"
                        }

                    </p>

                `;

            }

            else {

                const result =
                    theoryMarkingResults.find(
                        item =>
                            Number(
                                item.questionIndex
                            ) ===
                            index
                    );


                content = `

                    <p>

                        <strong>
                            Your answer:
                        </strong>

                        ${escapeHTML(
                            examAnswers[
                                index
                            ] ||
                            "Unanswered"
                        )}

                    </p>

                    <p>

                        <strong>
                            Model answer:
                        </strong>

                        ${escapeHTML(
                            question.modelAnswer
                        )}

                    </p>

                    <p>

                        <strong>
                            Marks:
                        </strong>

                        ${
                            Number(
                                result?.awardedMarks
                            ) || 0
                        }
                        /
                        ${
                            Number(
                                question.marks
                            ) || 0
                        }

                    </p>

                `;

            }


            card.innerHTML = `

                <h4>
                    Question ${index + 1}
                </h4>

                ${content}

            `;


            reviewAnswers.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   FINISH EXAM
========================================================= */

async function finishExam() {

    if (examFinished) {
        return;
    }


    examFinished =
        true;


    stopExamTimer();

    saveCurrentAnswer();


    if (examSubmitButton) {

        examSubmitButton.disabled =
            true;

        examSubmitButton.textContent =
            "Marking...";

    }


    if (examContainer) {

        examContainer.classList.add(
            "hidden"
        );

    }


    if (examResults) {

        examResults.classList.remove(
            "hidden"
        );


        examResults.innerHTML = `

            <div class="ai-loading">

                <div class="loading-spinner"></div>

                <h3>
                    Marking your exam...
                </h3>

                <p>
                    Studyflow AI is checking your answers.
                </p>

            </div>

        `;

    }


    try {

        theoryMarkingResults =
            await markTheoryAnswers();


        const score =
            calculateExamScore();


        saveExamProgress(
            score
        );


        if (examResults) {

            examResults.innerHTML = `

                <div class="exam-results-content">

                    <div class="result-header">

                        <span class="small-label">
                            EXAM COMPLETE
                        </span>

                        <h2>
                            ${escapeHTML(
                                examConfig.subject ||
                                "Exam"
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                examConfig.topic ||
                                ""
                            )}
                        </p>

                    </div>


                    <div class="result-score-card">

                        <span>
                            Your Score
                        </span>

                        <strong id="resultScore">
                            ${score.earnedMarks}/${score.totalMarks}
                        </strong>

                        <b id="resultPercentage">
                            ${Math.round(
                                score.percentage
                            )}%
                        </b>

                    </div>


                    <div class="result-stats">

                        <div class="result-stat">

                            <span>
                                OBJ Correct
                            </span>

                            <strong>
                                ${score.objCorrect}
                                /
                                ${score.objTotal}
                            </strong>

                        </div>


                        <div class="result-stat">

                            <span>
                                Total Marks
                            </span>

                            <strong>
                                ${score.totalMarks}
                            </strong>

                        </div>

                    </div>


                    <p
                        id="resultMessage"
                        class="result-message">

                        ${escapeHTML(
                            score.percentage >= 80
                                ? "Excellent work! Keep it up."
                                : score.percentage >= 60
                                    ? "Good work. Keep practising."
                                    : score.percentage >= 40
                                        ? "You are making progress. Review the difficult topics."
                                        : "Keep practising and review the questions you missed."
                        )}

                    </p>


                    <div
                        id="theoryResultsList"
                        class="theory-results-list">
                    </div>


                    <div
                        id="reviewAnswers"
                        class="review-answers">
                    </div>


                    <div class="exam-result-actions">

                        <button
                            type="button"
                            class="primary-btn"
                            id="retryExamBtn">

                            ↻ Retry Exam

                        </button>


                        <button
                            type="button"
                            class="secondary-btn"
                            id="newExamBtn">

                            + New Exam

                        </button>

                    </div>

                </div>

            `;


            renderTheoryResults();

            renderReviewAnswers();


            const retryButton =
                document.getElementById(
                    "retryExamBtn"
                );

            const newButton =
                document.getElementById(
                    "newExamBtn"
                );


            if (retryButton) {

                retryButton.addEventListener(
                    "click",
                    retryExam
                );

            }


            if (newButton) {

                newButton.addEventListener(
                    "click",
                    newExam
                );

            }

        }


        showToast(
            "Exam submitted successfully! 🎓"
        );

    }

    catch (error) {

        console.error(
            "Finish exam error:",
            error
        );


        if (examResults) {

            examResults.innerHTML = `

                <div class="error-state">

                    <h3>
                        Something went wrong
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "The exam could not be marked."
                        )}
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        id="retryMarkingBtn">

                        Try Again

                    </button>

                </div>

            `;


            const retryMarking =
                document.getElementById(
                    "retryMarkingBtn"
                );


            if (retryMarking) {

                retryMarking.addEventListener(
                    "click",
                    finishExam
                );

            }

        }

    }

    finally {

        if (examSubmitButton) {

            examSubmitButton.disabled =
                false;

            examSubmitButton.textContent =
                "Submit Exam";

        }

    }

}


/* =========================================================
   RETRY EXAM
========================================================= */

function retryExam() {

    stopExamTimer();


    examAnswers =
        examQuestions.map(
            () => null
        );


    theoryMarkingResults =
        [];


    currentExamQuestion =
        0;


    examFinished =
        false;


    examTimeRemaining =
        (
            Number(
                examConfig.minutes
            ) || 20
        ) * 60;


    if (examResults) {

        examResults.classList.add(
            "hidden"
        );

    }


    if (examContainer) {

        examContainer.classList.remove(
            "hidden"
        );

    }


    renderExamQuestion();

    renderQuestionNumbers();

    updateExamProgressBar();

    startExamTimer();

}


/* =========================================================
   NEW EXAM
========================================================= */

function newExam() {

    stopExamTimer();


    examQuestions =
        [];

    examAnswers =
        [];

    theoryMarkingResults =
        [];


    currentExamQuestion =
        0;


    examFinished =
        false;


    examConfig =
        {};


    if (examResults) {

        examResults.classList.add(
            "hidden"
        );

    }


    if (examContainer) {

        examContainer.classList.add(
            "hidden"
        );

    }


    if (examSetup) {

        examSetup.classList.remove(
            "hidden"
        );

    }


    if (startExamBtn) {

        startExamBtn.disabled =
            false;

        startExamBtn.textContent =
            "✦ Generate Exam";

    }


    showToast(
        "Ready for a new exam."
    );

}


/* =========================================================
   RETRY / NEW EXAM BUTTONS
========================================================= */

if (examRetryButton) {

    examRetryButton.addEventListener(
        "click",
        retryExam
    );

}


if (examNewButton) {

    examNewButton.addEventListener(
        "click",
        newExam
    );

}


/* =========================================================
   SUBMIT BUTTON
========================================================= */

if (examSubmitButton) {

    examSubmitButton.addEventListener(
        "click",
        () => {

            if (
                examFinished
            ) {

                return;

            }


            const unanswered =
                examAnswers.filter(
                    answer =>
                        answer === null ||
                        answer === undefined ||
                        answer === ""
                ).length;


            if (
                unanswered > 0
            ) {

                const shouldSubmit =
                    confirm(
                        `You have ${unanswered} unanswered question${
                            unanswered === 1
                                ? ""
                                : "s"
                        }. Submit anyway?`
                    );


                if (!shouldSubmit) {
                    return;
                }

            }


            finishExam();

        }
    );

}


/* =========================================================
   KEYBOARD SUPPORT
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            currentPage !==
                "exams" ||
            !examQuestions.length ||
            examFinished
        ) {

            return;

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextQuestion();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousQuestion();

        }

    }
);
