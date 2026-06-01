const trafficMessages = {
    close: {
        title: "process.exit() отменён",
        dot: "close",
        body: `
            <p>Стой, не закрывай так быстро.</p>
            <p>Если хочешь обсудить аналитику, эксперименты, оценку AI или странное поведение систем, Егору можно написать в блоке контактов.</p>
        `,
        primary: "открыть контакты",
        secondary: "ладно, читаю дальше"
    },
    minimize: {
        title: "фоновый режим включён",
        dot: "minimize",
        body: `
            <p>Сайт якобы свёрнут, но процесс всё ещё жив.</p>
            <p>В фоне Егор обычно думает про:</p>
            <ul>
                <li>memory pressure;</li>
                <li>A/B тесты, которые слишком уверенно выглядят;</li>
                <li>метрики, которые показывают что, но не объясняют почему.</li>
            </ul>
            <p>Можно написать ему, пока процесс не уснул.</p>
        `,
        primary: "открыть контакты",
        secondary: "вернуться к чтению"
    },
    maximize: {
        title: "карьерный режим: расширен",
        dot: "maximize",
        body: `
            <p>Если ты HR, PO или TGM и нажал сюда просто проверить кнопку: всё работает.</p>
            <p>Егор умеет не только писать SQL, но и разбираться, почему система ведёт себя странно: от экспериментов и аналитической инфраструктуры до оценки Conversational AI.</p>
        `,
        primary: "открыть контакты",
        secondary: "понятно, продолжаю"
    }
};

let lastFocusedElement = null;

function contactHref() {
    return window.location.pathname.includes("/blog/") ? "../index.html#contacts" : "#contacts";
}

function openContacts() {
    const contacts = document.querySelector("#contacts");
    closeTrafficModal();

    if (contacts) {
        contacts.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    window.location.href = contactHref();
}

function closeTrafficModal() {
    const overlay = document.querySelector(".traffic-overlay");

    if (!overlay) {
        return;
    }

    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function openTrafficModal(kind) {
    const overlay = document.querySelector(".traffic-overlay");
    const message = trafficMessages[kind];

    if (!overlay || !message) {
        return;
    }

    lastFocusedElement = document.activeElement;
    overlay.querySelector(".traffic-dot").className = `traffic-dot ${message.dot}`;
    overlay.querySelector(".traffic-modal-title").textContent = `терминал/${message.title}`;
    overlay.querySelector(".traffic-modal-body h2").textContent = message.title;
    overlay.querySelector(".traffic-modal-copy").innerHTML = message.body;
    overlay.querySelector("[data-traffic-primary]").textContent = message.primary;
    overlay.querySelector("[data-traffic-close]").textContent = message.secondary;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    overlay.querySelector("[data-traffic-close]").focus();
}

function createTrafficModal() {
    const overlay = document.createElement("div");
    overlay.className = "traffic-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
        <div class="traffic-modal" role="dialog" aria-modal="true" aria-labelledby="traffic-title">
            <div class="traffic-modal-header">
                <span class="traffic-dot close"></span>
                <span class="traffic-modal-title">терминал/процесс</span>
            </div>
            <div class="traffic-modal-body">
                <h2 id="traffic-title"></h2>
                <div class="traffic-modal-copy"></div>
                <div class="traffic-modal-actions">
                    <button class="traffic-action primary" type="button" data-traffic-primary></button>
                    <button class="traffic-action" type="button" data-traffic-close></button>
                </div>
            </div>
        </div>
    `;

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeTrafficModal();
        }
    });

    overlay.querySelector("[data-traffic-primary]").addEventListener("click", openContacts);
    overlay.querySelector("[data-traffic-close]").addEventListener("click", closeTrafficModal);
    document.body.appendChild(overlay);
}

function setupTrafficButtons() {
    const labels = {
        close: "Показать пасхалку закрытия",
        minimize: "Показать пасхалку сворачивания",
        maximize: "Показать пасхалку разворачивания"
    };

    document.querySelectorAll(".button.close, .button.minimize, .button.maximize").forEach((button) => {
        const kind = ["close", "minimize", "maximize"].find((name) => button.classList.contains(name));

        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
        button.setAttribute("aria-label", labels[kind]);
        button.addEventListener("click", () => openTrafficModal(kind));
        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openTrafficModal(kind);
            }
        });
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeTrafficModal();
    }
});

createTrafficModal();
setupTrafficButtons();
